/**
 * 加载动画类型
 */
export type LoadingType = 'spinner' | 'dots' | 'pulse' | 'bars' | 'neon' | 'wave' | 'bounce' | 'fade' | 'flip' | 'orbit' | 'ring' | 'ripple' | 'square' | 'custom';

/**
 * 加载尺寸
 */
export type LoadingSize = 'small' | 'medium' | 'large';

/**
 * 加载位置
 */
export type LoadingPosition = 'center' | 'top' | 'bottom';

/**
 * 加载主题
 */
export type LoadingTheme = 'light' | 'dark' | 'auto';

/**
 * 加载动画配置
 */
export interface LoadingAnimationConfig {
  duration?: number;
  easing?: string;
  iterationCount?: number | 'infinite';
}

/**
 * 加载全局配置
 */
export interface LoadingGlobalConfig {
  defaultType?: LoadingType;
  defaultSize?: LoadingSize;
  defaultColor?: string;
  defaultTheme?: LoadingTheme;
  defaultAnimation?: LoadingAnimationConfig;
  presets?: Array<{ name: string; config: Record<string, unknown> }>;
  enableGlobalStyles?: boolean;
  cssVariables?: Record<string, string>;
}

/**
 * 加载统计信息
 */
export interface LoadingStats {
  totalShown: number;
  totalHidden: number;
  averageDuration: number;
  activeInstances: number;
  totalInstances: number;
  averageDisplayTime: number;
  maxDisplayTime: number;
  minDisplayTime: number;
}

/**
 * 加载性能监控
 */
export interface LoadingPerformanceMonitor {
  start: (id: string) => void;
  stop: () => void;
  end: (id: string) => void;
  reset?: () => void;
  getStats: () => LoadingStats;
}

/**
 * 加载服务配置
 */
export interface LoadingServiceConfig extends ExLoadingProps {
  target?: HTMLElement | string;
  singleton?: boolean;
}

/**
 * 加载服务实例
 */
export interface LoadingServiceInstance {
  show?: () => void;
  hide?: () => void;
  close: () => void;
  destroy?: () => void;
  updateConfig: (config: Partial<LoadingServiceConfig>) => void;
}

/**
 * 加载服务
 */
export interface LoadingService {
  show: (config?: LoadingServiceConfig) => LoadingServiceInstance;
  hide?: () => void;
  hideAll?: () => void;
  destroyAll?: () => void;
  getInstanceCount?: () => number;
  singleton?: boolean;
}

/**
 * 加载组件属性
 */
export interface ExLoadingProps {
  /** 是否显示 */
  visible?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 加载动画类型 */
  type?: LoadingType;
  /** 加载尺寸 */
  size?: LoadingSize;
  /** 加载文本 */
  text?: string;
  /** 颜色 */
  color?: string;
  /** 主题 */
  theme?: LoadingTheme;
  /** 位置 */
  position?: LoadingPosition;
  /** 是否全屏显示 */
  fullscreen?: boolean;
  /** 是否显示遮罩 */
  mask?: boolean;
  /** 点击遮罩是否关闭 */
  maskClosable?: boolean;
  /** 目标容器（CSS选择器或DOM元素），非全屏时使用 */
  target?: string | HTMLElement;
  /** 层级 */
  zIndex?: number;
  /** 动画配置 */
  animation?: LoadingAnimationConfig;
  /** 最小显示时长 */
  minDuration?: number;
  /** 最大显示时长 */
  maxDuration?: number;
  /** 禁用动画 */
  disableAnimation?: boolean;
  /** 显示百分比 */
  showPercentage?: boolean;
  /** 百分比值 */
  percentage?: number;
  /** 显示时间 */
  showTime?: boolean;
  /** 可取消 */
  cancelable?: boolean;
  /** 显示详情 */
  showDetails?: boolean;
  /** 自动隐藏 */
  autoHide?: boolean;
  /** 自动隐藏延迟 */
  autoHideDelay?: number;
  /** 锁定滚动 */
  lockScroll?: boolean;
  /** 可关闭 */
  closable?: boolean;
  /** 可拖拽 */
  draggable?: boolean;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 加载组件事件
 */
export interface ExLoadingEmits {
  /** 显示状态改变事件 */
  'update:visible': [visible: boolean];
  /** 关闭事件 */
  close: [];
}

/**
 * 加载组件暴露的方法
 */
export interface ExLoadingExposed {
  /** 获取加载DOM元素 */
  getElement: () => HTMLDivElement | null;
  /** 关闭加载 */
  close: () => void;
}
