import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExPagination from '../../../src/components/pagination/ExPagination.vue';

describe('ExPagination', () => {
  it('renders root element', () => {
    const wrapper = mount(ExPagination, { props: { current: 1, pageSize: 10, total: 100 } });
    expect(wrapper.find('.ex-pagination').exists()).toBe(true);
  });

  it('marks the current page as active', () => {
    const wrapper = mount(ExPagination, { props: { current: 1, pageSize: 10, total: 100 } });
    expect(wrapper.find('.ex-pagination__item--active').text()).toBe('1');
  });

  it('emits update:current and change when next is clicked', async () => {
    const wrapper = mount(ExPagination, { props: { current: 1, pageSize: 10, total: 100 } });
    await wrapper.find('.ex-pagination__next').trigger('click');
    expect(wrapper.emitted('update:current')?.at(-1)?.[0]).toBe(2);
    expect(wrapper.emitted('change')).toBeTruthy();
  });

  it('does not advance past the last page', async () => {
    const wrapper = mount(ExPagination, { props: { current: 10, pageSize: 10, total: 100 } });
    await wrapper.find('.ex-pagination__next').trigger('click');
    // already on the last page → no page change emitted
    const emitted = wrapper.emitted('update:current');
    if (emitted) {
      expect(emitted.at(-1)?.[0]).toBe(10);
    } else {
      expect(emitted).toBeFalsy();
    }
  });

  it('jumps to a specific page when its item is clicked', async () => {
    const wrapper = mount(ExPagination, { props: { current: 1, pageSize: 10, total: 100 } });
    await nextTick();
    const items = wrapper.findAll('.ex-pagination__item');
    const page3 = items.find(i => i.text() === '3');
    expect(page3).toBeTruthy();
    await page3!.trigger('click');
    expect(wrapper.emitted('update:current')?.at(-1)?.[0]).toBe(3);
  });

  it('修改每页条数时应该保留当前数据项位置', async () => {
    const wrapper = mount(ExPagination, {
      props: {
        current: 2,
        pageSize: 10,
        total: 100,
        showSizeChanger: true,
      },
    });

    await wrapper.find('.ex-pagination__size-select').setValue('20');

    expect(wrapper.emitted('update:pageSize')?.at(-1)?.[0]).toBe(20);
    expect(wrapper.emitted('update:current')?.at(-1)?.[0]).toBe(1);
    expect(wrapper.emitted('change')?.at(-1)).toEqual([1, 20]);
  });

  it('总数为零时应该使用空范围且不渲染虚假的第一页', () => {
    const wrapper = mount(ExPagination, {
      props: {
        current: 1,
        pageSize: 10,
        total: 0,
        totalText: (_total, range) => `${range[0]}-${range[1]}`,
      },
    });

    expect(wrapper.find('.ex-pagination__total').text()).toBe('0-0');
    expect(wrapper.find('.ex-pagination__item--active').exists()).toBe(false);
    expect(wrapper.find('.ex-pagination__next').attributes('disabled')).toBeDefined();
  });

  it('简洁模式的页码输入应该具有可访问名称', () => {
    const wrapper = mount(ExPagination, {
      props: { current: 1, pageSize: 10, total: 100, simple: true },
    });

    expect(wrapper.find('.ex-pagination__simple-input').attributes('aria-label')).toBeTruthy();
  });

  it('无效 pageSize 不应该生成 Infinity 或 NaN 页码', () => {
    const wrapper = mount(ExPagination, {
      props: { current: 1, pageSize: 0, total: 100 },
    });

    expect(wrapper.text()).not.toMatch(/Infinity|NaN/);
    expect(wrapper.findAll('.ex-pagination__item').length).toBeLessThan(20);
  });
});
