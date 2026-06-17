import type { CSSProperties } from 'vue';
import type {
  BackTopTarget,
  BackTopPosition,
  BackTopOffset,
  BackTopScrollBehavior,
  BackTopScrollInfo,
} from './types';

/** 解析滚动目标为 HTMLElement | Window（仅在客户端调用） */
export function resolveTarget(target?: BackTopTarget): HTMLElement | Window {
  let t: BackTopTarget | null | undefined = target;
  if (typeof t === 'function') t = t();
  if (typeof t === 'string') {
    const el = document.querySelector<HTMLElement>(t);
    return el || window;
  }
  if (t instanceof HTMLElement) return t;
  return window;
}

const isWindowTarget = (target: HTMLElement | Window): target is Window => !(target instanceof HTMLElement);

/** 读取目标的滚动信息 */
export function getScrollInfo(target: HTMLElement | Window): BackTopScrollInfo {
  let scrollTop: number;
  let scrollHeight: number;
  let clientHeight: number;

  if (isWindowTarget(target)) {
    const doc = document.documentElement;
    scrollTop = window.pageYOffset || doc.scrollTop || 0;
    scrollHeight = doc.scrollHeight;
    clientHeight = window.innerHeight;
  } else {
    scrollTop = target.scrollTop;
    scrollHeight = target.scrollHeight;
    clientHeight = target.clientHeight;
  }

  const max = scrollHeight - clientHeight;
  const scrollPercent = max > 0 ? Math.min(100, Math.max(0, (scrollTop / max) * 100)) : 0;
  return { scrollTop, scrollHeight, clientHeight, scrollPercent };
}

/** 将目标滚动到指定位置，返回滚动完成的 Promise */
export function scrollToPosition(
  target: HTMLElement | Window,
  to: number,
  behavior: BackTopScrollBehavior,
  duration: number
): Promise<void> {
  return new Promise(resolve => {
    const setTop = (v: number) => {
      if (isWindowTarget(target)) window.scrollTo(0, v);
      else target.scrollTop = v;
    };

    // 立即滚动
    if (behavior !== 'smooth' || duration <= 0 || typeof requestAnimationFrame === 'undefined') {
      setTop(to);
      resolve();
      return;
    }

    // 自定义时长的平滑滚动（easeOutCubic），保证有明确的结束回调
    const from = getScrollInfo(target).scrollTop;
    const distance = to - from;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setTop(from + distance * ease(progress));
      if (progress < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

const DEFAULT_OFFSET = 24;

/** 根据 position + offset 计算固定定位样式 */
export function getPositionStyle(position: BackTopPosition, offset?: BackTopOffset): CSSProperties {
  const o = offset || {};
  const toLen = (v: number | string | undefined, fallback: number) =>
    v === undefined ? `${fallback}px` : typeof v === 'number' ? `${v}px` : v;

  const style: CSSProperties = { position: 'fixed' };
  const [vertical, horizontal] = position.split('-');

  if (vertical === 'top') style.top = toLen(o.top, DEFAULT_OFFSET);
  else style.bottom = toLen(o.bottom, DEFAULT_OFFSET);

  if (horizontal === 'left') style.left = toLen(o.left, DEFAULT_OFFSET);
  else if (horizontal === 'right') style.right = toLen(o.right, DEFAULT_OFFSET);
  else {
    style.left = '50%';
    style.transform = 'translateX(-50%)';
  }

  return style;
}

/** 是否移动端宽度 */
export function isMobile(breakpoint = 768): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= breakpoint;
}
