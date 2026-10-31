import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, reactive, ref, type VNode } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExInput from '../../../src/components/input/ExInput.vue';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';
import ExTimePicker from '../../../src/components/time-picker/ExTimePicker.vue';
import ExColorPicker from '../../../src/components/color-picker/ExColorPicker.vue';
import type { FormInstance } from '../../../src/components/form/types';
import type { DateTimePickerValue } from '../../../src/components/datetime-picker/types';
import type { TimePickerRange } from '../../../src/components/time-picker/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
});

function mountField(model: Record<string, unknown>, renderControl: () => VNode) {
  const form = ref<FormInstance>();
  const wrapper = mount(
    {
      render: () =>
        h(ExForm, { ref: form, model }, () => h(ExFormItem, { prop: 'value' }, renderControl)),
    },
    { attachTo: document.body }
  );
  wrappers.push(wrapper);
  const reset = async () => {
    form.value!.resetFields();
    await nextTick();
  };
  return { wrapper, reset };
}

describe('表单同值重置丢弃控件未提交草稿', () => {
  it.each(['text', 'textarea'] as const)(
    '%s 的 lazy 草稿和本地错误重置后不会再提交',
    async type => {
      const model = reactive({ value: '初始值' });
      const { wrapper, reset } = mountField(model, () =>
        h(ExInput, {
          type,
          modelValue: model.value,
          modelModifiers: { lazy: true },
          validateTrigger: 'input',
          rules: [value => value === '初始值' || '草稿错误'],
          'onUpdate:modelValue': value => (model.value = String(value)),
        })
      );
      const input = wrapper.get<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
      input.element.focus();
      input.element.value = '草稿';
      await input.trigger('input');
      expect(model.value).toBe('初始值');
      expect(wrapper.text()).toContain('草稿错误');
      await reset();
      expect(input.element.value).toBe('初始值');
      expect(wrapper.text()).not.toContain('草稿错误');
      expect(document.activeElement).toBe(input.element);
      await input.trigger('change');
      expect(model.value).toBe('初始值');
      input.element.value = '新输入';
      await input.trigger('input');
      await input.trigger('change');
      expect(model.value).toBe('新输入');
    }
  );

  it('输入法组合在重置后到达的结束和尾随 input 不恢复已丢弃内容', async () => {
    const model = reactive({ value: '初始值' });
    const { wrapper, reset } = mountField(model, () =>
      h(ExInput, {
        modelValue: model.value,
        'onUpdate:modelValue': value => (model.value = String(value)),
      })
    );
    const input = wrapper.get<HTMLInputElement>('input');
    await input.trigger('compositionstart');
    input.element.value = '未完成拼音';
    await input.trigger('input');
    await reset();
    expect(input.element.value).toBe('初始值');
    input.element.value = '旧拼音结果';
    input.element.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true }));
    input.element.value = '旧拼音结果';
    input.element.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await nextTick();
    expect(model.value).toBe('初始值');
    expect(input.element.value).toBe('初始值');
    expect(wrapper.findComponent(ExInput).emitted('update:modelValue')).toBeUndefined();
    await input.trigger('compositionstart');
    input.element.value = '新组合输入';
    await input.trigger('input');
    await input.trigger('compositionend');
    expect(model.value).toBe('新组合输入');
  });

  it.each(['datetime', 'datetimerange'] as const)('%s 的空模型重置取消待确认日期', async type => {
    const model = reactive<{ value: DateTimePickerValue }>({ value: null });
    const { wrapper, reset } = mountField(model, () =>
      h(ExDateTimePicker, {
        type,
        modelValue: model.value,
        teleported: false,
        'onUpdate:modelValue': value => (model.value = value),
      })
    );
    await wrapper.get('input').trigger('click');
    const days = wrapper.findAll('.ex-datetime-picker__day:not([disabled])');
    await days[10]!.trigger('click');
    if (type === 'datetimerange') await days[15]!.trigger('click');
    expect(
      wrapper.get<HTMLButtonElement>('.ex-datetime-picker__confirm-btn').element.disabled
    ).toBe(false);
    expect(model.value).toBeNull();
    await reset();
    expect(wrapper.get('input').attributes('aria-expanded')).toBe('false');
    expect(wrapper.findComponent(ExDateTimePicker).emitted('update:modelValue')).toBeUndefined();
    await wrapper.get('input').trigger('click');
    expect(
      wrapper.get<HTMLButtonElement>('.ex-datetime-picker__confirm-btn').element.disabled
    ).toBe(true);
    expect(model.value).toBeNull();
  });

  it('空时间范围重置取消已选两端，重新打开必须重新选择', async () => {
    const model = reactive<{ value: TimePickerRange | null }>({ value: null });
    const { wrapper, reset } = mountField(model, () =>
      h(ExTimePicker, {
        range: true,
        rangeValue: model.value,
        teleported: false,
        'onUpdate:rangeValue': value => (model.value = value),
      })
    );
    const trigger = wrapper.get('[role="combobox"]');
    await trigger.trigger('click');
    await wrapper.get('[data-unit="h"][data-value="9"]').trigger('click');
    await wrapper.get('[data-endpoint="end"]').trigger('click');
    await wrapper.get('[data-unit="h"][data-value="18"]').trigger('click');
    expect(wrapper.get<HTMLButtonElement>('.ex-time-picker__confirm').element.disabled).toBe(false);
    await reset();
    expect(trigger.attributes('aria-expanded')).toBe('false');
    expect(wrapper.findComponent(ExTimePicker).emitted('update:rangeValue')).toBeUndefined();
    await trigger.trigger('click');
    expect(wrapper.get<HTMLButtonElement>('.ex-time-picker__confirm').element.disabled).toBe(true);
    expect(model.value).toBeNull();
  });

  it.each([true, false])('接受颜色回写=%s 时重置中断拖动，不再提交旧操作', async accept => {
    const model = reactive({ value: '#ff0000' });
    const { wrapper, reset } = mountField(model, () =>
      h(ExColorPicker, {
        modelValue: model.value,
        teleported: false,
        'onUpdate:modelValue': value => {
          if (accept) model.value = value;
        },
      })
    );
    await wrapper.get('.ex-color-picker__trigger').trigger('click');
    const slider = wrapper.get<HTMLElement>('.ex-color-picker__hue');
    vi.spyOn(slider.element, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      width: 100,
      height: 10,
      right: 100,
      bottom: 10,
      toJSON: () => ({}),
    });
    slider.element.dispatchEvent(new MouseEvent('pointerdown', { clientX: 50, bubbles: true }));
    await nextTick();
    const control = wrapper.findComponent(ExColorPicker);
    const before = control.emitted('update:modelValue')!.length;
    await reset();
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 75 }));
    window.dispatchEvent(new Event('pointerup'));
    await nextTick();
    expect(model.value).toBe('#ff0000');
    expect(control.emitted('update:modelValue')).toHaveLength(before);
    expect(control.emitted('change')).toBeUndefined();
    expect(wrapper.find('.ex-color-picker__panel').exists()).toBe(false);
    await wrapper.get('.ex-color-picker__trigger').trigger('click');
    expect(wrapper.get<HTMLInputElement>('.ex-color-picker__input').element.value).toBe('#ff0000');
  });
});
