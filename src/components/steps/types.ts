/**
 * 步骤条状态
 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

/**
 * 步骤条方向
 */
export type StepsDirection = 'horizontal' | 'vertical';

/**
 * 步骤条尺寸
 */
export type StepsSize = 'small' | 'medium' | 'large';

/**
 * 单个步骤属性
 */
export interface ExStepProps {
  /** 步骤标题 */
  title?: string;
  /** 步骤描述 */
  description?: string;
  /** 步骤子标题 */
  subtitle?: string;
  /** 步骤状态（会覆盖父组件的status） */
  status?: StepStatus;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否可点击 */
  clickable?: boolean;
  /** 自定义图标颜色 */
  iconColor?: string;
  /** 自定义标题颜色 */
  titleColor?: string;
  /** 自定义连接线颜色 */
  lineColor?: string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 步骤条组件属性
 */
export interface ExStepsProps {
  /** 当前步骤（从0开始） */
  current?: number;
  /** 步骤条方向 */
  direction?: StepsDirection;
  /** 步骤条尺寸 */
  size?: StepsSize;
  /** 当前步骤状态 */
  status?: StepStatus;
  /** 是否显示进度点 */
  progressDot?: boolean;
  /** 步骤是否可点击 */
  clickable?: boolean;
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 步骤条组件事件
 */
export interface ExStepsEmits {
  /** 点击步骤时触发 */
  change: [current: number];
}

/**
 * 步骤条组件暴露的方法
 */
export interface ExStepsExposed {
  /** 获取步骤条 DOM 元素 */
  getElement: () => HTMLDivElement | null;
  /** 跳转到指定步骤 */
  goTo: (index: number) => void;
  /** 下一步 */
  next: () => void;
  /** 上一步 */
  prev: () => void;
}

/**
 * 单个步骤组件暴露的方法
 */
export interface ExStepExposed {
  /** 获取步骤 DOM 元素 */
  getElement: () => HTMLDivElement | null;
  /** 获取步骤索引 */
  getIndex: () => number;
}

import type { ComputedRef } from 'vue';

/**
 * 步骤上下文
 */
export interface StepsContext {
  current: ComputedRef<number>;
  status: ComputedRef<StepStatus>;
  direction: ComputedRef<StepsDirection>;
  size: ComputedRef<StepsSize>;
  progressDot: ComputedRef<boolean>;
  clickable: ComputedRef<boolean>;
  stepCount: ComputedRef<number>;
  registerStep: (uid: number) => number;
  unregisterStep: (uid: number) => void;
  onStepClick: (index: number) => void;
}
