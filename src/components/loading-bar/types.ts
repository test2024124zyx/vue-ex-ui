/**
 * LoadingBar 状态
 */
export type LoadingBarStatus = 'loading' | 'success' | 'error' | 'warning';

/**
 * LoadingBar 配置选项
 */
export interface LoadingBarOptions {
  /** 进度条颜色 */
  color?: string | ((percentage: number) => string);
  /** 进度条高度 */
  height?: number;
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 层级 */
  zIndex?: number;
}

/**
 * LoadingBar 组件属性
 */
export interface ExLoadingBarProps {
  /** 百分比（0-100） */
  percentage: number;
  /** 状态 */
  status?: LoadingBarStatus;
  /** 进度条高度 */
  height?: number;
  /** 进度条颜色 */
  color?: string | ((percentage: number) => string);
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 层级 */
  zIndex?: number;
}

/**
 * LoadingBar 实例
 */
export interface LoadingBarInstance {
  /** 开始加载 */
  start: () => void;
  /** 完成加载 */
  finish: () => void;
  /** 加载失败 */
  error: () => void;
  /** 警告状态 */
  warning?: () => void;
  /** 重置 */
  reset?: () => void;
  /** 设置百分比 */
  setPercentage?: (percentage: number) => void;
  /** 更新进度 */
  update: (percentage: number) => void;
}

/**
 * LoadingBar 实例（别名）
 */
export type LoadingBarInst = LoadingBarInstance;
