/**
 * 固定位置
 */
export type AffixPosition = 'top' | 'bottom';

/**
 * Affix 组件属性
 */
export interface ExAffixProps {
  /** 距离窗口顶部达到指定偏移量后触发 */
  offsetTop?: number;
  /** 距离窗口底部达到指定偏移量后触发 */
  offsetBottom?: number;
  /** 设置 Affix 需要监听其滚动事件的元素 */
  target?: () => HTMLElement | Window;
  /** z-index */
  zIndex?: number;
}

/**
 * Affix 组件事件
 */
export interface ExAffixEmits {
  /** 固定状态改变时触发 */
  change: [fixed: boolean];
}

/**
 * Affix 组件暴露的方法
 */
export interface ExAffixExposed {
  /** 更新固定状态 */
  updatePosition: () => void;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}

/**
 * Affix 目标类型
 */
export type AffixTarget = HTMLElement | Window | (() => HTMLElement | Window);

/**
 * Affix 偏移量
 */
export interface AffixOffset {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

/**
 * Affix 边界
 */
export interface AffixBounds {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

/**
 * Affix 状态
 */
export interface AffixState {
  affixed: boolean;
  position: AffixPosition | null;
  offset: AffixOffset;
  width?: number;
  height?: number;
  originalRect?: DOMRect | null;
  currentOffset?: AffixOffset;
  placeholderSize?: { width: number; height: number };
}

/**
 * Affix 配置
 */
export interface AffixConfig {
  position: AffixPosition;
  offset?: number;
  offsetTop: number;
  offsetBottom: number;
  target: AffixTarget;
  zIndex: number;
  enabled: boolean;
  showPlaceholder?: boolean;
  useTransform?: boolean;
  listenResize?: boolean;
  checkOnMount?: boolean;
  keepWidth?: boolean;
  keepHeight?: boolean;
  throttleDelay: number;
  animationDuration: number;
  bounds?: AffixBounds;
}

/**
 * Affix 全局配置
 */
export interface AffixGlobalConfig {
  defaultPosition: AffixPosition;
  defaultOffsetTop: number;
  defaultOffsetBottom: number;
  defaultZIndex: number;
  defaultAnimationDuration: number;
  defaultThrottleDelay: number;
  defaultEnabled: boolean;
  defaultShowPlaceholder: boolean;
  defaultUseTransform: boolean;
  defaultListenResize: boolean;
  defaultCheckOnMount: boolean;
  defaultKeepWidth: boolean;
  defaultKeepHeight: boolean;
  cssVariables: Record<string, string>;
}

/**
 * Affix 性能监控
 */
export interface AffixPerformanceMonitor {
  scrollEventCount: number;
  resizeEventCount: number;
  positionUpdateCount: number;
  averageUpdateTime: number;
  maxUpdateTime: number;
  minUpdateTime: number;
  start: () => void;
  stop: () => void;
  reset: () => void;
  getReport: () => AffixPerformanceReport;
}

/**
 * Affix 性能报告
 */
export interface AffixPerformanceReport {
  duration: number;
  events: {
    scroll: number;
    resize: number;
    positionUpdate: number;
  };
  performance: {
    averageUpdateTime: number;
    maxUpdateTime: number;
    minUpdateTime: number;
    totalUpdateTime: number;
  };
  memory?: {
    used: number;
    total: number;
  };
}

/**
 * Affix 调试信息
 */
export interface AffixDebugInfo {
  id: string;
  state: AffixState;
  config: AffixConfig;
  target: {
    type: string;
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
  };
  element: {
    width: number;
    height: number;
    top: number;
    left: number;
  };
  performance: AffixPerformanceReport;
}

/**
 * Affix 工具函数类型
 */
export interface AffixUtils {
  getTarget: (target: AffixTarget) => HTMLElement | Window;
  getScrollContainer: (element: HTMLElement) => HTMLElement | Window;
  getElementBounds: (element: HTMLElement, container: HTMLElement | Window) => DOMRect;
  calculateOffset: (element: HTMLElement, container: HTMLElement | Window, position: AffixPosition, offset: number) => AffixOffset;
  shouldAffix: (elementRect: DOMRect, containerRect: DOMRect, position: AffixPosition, offset: number, bounds?: AffixBounds) => boolean;
  throttle: <T extends (...args: unknown[]) => unknown>(func: T, delay: number) => T;
  debounce: <T extends (...args: unknown[]) => unknown>(func: T, delay: number) => T;
  getComputedStyle?: (element: HTMLElement, property: string) => string;
  setStyle?: (element: HTMLElement, styles: Record<string, string>) => void;
  addClass?: (element: HTMLElement, className: string) => void;
  removeClass?: (element: HTMLElement, className: string) => void;
  toggleClass?: (element: HTMLElement, className: string) => void;
  hasClass?: (element: HTMLElement, className: string) => boolean;
  createAffixConfig?: (options: Partial<AffixConfig>, globalConfig?: AffixGlobalConfig) => AffixConfig;
  createInitialState?: () => AffixState;
  createPerformanceMonitor?: () => AffixPerformanceMonitor;
  validateConfig?: (config: Partial<AffixConfig>) => boolean;
}

/**
 * Affix 组件实例
 */
export interface ExAffixInstance extends ExAffixExposed {
  $el: HTMLElement;
  state: AffixState;
  config: AffixConfig;
}
