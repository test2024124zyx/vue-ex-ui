import { isVNode } from 'vue';
import type {
  NotificationGlobalConfig,
  NotificationOptions,
  NotificationPosition,
  NotificationType,
} from './types';

const NOTIFICATION_TYPES = new Set<NotificationType>(['info', 'success', 'warning', 'error']);
const NOTIFICATION_POSITIONS = new Set<NotificationPosition>([
  'top-right',
  'top-left',
  'bottom-right',
  'bottom-left',
]);
const OPTION_KEYS = new Set([
  'id',
  'type',
  'title',
  'content',
  'showIcon',
  'closable',
  'duration',
  'customClass',
  'customStyle',
  'zIndex',
  'offset',
  'position',
  'dangerouslyUseHTMLString',
  'onClose',
  'onClick',
]);
const CONFIG_KEYS = new Set([
  'duration',
  'offset',
  'zIndex',
  'maxCount',
  'showIcon',
  'closable',
  'position',
]);

export interface ResolvedNotificationOptions {
  id?: string;
  type: NotificationType;
  title: string;
  content: string | import('vue').VNode;
  showIcon: boolean;
  closable: boolean;
  duration: number;
  customClass?: string;
  customStyle?: Record<string, string>;
  zIndex: number;
  offset: number;
  position: NotificationPosition;
  dangerouslyUseHTMLString: boolean;
  onClose?: () => void;
  onClick?: () => void;
}

const assertKnownKeys = (value: object, allowed: ReadonlySet<string>, source: string): void => {
  const unsupported = Object.keys(value).find(key => !allowed.has(key));
  if (unsupported) throw new TypeError(`${source} 不支持选项 "${unsupported}"`);
};

const normalizeFiniteNumber = (value: unknown, name: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${name} 必须是有限数值`);
  }
  return value;
};

const normalizeNonNegativeNumber = (value: unknown, name: string): number => {
  const normalized = normalizeFiniteNumber(value, name);
  if (normalized < 0) throw new RangeError(`${name} 不能小于 0`);
  return normalized;
};

const normalizeBoolean = (value: unknown, fallback: boolean, name: string): boolean => {
  if (value === undefined) return fallback;
  if (typeof value !== 'boolean') throw new TypeError(`${name} 必须是 boolean`);
  return value;
};

const normalizePosition = (value: unknown): NotificationPosition => {
  if (!NOTIFICATION_POSITIONS.has(value as NotificationPosition)) {
    throw new TypeError('Notification position 必须是四个角落位置之一');
  }
  return value as NotificationPosition;
};

const normalizeType = (value: unknown): NotificationType => {
  if (!NOTIFICATION_TYPES.has(value as NotificationType)) {
    throw new TypeError('Notification type 必须是 info、success、warning 或 error');
  }
  return value as NotificationType;
};

/** 将单条通知选项收敛成组件和容器都可安全消费的确定配置。 */
export function resolveNotificationOptions(
  input: NotificationOptions,
  config: NotificationGlobalConfig,
  forcedType?: NotificationType
): ResolvedNotificationOptions {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Notification 参数必须是配置对象');
  }
  assertKnownKeys(input, OPTION_KEYS, 'Notification');
  if (forcedType && Object.prototype.hasOwnProperty.call(input, 'type')) {
    throw new TypeError('Notification 类型快捷方法不接受 type 选项');
  }

  const title = input.title ?? '';
  if (typeof title !== 'string') throw new TypeError('Notification title 必须是字符串');
  const content = input.content ?? '';
  if (typeof content !== 'string' && !isVNode(content)) {
    throw new TypeError('Notification content 必须是字符串或 VNode');
  }
  if (!title.trim() && content === '') {
    throw new TypeError('Notification title 与 content 至少需要提供一项');
  }

  const dangerouslyUseHTMLString = normalizeBoolean(
    input.dangerouslyUseHTMLString,
    false,
    'Notification dangerouslyUseHTMLString'
  );
  if (dangerouslyUseHTMLString && typeof content !== 'string') {
    throw new TypeError('VNode 内容不能启用 dangerouslyUseHTMLString');
  }

  const id = input.id;
  if (id !== undefined && (typeof id !== 'string' || !id.trim())) {
    throw new TypeError('Notification id 必须是非空字符串');
  }
  if (input.customClass !== undefined && typeof input.customClass !== 'string') {
    throw new TypeError('Notification customClass 必须是字符串');
  }
  if (
    input.customStyle !== undefined &&
    (!input.customStyle ||
      typeof input.customStyle !== 'object' ||
      Array.isArray(input.customStyle))
  ) {
    throw new TypeError('Notification customStyle 必须是样式对象');
  }
  if (input.onClose !== undefined && typeof input.onClose !== 'function') {
    throw new TypeError('Notification onClose 必须是函数');
  }
  if (input.onClick !== undefined && typeof input.onClick !== 'function') {
    throw new TypeError('Notification onClick 必须是函数');
  }

  const zIndex = normalizeNonNegativeNumber(input.zIndex ?? config.zIndex, 'Notification zIndex');
  if (!Number.isInteger(zIndex)) throw new RangeError('Notification zIndex 必须是整数');

  return {
    id: id?.trim(),
    type: forcedType ?? normalizeType(input.type ?? 'info'),
    title,
    content,
    showIcon: normalizeBoolean(input.showIcon, config.showIcon, 'Notification showIcon'),
    closable: normalizeBoolean(input.closable, config.closable, 'Notification closable'),
    duration: normalizeNonNegativeNumber(
      input.duration ?? config.duration,
      'Notification duration'
    ),
    customClass: input.customClass,
    customStyle: input.customStyle,
    zIndex,
    offset: normalizeNonNegativeNumber(input.offset ?? config.offset, 'Notification offset'),
    position: normalizePosition(input.position ?? config.position),
    dangerouslyUseHTMLString,
    onClose: input.onClose,
    onClick: input.onClick,
  };
}

/** 原子校验并合并服务级配置。 */
export function resolveNotificationConfig(
  input: Partial<NotificationGlobalConfig>,
  current: NotificationGlobalConfig
): NotificationGlobalConfig {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('Notification config 必须是对象');
  }
  assertKnownKeys(input, CONFIG_KEYS, 'Notification config');
  const next = { ...current };

  if (Object.prototype.hasOwnProperty.call(input, 'duration')) {
    next.duration = normalizeNonNegativeNumber(input.duration, 'Notification duration');
  }
  if (Object.prototype.hasOwnProperty.call(input, 'offset')) {
    next.offset = normalizeNonNegativeNumber(input.offset, 'Notification offset');
  }
  if (Object.prototype.hasOwnProperty.call(input, 'zIndex')) {
    next.zIndex = normalizeNonNegativeNumber(input.zIndex, 'Notification zIndex');
    if (!Number.isInteger(next.zIndex)) throw new RangeError('Notification zIndex 必须是整数');
  }
  if (Object.prototype.hasOwnProperty.call(input, 'maxCount')) {
    next.maxCount = normalizeFiniteNumber(input.maxCount, 'Notification maxCount');
    if (!Number.isInteger(next.maxCount) || next.maxCount < 1) {
      throw new RangeError('Notification maxCount 必须是正整数');
    }
  }
  if (Object.prototype.hasOwnProperty.call(input, 'showIcon')) {
    next.showIcon = normalizeBoolean(input.showIcon, next.showIcon, 'Notification showIcon');
  }
  if (Object.prototype.hasOwnProperty.call(input, 'closable')) {
    next.closable = normalizeBoolean(input.closable, next.closable, 'Notification closable');
  }
  if (Object.prototype.hasOwnProperty.call(input, 'position')) {
    next.position = normalizePosition(input.position);
  }
  return next;
}
