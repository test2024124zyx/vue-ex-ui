import { describe, expect, it } from 'vitest';
import { validateField } from '../../../src/components/form/utils';
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
