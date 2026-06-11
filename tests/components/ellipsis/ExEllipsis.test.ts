import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExEllipsis from '@/components/ellipsis/ExEllipsis.vue';

describe('ExEllipsis', () => {
  it('renders and applies line clamp', () => {
    const wrapper = mount(ExEllipsis, {
      props: { lines: 2, tooltip: false },
      slots: { default: '这是一段较长的文本用于测试多行省略效果。' }
    });
    const content = wrapper.find('.ex-ellipsis__content');
    expect(content.exists()).toBe(true);
    // style 应包含 -webkit-line-clamp: 2
    expect(content.attributes('style')).toContain('-webkit-line-clamp: 2');
  });

  it('expandable toggles expanded state', async () => {
    const wrapper = mount(ExEllipsis, {
      props: { lines: 1, expandable: true, tooltip: false },
      slots: { default: '长文本' }
    });
    const btn = wrapper.get('.ex-ellipsis__btn');
    expect(wrapper.find('.ex-ellipsis__content.is-expanded').exists()).toBe(false);
    await btn.trigger('click');
    expect(wrapper.find('.ex-ellipsis__content.is-expanded').exists()).toBe(true);
    await btn.trigger('click');
    expect(wrapper.find('.ex-ellipsis__content.is-expanded').exists()).toBe(false);
  });

  it('a11y attributes present', () => {
    const wrapper = mount(ExEllipsis, { props: { ariaLabel: '全文提示' } });
    const region = wrapper.get('.ex-ellipsis');
    expect(region.attributes('role')).toBe('group');
    expect(region.attributes('aria-label')).toBe('全文提示');
  });
});