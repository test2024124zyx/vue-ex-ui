/**
 * ID 生成工具函数
 */

let idCounter = 0;

/**
 * 生成唯一 ID
 * @param prefix 前缀
 * @returns 唯一 ID 字符串
 */
export function generateId(prefix = 'ex'): string {
  return `${prefix}-${++idCounter}-${Date.now().toString(36)}`;
}

/**
 * 生成随机 ID
 * @param length 长度，默认为 8
 * @returns 随机 ID 字符串
 */
export function generateRandomId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成 UUID v4
 * @returns UUID v4 字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
