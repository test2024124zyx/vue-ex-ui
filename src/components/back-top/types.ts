import type { VNode, Component, CSSProperties } from 'vue';

/** 显示位置 */
export type BackTopPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'bottom-center'
  | 'top-center';

/** 形状 */
export type BackTopShape = 'circle' | 'square' | 'rounded';

/** 尺寸 */
export type BackTopSize = 'small' | 'medium' | 'large';

/** 出现/消失动画 */
export type BackTopAnimation = 'fade' | 'slide' | 'zoom' | 'none';

/** 滚动行为 */
export type BackTopScrollBehavior = 'auto' | 'smooth' | 'instant';

/** 进度展示类型 */
export type BackTopProgressType = 'circle' | 'line';

/**
 * 滚动监听目标：
 * - 省略 / window：监听整个页面
 * - CSS 选择器字符串、HTMLElement、或返回二者之一的函数：监听指定滚动容器
 */
export type BackTopTarget =
  | HTMLElement
  | Window
  | string
  | (() => HTMLElement | Window | string | null | undefined);

/** 位置偏移（像素或带单位字符串） */
export interface BackTopOffset {
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
}

/** 当前滚动信息 */
export interface BackTopScrollInfo {
  /** 当前滚动距离 */
  scrollTop: number;
  /** 滚动百分比 0-100 */
  scrollPercent: number;
  /** 内容总高度 */
  scrollHeight: number;
  /** 可视区高度 */
  clientHeight: number;
}

/** BackTop 组件属性 */
export interface ExBackTopProps {
  /** 显示位置 */
  position?: BackTopPosition;
  /** 形状 */
  shape?: BackTopShape;
  /** 尺寸 */
  size?: BackTopSize;
  /** 滚动超过该距离（px）后显示 */
  visibilityHeight?: number;
  /** 滚动超过该百分比（0-100）后显示；设置后优先于 visibilityHeight */
  visibilityPercent?: number;
  /** 滚动监听目标，默认监听 window */
  target?: BackTopTarget;
  /** 点击后的滚动行为 */
  scrollBehavior?: BackTopScrollBehavior;
  /** 自定义平滑滚动时长（ms），scrollBehavior 为 'smooth' 时生效 */
  scrollDuration?: number;
  /** 点击后滚动到的位置（px），默认 0（顶部） */
  scrollTo?: number;
  /** 位置偏移，默认四周 24px */
  offset?: BackTopOffset;
  /** 出现/消失动画 */
  animation?: BackTopAnimation;
  /** 按钮文字（设置后显示在图标下方） */
  text?: string;
  /** 自定义图标：内置图标名、组件、VNode，或字体图标类名 */
  icon?: VNode | Component | string;
  /** 是否显示滚动进度 */
  showProgress?: boolean;
  /** 进度展示类型 */
  progressType?: BackTopProgressType;
  /** 是否显示百分比文字 */
  showPercent?: boolean;
  /** 层级 */
  zIndex?: number;
  /** 是否在移动端显示 */
  showOnMobile?: boolean;
  /** 移动端断点（px） */
  mobileBreakpoint?: number;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: CSSProperties | string;
}

/** BackTop 组件事件 */
export interface ExBackTopEmits {
  /** 点击按钮 */
  click: [event: MouseEvent];
  /** 回到顶部滚动开始 */
  'scroll-start': [];
  /** 回到顶部滚动结束 */
  'scroll-end': [];
  /** 显示状态变化 */
  'visibility-change': [visible: boolean];
}

/** BackTop 暴露的方法 */
export interface ExBackTopExposed {
  /** 滚动到目标位置（默认顶部） */
  scrollToTop: () => Promise<void>;
  /** 强制显示 */
  show: () => void;
  /** 强制隐藏 */
  hide: () => void;
  /** 获取按钮 DOM 元素 */
  getElement: () => HTMLElement | null;
}
