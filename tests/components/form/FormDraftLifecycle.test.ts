import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, reactive, ref } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExNumberInput from '../../../src/components/number-input/ExNumberInput.vue';
import type { FormInstance, FormRule } from '../../../src/components/form/types';

const wrappers: Array<{ unmount(): void }> = [];
const pendingCleanup: Array<() => void> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  pendingCleanup.splice(0).forEach(finish => finish());
  vi.useRealTimers();
});

function createHarness(accept = true, debounceDelay = 0) {
  const model = reactive<Record<string, number | null>>({ count: 1, other: 8 });
  const prop = ref('count');
  const shown = ref(true);
  const readonly = ref(false);
  const form = ref<FormInstance>();
  const pending: Array<{ value: unknown; finish: (error?: string) => void }> = [];
  const rule: FormRule = {
    trigger: 'input',
    validator: (_rule, value, finish) => {
      pending.push({ value, finish });
      pendingCleanup.push(() => finish());
    },
  };
  const rules = { count: [rule], other: [rule] };
  const wrapper = mount(
    {
      render: () =>
        h(ExForm, { ref: form, model, rules, readonly: readonly.value }, () =>
          shown.value
            ? h(ExFormItem, { prop: prop.value }, () =>
                h(ExNumberInput, {
                  modelValue: model[prop.value],
                  debounceDelay,
                  'onUpdate:modelValue': value => {
                    if (accept) model[prop.value] = value;
                  },
                })
              )
            : null
        ),
    },
    { attachTo: document.body }
  );
  wrappers.push(wrapper);
  const input = () => wrapper.get<HTMLInputElement>('input');
  const draft = async (value = '2') => {
    await input().trigger('focus');
    input().element.value = value;
    await input().trigger('input');
    await flushPromises();
  };
  return { wrapper, model, prop, shown, readonly, form, pending, input, draft };
}

describe('输入草稿校验的值身份与生命周期', () => {
  it.each(['external', 'blur', 'reset', 'clear', 'rename', 'unmount', 'readonly'] as const)(
    '%s 使旧草稿异步结果失效，即使新触发器没有匹配规则',
    async transition => {
      const harness = createHarness();
      await harness.draft();
      expect(harness.pending[0]!.value).toBe(2);
      const formWrapper = harness.wrapper.findComponent(ExForm);
      const before = formWrapper.emitted('field-validate')?.length ?? 0;
      if (transition === 'external') harness.model.count = 4;
      if (transition === 'blur') await harness.input().trigger('blur');
      if (transition === 'reset') harness.form.value!.resetFields();
      if (transition === 'clear') harness.form.value!.clearValidate();
      if (transition === 'rename') harness.prop.value = 'other';
      if (transition === 'unmount') harness.shown.value = false;
      if (transition === 'readonly') harness.readonly.value = true;
      await flushPromises();
      harness.pending[0]!.finish('旧草稿错误');
      await flushPromises();
      expect(harness.wrapper.text()).not.toContain('旧草稿错误');
      expect(formWrapper.emitted('field-validate')?.length ?? 0).toBe(before);
      expect(harness.wrapper.find('.is-validating').exists()).toBe(false);
    }
  );

  it.each(['external', 'blur', 'reset', 'rename', 'readonly'] as const)(
    '%s 同时清除已经完成但不再对应当前值的草稿错误',
    async transition => {
      const harness = createHarness();
      await harness.draft();
      harness.pending[0]!.finish('草稿不合法');
      await flushPromises();
      expect(harness.wrapper.text()).toContain('草稿不合法');
      if (transition === 'external') harness.model.count = 4;
      if (transition === 'blur') await harness.input().trigger('blur');
      if (transition === 'reset') harness.form.value!.resetFields();
      if (transition === 'rename') harness.prop.value = 'other';
      if (transition === 'readonly') harness.readonly.value = true;
      await flushPromises();
      expect(harness.wrapper.text()).not.toContain('草稿不合法');
    }
  );

  it.each([true, false])(
    '父级接受=%s 时，change/blur 按最终确认值保留或丢弃在途校验',
    async accept => {
      const harness = createHarness(accept);
      await harness.draft();
      await harness.input().trigger('change');
      await harness.input().trigger('blur');
      await flushPromises();
      harness.pending[0]!.finish('值2不合法');
      await flushPromises();
      expect(harness.model.count).toBe(accept ? 2 : 1);
      expect(harness.input().element.value).toBe(accept ? '2' : '1');
      expect(harness.wrapper.text().includes('值2不合法')).toBe(accept);
    }
  );

  it('值已接受时，无关 blur 也不能清除已经完成的 input 错误', async () => {
    const harness = createHarness();
    await harness.draft();
    harness.pending[0]!.finish('值2不合法');
    await flushPromises();
    await harness.input().trigger('change');
    await harness.input().trigger('blur');
    await flushPromises();
    expect(harness.wrapper.text()).toContain('值2不合法');
  });

  it('同值 reset 清除聚焦草稿与防抖任务，但不发出 change 或更新模型', async () => {
    vi.useFakeTimers();
    const harness = createHarness(true, 100);
    harness.input().element.focus();
    await nextTick();
    harness.input().element.value = '2';
    await harness.input().trigger('input');
    const field = harness.wrapper.findComponent(ExNumberInput);
    expect(harness.model.count).toBe(1);
    harness.form.value!.resetFields();
    await nextTick();
    await vi.advanceTimersByTimeAsync(200);
    expect(harness.input().element.value).toBe('1');
    expect(harness.input().element).toBe(document.activeElement);
    expect(field.emitted('input')).toBeUndefined();
    expect(field.emitted('change')).toBeUndefined();
    expect(field.emitted('update:modelValue')).toBeUndefined();
  });

  it('外部更新覆盖正在编辑的草稿，随后新输入和校验仍能正常工作', async () => {
    const harness = createHarness();
    await harness.draft();
    harness.model.count = 4;
    await nextTick();
    expect(harness.input().element.value).toBe('4');
    await harness.draft('5');
    harness.pending[1]!.finish();
    await flushPromises();
    harness.pending[0]!.finish('旧任务');
    await flushPromises();
    expect(harness.wrapper.text()).not.toContain('旧任务');
    expect(harness.wrapper.find('.is-success').exists()).toBe(true);
  });
});
