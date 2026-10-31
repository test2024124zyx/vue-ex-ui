import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, reactive } from 'vue';
import ExTimePicker from '../../../src/components/time-picker/ExTimePicker.vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import type { TimePickerRange } from '../../../src/components/time-picker/types';

const cleanups: Array<() => void> = [];
afterEach(() => {
  cleanups.splice(0).forEach(cleanup => cleanup());
  vi.restoreAllMocks();
});

describe('时间范围与表单、服务端渲染集成', () => {
  it('只在完整确认后校验范围模型，半成品和取消不触发表单变更', async () => {
    const model = reactive<{ time: TimePickerRange | null }>({ time: null });
    const validated: unknown[] = [];
    const wrapper = mount(ExForm, {
      props: {
        model,
        rules: {
          time: [
            {
              trigger: 'change',
              validator: (_rule, value, done) => {
                validated.push(value);
                done();
              },
            },
          ],
        },
      },
      slots: {
        default: () =>
          h(ExFormItem, { prop: 'time', label: '预约范围' }, () =>
            h(ExTimePicker, {
              range: true,
              rangeValue: model.time,
              teleported: false,
              'onUpdate:rangeValue': value => (model.time = value),
            })
          ),
      },
    });
    cleanups.push(() => wrapper.unmount());
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="9"]').trigger('click');
    await flushPromises();
    expect(model.time).toBeNull();
    expect(validated).toEqual([]);
    await wrapper.get('[data-endpoint="end"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="18"]').trigger('click');
    await wrapper.get('.ex-time-picker__confirm').trigger('click');
    await flushPromises();
    expect(model.time).toEqual(['09:00:00', '18:00:00']);
    expect(validated.at(-1)).toEqual(model.time);
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="10"]').trigger('click');
    await wrapper.setProps({ readonly: true });
    expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('false');
    expect(model.time).toEqual(['09:00:00', '18:00:00']);
  });
});
