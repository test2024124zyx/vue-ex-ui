import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, reactive, nextTick, ref } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExInput from '../../../src/components/input/ExInput.vue';
import type { FormInstance } from '../../../src/components/form/types';

/**
 * Form 验证链路集成测试：
 * 输入控件的 blur / 值变化应自动触发 FormItem 按规则 trigger 校验
 */
/** 等待异步校验与 DOM 更新完成 */
const flushValidation = async () => {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 20));
  await nextTick();
};

describe('Form validation integration', () => {
  const createForm = () => {
    const model = reactive({ name: '' });

    const App = defineComponent({
      components: { ExForm, ExFormItem, ExInput },
      setup() {
        const rules = {
          name: [
            {
              required: true,
              message: 'name is required',
              trigger: 'blur',
            },
            {
              min: 3,
              message: 'at least 3 chars',
              trigger: 'change',
            },
          ],
        };
        return { model, rules };
      },
      template: `
        <ExForm :model="model" :rules="rules">
          <ExFormItem label="Name" prop="name">
            <ExInput v-model="model.name" />
          </ExFormItem>
        </ExForm>
      `,
    });

    return { wrapper: mount(App, { attachTo: document.body }), model };
  };

  it('blur 触发 required 校验并显示错误', async () => {
    const { wrapper } = createForm();

    const input = wrapper.find('input');
    await input.trigger('blur');
    await flushValidation();

    const error = wrapper.find('.ex-form-item__error');
    expect(error.exists()).toBe(true);
    expect(error.text()).toContain('name is required');
  });

  it('值变化触发 change 校验', async () => {
    const { wrapper, model } = createForm();

    model.name = 'ab';
    await flushValidation();

    const error = wrapper.find('.ex-form-item__error');
    expect(error.exists()).toBe(true);
    expect(error.text()).toContain('at least 3 chars');
  });

  it('输入合法值后错误消除', async () => {
    const { wrapper, model } = createForm();

    model.name = 'ab';
    await flushValidation();
    expect(wrapper.find('.ex-form-item__error').exists()).toBe(true);

    model.name = 'abcd';
    await flushValidation();
    expect(wrapper.find('.ex-form-item__error').exists()).toBe(false);
  });

  it('required 未显式传入时从 rules 推断必填标记', () => {
    const { wrapper } = createForm();
    expect(wrapper.find('.ex-form-item.is-required').exists()).toBe(true);
  });

  it('FormItem 标签、反馈消息与 ExInput 建立可访问性关联，并同步校验状态', async () => {
    const { wrapper } = createForm();
    const input = wrapper.find('input');
    const label = wrapper.find('.ex-form-item__label');

    expect(label.attributes('id')).toBeDefined();
    expect(input.attributes('aria-labelledby')).toBe(label.attributes('id'));

    await input.trigger('blur');
    await flushValidation();

    const error = wrapper.find('.ex-form-item__error');
    expect(error.attributes('id')).toBeDefined();
    expect(input.attributes('aria-describedby')).toContain(error.attributes('id'));
    expect(input.attributes('aria-errormessage')).toBe(error.attributes('id'));
    expect(input.attributes('aria-invalid')).toBe('true');
    expect(wrapper.find('.ex-input').classes()).toContain('ex-input--error');
  });

  it('Form 的尺寸、禁用和只读状态同步到原生输入控件', () => {
    const model = reactive({ name: 'value' });
    const App = defineComponent({
      components: { ExForm, ExFormItem, ExInput },
      setup() {
        return { model };
      },
      template: `
        <ExForm :model="model" size="large" disabled>
          <ExFormItem label="Name" prop="name">
            <ExInput v-model="model.name" />
          </ExFormItem>
        </ExForm>
      `,
    });
    const disabledWrapper = mount(App);
    const disabledInput = disabledWrapper.find('input');

    expect(disabledWrapper.find('.ex-input').classes()).toContain('ex-input--large');
    expect(disabledInput.attributes('disabled')).toBeDefined();
    expect(disabledInput.attributes('aria-disabled')).toBe('true');

    disabledWrapper.unmount();

    const readonlyApp = defineComponent({
      components: { ExForm, ExFormItem, ExInput },
      setup() {
        return { model };
      },
      template: `
        <ExForm :model="model" readonly>
          <ExFormItem label="Name" prop="name">
            <ExInput v-model="model.name" />
          </ExFormItem>
        </ExForm>
      `,
    });
    const readonlyWrapper = mount(readonlyApp);

    expect(readonlyWrapper.find('input').attributes('readonly')).toBeDefined();
    expect(readonlyWrapper.find('input').attributes('aria-readonly')).toBe('true');
    readonlyWrapper.unmount();
  });

  it('FormItem 的 input trigger 会在输入后执行对应规则', async () => {
    const model = reactive({ name: '' });
    const rules = {
      name: [{ required: true, message: 'name is required', trigger: 'input' as const }],
    };
    const App = defineComponent({
      components: { ExForm, ExFormItem, ExInput },
      setup() {
        return { model, rules };
      },
      template: `
        <ExForm :model="model" :rules="rules">
          <ExFormItem label="Name" prop="name">
            <ExInput v-model="model.name" />
          </ExFormItem>
        </ExForm>
      `,
    });
    const wrapper = mount(App);
    const input = wrapper.find('input');

    await input.setValue('');
    await flushValidation();

    expect(wrapper.find('.ex-form-item__error').text()).toContain('name is required');
    wrapper.unmount();
  });

  it('通过 Form 发出字段验证事件，并保持错误字段的注册顺序', async () => {
    const { wrapper } = createForm();
    const form = wrapper.findComponent(ExForm);

    const result = await (form.vm as unknown as FormInstance).validate();
    const events = form.emitted('field-validate');
    const latestEvent = events?.at(-1);

    expect(result.valid).toBe(false);
    expect(latestEvent?.[0]).toBe('name');
    expect(latestEvent?.[1]).toMatchObject({ valid: false });
    expect(result.errors[0]?.field).toBe('name');
    wrapper.unmount();
  });

  it('异步校验完成顺序变化时不会让过期结果覆盖最新状态', async () => {
    const model = reactive({ name: 'value' });
    const pending: Array<(error?: string) => void> = [];
    const rules = {
      name: [
        {
          asyncValidator: async (
            _rule: unknown,
            _value: unknown,
            callback: (error?: string) => void
          ) =>
            new Promise<void>(resolve => {
              pending.push(error => {
                callback(error);
                resolve();
              });
            }),
        },
      ],
    };
    const App = defineComponent({
      components: { ExForm, ExFormItem, ExInput },
      setup() {
        return { model, rules };
      },
      template: `
        <ExForm :model="model" :rules="rules">
          <ExFormItem label="Name" prop="name">
            <ExInput v-model="model.name" />
          </ExFormItem>
        </ExForm>
      `,
    });
    const wrapper = mount(App);
    const form = wrapper.findComponent(ExForm);

    const firstValidation = (form.vm as unknown as FormInstance).validate();
    await nextTick();
    const secondValidation = (form.vm as unknown as FormInstance).validate();
    await nextTick();

    expect(pending).toHaveLength(2);
    pending[1]?.('最新校验失败');
    const latestResult = await secondValidation;
    pending[0]?.();
    const staleResult = await firstValidation;

    expect(latestResult).toMatchObject({ valid: false });
    expect(latestResult.errors[0]?.message).toBe('最新校验失败');
    expect(staleResult).toMatchObject({ valid: false, outOfDate: true });
    expect(wrapper.find('.ex-form-item__error').text()).toContain('最新校验失败');
    wrapper.unmount();
  });

  it('clearValidate 会使正在执行的异步校验失效', async () => {
    const model = reactive({ name: 'value' });
    const pending: Array<(error?: string) => void> = [];
    const rules = {
      name: [
        {
          asyncValidator: async (
            _rule: unknown,
            _value: unknown,
            callback: (error?: string) => void
          ) =>
            new Promise<void>(resolve => {
              pending.push(error => {
                callback(error);
                resolve();
              });
            }),
        },
      ],
    };
    const App = defineComponent({
      components: { ExForm, ExFormItem, ExInput },
      setup() {
        return { model, rules };
      },
      template: `
        <ExForm :model="model" :rules="rules">
          <ExFormItem label="Name" prop="name">
            <ExInput v-model="model.name" />
          </ExFormItem>
        </ExForm>
      `,
    });
    const wrapper = mount(App);
    const form = wrapper.findComponent(ExForm);

    const validation = (form.vm as unknown as FormInstance).validate();
    await nextTick();
    (form.vm as unknown as FormInstance).clearValidate('name');
    pending[0]?.('过期错误');
    const result = await validation;
    await nextTick();

    expect(result).toMatchObject({ valid: false, outOfDate: true });
    expect(wrapper.find('.ex-form-item__error').exists()).toBe(false);
    wrapper.unmount();
  });

  it('resetFields 会使正在执行的异步校验失效', async () => {
    const model = reactive({ name: 'initial' });
    const pending: Array<(error?: string) => void> = [];
    const rules = {
      name: [
        {
          asyncValidator: async (
            _rule: unknown,
            _value: unknown,
            callback: (error?: string) => void
          ) =>
            new Promise<void>(resolve => {
              pending.push(error => {
                callback(error);
                resolve();
              });
            }),
        },
      ],
    };
    const App = defineComponent({
      components: { ExForm, ExFormItem },
      setup() {
        return { model, rules };
      },
      template: `
        <ExForm ref="formRef" :model="model" :rules="rules">
          <ExFormItem label="Name" prop="name" />
        </ExForm>
      `,
    });
    const wrapper = mount(App);
    const form = wrapper.findComponent(ExForm);

    model.name = 'changed';
    const validation = (form.vm as unknown as FormInstance).validate();
    await nextTick();
    (form.vm as unknown as FormInstance).resetFields('name');
    pending[0]?.('过期错误');
    const result = await validation;
    await nextTick();

    expect(result).toMatchObject({ valid: false, outOfDate: true });
    expect(model.name).toBe('initial');
    expect(wrapper.find('.ex-form-item__error').exists()).toBe(false);
    wrapper.unmount();
  });

  it('移除字段规则后会清除已有校验错误', async () => {
    const model = reactive({ name: '' });
    const rules = ref({
      name: [{ required: true, message: 'name is required' }],
    });
    const App = defineComponent({
      components: { ExForm, ExFormItem },
      setup() {
        return { model, rules };
      },
      template: `
        <ExForm :model="model" :rules="rules">
          <ExFormItem label="Name" prop="name" />
        </ExForm>
      `,
    });
    const wrapper = mount(App);
    const form = wrapper.findComponent(ExForm);

    await (form.vm as unknown as FormInstance).validate();
    expect(wrapper.find('.ex-form-item__error').exists()).toBe(true);

    rules.value = {} as typeof rules.value;
    await flushValidation();

    expect(wrapper.find('.ex-form-item__error').exists()).toBe(false);
    wrapper.unmount();
  });

  it('trigger 过滤后没有匹配规则时会保留已有错误', async () => {
    const model = reactive({ name: '' });
    const rules = {
      name: [{ required: true, message: 'name is required', trigger: 'change' as const }],
    };
    const App = defineComponent({
      components: { ExForm, ExFormItem, ExInput },
      setup() {
        return { model, rules };
      },
      template: `
        <ExForm :model="model" :rules="rules">
          <ExFormItem label="Name" prop="name">
            <ExInput v-model="model.name" />
          </ExFormItem>
        </ExForm>
      `,
    });
    const wrapper = mount(App);

    model.name = 'value';
    await flushValidation();
    model.name = '';
    await flushValidation();
    expect(wrapper.find('.ex-form-item__error').exists()).toBe(true);
    await wrapper.find('input').trigger('blur');
    await flushValidation();

    expect(wrapper.find('.ex-form-item__error').exists()).toBe(true);
    expect(wrapper.find('.ex-form-item__error').text()).toContain('name is required');
    wrapper.unmount();
  });

  it('无关 trigger 不会取消正在执行的匹配校验', async () => {
    const model = reactive({ name: '' });
    const pending: Array<(error?: string) => void> = [];
    const rules = {
      name: [
        {
          trigger: 'change' as const,
          asyncValidator: async (
            _rule: unknown,
            _value: unknown,
            callback: (error?: string) => void
          ) =>
            new Promise<void>(resolve => {
              pending.push(error => {
                callback(error);
                resolve();
              });
            }),
        },
      ],
    };
    const App = defineComponent({
      components: { ExForm, ExFormItem, ExInput },
      setup() {
        return { model, rules };
      },
      template: `
        <ExForm :model="model" :rules="rules">
          <ExFormItem label="Name" prop="name">
            <ExInput v-model="model.name" />
          </ExFormItem>
        </ExForm>
      `,
    });
    const wrapper = mount(App);

    model.name = 'pending';
    await flushValidation();
    expect(pending).toHaveLength(1);
    expect(wrapper.find('.ex-form-item').classes()).toContain('is-validating');

    await wrapper.find('input').trigger('blur');
    await flushValidation();
    expect(wrapper.find('.ex-form-item').classes()).toContain('is-validating');

    pending[0]?.('change validation failed');
    await flushValidation();

    expect(wrapper.find('.ex-form-item__error').text()).toContain('change validation failed');
    wrapper.unmount();
  });

  it('prop 运行时切换后会更新注册字段与重置快照', async () => {
    const model = reactive({ first: 'first-initial', second: 'second-initial' });
    const propName = ref<'first' | 'second'>('first');
    const App = defineComponent({
      components: { ExForm, ExFormItem },
      setup() {
        return { model, propName };
      },
      template: `
        <ExForm :model="model">
          <ExFormItem label="Dynamic" :prop="propName" />
        </ExForm>
      `,
    });
    const wrapper = mount(App);
    const form = wrapper.findComponent(ExForm);

    model.second = 'second-at-switch';
    propName.value = 'second';
    await nextTick();
    model.first = 'first-changed';
    model.second = 'second-changed';

    (form.vm as unknown as FormInstance).resetFields('first');
    expect(model.first).toBe('first-changed');
    (form.vm as unknown as FormInstance).resetFields('second');
    expect(model.second).toBe('second-at-switch');
    wrapper.unmount();
  });

  it('同一 prop 的多个 FormItem 会全部注册并接收校验清理', async () => {
    const model = reactive({ name: '' });
    const rules = {
      name: [{ required: true, message: 'name is required' }],
    };
    const App = defineComponent({
      components: { ExForm, ExFormItem },
      setup() {
        return { model, rules };
      },
      template: `
        <ExForm :model="model" :rules="rules">
          <ExFormItem label="Primary" prop="name" />
          <ExFormItem label="Confirm" prop="name" />
        </ExForm>
      `,
    });
    const wrapper = mount(App);
    const form = wrapper.findComponent(ExForm);

    await (form.vm as unknown as FormInstance).validate();
    expect(wrapper.findAll('.ex-form-item__error')).toHaveLength(2);
    (form.vm as unknown as FormInstance).clearValidate('name');
    await nextTick();

    expect(wrapper.findAll('.ex-form-item__error')).toHaveLength(0);
    wrapper.unmount();
  });

  it('控件通知与模型 watcher 不会重复执行同一次校验', async () => {
    const validator = vi.fn((_rule: unknown, _value: unknown, callback: (error?: string) => void) =>
      callback()
    );
    const model = reactive({ name: '' });
    const rules = {
      name: [{ validator, trigger: ['input', 'change'] as const }],
    };
    const App = defineComponent({
      components: { ExForm, ExFormItem, ExInput },
      setup() {
        return { model, rules };
      },
      template: `
        <ExForm :model="model" :rules="rules">
          <ExFormItem label="Name" prop="name">
            <ExInput v-model="model.name" />
          </ExFormItem>
        </ExForm>
      `,
    });
    const wrapper = mount(App);

    await wrapper.find('input').setValue('updated');
    await flushValidation();

    expect(validator).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('模型字段原地深层变更仍会触发 change 校验', async () => {
    const validator = vi.fn((_rule: unknown, _value: unknown, callback: (error?: string) => void) =>
      callback()
    );
    const model = reactive<{ tags: string[] }>({ tags: [] });
    const rules = {
      tags: [{ validator, trigger: 'change' as const }],
    };
    const App = defineComponent({
      components: { ExForm, ExFormItem },
      setup() {
        return { model, rules };
      },
      template: `
        <ExForm :model="model" :rules="rules">
          <ExFormItem label="Tags" prop="tags" />
        </ExForm>
      `,
    });
    const wrapper = mount(App);

    model.tags.push('one');
    await flushValidation();

    expect(validator).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
});
