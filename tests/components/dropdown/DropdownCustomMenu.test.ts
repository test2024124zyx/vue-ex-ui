import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
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
        menu: () => [h('button', { role: 'menuitem' }, 'Alpha'), h('button', { role: 'menuitem' }, 'Beta')],
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
});
