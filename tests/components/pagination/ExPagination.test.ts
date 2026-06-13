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
});
