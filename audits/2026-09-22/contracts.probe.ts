import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { h, reactive } from 'vue';
import fc from 'fast-check';
import ExForm from '../../src/components/form/ExForm.vue';
import ExFormItem from '../../src/components/form/ExFormItem.vue';
import ExConfigProvider from '../../src/components/config-provider/ExConfigProvider.vue';
import { setLocale, zhCN, enUS } from '../../src/locale';
import { deepMerge } from '../../src/utils';
import { sanitizeHtml } from '../../src/utils/sanitize';
import { getFieldValue, setFieldValue } from '../../src/components/form/utils';
import type { FormInstance } from '../../src/components/form/types';

const PROPERTY_BUDGET = { seed: 20260922, numRuns: 200 };
const mounted: Array<{ unmount(): void }> = [];
function track<T extends { unmount(): void }>(wrapper: T): T {
  mounted.push(wrapper);
  return wrapper;
}

afterEach(() => {
  mounted.splice(0).forEach(wrapper => wrapper.unmount());
  setLocale('en-US');
  vi.restoreAllMocks();
});

describe('R10 局部语言与表单默认校验', () => {
  it.each(['en-US', 'zh-CN'] as const)('Provider %s 决定默认 required 文案', async locale => {
    setLocale('en-US');
    const wrapper = track(
      mount(ExConfigProvider, {
        props: { locale },
        slots: {
          default: () =>
            h(
              ExForm,
              {
                model: { name: '' },
                rules: { name: [{ required: true }] },
                scrollToError: false,
              },
              { default: () => h(ExFormItem, { prop: 'name', label: '姓名' }) }
            ),
        },
      })
    );
    await (wrapper.findComponent(ExForm).vm as unknown as FormInstance).validate();
    const expected = locale === 'zh-CN' ? zhCN.validators.required : enUS.validators.required;
    expect(wrapper.get('.ex-form-item__error').text()).toBe(expected);
  });
});

describe('R09 异步结果与生命周期', () => {
  it('较旧校验晚返回时不覆盖新值状态', async () => {
    const completions = new Map<string, (error?: string) => void>();
    const model = reactive({ name: 'first' });
    const wrapper = track(
      mount(ExForm, {
        props: {
          model,
          scrollToError: false,
          rules: {
            name: [
              {
                trigger: 'blur',
                validator: (_rule, value, callback) => {
                  completions.set(String(value), callback);
                },
              },
            ],
          },
        },
        slots: { default: () => h(ExFormItem, { prop: 'name' }) },
      })
    );
    const form = wrapper.vm as unknown as FormInstance;
    const first = form.validate();
    model.name = 'second';
    await flushPromises();
    const second = form.validate();
    completions.get('second')!();
    expect((await second).valid).toBe(true);
    completions.get('first')!('旧结果');
    expect((await first).outOfDate).toBe(true);
    expect(wrapper.find('.ex-form-item__error').exists()).toBe(false);
  });

  it('卸载后晚到校验不得执行成功回调', async () => {
    let finish!: (error?: string) => void;
    const callback = vi.fn();
    const wrapper = mount(ExForm, {
      props: {
        model: { name: 'a' },
        scrollToError: false,
        rules: {
          name: [
            {
              validator: (_rule, _value, done) => {
                finish = done;
              },
            },
          ],
        },
      },
      slots: { default: () => h(ExFormItem, { prop: 'name' }) },
    });
    const pending = (wrapper.vm as unknown as FormInstance).validate(callback);
    wrapper.unmount();
    finish();
    expect((await pending).outOfDate).toBe(true);
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('R15 合并与字段路径安全', () => {
  it('不可信 source 的原型键不得成为返回值继承属性', () => {
    const result = deepMerge({}, JSON.parse('{"__proto__":{"auditInjected":true}}'));
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect('auditInjected' in result).toBe(false);
  });

  it('不可信 target 的原型键不得成为返回值继承属性', () => {
    const input = JSON.parse('{"__proto__":{"auditInjected":true},"safe":1}');
    const result = deepMerge(input, { safe: 2 });
    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect('auditInjected' in result).toBe(false);
    expect(({} as Record<string, unknown>).auditInjected).toBeUndefined();
  });

  it('安全字段路径写入后读取保持值且不影响原型', () => {
    fc.assert(
      fc.property(
        fc.array(fc.stringMatching(/^[a-z]{1,8}$/), { minLength: 1, maxLength: 5 }),
        fc.jsonValue(),
        (segments, value) => {
          const model = {};
          const path = segments.join('.');
          setFieldValue(model, path, value);
          expect(getFieldValue(model, path)).toEqual(value);
          expect(Object.getPrototypeOf(model)).toBe(Object.prototype);
        }
      ),
      PROPERTY_BUDGET
    );
  });

  it.each(['__proto__.auditInjected', 'constructor.prototype.auditInjected', 'a.__proto__.x'])(
    '危险路径 %s 不得写入',
    path => {
      const model = {};
      setFieldValue(model, path, true);
      expect(model).toEqual({});
      expect(({} as Record<string, unknown>).auditInjected).toBeUndefined();
    }
  );
});

describe('R14 消毒属性测试', () => {
  it('随机文本放入可执行属性后，解析结果不保留处理器或危险 scheme', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 256 }), text => {
        const input = `<div onclick="window.auditExecuted=true">${text}<a href="javascript:window.auditExecuted=true">x</a></div>`;
        const document = new DOMParser().parseFromString(sanitizeHtml(input), 'text/html');
        for (const element of document.querySelectorAll('*')) {
          expect([...element.attributes].some(attribute => /^on/i.test(attribute.name))).toBe(
            false
          );
          expect(element.getAttribute('href')?.toLowerCase().startsWith('javascript:')).not.toBe(
            true
          );
        }
      }),
      PROPERTY_BUDGET
    );
  });
});
