/**
 * 面板类型
 */
export type PanelType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * 面板尺寸
 */
export type PanelSize = 'small' | 'medium' | 'large';

/**
 * 面板阴影
 */
export type PanelShadow = 'none' | 'base' | 'sm' | 'md' | 'lg' | 'xl' | 'neon';

/**
 * 面板组件属性
 */
export interface ExPanelProps {
  /** 面板标题 */
  title?: string;
  /** 面板副标题 */
  subtitle?: string;
  /** 面板类型 */
  type?: PanelType;
  /** 面板尺寸 */
  size?: PanelSize;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否可悬停 */
  hoverable?: boolean;
  /** 阴影效果 */
  shadow?: PanelShadow;
  /** 是否加载中 */
  loading?: boolean;
  /** 头部样式 */
  headerStyle?: string | Record<string, string | number>;
  /** 内容样式 */
  bodyStyle?: string | Record<string, string | number>;
  /** 底部样式 */
  footerStyle?: string | Record<string, string | number>;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 面板组件暴露的方法
 */
export interface ExPanelExposed {
  /** 获取面板DOM元素 */
  getElement: () => HTMLDivElement | null;
}
