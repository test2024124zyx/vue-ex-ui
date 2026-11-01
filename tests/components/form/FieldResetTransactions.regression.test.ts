import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, reactive, ref, type Component, type VNode } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExCheckbox from '../../../src/components/checkbox/ExCheckbox.vue';
import ExCheckboxGroup from '../../../src/components/checkbox/ExCheckboxGroup.vue';
import ExRadio from '../../../src/components/radio/ExRadio.vue';
import ExRadioGroup from '../../../src/components/radio/ExRadioGroup.vue';
import ExSlider from '../../../src/components/slider/ExSlider.vue';
import ExTagInput from '../../../src/components/tag/ExTagInput.vue';
import ExVerificationCode from '../../../src/components/verification-code/ExVerificationCode.vue';
import type { FormInstance } from '../../../src/components/form/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function mountField(model: Record<string, unknown>, control: () => VNode) {
  const form = ref<FormInstance>();
  const wrapper = mount(
    {
      render: () =>
        h(ExForm, { ref: form, model }, () => h(ExFormItem, { prop: 'value' }, control)),
    },
    { attachTo: document.body }
  );
  wrappers.push(wrapper);
  return {
    wrapper,
    reset: async () => {
      form.value!.resetFields();
      await nextTick();
    },
  };
}

describe('重置字段同时撤销控件本地事务', () => {
  it.each(['checkbox', 'checkbox-group', 'radio', 'radio-group'] as const)(
    '%s 外部赋合法值后清除本地错误，外部错误信息仍由父级控制',
    async kind => {
      const checkbox = kind.startsWith('checkbox');
      const grouped = kind.endsWith('group');
      const initial = checkbox ? (grouped ? [] : false) : 'a';
      const model = reactive<{ value: unknown; error: string }>({ value: initial, error: '' });
      const component: Component = checkbox
        ? grouped
          ? ExCheckboxGroup
          : ExCheckbox
        : grouped
          ? ExRadioGroup
          : ExRadio;
      const { wrapper } = mountField(model, () =>
        h(
          component,
          {
            modelValue: model.value,
            value: 'b',
            errorMessage: model.error,
            options: checkbox && grouped ? [{ label: '乙', value: 'b' }] : undefined,
            rules: [
              (value: unknown) =>
                (checkbox
                  ? Array.isArray(value)
                    ? value.length === 0
                    : value === false
                  : value === 'a') || '本地错误',
            ],
            'onUpdate:modelValue': (value: unknown) => (model.value = value),
          },
          grouped && !checkbox ? { default: () => h(ExRadio, { value: 'b' }) } : undefined
        )
      );
      await wrapper.get('input').setValue(true);
      expect(wrapper.text()).toContain('本地错误');
      model.value = initial;
      await nextTick();
      expect(wrapper.text()).not.toContain('本地错误');
      model.error = '服务端错误';
      await nextTick();
      model.value = checkbox ? (grouped ? ['b'] : true) : 'b';
      await nextTick();
      expect(wrapper.text()).toContain('服务端错误');
    }
  );

  it.each(['checkbox', 'checkbox-group', 'radio', 'radio-group'] as const)(
    '%s 重置后清除本地规则错误，并允许新的交互重新校验',
    async kind => {
      const checkbox = kind.startsWith('checkbox');
      const grouped = kind.endsWith('group');
      const initial = checkbox ? (grouped ? [] : false) : 'a';
      const model = reactive<{ value: unknown }>({ value: initial });
      const component: Component = checkbox
        ? grouped
          ? ExCheckboxGroup
          : ExCheckbox
        : grouped
          ? ExRadioGroup
          : ExRadio;
      const { wrapper, reset } = mountField(model, () =>
        h(
          component,
          {
            modelValue: model.value,
            value: 'b',
            options: checkbox && grouped ? [{ label: '乙', value: 'b' }] : undefined,
            rules: [
              (value: unknown) =>
                (checkbox
                  ? Array.isArray(value)
                    ? value.length === 0
                    : value === false
                  : value === 'a') || '本地错误',
            ],
            'onUpdate:modelValue': (value: unknown) => (model.value = value),
          },
          grouped && !checkbox
            ? { default: () => h(ExRadio, { value: 'b', label: '乙' }) }
            : undefined
        )
      );
      await wrapper.get('input').setValue(true);
      expect(wrapper.text()).toContain('本地错误');
      await reset();
      expect(model.value).toEqual(initial);
      expect(wrapper.text()).not.toContain('本地错误');
      await wrapper.get('input').setValue(true);
      expect(wrapper.text()).toContain('本地错误');
    }
  );

  it.each([true, false])(
    '验证码父级接受更新=%s，重置后取消旧自动提交并清空原生值',
    async accept => {
      vi.useFakeTimers();
      const model = reactive({ value: '' });
      const { wrapper, reset } = mountField(model, () =>
        h(ExVerificationCode, {
          modelValue: model.value,
          autoSubmit: true,
          autoSubmitDelay: 50,
          'onUpdate:modelValue': value => {
            if (accept) model.value = value;
          },
        })
      );
      const input = wrapper.get<HTMLInputElement>('input');
      await input.setValue('123456');
      await reset();
      await vi.advanceTimersByTimeAsync(100);
      expect(input.element.value).toBe('');
      expect(wrapper.findComponent(ExVerificationCode).emitted('submit')).toBeUndefined();
      if (accept) {
        await input.setValue('654321');
        await vi.advanceTimersByTimeAsync(100);
        expect(wrapper.findComponent(ExVerificationCode).emitted('submit')).toEqual([['654321']]);
      }
    }
  );

  it('滑块重置取消旧拖动，但新的拖动仍可提交', async () => {
    const model = reactive({ value: 10 });
    const { wrapper, reset } = mountField(model, () =>
      h(ExSlider, {
        modelValue: model.value,
        'onUpdate:modelValue': value => (model.value = value as number),
      })
    );
    vi.spyOn(
      wrapper.get('.ex-slider__track-wrapper').element,
      'getBoundingClientRect'
    ).mockReturnValue({ left: 0, top: 0, width: 100, height: 20 } as DOMRect);
    const thumb = wrapper.get('[role="slider"]');
    await thumb.trigger('mousedown', { clientX: 10 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 80 }));
    await nextTick();
    expect(model.value).toBe(80);
    await reset();
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 90 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();
    expect(model.value).toBe(10);
    expect(wrapper.findComponent(ExSlider).emitted('change')).toBeUndefined();
    await thumb.trigger('mousedown', { clientX: 10 });
    document.dispatchEvent(new MouseEvent('mousemove', { clientX: 30 }));
    document.dispatchEvent(new MouseEvent('mouseup'));
    await nextTick();
    expect(model.value).toBe(30);
  });

  it('TagInput 重置撤销草稿，旧输入节点的尾事件不能再添加标签', async () => {
    const model = reactive({ value: [] as string[] });
    const { wrapper, reset } = mountField(model, () =>
      h(ExTagInput, {
        existingTags: model.value,
        onConfirm: value => model.value.push(value),
      })
    );
    await wrapper.get('button').trigger('click');
    const oldInput = wrapper.get('input');
    await oldInput.setValue('旧草稿');
    await reset();
    await oldInput.trigger('keydown', { key: 'Enter' });
    expect(model.value).toEqual([]);
    expect(wrapper.find('input').exists()).toBe(false);
    await wrapper.get('button').trigger('click');
    await wrapper.get('input').setValue('新标签');
    await wrapper.get('input').trigger('keydown', { key: 'Enter' });
    expect(model.value).toEqual(['新标签']);
  });
});
