import { describe, expect, it } from 'vitest';
import { validateField, validateUtils } from '../../../src/components/form/utils';
import type { FormRule } from '../../../src/components/form/types';

const cases: Array<{ rule: FormRule; valid: unknown; invalid: unknown }> = [
  { rule: { type: 'method' }, valid: () => undefined, invalid: 'function' },
  { rule: { type: 'regexp' }, valid: /valid/, invalid: {} },
  { rule: { type: 'object' }, valid: { id: 1 }, invalid: [] },
  { rule: { type: 'date' }, valid: new Date(2024, 0, 1), invalid: new Date(Number.NaN) },
  { rule: { type: 'hex' }, valid: '0xff', invalid: 'not-hex' },
  { rule: { type: 'float' }, valid: 1.25, invalid: Number.POSITIVE_INFINITY },
  { rule: { type: 'enum', enum: ['a', 'b'] }, valid: 'a', invalid: 'c' },
  { rule: { type: 'string' }, valid: 'abc', invalid: 123 },
];

describe('表单类型与可选规则边界', () => {
  it.each(
    [
      '   ',
      false,
      true,
      [],
      [42],
      { valueOf: () => 42 },
      Symbol('value'),
      Number.POSITIVE_INFINITY,
    ].map(value => ({ value }))
  )('数字规则不把其他类型或非有限值强制转成数字：$value', async ({ value }) => {
    const rules: FormRule[] = [
      { type: 'number' },
      { type: 'integer' },
      { type: 'float' },
      { minValue: 0 },
      { maxValue: 100 },
    ];
    for (const rule of rules)
      expect((await validateField([rule], value, 'amount')).valid).toBe(false);
    expect(validateUtils.isNumber(value)).toBe(false);
    expect(validateUtils.isInteger(value)).toBe(false);
  });

  it('保留有限数值和非空数字字符串，整数与小数规则各自生效', async () => {
    expect((await validateField([{ type: 'number' }], ' 0 ', 'amount')).valid).toBe(true);
    expect((await validateField([{ type: 'integer' }], ' -2 ', 'amount')).valid).toBe(true);
    expect((await validateField([{ type: 'float' }], '1e-2', 'amount')).valid).toBe(true);
    expect((await validateField([{ type: 'float' }], 2, 'amount')).valid).toBe(false);
    expect((await validateField([{ type: 'float' }], '2.0', 'amount')).valid).toBe(false);
    expect(validateUtils.isNumber('')).toBe(false);
    expect(validateUtils.isInteger(null)).toBe(false);
  });

  it('长度规则独立于数值上下界', async () => {
    expect((await validateField([{ min: 2, max: 3, len: 2 }], '12', 'code')).valid).toBe(true);
    expect((await validateField([{ min: 2, max: 3, len: 2 }], [1, 2], 'items')).valid).toBe(true);
    expect((await validateField([{ minValue: 2, maxValue: 3 }], '12', 'amount')).valid).toBe(false);
    expect((await validateField([{ minValue: 2, maxValue: 3 }], '2.5', 'amount')).valid).toBe(true);
  });

  it.each([
    ['http://example.com', true],
    ['  HTTPS://example.com/path?data=ftp:  ', true],
    ['javascript:alert(1)', false],
    ['data:text/html,<script>alert(1)</script>', false],
    ['ftp://example.com/file', false],
    ['mailto:team@example.com', false],
    ['https://exam\tple.com/', false],
    ['//example.com', false],
    ['/relative/path', false],
  ])('表单和公开工具统一校验 HTTP(S) 地址 %s', async (url, allowed) => {
    expect((await validateField([{ type: 'url' }], url, 'homepage')).valid).toBe(allowed);
    expect(validateUtils.isUrl(url)).toBe(allowed);
  });

  it.each(cases)(
    '$rule.type 正确接受业务类型并拒绝不合法的值',
    async ({ rule, valid, invalid }) => {
      expect((await validateField([rule], valid, 'field')).valid).toBe(true);
      expect((await validateField([rule], invalid, 'field')).valid).toBe(false);
    }
  );

  it.each([
    { type: 'email' },
    { type: 'url' },
    { type: 'number' },
    { type: 'integer' },
    { type: 'float' },
    { min: 2 },
    { max: 5 },
    { minValue: 2 },
    { maxValue: 5 },
    { len: 3 },
    { pattern: /value/ },
    { enum: ['value'] },
  ] satisfies FormRule[])('没有 required 的规则 %j 允许未填值', async rule => {
    expect((await validateField([rule], null, 'optional')).valid).toBe(true);
  });

  it('转换器失败返回明确错误，数组长度采用项目数量', async () => {
    expect(
      await validateField(
        [
          {
            transform: () => {
              throw new Error('无法转换');
            },
          },
        ],
        'x',
        'field'
      )
    ).toEqual({ valid: false, error: '无法转换' });
    expect((await validateField([{ min: 2 }], ['one'], 'items')).valid).toBe(false);
    expect((await validateField([{ min: 2, max: 3 }], ['one', 'two'], 'items')).valid).toBe(true);
  });
});
