import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExPanel from '../../src/components/panel/ExPanel.vue';
import ExEllipsis from '../../src/components/ellipsis/ExEllipsis.vue';
import ExAnchor from '../../src/components/anchor/ExAnchor.vue';
import ExAnchorLink from '../../src/components/anchor/ExAnchorLink.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
});

describe('复查发现的展示组件状态边界', () => {
  it('Panel 加载时阻止根节点及后代点击，结束加载后恢复正常操作', async () => {
    const click = vi.fn();
    const child = vi.fn();
    const wrapper = mount(ExPanel, {
      props: { loading: true, hoverable: true, onClick: click },
      slots: { default: () => h('button', { onClick: child }, '子操作') },
    });
    wrappers.push(wrapper);
    await wrapper.trigger('click');
    await wrapper.get('button').trigger('click');
    expect(click).not.toHaveBeenCalled();
    expect(child).not.toHaveBeenCalled();
    await wrapper.setProps({ loading: false });
    await wrapper.trigger('click');
    expect(click).toHaveBeenCalledOnce();
  });

  it('Ellipsis 撤销控制保留最后确认状态，之后可由内部继续切换', async () => {
    const wrapper = mount(ExEllipsis, {
      props: { expandable: true, expanded: true },
      slots: { default: '内容' },
    });
    wrappers.push(wrapper);
    wrapper.vm.collapse();
    expect(wrapper.vm.isExpanded()).toBe(true);
    await wrapper.setProps({ expanded: undefined });
    expect(wrapper.vm.isExpanded()).toBe(true);
    wrapper.vm.collapse();
    expect(wrapper.vm.isExpanded()).toBe(false);
  });

  it('动态锚点注册和移除即时同步当前项及 change，不依赖额外滚动', async () => {
    const visible = ref(false);
    const target = document.createElement('div');
    target.id = 'dynamic-anchor-target';
    document.body.appendChild(target);
    const wrapper = mount({
      render: () =>
        h(ExAnchor, {}, () =>
          visible.value
            ? h(ExAnchorLink, { href: '#dynamic-anchor-target', title: '当前位置' })
            : null
        ),
    });
    wrappers.push(wrapper);
    try {
      visible.value = true;
      await nextTick();
      expect(wrapper.get('.ex-anchor-link').classes()).toContain('is-active');
      visible.value = false;
      await nextTick();
      expect(wrapper.getComponent(ExAnchor).emitted('change')).toEqual([
        ['#dynamic-anchor-target'],
        [''],
      ]);
    } finally {
      target.remove();
    }
  });
});
