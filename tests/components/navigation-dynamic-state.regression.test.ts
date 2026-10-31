import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExAnchor from '../../src/components/anchor/ExAnchor.vue';
import ExAnchorLink from '../../src/components/anchor/ExAnchorLink.vue';
import ExTooltip from '../../src/components/tooltip/ExTooltip.vue';
import ExDropdown from '../../src/components/dropdown/ExDropdown.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  document.body.replaceChildren();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('导航和浮层动态状态边界', () => {
  it.each([false, true])('公开锚点滚动结束同步活动项，减少动画=%s', async reduced => {
    vi.useFakeTimers();
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: reduced } as MediaQueryList);
    const container = document.createElement('div');
    const sections = [document.createElement('section'), document.createElement('section')];
    container.append(...sections);
    document.body.append(container);
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({ top: 0 } as DOMRect);
    sections.forEach((section, index) => {
      section.id = `section-${index}`;
      vi.spyOn(section, 'getBoundingClientRect').mockImplementation(
        () => ({ top: index * 500 - container.scrollTop }) as DOMRect
      );
    });
    container.scrollTo = (options?: ScrollToOptions | number) => {
      container.scrollTop = typeof options === 'object' ? (options.top ?? 0) : (options ?? 0);
      container.dispatchEvent(new Event('scroll'));
    };
    const wrapper = mount(ExAnchor, {
      props: { container: () => container },
      slots: {
        default: () =>
          sections.map((section, index) =>
            h(ExAnchorLink, { href: `#${section.id}`, title: `章节${index}` })
          ),
      },
    });
    wrappers.push(wrapper);
    wrapper.vm.scrollToAnchor('#section-1');
    await vi.advanceTimersByTimeAsync(600);
    expect(container.scrollTop).toBe(500);
    expect(wrapper.emitted('change')?.at(-1)).toEqual(['#section-1']);
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('Tooltip 只管理自己的说明 ID，保留父级动态说明并跟随触发器替换', async () => {
    const description = ref('旧说明');
    const triggerKey = ref(0);
    const tooltip = ref<InstanceType<typeof ExTooltip>>();
    const wrapper = mount(
      {
        render: () =>
          h(ExTooltip, { ref: tooltip, content: '提示', trigger: 'click', closeDelay: 0 }, () =>
            h('button', { key: triggerKey.value, 'aria-describedby': description.value }, '操作')
          ),
      },
      { attachTo: document.body }
    );
    wrappers.push(wrapper);
    tooltip.value!.show();
    await nextTick();
    await nextTick();
    const id = document.querySelector('[role="tooltip"]')!.id;
    description.value = '新说明 表单错误';
    await nextTick();
    expect(wrapper.get('button').attributes('aria-describedby')?.split(' ')).toEqual([
      '新说明',
      '表单错误',
      id,
    ]);
    const oldTrigger = wrapper.get('button').element;
    triggerKey.value += 1;
    await nextTick();
    expect(oldTrigger.getAttribute('aria-describedby')).toBe('新说明 表单错误');
    expect(wrapper.get('button').attributes('aria-describedby')).toContain(id);
    tooltip.value!.hide();
    await nextTick();
    expect(wrapper.get('button').attributes('aria-describedby')).toBe('新说明 表单错误');
  });

  it('自定义菜单的原生 disabled 和禁用 fieldset 子项不参与键盘导航', async () => {
    const wrapper = mount(ExDropdown, {
      props: { trigger: 'click' },
      slots: {
        default: () => h('button', '菜单'),
        menu: () => [
          h('button', { role: 'menuitem', disabled: true }, '禁用'),
          h('fieldset', { disabled: true }, [h('button', { role: 'menuitem' }, '禁用组')]),
          h('button', { role: 'menuitem' }, '可用'),
        ],
      },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await wrapper.get('button').trigger('keydown', { key: 'ArrowDown' });
    await nextTick();
    const menu = document.querySelector('[role="menu"]')!;
    const active = () => document.getElementById(menu.getAttribute('aria-activedescendant')!);
    expect(active()?.textContent).toBe('可用');
    menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await nextTick();
    expect(active()?.textContent).toBe('可用');
  });
});
