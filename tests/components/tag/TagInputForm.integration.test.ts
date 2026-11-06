import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, reactive } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExTagInput from '../../../src/components/tag/ExTagInput.vue';
import type { FormRule, FormSize, FormValidateStatus } from '../../../src/components/form/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

function mountField() {
  const state = reactive({
    disabled: false,
    readonly: false,
    size: 'large' as FormSize,
    status: 'error' as FormValidateStatus,
    error: '至少一个标签',
  });
  const wrapper = mount(
    {
      render: () =>
        h(ExForm, state, {
          default: () =>
            h(
              ExFormItem,
              { label: '标签', error: state.error, validateStatus: state.status },
              {
                default: () =>
                  h(ExTagInput, { existingTags: ['已有'], 'aria-describedby': 'business-help' }),
              }
            ),
        }),
    },
    { attachTo: document.body }
  );
  wrappers.push(wrapper);
  return { wrapper, state };
}

describe('TagInput 正式表单字段集成', () => {
  it('按钮与输入继承标签、错误、尺寸，并合并本地重复提示', async () => {
    const { wrapper, state } = mountField();
    const labelId = wrapper.get('.ex-form-item__label').attributes('id');
    const errorId = wrapper.get('.ex-form-item__error').attributes('id');
    const button = wrapper.get('.ex-tag-input__button');
    expect(button.classes()).toContain('ex-tag-input__button--large');
    expect(button.attributes('aria-labelledby')).toBe(labelId);
    expect(button.attributes('aria-describedby')?.split(' ')).toEqual(['business-help', errorId]);
    expect(button.attributes('aria-invalid')).toBe('true');
    expect(button.classes()).toContain('is-error');
    await button.trigger('click');
    const input = wrapper.get('input');
    expect(input.classes()).toContain('ex-tag-input__input--large');
    expect(input.attributes('aria-labelledby')).toBe(labelId);
    expect(input.attributes('aria-invalid')).toBe('true');
    await input.setValue('已有');
    await input.trigger('keydown', { key: 'Enter' });
    const duplicateId = wrapper.get('.ex-tag-input__feedback').attributes('id');
    expect(input.attributes('aria-describedby')?.split(' ')).toEqual([
      'business-help',
      errorId,
      duplicateId,
    ]);
    await input.setValue('不同');
    expect(input.attributes('aria-describedby')?.split(' ')).toEqual(['business-help', errorId]);
    expect(input.attributes('aria-invalid')).toBe('true');
    state.error = '';
    state.status = 'success';
    state.size = 'small';
    await nextTick();
    expect(input.attributes('aria-invalid')).toBeUndefined();
    expect(input.classes()).toContain('is-success');
    expect(input.classes()).toContain('ex-tag-input__input--small');
  });

  it.each(['disabled', 'readonly'] as const)('Form %s 阻止开始编辑，恢复后可以继续', async mode => {
    const { wrapper, state } = mountField();
    state[mode] = true;
    await nextTick();
    const button = wrapper.get('.ex-tag-input__button');
    expect(button.attributes('aria-disabled')).toBe('true');
    await button.trigger('click');
    expect(wrapper.find('input').exists()).toBe(false);
    state[mode] = false;
    await nextTick();
    await button.trigger('click');
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it.each(['disabled', 'readonly'] as const)(
    '编辑中切换 %s 丢弃草稿，晚到事件不能提交',
    async mode => {
      const { wrapper, state } = mountField();
      const field = wrapper.findComponent(ExTagInput);
      await wrapper.get('.ex-tag-input__button').trigger('click');
      const oldInput = wrapper.get('input');
      await oldInput.trigger('compositionstart');
      await oldInput.setValue('草稿');
      state[mode] = true;
      await nextTick();
      expect(wrapper.find('input').exists()).toBe(false);
      await oldInput.trigger('compositionend');
      await oldInput.trigger('input');
      await oldInput.trigger('keydown', { key: 'Enter' });
      expect(field.emitted('confirm')).toBeUndefined();
      expect(field.emitted('cancel')).toBeUndefined();
      expect(field.emitted('duplicate')).toBeUndefined();
      state[mode] = false;
      await nextTick();
      await wrapper.get('.ex-tag-input__button').trigger('click');
      expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('');
      await wrapper.get('input').setValue('新草稿');
      (oldInput.element as HTMLInputElement).value = '晚到草稿';
      await oldInput.trigger('compositionend');
      await oldInput.trigger('keydown', { key: 'Enter' });
      expect(wrapper.find('input').exists()).toBe(true);
      expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('新草稿');
      expect(field.emitted('confirm')).toBeUndefined();
      await wrapper.get('input').trigger('keydown', { key: 'Enter' });
      expect(field.emitted('confirm')).toEqual([['新草稿']]);
    }
  );

  it('独立字段也遵守禁用和只读属性', async () => {
    const wrapper = mount(ExTagInput, { props: { disabled: true } });
    wrappers.push(wrapper);
    await wrapper.get('button').trigger('click');
    expect(wrapper.find('input').exists()).toBe(false);
    await wrapper.setProps({ disabled: false, readonly: true });
    await wrapper.get('button').trigger('click');
    expect(wrapper.find('input').exists()).toBe(false);
  });

  it('真实 Form 在输入、确认和离开整个字段时校验，内部动作焦点移动不提前失焦', async () => {
    const inputValidator = vi.fn<NonNullable<FormRule['validator']>>((_rule, _value, done) =>
      done()
    );
    const changeValidator = vi.fn<NonNullable<FormRule['validator']>>((_rule, _value, done) =>
      done()
    );
    const blurValidator = vi.fn<NonNullable<FormRule['validator']>>((_rule, _value, done) =>
      done()
    );
    const model = reactive({ tags: [] as string[] });
    const wrapper = mount(ExForm, {
      props: {
        model,
        rules: {
          tags: [
            { validator: inputValidator, trigger: 'input' },
            { validator: changeValidator, trigger: 'change' },
            { validator: blurValidator, trigger: 'blur' },
          ],
        },
      },
      slots: {
        default: () =>
          h(
            ExFormItem,
            { prop: 'tags', label: '标签' },
            {
              default: () =>
                h(ExTagInput, {
                  existingTags: model.tags,
                  onConfirm: value => model.tags.push(value),
                }),
            }
          ),
      },
    });
    wrappers.push(wrapper);
    await wrapper.get('.ex-tag-input__button').trigger('click');
    await wrapper.get('input').setValue('新标签');
    await flushPromises();
    expect(inputValidator).toHaveBeenCalled();
    await wrapper
      .get('input')
      .trigger('blur', { relatedTarget: wrapper.get('.ex-tag-input__action--confirm').element });
    await flushPromises();
    expect(blurValidator).not.toHaveBeenCalled();
    await wrapper.get('.ex-tag-input__action--confirm').trigger('click');
    await flushPromises();
    expect(changeValidator.mock.calls.at(-1)?.[1]).toEqual(['新标签']);
    await wrapper.get('.ex-tag-input__button').trigger('blur', { relatedTarget: document.body });
    await flushPromises();
    expect(blurValidator).toHaveBeenCalled();
    expect(blurValidator.mock.calls.at(-1)?.[1]).toEqual(['新标签']);
  });
});
