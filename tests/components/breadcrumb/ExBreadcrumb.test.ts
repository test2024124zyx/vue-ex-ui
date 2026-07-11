import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
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
