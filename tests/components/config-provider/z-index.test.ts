import { describe, expect, it } from 'vitest';
import {
  createZIndexCssVariables,
  normalizeZIndexBase,
  resolveZIndexLayer,
  Z_INDEX_BASE_RANGE,
  Z_INDEX_LAYER_DEFINITIONS,
} from '../../../src/components/config-provider/z-index';

describe('z-index 层级契约', () => {
  it('由一份只读定义生成所有 CSS 变量与服务层级', () => {
    expect(createZIndexCssVariables(2000)).toEqual({
      '--ex-z-watermark': '2000',
      '--ex-z-index-base': '2000',
      '--ex-z-dropdown': '2000',
      '--ex-z-sticky': '2020',
      '--ex-z-banner': '2030',
      '--ex-z-overlay-backdrop': '2039',
      '--ex-z-overlay': '2040',
      '--ex-z-modal': '2050',
      '--ex-z-popover': '2060',
      '--ex-z-toast': '2080',
      '--ex-z-tooltip': '2090',
      '--ex-z-loading': '2100',
    });
    expect(resolveZIndexLayer(3000, 'toast')).toBe(3080);
    expect(resolveZIndexLayer(3000, 'loading')).toBe(3100);
    expect(Object.isFrozen(Z_INDEX_LAYER_DEFINITIONS)).toBe(true);
  });

  it('层级基值使用命名边界并以截断策略规范有限小数', () => {
    expect(normalizeZIndexBase(2100.9, 1000)).toBe(2100);
    expect(normalizeZIndexBase(Number.NaN, 3000)).toBe(3000);
    expect(normalizeZIndexBase(Number.POSITIVE_INFINITY, 3000)).toBe(3000);
    expect(normalizeZIndexBase(-1, 3000)).toBe(3000);
    expect(normalizeZIndexBase(Z_INDEX_BASE_RANGE.max + 1, 3000)).toBe(3000);
  });
});
