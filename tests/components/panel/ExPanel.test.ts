import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExPanel from '../../../src/components/panel/ExPanel.vue';

describe('ExPanel', () => {
  it('renders root element', () => {
    const wrapper = mount(ExPanel);
    expect(wrapper.find('.ex-panel').exists()).toBe(true);
  });

  it('renders the title prop', () => {
    const wrapper = mount(ExPanel, { props: { title: '面板标题' } });
    expect(wrapper.find('.ex-panel__header').exists()).toBe(true);
    expect(wrapper.text()).toContain('面板标题');
  });

  it('renders default slot into the body', () => {
    const wrapper = mount(ExPanel, {
      slots: { default: '<p class="inner">body content</p>' },
    });
    expect(wrapper.find('.ex-panel__body .inner').exists()).toBe(true);
  });

  it('applies the loading modifier', () => {
    const wrapper = mount(ExPanel, { props: { loading: true } });
    expect(wrapper.find('.ex-panel--loading').exists()).toBe(true);
    expect(wrapper.get('.ex-panel').attributes('aria-busy')).toBe('true');
    expect(wrapper.get('.ex-panel__body').attributes('inert')).toBe('true');
    expect(wrapper.get('[role="status"]').text()).toBe('Loading...');
  });

  it('renders the footer slot', () => {
    const wrapper = mount(ExPanel, {
      slots: { footer: '<span class="foot">footer</span>' },
    });
    expect(wrapper.find('.ex-panel__footer .foot').exists()).toBe(true);
  });

  it('只在有名称时创建 region landmark', () => {
    const unnamed = mount(ExPanel);
    const named = mount(ExPanel, { props: { title: '状态面板' } });

    expect(unnamed.get('.ex-panel').attributes('role')).toBeUndefined();
    expect(named.get('.ex-panel').attributes('role')).toBe('region');
    expect(named.get('.ex-panel').attributes('aria-label')).toBe('状态面板');
  });

  it('hoverable 只有在存在点击处理器时才暴露键盘按钮语义', async () => {
    const onClick = vi.fn();
    const interactive = mount(ExPanel, { props: { hoverable: true, onClick } });
    const decorative = mount(ExPanel, { props: { hoverable: true } });

    expect(interactive.get('.ex-panel').attributes('role')).toBe('button');
    expect(interactive.get('.ex-panel').attributes('tabindex')).toBe('0');
    expect(decorative.get('.ex-panel').attributes('tabindex')).toBeUndefined();
    await interactive.get('.ex-panel').trigger('keydown', { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
