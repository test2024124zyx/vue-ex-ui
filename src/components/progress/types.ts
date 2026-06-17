/**
 * 进度条类型
 */
export type ProgressType = 'line' | 'circle' | 'wave' | 'wave-circle' | 'dashboard';

/**
 * 进度条状态
 */
export type ProgressStatus = 'success' | 'exception' | 'warning' | 'normal' | 'active';

/**
 * 进度条尺寸
 */
export type ProgressSize = 'small' | 'default' | 'large';

/**
 * 进度条主题
 */
export type ProgressTheme = 'default' | 'primary' | 'success' | 'warning' | 'danger';

/**
 * 进度条主题配置
 */
export interface ProgressThemeConfig {
  primaryColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  trailColor: string;
  textColor: string;
}

/**
 * 进度条渐变色
 */
export interface ProgressGradient {
  from: string;
  to: string;
  direction?: 'to right' | 'to left' | 'to bottom' | 'to top';
  stops?: Array<{ color: string; offset: string }>;
}

/**
 * 进度条颜色映射
 */
export type ProgressColorMap = Record<ProgressStatus, string>;

/**
 * 圆形进度条配置
 */
export interface CircleProgressConfig {
  width?: number;
  strokeWidth?: number;
  strokeLinecap?: 'round' | 'square' | 'butt';
  radius?: number;
  circumference?: number;
  centerX?: number;
  centerY?: number;
  viewBox?: string;
}

/**
 * 仪表盘进度条配置
 */
export interface DashboardProgressConfig extends CircleProgressConfig {
  gapDegree?: number;
  gapPosition?: GapPosition;
  startAngle?: number;
  endAngle?: number;
}

/**
 * 步骤进度条配置
 */
export interface StepProgressConfig {
  steps?: number;
  showInfo?: boolean;
  current?: number;
  stepWidth?: number;
  stepGap?: number;
  direction?: 'horizontal' | 'vertical';
}

/**
 * 缺口位置
 */
export type GapPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * 进度条尺寸配置
 */
export interface ProgressSizeConfig {
  strokeWidth: number;
  fontSize: number;
  lineHeight?: number;
  circleWidth?: number;
  iconSize?: number;
}

/**
 * SVG 路径信息
 */
export interface SvgPathInfo {
  pathString: string;
  trailPathString: string;
}

/**
 * 进度条渲染信息
 */
export interface ProgressRenderInfo {
  percent?: number;
  percentage?: number;
  status: ProgressStatus;
  color: string;
  text: string;
  successPercent?: number;
  trailColor?: string;
  showInfo?: boolean;
}

/**
 * 进度条颜色配置
 */
export interface ProgressColor {
  /** 颜色值 */
  color: string;
  /** 百分比 */
  percentage: number;
}

/**
 * 进度条组件属性
 */
export interface ExProgressProps {
  /** 百分比（0-100） */
  percentage: number;
  /** 进度条类型 */
  type?: ProgressType;
  /** 进度条线宽 */
  strokeWidth?: number;
  /** 是否显示进度文字 */
  showText?: boolean;
  /** 进度文字是否在进度条内部 */
  textInside?: boolean;
  /** 进度条状态 */
  status?: ProgressStatus;
  /** 进度条颜色 */
  color?: string | ProgressColor[] | ((percentage: number) => string);
  /** 是否显示条纹 */
  striped?: boolean;
  /** 条纹是否流动 */
  stripedFlow?: boolean;
  /** 是否显示状态图标 */
  showIcon?: boolean;
  /** 自定义文字格式化函数 */
  format?: (percentage: number) => string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 圆形进度条宽度 */
  width?: number;
  /** 波浪动画速度（默认 0.02） */
  waveSpeed?: number;
  /** 波浪振幅（默认 10） */
  waveAmplitude?: number;
  /** 是否显示波浪动画 */
  waveAnimated?: boolean;
}

/**
 * 进度条组件事件
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ExProgressEmits {
  // 暂无事件
}

/**
 * 进度条组件暴露的方法
 */
export interface ExProgressExposed {
  /** 获取进度条DOM元素 */
  getElement: () => HTMLDivElement | null;
}
