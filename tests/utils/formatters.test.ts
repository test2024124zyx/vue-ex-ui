import { describe, expect, it } from 'vitest';
import {
  formatThousands,
  parseThousands,
  formatPhone,
  parsePhone,
  formatCreditCard,
  parseCreditCard,
  formatCurrency,
  parseCurrency,
  formatPercent,
  parsePercent,
  formatIdCard,
  parseIdCard,
  formatUpperCase,
  formatLowerCase,
  formatCapitalize,
  formatNoSpace,
  formatNumberOnly,
  formatLetterOnly,
  formatAlphanumeric,
} from '../../src/utils/formatters';

describe('输入格式化工具', () => {
  it('格式化和解析千分位数字', () => {
    expect(formatThousands('')).toBe('');
    expect(formatThousands('abc1234567.89')).toBe('1,234,567.89');
    expect(parseThousands('1,234,567.89')).toBe('1234567.89');
  });

  it('格式化和解析手机号码', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone('12')).toBe('12');
    expect(formatPhone('13812')).toBe('138 12');
    expect(formatPhone('1381234567899')).toBe('138 1234 5678');
    expect(parsePhone('138 1234 5678')).toBe('13812345678');
  });

  it('格式化和解析信用卡号', () => {
    expect(formatCreditCard('')).toBe('');
    expect(formatCreditCard('1234-5678901234567899')).toBe('1234 5678 9012 3456');
    expect(parseCreditCard('1234 5678 9012 3456')).toBe('1234567890123456');
  });

  it('格式化和解析金额', () => {
    expect(formatCurrency('')).toBe('');
    expect(formatCurrency('abc1234567.891')).toBe('1,234,567.89');
    expect(formatCurrency('1234')).toBe('1,234');
    expect(parseCurrency('1,234,567.89')).toBe('1234567.89');
  });

  it('格式化和解析百分比并限制范围', () => {
    expect(formatPercent('')).toBe('');
    expect(formatPercent('abc')).toBe('');
    expect(formatPercent('-20')).toBe('20%');
    expect(formatPercent('120')).toBe('100%');
    expect(formatPercent('50.5')).toBe('50.5%');
    expect(parsePercent('50.5%')).toBe('50.5');
  });

  it('格式化和解析身份证号码', () => {
    expect(formatIdCard('')).toBe('');
    expect(formatIdCard('110101')).toBe('110101');
    expect(formatIdCard('110101199001')).toBe('110101 199001');
    expect(formatIdCard('11010119900101123x')).toBe('110101 19900101 123X');
    expect(formatIdCard('110101199001011234567')).toBe('110101 19900101 1234');
    expect(parseIdCard('110101 19900101 1234')).toBe('110101199001011234');
  });

  it('执行文本和字符集格式化', () => {
    expect(formatUpperCase('hello')).toBe('HELLO');
    expect(formatLowerCase('HELLO')).toBe('hello');
    expect(formatCapitalize('hello world')).toBe('Hello World');
    expect(formatNoSpace('hello world')).toBe('helloworld');
    expect(formatNumberOnly('abc123def')).toBe('123');
    expect(formatLetterOnly('abc123-def')).toBe('abcdef');
    expect(formatAlphanumeric('abc-123_def')).toBe('abc123def');
  });
});
