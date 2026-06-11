import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, reactive, nextTick } from 'vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import ExInput from '../../../src/components/input/ExInput.vue';

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
});
