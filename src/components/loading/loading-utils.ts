import type { LoadingSize, LoadingTarget, LoadingType } from './types';

const LOADING_TYPES = new Set<LoadingType>(['spinner', 'dots', 'pulse', 'bars', 'neon']);
const LOADING_SIZES = new Set<LoadingSize>(['small', 'medium', 'large']);

interface TargetPositionLease {
  count: number;
  changed: boolean;
  originalInlinePosition: string;
}

const targetPositionLeases = new WeakMap<HTMLElement, TargetPositionLease>();

/** 运行时类型输入只接受组件真实渲染的动画。 */
export function normalizeLoadingType(value: unknown): LoadingType {
  return LOADING_TYPES.has(value as LoadingType) ? (value as LoadingType) : 'spinner';
}

/** 运行时尺寸输入只接受三档稳定尺寸。 */
export function normalizeLoadingSize(value: unknown): LoadingSize {
  return LOADING_SIZES.has(value as LoadingSize) ? (value as LoadingSize) : 'medium';
}

/** 空白颜色不写入 CSS 变量，让主题令牌继续生效。 */
export function normalizeLoadingColor(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

/** 层级规范为非负整数，非法输入交由样式系统默认值处理。 */
export function normalizeLoadingZIndex(value?: number): number | undefined {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.trunc(value));
}

const isHTMLElement = (value: unknown): value is HTMLElement =>
  typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;

/** 安全解析目标容器；非法选择器不会中断组件渲染。 */
export function resolveLoadingTarget(target?: LoadingTarget): HTMLElement | null {
  if (isHTMLElement(target)) return target;
  if (typeof target !== 'string' || typeof document === 'undefined') return null;

  const selector = target.trim();
  if (!selector) return null;

  try {
    const element = document.querySelector(selector);
    return isHTMLElement(element) ? element : null;
  } catch {
    return null;
  }
}

/**
 * 为局部浮层临时建立定位上下文。引用计数保证同一容器的多个实例不会提前恢复样式。
 */
export function acquireLoadingTargetPosition(target: HTMLElement): () => void {
  const existing = targetPositionLeases.get(target);
  if (existing) {
    existing.count += 1;
  } else {
    const computedPosition =
      typeof getComputedStyle === 'function' ? getComputedStyle(target).position : '';
    const changed = !computedPosition || computedPosition === 'static';
    const lease: TargetPositionLease = {
      count: 1,
      changed,
      originalInlinePosition: target.style.position,
    };
    targetPositionLeases.set(target, lease);
    if (changed) target.style.position = 'relative';
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    const lease = targetPositionLeases.get(target);
    if (!lease) return;

    lease.count -= 1;
    if (lease.count > 0) return;

    targetPositionLeases.delete(target);
    // 持有期间若调用方主动改变定位，不覆盖其最新决定。
    if (lease.changed && target.style.position === 'relative') {
      target.style.position = lease.originalInlinePosition;
    }
  };
}
