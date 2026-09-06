import { describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import { validateField } from '../../../src/components/form/utils';
import type { FormInstance, FormRule } from '../../../src/components/form/types';

describe('异步字段校验完成契约', () => {
  it('仅返回 Promise 的验证器能够完成成功校验', async () => {
    const completed = vi.fn();
    void validateField([{ asyncValidator: async () => {} }], '用户', 'name').then(completed);
    await flushPromises();
    expect(completed).toHaveBeenCalledWith({ valid: true });
  });

  it.each([new Error('服务不可用'), '网络失败', undefined])(
    'Promise 拒绝转换为失败结果并结束表单忙碌状态：%s',
    async reason => {
      const rules: FormRule[] = [{ asyncValidator: () => Promise.reject(reason) }];
      const wrapper = mount(ExForm, {
        props: { model: { name: '用户' }, rules: { name: rules }, scrollToError: false },
        slots: { default: () => h(ExFormItem, { prop: 'name', label: '姓名' }) },
      });
      const completed = vi.fn();
      void (wrapper.vm as unknown as FormInstance).validate().then(completed);
      await flushPromises();
      expect(completed).toHaveBeenCalledOnce();
      expect(completed.mock.calls[0]?.[0]).toMatchObject({ valid: false });
      expect(wrapper.attributes('aria-busy')).toBeUndefined();
      expect(wrapper.find('.ex-form-item__error').text()).toBeTruthy();
      wrapper.unmount();
    }
  );

  it('支持稍后调用的 callback，不把 undefined 返回当成成功', async () => {
    let complete: ((error?: string) => void) | undefined;
    const completed = vi.fn();
    const rules: FormRule[] = [
      {
        validator: (_rule, _value, callback) => {
          complete = callback;
        },
      },
    ];
    void validateField(rules, '用户', 'name').then(completed);
    await flushPromises();
    expect(completed).not.toHaveBeenCalled();
    complete?.('用户名重复');
    await flushPromises();
    expect(completed).toHaveBeenCalledWith({ valid: false, error: '用户名重复' });
  });

  it('callback 和 Promise 混用时只采纳首次完成并接住晚到的拒绝', async () => {
    const result = await validateField(
      [
        {
          asyncValidator: async (_rule, _value, callback) => {
            callback('首次失败');
            callback();
            throw new Error('晚到的异常');
          },
        },
      ],
      '用户',
      'name'
    );
    await flushPromises();
    expect(result).toEqual({ valid: false, error: '首次失败' });
  });

  it('Promise 先完成后 callback 不能覆盖校验结果', async () => {
    let complete: ((error?: string) => void) | undefined;
    const completed = vi.fn();
    void validateField(
      [
        {
          asyncValidator: async (_rule, _value, callback) => {
            complete = callback;
          },
        },
      ],
      '用户',
      'name'
    ).then(completed);
    await flushPromises();
    expect(completed).toHaveBeenCalledWith({ valid: true });
    complete?.('晚到失败');
    await flushPromises();
    expect(completed).toHaveBeenCalledOnce();
  });
});
