import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExBreadcrumb from '../../../src/components/breadcrumb/ExBreadcrumb.vue';
import type { BreadcrumbItem } from '../../../src/components/breadcrumb/types';

describe('ExBreadcrumb', () => {
  const items: BreadcrumbItem[] = [
    { label: '首页', path: '/' },
    { label: '组件', path: '/components' },
    { label: '面包屑' },
  ];

  it('renders root element', () => {
    const wrapper = mount(ExBreadcrumb, { props: { items } });
    expect(wrapper.find('.ex-breadcrumb').exists()).toBe(true);
  });

  it('renders one item per data entry with its label', () => {
    const wrapper = mount(ExBreadcrumb, { props: { items } });
    const rendered = wrapper.findAll('.ex-breadcrumb-item');
    expect(rendered.length).toBe(items.length);
    expect(wrapper.text()).toContain('首页');
    expect(wrapper.text()).toContain('组件');
    expect(wrapper.text()).toContain('面包屑');
  });

  it('renders separators between items (count = items - 1)', () => {
    const wrapper = mount(ExBreadcrumb, { props: { items } });
    const separators = wrapper.findAll('.ex-breadcrumb-item__separator');
    expect(separators.length).toBe(items.length - 1);
  });

  it('supports a custom separator', () => {
    const wrapper = mount(ExBreadcrumb, { props: { items, separator: '>' } });
    expect(wrapper.find('.ex-breadcrumb-item__separator').text()).toContain('>');
  });

  it('emits click with the item and index when a clickable item is clicked', async () => {
    const wrapper = mount(ExBreadcrumb, { props: { items, clickable: true } });
    // 非末项渲染为可点击链接
    await wrapper.find('.ex-breadcrumb-item__link').trigger('click');
    const clicks = wrapper.emitted('click');
    expect(clicks).toBeTruthy();
    expect((clicks!.at(-1)![0] as BreadcrumbItem).label).toBe('首页');
    expect(clicks!.at(-1)![1]).toBe(0);
  });

  it('places state and size modifiers on the item root where component styles apply', () => {
    const wrapper = mount(ExBreadcrumb, { props: { items, size: 'large' } });
    const rendered = wrapper.findAll('.ex-breadcrumb-item');

    expect(rendered[0]?.classes()).toContain('ex-breadcrumb-item--large');
    expect(rendered[0]?.classes()).toContain('ex-breadcrumb-item--clickable');
    expect(rendered.at(-1)?.classes()).toContain('ex-breadcrumb-item--last');
  });

  it('uses the declared path instead of a javascript pseudo URL', () => {
    const wrapper = mount(ExBreadcrumb, { props: { items } });

    expect(wrapper.find('.ex-breadcrumb-item__link').attributes('href')).toBe('/');
  });

  it('带有真实路径的链接不应该被组件阻止默认导航', async () => {
    const wrapper = mount(ExBreadcrumb, {
      props: {
        items: [{ label: '锚点', path: '#target' }, { label: '当前页' }],
      },
    });
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    wrapper.find('.ex-breadcrumb-item__link').element.dispatchEvent(event);
    await nextTick();

    expect(event.defaultPrevented).toBe(false);
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('危险协议路径渲染为禁用语义且不发送点击事件', async () => {
    const wrapper = mount(ExBreadcrumb, {
      props: {
        items: [{ label: '危险链接', path: ' javascript:alert(1) ' }, { label: '当前页' }],
      },
    });
    const dangerousItem = wrapper.find('.ex-breadcrumb-item');

    expect(dangerousItem.classes()).toContain('ex-breadcrumb-item--disabled');
    expect(dangerousItem.attributes('aria-disabled')).toBe('true');
    expect(dangerousItem.find('a').exists()).toBe(false);
    await dangerousItem.trigger('click');
    expect(wrapper.emitted('click')).toBeUndefined();
  });

  it('安全路径会去除首尾空白后绑定到链接', () => {
    const wrapper = mount(ExBreadcrumb, {
      props: { items: [{ label: '组件', path: ' /components ' }, { label: '当前页' }] },
    });

    expect(wrapper.get('.ex-breadcrumb-item__link').attributes('href')).toBe('/components');
  });

  it('normalizes maxItems below two and keeps distinct first and last items', () => {
    const wrapper = mount(ExBreadcrumb, { props: { items, maxItems: 1 } });

    expect(wrapper.findAll('.ex-breadcrumb-item')).toHaveLength(2);
    expect(wrapper.text()).toContain('首页');
    expect(wrapper.text()).toContain('面包屑');
    expect(wrapper.find('.ex-breadcrumb__ellipsis').exists()).toBe(true);
  });

  it('renders disabled entries as non-interactive content with aria-disabled', () => {
    const wrapper = mount(ExBreadcrumb, {
      props: { items: [{ label: '禁用', path: '/disabled', disabled: true }, items[2]!] },
    });
    const disabled = wrapper.find('.ex-breadcrumb-item--disabled');

    expect(disabled.find('a').exists()).toBe(false);
    expect(disabled.attributes('aria-disabled')).toBe('true');
  });
});
