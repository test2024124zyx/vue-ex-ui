import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, reactive, ref } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import type { FormInstance, FormItemInstance, FormRule } from '../../../src/components/form/types';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('表单结构和规则变化撤销旧校验结果', () => {
  it.each(['form', 'fields'] as const)(
    '%s 汇总前复核已完成字段，值或规则变化都不能使用旧的通过结果',
    async mode => {
      const model = reactive({ fast: '已填写', slow: '内容', unrelated: '原值' });
      const fastRules = ref<FormRule[]>([{ required: true, message: '必填' }]);
      const form = ref<FormInstance>();
      let finish!: (error?: string) => void;
      const slowRule: FormRule = {
        validator: (_rule, _value, done) => {
          finish = done;
        },
      };
      const wrapper = mount({
        render: () =>
          h(ExForm, { ref: form, model, scrollToError: false, validateOnRuleChange: false }, () => [
            h(ExFormItem, { prop: 'fast', rules: fastRules.value }),
            h(ExFormItem, { prop: 'slow', rules: slowRule }),
          ]),
      });
      wrappers.push(wrapper);
      const submitted = vi.fn();
      const validate = () =>
        mode === 'form'
          ? form.value!.validate(submitted)
          : form.value!.validateField(['fast', 'slow'], submitted);

      for (const change of ['value', 'rules'] as const) {
        const pending = validate();
        await flushPromises();
        if (change === 'value') model.fast = '';
        else fastRules.value = [{ min: 5, message: '长度不足' }];
        await flushPromises();
        finish();
        await expect(pending).resolves.toMatchObject({ valid: false, outOfDate: true });
        expect(submitted).not.toHaveBeenCalled();
        model.fast = '新的有效内容';
        await flushPromises();
      }

      const current = validate();
      await flushPromises();
      // 未参与校验的数据不应让本次有效结果失效。
      model.unrelated = '新值';
      finish();
      await expect(current).resolves.toEqual({ valid: true, errors: [] });
      expect(submitted).toHaveBeenCalledOnce();
    }
  );

  it('校验期间新增必填字段不得通过提交，重新校验包含新增字段', async () => {
    const model = reactive({ first: '已填写', second: '' });
    const visible = ref(false);
    const form = ref<FormInstance>();
    let finish!: (error?: string) => void;
    const rule: FormRule = {
      validator: (_rule, _value, done) => {
        finish = done;
      },
    };
    const wrapper = mount({
      render: () =>
        h(ExForm, { ref: form, model, scrollToError: false }, () => [
          h(ExFormItem, { prop: 'first', rules: rule }),
          visible.value
            ? h(ExFormItem, { prop: 'second', rules: { required: true, message: '请填写新增项' } })
            : null,
        ]),
    });
    wrappers.push(wrapper);
    const submitted = vi.fn();
    const pending = form.value!.validate(submitted);
    visible.value = true;
    await nextTick();
    finish();
    await expect(pending).resolves.toMatchObject({ valid: false, outOfDate: true });
    expect(submitted).not.toHaveBeenCalled();
    const current = form.value!.validate();
    finish();
    await expect(current).resolves.toMatchObject({
      valid: false,
      errors: [{ field: 'second', message: '请填写新增项' }],
    });
  });

  it.each([true, false])('本地规则替换后旧任务失效，自动重验=%s', async automatic => {
    const item = ref<FormItemInstance>();
    let finish!: (error?: string) => void;
    const rules = ref<FormRule[]>([
      {
        validator: (_rule, _value, done) => {
          finish = done;
        },
      },
    ]);
    const currentValidator = vi.fn<NonNullable<FormRule['validator']>>((_rule, _value, done) => {
      done();
    });
    const wrapper = mount({
      render: () =>
        h(ExForm, { model: { value: '内容' }, validateOnRuleChange: automatic }, () =>
          h(ExFormItem, { ref: item, prop: 'value', rules: rules.value })
        ),
    });
    wrappers.push(wrapper);
    const pending = item.value!.validate();
    rules.value = [{ validator: currentValidator }];
    await nextTick();
    finish('旧规则错误');
    await expect(pending).resolves.toMatchObject({ valid: false, outOfDate: true });
    await flushPromises();
    expect(wrapper.text()).not.toContain('旧规则错误');
    expect(currentValidator).toHaveBeenCalledTimes(automatic ? 1 : 0);
    await expect(item.value!.validate()).resolves.toEqual({ valid: true });
  });

  it('关闭自动重验时，原地修改表单规则仍撤销旧任务', async () => {
    const item = ref<FormItemInstance>();
    let finish!: (error?: string) => void;
    const rules = reactive<Record<string, FormRule[]>>({
      value: [
        {
          validator: (_rule, _value, done) => {
            finish = done;
          },
        },
      ],
    });
    const wrapper = mount(ExForm, {
      props: { model: { value: '内容' }, rules, validateOnRuleChange: false },
      slots: { default: () => h(ExFormItem, { ref: item, prop: 'value' }) },
    });
    wrappers.push(wrapper);
    const pending = item.value!.validate();
    rules.value![0]!.validator = (_rule, _value, done) => done();
    finish('已经移除的规则');
    await expect(pending).resolves.toMatchObject({ valid: false, outOfDate: true });
    expect(wrapper.text()).not.toContain('已经移除的规则');
  });
});
