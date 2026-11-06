import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExAnchor from '../../../src/components/anchor/ExAnchor.vue';
import ExAnchorLink from '../../../src/components/anchor/ExAnchorLink.vue';

afterEach(() => vi.restoreAllMocks());

describe('锚点边界与独立链接', () => {
  it('公开定位忽略空值、无效编码、无效选择器和不存在的目标', () => {
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const wrapper = mount(ExAnchor);
    for (const href of ['', '#%E0%A4%A', '[broken', '.missing']) wrapper.vm.scrollToAnchor(href);
    expect(scroll).not.toHaveBeenCalled();
    expect(wrapper.vm.getElement()).toBe(wrapper.element);
    wrapper.unmount();
  });

  it('独立链接仍发出自身点击事件，动态地址不会依赖不存在的父容器', async () => {
    const wrapper = mount(ExAnchorLink, { props: { href: '#first', title: '第一节' } });
    await wrapper.setProps({ href: '#second', title: '第二节' });
    await wrapper.get('a').trigger('click');
    expect(wrapper.emitted('click')).toEqual([['#second']]);
    expect(wrapper.get('a').attributes('href')).toBe('#second');
    wrapper.unmount();
  });
});
