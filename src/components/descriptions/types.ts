import type { CSSProperties, VNode } from 'vue';

/** 描述列表尺寸 */
export type DescriptionsSize = 'small' | 'medium' | 'large';

/** 排列方向 */
export type DescriptionsDirection = 'horizontal' | 'vertical';

/** 对齐方式 */
export type DescriptionsAlign = 'left' | 'center' | 'right';

/**
 * Descriptions 组件属性
 */
export interface ExDescriptionsProps {
  /** 标题 */
  title?: string;
  /** 一行的列数 */
  column?: number;
  /** 是否带边框 */
  border?: boolean;
  /** 尺寸 */
  size?: DescriptionsSize;
  /** 排列方向 */
  direction?: DescriptionsDirection;
  /** 标签对齐方式 */
  labelAlign?: DescriptionsAlign;
  /** 内容对齐方式 */
  contentAlign?: DescriptionsAlign;
  /** 是否在标签后显示冒号（仅无边框时生效） */
  colon?: boolean;
  /** 统一的标签自定义样式 */
  labelStyle?: CSSProperties;
  /** 统一的内容自定义样式 */
  contentStyle?: CSSProperties;
}

/**
 * DescriptionsItem 组件属性
 */
export interface ExDescriptionsItemProps {
  /** 标签文本 */
  label?: string;
  /** 列的数量（占据的列数） */
  span?: number;
  /** 标签对齐方式（覆盖父级） */
  labelAlign?: DescriptionsAlign;
  /** 内容对齐方式（覆盖父级） */
  contentAlign?: DescriptionsAlign;
  /** 标签自定义类名 */
  labelClass?: string;
  /** 内容自定义类名 */
  contentClass?: string;
  /** 标签自定义样式 */
  labelStyle?: CSSProperties;
  /** 内容自定义样式 */
  contentStyle?: CSSProperties;
}

/**
 * Descriptions 插槽
 */
export interface ExDescriptionsSlots {
  /** 默认插槽：放置 ExDescriptionsItem */
  default?: () => VNode[];
  /** 标题插槽 */
  title?: () => VNode[];
  /** 右上角操作区插槽 */
  extra?: () => VNode[];
}

/**
 * DescriptionsItem 插槽
 */
export interface ExDescriptionsItemSlots {
  /** 内容插槽 */
  default?: () => VNode[];
  /** 标签插槽 */
  label?: () => VNode[];
}
