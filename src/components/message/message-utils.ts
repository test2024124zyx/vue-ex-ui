import type { HTMLAttributes, StyleValue } from 'vue';
import type { MessageGlobalConfig, MessageInput, MessageType, MessageTypedInput } from './types';

const MESSAGE_TYPES = new Set<MessageType>(['info', 'success', 'warning', 'error', 'loading']);
const MESSAGE_OPTION_KEYS = new Set<string>([
  'content',
  'type',
  'showIcon',
  'closable',
  'duration',
  'class',
  'style',
  'dangerouslyUseHTMLString',
  'onClose',
  'grouping',
]);
const MESSAGE_CONFIG_KEYS = new Set<string>([
  'duration',
  'offset',
  'zIndex',
  'maxCount',
  'showIcon',
  'closable',
  'grouping',
]);

export interface ResolvedMessageOptions {
  content: string;
  type: MessageType;
  showIcon: boolean;
  closable: boolean;
  duration: number;
  class?: HTMLAttributes['class'];
  style?: StyleValue;
  dangerouslyUseHTMLString: boolean;
  onClose?: () => void;
  grouping: boolean;
}

const assertKnownKeys = (value: object, allowed: ReadonlySet<string>, source: string): void => {
  const unsupported = Object.keys(value).find(key => !allowed.has(key));
  if (unsupported) throw new TypeError(`${source} 不支持选项 "${unsupported}"`);
};

const normalizeBoolean = (value: unknown, fallback: boolean, name: string): boolean => {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') throw new TypeError(`${name} 必须是 boolean`);
  return value;
};

const normalizeFiniteNumber = (value: unknown, name: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} 必须是有限数值`);
  }
  return value;
};

export function normalizeMessageType(value: unknown): MessageType {
  if (!MESSAGE_TYPES.has(value as MessageType)) {
    throw new TypeError('Message type 必须是 info、success、warning、error 或 loading');
  }
  return value as MessageType;
}

export function normalizeMessageDuration(value: unknown): number {
  const duration = normalizeFiniteNumber(value, 'Message duration');
  if (duration < 0) throw new RangeError('Message duration 不能小于 0');
  return duration;
}

/** 将公开输入收敛为不会向组件泄漏服务字段的确定配置。 */
export function resolveMessageOptions(
  input: MessageInput | MessageTypedInput,
  config: MessageGlobalConfig,
  forcedType?: MessageType
): ResolvedMessageOptions {
  const raw: Record<string, unknown> =
    typeof input === 'string'
      ? { content: input }
      : input !== null && typeof input === 'object' && !Array.isArray(input)
        ? (input as unknown as Record<string, unknown>)
        : (() => {
            throw new TypeError('Message 参数必须是字符串或配置对象');
          })();

  assertKnownKeys(raw, MESSAGE_OPTION_KEYS, 'Message');
  if (forcedType && Object.prototype.hasOwnProperty.call(raw, 'type')) {
    throw new TypeError('Message 类型快捷方法不接受 type 选项');
  }
  if (typeof raw.content !== 'string' || raw.content.trim() === '') {
    throw new TypeError('Message content 必须是非空字符串');
  }

  const type = forcedType ?? normalizeMessageType(raw.type ?? 'info');
  const fallbackDuration = type === 'loading' ? 0 : config.duration;
  const duration = normalizeMessageDuration(raw.duration ?? fallbackDuration);
  const onClose = raw.onClose;
  if (onClose !== undefined && typeof onClose !== 'function') {
    throw new TypeError('Message onClose 必须是函数');
  }

  return {
    content: raw.content,
    type,
    showIcon: normalizeBoolean(raw.showIcon, config.showIcon, 'Message showIcon'),
    closable: normalizeBoolean(raw.closable, config.closable, 'Message closable'),
    duration,
    class: raw.class as HTMLAttributes['class'],
    style: raw.style as StyleValue | undefined,
    dangerouslyUseHTMLString: normalizeBoolean(
      raw.dangerouslyUseHTMLString,
      false,
      'Message dangerouslyUseHTMLString'
    ),
    onClose: onClose as (() => void) | undefined,
    grouping: normalizeBoolean(raw.grouping, config.grouping, 'Message grouping'),
  };
}

/** 先完整验证再返回新对象，避免部分非法配置污染单例状态。 */
export function resolveMessageConfig(
  input: Partial<MessageGlobalConfig>,
  current: MessageGlobalConfig
): MessageGlobalConfig {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Message config 必须是对象');
  }
  assertKnownKeys(input, MESSAGE_CONFIG_KEYS, 'Message config');

  const next = { ...current };
  if (Object.prototype.hasOwnProperty.call(input, 'duration')) {
    next.duration = normalizeMessageDuration(input.duration);
  }
  if (Object.prototype.hasOwnProperty.call(input, 'offset')) {
    next.offset = normalizeFiniteNumber(input.offset, 'Message offset');
    if (next.offset < 0) throw new RangeError('Message offset 不能小于 0');
  }
  if (Object.prototype.hasOwnProperty.call(input, 'zIndex')) {
    next.zIndex = normalizeFiniteNumber(input.zIndex, 'Message zIndex');
    if (!Number.isInteger(next.zIndex) || next.zIndex < 0) {
      throw new RangeError('Message zIndex 必须是非负整数');
    }
  }
  if (Object.prototype.hasOwnProperty.call(input, 'maxCount')) {
    next.maxCount = normalizeFiniteNumber(input.maxCount, 'Message maxCount');
    if (!Number.isInteger(next.maxCount) || next.maxCount < 1) {
      throw new RangeError('Message maxCount 必须是正整数');
    }
  }
  if (Object.prototype.hasOwnProperty.call(input, 'showIcon')) {
    next.showIcon = normalizeBoolean(input.showIcon, next.showIcon, 'Message showIcon');
  }
  if (Object.prototype.hasOwnProperty.call(input, 'closable')) {
    next.closable = normalizeBoolean(input.closable, next.closable, 'Message closable');
  }
  if (Object.prototype.hasOwnProperty.call(input, 'grouping')) {
    next.grouping = normalizeBoolean(input.grouping, next.grouping, 'Message grouping');
  }
  return next;
}
