import { describe, expect, it } from 'vitest';
import type { FormRule } from '../../../src/components/form/types';
import {
  builtinValidators,
  commonRules,
  getFieldValue,
  resetField,
  setFieldValue,
  validateField,
  validateUtils,
} from '../../../src/components/form/utils';

const runValidator = (
  name: keyof typeof builtinValidators,
  rule: FormRule,
  value: unknown
): Promise<string | undefined> =>
  new Promise(resolve => builtinValidators[name](rule, value, resolve));

describe('Form 校验工具', () => {
  it('读取、设置和重置嵌套字段值', () => {
    const model: Record<string, unknown> = { user: { name: '旧值' } };

    expect(getFieldValue(model, 'user.name')).toBe('旧值');
    expect(getFieldValue(model, 'user.missing')).toBeUndefined();

    setFieldValue(model, 'user.profile.email', 'test@example.com');
    expect(getFieldValue(model, 'user.profile.email')).toBe('test@example.com');

    setFieldValue(model, 'user.profile', '覆盖值');
    setFieldValue(model, 'user.profile.email', '重新创建');
    expect(getFieldValue(model, 'user.profile.email')).toBe('重新创建');

    resetField(model, 'user.name', '初始值');
    expect(getFieldValue(model, 'user.name')).toBe('初始值');
  });

  it('执行必填、空白和常用基础校验', async () => {
    expect(await runValidator('required', { required: true, message: '必填' }, '')).toBe('必填');
    expect(await runValidator('required', { required: true, message: '必填' }, [])).toBe('必填');
    expect(await runValidator('required', { required: true, message: '必填' }, '  ')).toBe('必填');
    expect(
      await runValidator('required', { required: true, whitespace: false }, '  ')
    ).toBeUndefined();
    expect(await runValidator('required', { required: true }, '有效值')).toBeUndefined();

    expect(await runValidator('email', { type: 'email', message: '邮箱' }, 'bad')).toBe('邮箱');
    expect(await runValidator('email', { type: 'email' }, 'a@example.com')).toBeUndefined();
    expect(await runValidator('url', { type: 'url', message: '网址' }, 'bad')).toBe('网址');
    expect(await runValidator('url', { type: 'url' }, 'https://example.com')).toBeUndefined();
    expect(await runValidator('number', { type: 'number', message: '数字' }, 'bad')).toBe('数字');
    expect(await runValidator('integer', { type: 'integer', message: '整数' }, '1.2')).toBe('整数');
    expect(await runValidator('float', { type: 'float' }, '1.2')).toBeUndefined();
  });

  it('执行长度、数值、正则和枚举校验', async () => {
    expect(await runValidator('min', { min: 3, message: '太短' }, 'ab')).toBe('太短');
    expect(await runValidator('min', { min: 3 }, ['a', 'b', 'c'])).toBeUndefined();
    expect(await runValidator('max', { max: 3, message: '太长' }, 'abcd')).toBe('太长');
    expect(await runValidator('max', { max: 3 }, 'abc')).toBeUndefined();
    expect(await runValidator('minValue', { minValue: 10, message: '太小' }, 9)).toBe('太小');
    expect(await runValidator('minValue', { minValue: 10 }, 10)).toBeUndefined();
    expect(await runValidator('maxValue', { maxValue: 10, message: '太大' }, 11)).toBe('太大');
    expect(await runValidator('maxValue', { maxValue: 10 }, 10)).toBeUndefined();
    expect(await runValidator('pattern', { pattern: /^ok$/, message: '格式' }, 'bad')).toBe('格式');
    expect(await runValidator('pattern', { pattern: /^ok$/ }, 'ok')).toBeUndefined();
    expect(await runValidator('enum', { enum: ['a', 'b'], message: '枚举' }, 'c')).toBe('枚举');
    expect(await runValidator('enum', { enum: ['a', 'b'] }, 'a')).toBeUndefined();
  });

  it('支持声明中的类型和精确长度校验，并可重复使用全局正则', async () => {
    expect(await runValidator('type', { type: 'string' }, '文本')).toBeUndefined();
    expect(await runValidator('type', { type: 'string', message: '类型错误' }, 123)).toBe(
      '类型错误'
    );
    expect(await runValidator('type', { type: 'array' }, ['a'])).toBeUndefined();
    expect(await runValidator('len', { len: 3, message: '长度错误' }, 'ab')).toBe('长度错误');
    expect(await runValidator('len', { len: 3 }, ['a', 'b', 'c'])).toBeUndefined();

    const reusablePattern = /^ok$/g;
    expect(await runValidator('pattern', { pattern: reusablePattern }, 'ok')).toBeUndefined();
    expect(await runValidator('pattern', { pattern: reusablePattern }, 'ok')).toBeUndefined();
  });

  it('支持转换器、自定义校验器和异步校验器', async () => {
    const transformed = await validateField(
      [{ transform: value => String(value).trim(), pattern: /^ok$/, message: '转换失败' }],
      ' ok ',
      'name'
    );
    expect(transformed).toEqual({ valid: true });

    const custom = await validateField(
      [
        {
          validator: (_rule, value, callback) =>
            callback(value === 'ok' ? undefined : '自定义失败'),
        },
      ],
      'bad',
      'name'
    );
    expect(custom).toEqual({ valid: false, error: '自定义失败' });

    const asyncResult = await validateField(
      [
        {
          asyncValidator: async (_rule, _value, callback) => callback('异步失败'),
        },
      ],
      'bad',
      'name'
    );
    expect(asyncResult).toEqual({ valid: false, error: '异步失败' });

    const thrown = await validateField(
      [
        {
          validator: () => {
            throw new Error('校验异常');
          },
        },
      ],
      'bad',
      'name'
    );
    expect(thrown).toEqual({ valid: false, error: '校验异常' });
  });

  it('暴露通用校验工具和规则工厂', () => {
    expect(validateUtils.isEmpty('')).toBe(true);
    expect(validateUtils.isEmail('a@example.com')).toBe(true);
    expect(validateUtils.isUrl('https://example.com')).toBe(true);
    expect(validateUtils.isNumber('1.2')).toBe(true);
    expect(validateUtils.isInteger('2')).toBe(true);
    expect(validateUtils.isPhone('13812345678')).toBe(true);
    expect(validateUtils.isIdCard('110101199001011234')).toBe(true);

    expect(commonRules.required('必填').message).toBe('必填');
    expect(commonRules.email().type).toBe('email');
    expect(commonRules.phone().pattern).toBeInstanceOf(RegExp);
    expect(commonRules.length(2, 4).min).toBe(2);
    expect(commonRules.minLength(2).min).toBe(2);
    expect(commonRules.maxLength(4).max).toBe(4);
    expect(commonRules.range(1, 4).minValue).toBe(1);
    expect(commonRules.pattern(/^ok$/).pattern).toEqual(/^ok$/);
  });
});
