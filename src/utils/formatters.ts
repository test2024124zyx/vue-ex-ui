/**
 * 输入格式化工具函数
 */

/**
 * 数字千分位格式化
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatThousands('1234567') => '1,234,567'
 */
export function formatThousands(value: string): string {
  if (!value) return '';

  // 移除非数字字符（保留小数点）
  const cleaned = value.replace(/[^\d.]/g, '');

  // 分割整数和小数部分
  const parts = cleaned.split('.');
  const integerPart = parts[0] || '';
  const decimalPart = parts[1];

  // 添加千分位分隔符
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // 组合整数和小数部分
  return decimalPart !== undefined ? `${formatted}.${decimalPart}` : formatted;
}

/**
 * 解析千分位数字
 * @param value 格式化的值
 * @returns 原始数字字符串
 * @example parseThousands('1,234,567') => '1234567'
 */
export function parseThousands(value: string): string {
  return value.replace(/,/g, '');
}

/**
 * 电话号码格式化（中国手机号）
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatPhone('13812345678') => '138 1234 5678'
 */
export function formatPhone(value: string): string {
  if (!value) return '';

  // 移除非数字字符
  const cleaned = value.replace(/\D/g, '');

  // 限制长度为11位
  const limited = cleaned.slice(0, 11);

  // 格式化为 3-4-4 格式
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 7) {
    return `${limited.slice(0, 3)} ${limited.slice(3)}`;
  } else {
    return `${limited.slice(0, 3)} ${limited.slice(3, 7)} ${limited.slice(7)}`;
  }
}

/**
 * 解析电话号码
 * @param value 格式化的值
 * @returns 原始数字字符串
 * @example parsePhone('138 1234 5678') => '13812345678'
 */
export function parsePhone(value: string): string {
  return value.replace(/\s/g, '');
}

/**
 * 信用卡号格式化
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatCreditCard('1234567890123456') => '1234 5678 9012 3456'
 */
export function formatCreditCard(value: string): string {
  if (!value) return '';

  // 移除非数字字符
  const cleaned = value.replace(/\D/g, '');

  // 限制长度为16位
  const limited = cleaned.slice(0, 16);

  // 格式化为 4-4-4-4 格式
  const groups = limited.match(/.{1,4}/g) || [];
  return groups.join(' ');
}

/**
 * 解析信用卡号
 * @param value 格式化的值
 * @returns 原始数字字符串
 * @example parseCreditCard('1234 5678 9012 3456') => '1234567890123456'
 */
export function parseCreditCard(value: string): string {
  return value.replace(/\s/g, '');
}

/**
 * 金额格式化（保留两位小数）
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatCurrency('1234.5') => '1,234.50'
 */
export function formatCurrency(value: string): string {
  if (!value) return '';

  // 移除非数字字符（保留小数点）
  const cleaned = value.replace(/[^\d.]/g, '');

  // 确保只有一个小数点
  const parts = cleaned.split('.');
  const integerPart = parts[0] || '';
  let decimalPart = parts[1] || '';

  // 限制小数位数为2位
  decimalPart = decimalPart.slice(0, 2);

  // 添加千分位分隔符
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // 组合整数和小数部分
  return decimalPart ? `${formatted}.${decimalPart}` : formatted;
}

/**
 * 解析金额
 * @param value 格式化的值
 * @returns 原始数字字符串
 * @example parseCurrency('1,234.50') => '1234.50'
 */
export function parseCurrency(value: string): string {
  return value.replace(/,/g, '');
}

/**
 * 百分比格式化
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatPercent('50') => '50%'
 */
export function formatPercent(value: string): string {
  if (!value) return '';

  // 移除非数字字符（保留小数点）
  const cleaned = value.replace(/[^\d.]/g, '');

  // 限制范围 0-100
  const num = parseFloat(cleaned);
  if (isNaN(num)) return '';

  const limited = Math.min(100, Math.max(0, num));
  return `${limited}%`;
}

/**
 * 解析百分比
 * @param value 格式化的值
 * @returns 原始数字字符串
 * @example parsePercent('50%') => '50'
 */
export function parsePercent(value: string): string {
  return value.replace(/%/g, '');
}

/**
 * 身份证号格式化（中国）
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatIdCard('110101199001011234') => '110101 19900101 1234'
 */
export function formatIdCard(value: string): string {
  if (!value) return '';

  // 移除非数字和X字符
  const cleaned = value.replace(/[^\dXx]/g, '').toUpperCase();

  // 限制长度为18位
  const limited = cleaned.slice(0, 18);

  // 格式化为 6-8-4 格式
  if (limited.length <= 6) {
    return limited;
  } else if (limited.length <= 14) {
    return `${limited.slice(0, 6)} ${limited.slice(6)}`;
  } else {
    return `${limited.slice(0, 6)} ${limited.slice(6, 14)} ${limited.slice(14)}`;
  }
}

/**
 * 解析身份证号
 * @param value 格式化的值
 * @returns 原始字符串
 * @example parseIdCard('110101 19900101 1234') => '110101199001011234'
 */
export function parseIdCard(value: string): string {
  return value.replace(/\s/g, '');
}

/**
 * 大写字母格式化
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatUpperCase('hello') => 'HELLO'
 */
export function formatUpperCase(value: string): string {
  return value.toUpperCase();
}

/**
 * 小写字母格式化
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatLowerCase('HELLO') => 'hello'
 */
export function formatLowerCase(value: string): string {
  return value.toLowerCase();
}

/**
 * 首字母大写格式化
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatCapitalize('hello world') => 'Hello World'
 */
export function formatCapitalize(value: string): string {
  return value.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * 移除空格格式化
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatNoSpace('hello world') => 'helloworld'
 */
export function formatNoSpace(value: string): string {
  return value.replace(/\s/g, '');
}

/**
 * 只允许数字
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatNumberOnly('abc123def') => '123'
 */
export function formatNumberOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * 只允许字母
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatLetterOnly('abc123def') => 'abcdef'
 */
export function formatLetterOnly(value: string): string {
  return value.replace(/[^a-zA-Z]/g, '');
}

/**
 * 只允许字母和数字
 * @param value 输入值
 * @returns 格式化后的值
 * @example formatAlphanumeric('abc-123_def') => 'abc123def'
 */
export function formatAlphanumeric(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '');
}
