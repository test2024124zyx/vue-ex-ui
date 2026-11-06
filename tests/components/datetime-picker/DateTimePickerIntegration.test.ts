import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h } from 'vue';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';

const cleanups: Array<() => void> = [];
afterEach(() => {
  cleanups.splice(0).forEach(cleanup => cleanup());
  vi.restoreAllMocks();
});

describe('日期周期输入的可访问性与水合', () => {
  it('外部原生标签关联真实输入框，年模式键盘打开后焦点位于当前年', async () => {
    const wrapper = mount(
      {
        render: () =>
          h('div', [
            h('label', { for: 'review-year' }, '审核年度'),
            h(ExDateTimePicker, {
              id: 'review-year',
              type: 'year',
              modelValue: new Date(2026, 9, 29),
              teleported: false,
            }),
          ]),
      },
      { attachTo: document.body }
    );
    cleanups.push(() => wrapper.unmount());
    const input = wrapper.get<HTMLInputElement>('input');
    expect(wrapper.get<HTMLLabelElement>('label').element.control).toBe(input.element);
    await input.trigger('keydown', { key: 'ArrowDown' });
    await flushPromises();
    expect(document.activeElement?.getAttribute('data-period')).toBe('2026');
    await wrapper.get('.ex-datetime-picker__confirm-btn').trigger('click');
    expect(
      wrapper.findComponent(ExDateTimePicker).emitted('update:modelValue')?.at(-1)?.[0]
    ).toEqual(new Date(2026, 0, 1));
  });
});
