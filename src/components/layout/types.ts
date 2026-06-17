// Layout Component Types
// 布局组件类型定义

import type { CSSProperties } from 'vue';

// ============================================================================
// Layout 主容器
// ============================================================================

export interface ExLayoutProps {
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: CSSProperties | string;
  /** 是否有侧边栏 */
  hasSider?: boolean;
  /** 布局方向 */
  direction?: 'horizontal' | 'vertical';
}

export interface ExLayoutSlots {
  default?: () => unknown;
}

export interface ExLayoutExposed {
  /** 获取 DOM 元素 */
  getElement: () => HTMLElement | null;
}

// ============================================================================
// Header 头部
// ============================================================================

export interface ExHeaderProps {
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: CSSProperties | string;
  /** 高度 */
  height?: string | number;
  /** 是否固定 */
  fixed?: boolean;
  /** 是否显示霓虹边框 */
  neonBorder?: boolean;
  /** 是否显示背景模糊 */
  blur?: boolean;
}

export interface ExHeaderSlots {
  default?: () => unknown;
  /** 左侧内容 */
  left?: () => unknown;
  /** 中间内容 */
  center?: () => unknown;
  /** 右侧内容 */
  right?: () => unknown;
}

export interface ExHeaderExposed {
  getElement: () => HTMLElement | null;
}

// ============================================================================
// Sider 侧边栏
// ============================================================================

export interface ExSiderProps {
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: CSSProperties | string;
  /** 宽度 */
  width?: string | number;
  /** 收起时的宽度 */
  collapsedWidth?: string | number;
  /** 是否收起 */
  collapsed?: boolean;
  /** 是否可收起 */
  collapsible?: boolean;
  /** 触发器位置 */
  trigger?: 'top' | 'bottom' | null;
  /** 侧边栏位置 */
  position?: 'left' | 'right';
  /** 是否显示霓虹边框 */
  neonBorder?: boolean;
  /** 是否显示背景模糊 */
  blur?: boolean;
  /** 响应式断点 */
  breakpoint?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** 动画过渡时长（毫秒） */
  transitionDuration?: number;
}

export interface ExSiderEmits {
  /** 收起状态变化 */
  (e: 'update:collapsed', value: boolean): void;
  /** 收起状态变化（兼容） */
  (e: 'collapse', collapsed: boolean, type: 'clickTrigger' | 'responsive'): void;
  /** 断点触发 */
  (e: 'breakpoint', broken: boolean): void;
}

export interface ExSiderSlots {
  default?: () => unknown;
  /** 自定义触发器 */
  trigger?: (props: { collapsed: boolean }) => unknown;
}

export interface ExSiderExposed {
  getElement: () => HTMLElement | null;
  /** 切换收起状态 */
  toggle: () => void;
}

// ============================================================================
// Content 内容区
// ============================================================================

export interface ExContentProps {
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: CSSProperties | string;
  /** 是否显示背景网格 */
  grid?: boolean;
  /** 是否显示扫描线效果 */
  scanline?: boolean;
}

export interface ExContentSlots {
  default?: () => unknown;
}

export interface ExContentExposed {
  getElement: () => HTMLElement | null;
}

// ============================================================================
// Footer 底部
// ============================================================================

export interface ExFooterProps {
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: CSSProperties | string;
  /** 高度 */
  height?: string | number;
  /** 是否固定 */
  fixed?: boolean;
  /** 是否显示霓虹边框 */
  neonBorder?: boolean;
  /** 是否显示背景模糊 */
  blur?: boolean;
}

export interface ExFooterSlots {
  default?: () => unknown;
  /** 左侧内容 */
  left?: () => unknown;
  /** 中间内容 */
  center?: () => unknown;
  /** 右侧内容 */
  right?: () => unknown;
}

export interface ExFooterExposed {
  getElement: () => HTMLElement | null;
}

// ============================================================================
// Container 容器
// ============================================================================

export interface ExContainerProps {
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: CSSProperties | string;
  /** 是否为流式容器（100%宽度） */
  fluid?: boolean;
  /** 固定尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface ExContainerSlots {
  default?: () => unknown;
}

export interface ExContainerExposed {
  getElement: () => HTMLElement | null;
}
