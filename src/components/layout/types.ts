/** 布局方向；未传入时由直系 Sider 自动决定。 */
export type LayoutDirection = 'horizontal' | 'vertical';

/** 与设计令牌一致的有效响应式断点。 */
export type LayoutBreakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** 可由浏览器 style 属性执行的尺寸。 */
export type LayoutLength = string | number;

/** 侧栏收起请求的真实来源。 */
export type SiderCollapseSource = 'trigger' | 'responsive' | 'mask';

export interface ExLayoutProps {
  /** 显式布局方向；省略时包含直系 Sider 的布局自动使用水平方向。 */
  direction?: LayoutDirection;
}

export interface ExLayoutSlots {
  default?: () => unknown;
}

export interface ExLayoutExposed {
  /** 获取根容器。 */
  getElement: () => HTMLDivElement | null;
}

export interface ExHeaderProps {
  /** 头部高度。非法值回退为 64px。 */
  height?: LayoutLength;
  /** 是否固定在视口顶部。 */
  fixed?: boolean;
  /** 是否显示主题强调边框；省略时继承 ConfigProvider。 */
  neonBorder?: boolean;
  /** 是否启用背景模糊。 */
  blur?: boolean;
}

export interface ExHeaderSlots {
  default?: () => unknown;
  left?: () => unknown;
  center?: () => unknown;
  right?: () => unknown;
}

export interface ExHeaderExposed {
  /** 获取 header 元素。 */
  getElement: () => HTMLElement | null;
}

export interface ExSiderProps {
  /** 展开宽度。 */
  width?: LayoutLength;
  /** 收起宽度；允许为 0。 */
  collapsedWidth?: LayoutLength;
  /** 受控收起状态。 */
  collapsed?: boolean;
  /** 非受控初始收起状态。 */
  defaultCollapsed?: boolean;
  /** 是否显示收起触发器。 */
  collapsible?: boolean;
  /** 触发器位置；null 隐藏触发器。 */
  trigger?: 'top' | 'bottom' | null;
  /** 侧栏位于布局的左侧或右侧。 */
  position?: 'left' | 'right';
  /** 是否显示主题强调边框；省略时继承 ConfigProvider。 */
  neonBorder?: boolean;
  /** 是否启用背景模糊。 */
  blur?: boolean;
  /** 视口小于该设计断点时进入 broken 状态。 */
  breakpoint?: LayoutBreakpoint;
  /** 宽度过渡时长，单位毫秒。 */
  transitionDuration?: number;
  /** aside 的无障碍名称。 */
  ariaLabel?: string;
}

export interface ExSiderEmits {
  'update:collapsed': [value: boolean];
  collapse: [collapsed: boolean, source: SiderCollapseSource];
  breakpoint: [broken: boolean];
}

export interface ExSiderSlots {
  default?: () => unknown;
  trigger?: (props: { collapsed: boolean; broken: boolean }) => unknown;
}

export interface ExSiderExposed {
  /** 获取 aside 元素。 */
  getElement: () => HTMLElement | null;
  /** 请求切换收起状态。 */
  toggle: () => void;
}

export type ExContentTag = 'main' | 'section' | 'div';

export interface ExContentProps {
  /** 根元素标签。 */
  tag?: ExContentTag;
  /** 是否显示背景网格。 */
  grid?: boolean;
  /** 是否显示扫描线效果。 */
  scanline?: boolean;
}

export interface ExContentSlots {
  default?: () => unknown;
}

export interface ExContentExposed {
  /** 获取内容根元素。 */
  getElement: () => HTMLElement | null;
}

export interface ExFooterProps {
  /** 底部高度。非法值回退为 64px。 */
  height?: LayoutLength;
  /** 是否固定在视口底部。 */
  fixed?: boolean;
  /** 是否显示主题强调边框；省略时继承 ConfigProvider。 */
  neonBorder?: boolean;
  /** 是否启用背景模糊。 */
  blur?: boolean;
}

export interface ExFooterSlots {
  default?: () => unknown;
  left?: () => unknown;
  center?: () => unknown;
  right?: () => unknown;
}

export interface ExFooterExposed {
  /** 获取 footer 元素。 */
  getElement: () => HTMLElement | null;
}

export type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ExContainerProps {
  /** 是否取消最大宽度限制。 */
  fluid?: boolean;
  /** 固定最大宽度令牌。 */
  size?: ContainerSize;
}

export interface ExContainerSlots {
  default?: () => unknown;
}

export interface ExContainerExposed {
  /** 获取容器元素。 */
  getElement: () => HTMLDivElement | null;
}
