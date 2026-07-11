import { getCurrentInstance, useId } from 'vue';

const RANDOM_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const MAX_RANDOM_ID_LENGTH = 1024;
let externalIdCounter = 0;

/**
 * 生成组件内可水合、组件外进程内唯一的 ID。
 */
export function generateId(prefix = 'ex'): string {
  if (getCurrentInstance()) {
    // Vue 3.5 的 useId 会按应用维护计数，并保证 SSR 与水合首屏一致。
    return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  }

  externalIdCounter += 1;
  return `${prefix}-${externalIdCounter}`;
}

const assertRandomIdLength = (length: number): void => {
  if (!Number.isSafeInteger(length) || length < 1 || length > MAX_RANDOM_ID_LENGTH) {
    throw new RangeError(`[ExUI] 随机 ID 长度必须是 1 到 ${MAX_RANDOM_ID_LENGTH} 的安全整数`);
  }
};

const fillRandomBytes = (bytes: Uint8Array): Uint8Array => {
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    return globalThis.crypto.getRandomValues(bytes);
  }

  // 仅为不支持 Web Crypto 的旧环境保留非安全降级，不用于令牌或密钥。
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }
  return bytes;
};

/** 生成指定长度的字母数字随机 ID。 */
export function generateRandomId(length = 8): string {
  assertRandomIdLength(length);

  const rejectionLimit = 256 - (256 % RANDOM_CHARACTERS.length);
  let result = '';

  while (result.length < length) {
    const bytes = fillRandomBytes(new Uint8Array(Math.max(16, length - result.length)));
    for (const byte of bytes) {
      if (byte >= rejectionLimit) continue;
      result += RANDOM_CHARACTERS[byte % RANDOM_CHARACTERS.length];
      if (result.length === length) break;
    }
  }

  return result;
}

/** 生成符合 RFC 4122 版本 4 与变体位要求的 UUID。 */
export function generateUUID(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  const bytes = fillRandomBytes(new Uint8Array(16));
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
