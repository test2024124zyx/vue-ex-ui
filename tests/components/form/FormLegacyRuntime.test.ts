import { describe, expect, it } from 'vitest';
import { getFieldValue, resetField, setFieldValue } from '../../../src/components/form/utils';

describe('已承诺最低环境中的表单字段操作', () => {
  it('不依赖 Array.at 完成普通、嵌套、数组路径写入与重置', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'at')!;
    const model: Record<string, unknown> = {};
    let error: unknown;
    try {
      Object.defineProperty(Array.prototype, 'at', { ...descriptor, value: undefined });
      setFieldValue(model, 'name', '已修改');
      setFieldValue(model, 'profile.displayName', '中文');
      setFieldValue(model, 'rows.0.amount', 0);
      resetField(model, 'name', '初始值');
    } catch (caught) {
      error = caught;
    } finally {
      Object.defineProperty(Array.prototype, 'at', descriptor);
    }
    expect(error).toBeUndefined();
    expect(getFieldValue(model, 'name')).toBe('初始值');
    expect(getFieldValue(model, 'profile.displayName')).toBe('中文');
    expect(getFieldValue(model, 'rows.0.amount')).toBe(0);
  });
});
