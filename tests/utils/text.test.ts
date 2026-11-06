import { describe, expect, it } from 'vitest';
import { getFirstGrapheme } from '../../src/utils/text';

describe('text utilities', () => {
  it.each([
    ['用户', '用'],
    ['  Admin  ', 'A'],
    ['👨‍👩‍👧‍👦家庭', '👨‍👩‍👧‍👦'],
    ['🇨🇳中国', '🇨🇳'],
  ])('从 %s 中返回首个完整字素', (value, expected) => {
    expect(getFirstGrapheme(value)).toBe(expected);
  });

  it('空白或空值返回空字符串', () => {
    expect(getFirstGrapheme('   ')).toBe('');
    expect(getFirstGrapheme('')).toBe('');
  });

  it('缺少 Intl.Segmenter 时按 Unicode 码点回退且不拆开代理对', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl, 'Segmenter');
    Object.defineProperty(Intl, 'Segmenter', { configurable: true, value: undefined });

    try {
      expect(getFirstGrapheme('😀状态')).toBe('😀');
    } finally {
      if (descriptor) {
        Object.defineProperty(Intl, 'Segmenter', descriptor);
      } else {
        Reflect.deleteProperty(Intl, 'Segmenter');
      }
    }
  });
});
