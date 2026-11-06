import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExPanel from '../../../src/components/panel/ExPanel.vue';

describe('面板插槽与键盘交互', () => {
  it('支持插槽、各区域样式与根元素查询', () => {
    const wrapper = mount(ExPanel, {
      props: {
        subtitle: '副标题',
        type: 'primary',
        bordered: false,
        shadow: 'base',
        ariaLabel: '项目详情',
        style: 'padding: 3px',
        headerStyle: { color: 'red' },
        bodyStyle: 'margin: 2px',
        footerStyle: { color: 'blue' },
      },
      slots: {
        title: () => '标题插槽',
        icon: () => '图标',
        extra: () => h('button', '更多'),
        default: () => '主体',
        footer: () => '页脚',
      },
    });
    expect(wrapper.get('.ex-panel__title').text()).toContain('标题插槽');
    expect(wrapper.get('.ex-panel__header').attributes('style')).toContain('color: red');
    expect(wrapper.get('.ex-panel__body').attributes('style')).toContain('margin: 2px');
    expect(wrapper.get('.ex-panel__footer').attributes('style')).toContain('color: blue');
    expect(wrapper.attributes('aria-label')).toBe('项目详情');
    expect(wrapper.vm.getElement()).toBe(wrapper.element);
    wrapper.unmount();
  });

  it('空格激活主操作，输入法、子控件按键与加载期间不重复激活', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ExPanel, {
      props: { hoverable: true, onClick },
      slots: { default: () => h('input') },
    });
    await wrapper.trigger('keydown', { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
    await wrapper.trigger('keydown', { key: 'Enter', isComposing: true });
    await wrapper.trigger('keydown', { key: 'Enter', keyCode: 229 });
    await wrapper.trigger('keydown', { key: 'ArrowDown' });
    await wrapper.get('input').trigger('keydown', { key: 'Enter' });
    await wrapper.setProps({ loading: true });
    await wrapper.trigger('keydown', { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
});
