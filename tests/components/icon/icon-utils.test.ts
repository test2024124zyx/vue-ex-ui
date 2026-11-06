import { describe, expect, it } from 'vitest';
import {
  createIconMaskUrl,
  getFontIconClasses,
  normalizeIconRotation,
  normalizeIconSize,
} from '../../../src/components/icon/icon-utils';
import { ICONS, getBuiltinIcon, isBuiltinIcon } from '../../../src/components/icon/icons';

describe('icon utilities', () => {
  it('规范数字和字符串尺寸，并保留合法的零尺寸', () => {
    expect(normalizeIconSize(24)).toBe('24px');
    expect(normalizeIconSize(0)).toBe('0px');
    expect(normalizeIconSize(' 2rem ')).toBe('2rem');
    expect(normalizeIconSize(-1)).toBe('16px');
    expect(normalizeIconSize(Number.NaN)).toBe('16px');
    expect(normalizeIconSize('   ')).toBe('16px');
  });

  it('旋转角只接受有限数值并限制为一圈内的等价角度', () => {
    expect(normalizeIconRotation(450)).toBe(90);
    expect(normalizeIconRotation(-450)).toBe(-90);
    expect(normalizeIconRotation(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it('为 mask URL 转义引号、反斜杠和换行，避免破坏 CSS 值', () => {
    expect(createIconMaskUrl('/icons/check.svg')).toBe('url("/icons/check.svg")');
    expect(createIconMaskUrl('x");color:red;/*')).toBe('url("x\\");color:red;/*")');
    expect(createIconMaskUrl('a\\b\nc')).toBe('url("a\\\\b\\a c")');
  });

  it('只接受单个有效字体类名标识，不拼接含空白的异常值', () => {
    expect(getFontIconClasses('star', 'fas')).toEqual(['fas', 'fas-star']);
    expect(getFontIconClasses('icon-home')).toEqual(['icon-home']);
    expect(getFontIconClasses('bad name', 'fas')).toEqual([]);
    expect(getFontIconClasses('star', 'bad prefix')).toEqual(['star']);
    expect(getFontIconClasses('')).toEqual([]);
  });

  it('内置注册表不可变且只识别自身注册键', () => {
    expect(Object.isFrozen(ICONS)).toBe(true);
    expect(isBuiltinIcon('search-line')).toBe(true);
    expect(isBuiltinIcon('toString')).toBe(false);
    expect(isBuiltinIcon('__proto__')).toBe(false);
    expect(getBuiltinIcon('search-line')).toContain('<circle');
    expect(getBuiltinIcon('toString')).toBe('');
    expect(getBuiltinIcon('missing-icon')).toBe('');
  });

  it('所有注册内容都非空且不包含可执行 SVG 标记', () => {
    for (const body of Object.values(ICONS)) {
      expect(body.length).toBeGreaterThan(0);
      expect(body).not.toMatch(/<script|<foreignObject|\son\w+=/i);
    }
  });
});
