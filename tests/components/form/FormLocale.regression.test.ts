import { afterEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExForm from '../../../src/components/form/ExForm.vue';
import ExFormItem from '../../../src/components/form/ExFormItem.vue';
import type { FormInstance, FormRule } from '../../../src/components/form/types';
import { createLocaleProvider, enUS, getCurrentLocale, setLocale, zhCN } from '../../../src/locale';
import type { LocaleMessages } from '../../../src/locale';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  setLocale('en-US');
});

function mountField(
  locale: 'en-US' | 'zh-CN',
  value: unknown,
  rule: FormRule,
  messages?: LocaleMessages
) {
  // 语言切换只改变语言；保持模型和规则身份，避免夹具意外触发另一轮规则变更校验。
  const model = { field: value };
  const rules = { field: [rule] };
  const wrapper = mount(ExConfigProvider, {
    props: { locale },
    slots: {
      default: () =>
        h(
          ExForm,
          {
            model,
            rules,
            scrollToError: false,
          },
          { default: () => h(ExFormItem, { prop: 'field', label: '字段' }) }
        ),
    },
    global: { plugins: messages ? [createLocaleProvider({ locale, messages })] : [] },
  });
  wrappers.push(wrapper);
  const form = wrapper.findComponent(ExForm).vm as unknown as FormInstance;
  return { wrapper, form };
}

const cases: Array<{ name: keyof typeof zhCN.validators; value: unknown; rule: FormRule }> = [
  { name: 'required', value: '', rule: { required: true } },
  { name: 'type', value: '错误布尔值', rule: { type: 'boolean' } },
  { name: 'email', value: '无效邮箱', rule: { type: 'email' } },
  { name: 'url', value: '无效地址', rule: { type: 'url' } },
  { name: 'number', value: '非数字', rule: { type: 'number' } },
  { name: 'integer', value: 1.5, rule: { type: 'integer' } },
  { name: 'min', value: '甲', rule: { min: 2 } },
  { name: 'max', value: '甲乙丙', rule: { max: 2 } },
  { name: 'minValue', value: 1, rule: { minValue: 2 } },
  { name: 'maxValue', value: 3, rule: { maxValue: 2 } },
  { name: 'len', value: '甲', rule: { len: 2 } },
  { name: 'pattern', value: '乙', rule: { pattern: /^甲$/ } },
  { name: 'enum', value: '乙', rule: { enum: ['甲'] } },
];

describe('内置表单校验使用实例翻译上下文', () => {
  it.each(cases)('$name 在中英文 Provider 并存时不串用全局语言', async testCase => {
    setLocale('en-US');
    for (const locale of ['en-US', 'zh-CN'] as const) {
      const { wrapper, form } = mountField(locale, testCase.value, testCase.rule);
      await form.validate();
      const messages = locale === 'zh-CN' ? zhCN : enUS;
      const expected = messages.validators[testCase.name].replace(/\{\w+\}/g, '2');
      expect(wrapper.get('.ex-form-item__error').text()).toBe(expected);
    }
    expect(getCurrentLocale()).toBe('en-US');
  });

  it('切换语言后的下一次校验使用新语言，显式 message 仍优先', async () => {
    const { wrapper, form } = mountField('zh-CN', '', { required: true });
    await form.validate();
    expect(wrapper.get('.ex-form-item__error').text()).toBe(zhCN.validators.required);
    await wrapper.setProps({ locale: 'en-US' });
    await form.validate();
    expect(wrapper.get('.ex-form-item__error').text()).toBe(enUS.validators.required);
    const explicit = mountField('en-US', '', { required: true, message: '业务指定消息' });
    await explicit.form.validate();
    expect(explicit.wrapper.get('.ex-form-item__error').text()).toBe('业务指定消息');
  });

  it('自定义 App 语言包可覆盖内置错误消息', async () => {
    const { wrapper, form } = mountField(
      'zh-CN',
      '',
      { required: true },
      {
        validators: { required: '当前应用的必填提示' },
      }
    );
    await form.validate();
    expect(wrapper.get('.ex-form-item__error').text()).toBe('当前应用的必填提示');
  });

  it('无消息异步拒绝使用实例语言，且完成前语言切换不修改全局状态', async () => {
    let reject!: (reason?: unknown) => void;
    const { wrapper, form } = mountField('en-US', '输入', {
      asyncValidator: () =>
        new Promise<void>((_resolve, fail) => {
          reject = fail;
        }),
    });
    const pending = form.validate();
    await wrapper.setProps({ locale: 'zh-CN' });
    reject();
    await pending;
    await flushPromises();
    expect(wrapper.get('.ex-form-item__error').text()).toBe(zhCN.common.validationError);
    expect(getCurrentLocale()).toBe('en-US');
  });
});
