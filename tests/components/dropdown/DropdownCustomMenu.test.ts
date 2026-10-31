import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExDropdown from '../../../src/components/dropdown/ExDropdown.vue';

afterEach(() => vi.unstubAllGlobals());

describe('下拉自定义菜单与定位降级', () => {
  it('无动画帧和尺寸观察器时自定义菜单仍可键盘导航', async () => {
    vi.stubGlobal('ResizeObserver', undefined);
    vi.stubGlobal('requestAnimationFrame', undefined);
    const wrapper = mount(ExDropdown, {
      props: { trigger: 'click', showDelay: 0, hideDelay: 0 },
      slots: {
        default: () => h('button', '操作'),
        menu: () => [
          h('button', { role: 'menuitem' }, 'Alpha'),
          h('button', { role: 'menuitem' }, 'Beta'),
        ],
      },
      attachTo: document.body,
    });
    await wrapper.get('button').trigger('keydown', { key: 'ArrowDown' });
    const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
    expect(menu).not.toBeNull();
    const items = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    expect(items.every(item => item.id)).toBe(true);
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true }));
    await wrapper.vm.$nextTick();
    expect(menu.getAttribute('aria-activedescendant')).toBe(items[1]!.id);
    const selection = vi.fn();
    items[1]!.addEventListener('click', selection);
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(selection).toHaveBeenCalledOnce();
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true }));
    expect(menu.getAttribute('aria-activedescendant')).toBe(items[1]!.id);
    wrapper.vm.updatePosition();
    window.dispatchEvent(new Event('resize'));
    wrapper.vm.hide();
    wrapper.unmount();
  });

  it('键盘将溢出项目滚入菜单可视区，Escape 返回原触发器', async () => {
    const wrapper = mount(ExDropdown, {
      props: {
        trigger: 'click',
        items: [
          { key: 'a', label: '甲' },
          { key: 'b', label: '乙' },
        ],
      },
      slots: { default: () => h('button', '操作') },
      attachTo: document.body,
    });
    try {
      await wrapper.get('button').trigger('keydown', { key: 'ArrowDown' });
      // 等待打开时的首次焦点与滚动完成，再验证后续按键的独立滚动。
      await nextTick();
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
      const items = Array.from(menu.querySelectorAll<HTMLElement>('[role="menuitem"]'));
      const rect = (top: number, bottom: number) =>
        ({ top, bottom, left: 0, right: 100, width: 100, height: bottom - top }) as DOMRect;
      vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue(rect(100, 200));
      vi.spyOn(items[0]!, 'getBoundingClientRect').mockReturnValue(rect(80, 100));
      vi.spyOn(items[1]!, 'getBoundingClientRect').mockReturnValue(rect(200, 230));
      menu.scrollTop = 40;
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      await nextTick();
      expect(menu.scrollTop).toBe(70);
      expect(menu.getAttribute('aria-activedescendant')).toBe(items[1]!.id);
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      await nextTick();
      expect(menu.scrollTop).toBe(50);
      expect(menu.getAttribute('aria-activedescendant')).toBe(items[0]!.id);
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await nextTick();
      await nextTick();
      expect(menu.style.display).toBe('none');
      expect(document.activeElement).toBe(wrapper.get('button').element);
    } finally {
      wrapper.unmount();
      vi.restoreAllMocks();
    }
  });

  it('空菜单可以安全导航，异步加入项目后上下键分别定位首尾', async () => {
    const wrapper = mount(ExDropdown, {
      props: { trigger: 'click' },
      slots: { default: () => h('button', '操作') },
      attachTo: document.body,
    });
    try {
      await wrapper.get('button').trigger('keydown', { key: 'ArrowDown' });
      const menu = document.querySelector<HTMLElement>('[role="menu"]')!;
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await nextTick();
      expect(menu.hasAttribute('aria-activedescendant')).toBe(false);
      const choices = [
        { key: 'a', label: '甲' },
        { key: 'b', label: '乙' },
      ];
      await wrapper.setProps({ items: choices });
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      await nextTick();
      expect(
        document.getElementById(menu.getAttribute('aria-activedescendant')!)?.textContent
      ).toContain('乙');
      await wrapper.setProps({ items: [] });
      await wrapper.setProps({ items: [{ key: 'c', label: '丙' }] });
      wrapper.vm.hide();
      await nextTick();
      wrapper.vm.show();
      await nextTick();
      menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      await nextTick();
      expect(
        document.getElementById(menu.getAttribute('aria-activedescendant')!)?.textContent
      ).toContain('丙');
    } finally {
      wrapper.unmount();
    }
  });
});
