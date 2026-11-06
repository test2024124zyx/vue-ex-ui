/** 加载条真实支持的状态。 */
export type LoadingBarStatus = 'loading' | 'success' | 'error' | 'warning';

/** 固定颜色，或根据当前规范化百分比计算颜色。 */
export type LoadingBarColor = string | ((percentage: number) => string);

/** 声明式 LoadingBar 属性。 */
export interface ExLoadingBarProps {
  /** 是否渲染加载条。 */
  visible?: boolean;
  /** 当前进度；运行时会限制在 0-100。 */
  percentage?: number;
  status?: LoadingBarStatus;
  /** 像素高度；运行时会限制在 1-16。 */
  height?: number;
  color?: LoadingBarColor;
  /** 非负整数层级；未提供时使用样式系统层级令牌。 */
  zIndex?: number;
}

/** LoadingBar 暴露方法。 */
export interface ExLoadingBarExposed {
  getElement: () => HTMLDivElement | null;
}

/** 命令式服务可配置的真实视觉选项。 */
export interface LoadingBarOptions {
  color?: LoadingBarColor;
  /** 像素高度，必须在 1-16 之间。 */
  height?: number;
  /** 非负层级；小数会向下取整。 */
  zIndex?: number;
}

/** 服务内部持有的完整视觉配置。 */
export interface NormalizedLoadingBarOptions {
  color: LoadingBarColor | undefined;
  height: number;
  zIndex: number | undefined;
}

/** 全局加载条服务；所有声明方法均为必定生效的能力。 */
export interface LoadingBarService {
  config: (options: LoadingBarOptions) => void;
  /** 从初始进度开始自动推进。 */
  start: () => void;
  /** 显示成功终态并自动清理。 */
  finish: () => void;
  /** 显示失败终态并自动清理。 */
  error: () => void;
  /** 显示警告终态并自动清理。 */
  warning: () => void;
  /** 切换到手动进度；100 会进入成功终态。 */
  update: (percentage: number) => void;
  /** 立即清除 DOM、状态与全部计时器；实例之后仍可复用。 */
  destroy: () => void;
}
