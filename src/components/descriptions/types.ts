import type { CSSProperties, VNode } from 'vue';

export type DescriptionsSize = 'small' | 'medium' | 'large';
export type DescriptionsDirection = 'horizontal' | 'vertical';
export type DescriptionsAlign = 'left' | 'center' | 'right';
export type DescriptionsClass = string | string[] | Record<string, boolean>;

/** 描述列表属性。 */
export interface ExDescriptionsProps {
  /** 可选标题。 */
  title?: string;
  /** 每行逻辑列数，运行时规范到 1～1000 的整数。 */
  column?: number;
  /** 是否显示单元格边框。 */
  border?: boolean;
  /** 组件尺寸。 */
  size?: DescriptionsSize;
  /** 标签与内容的排列方向。 */
  direction?: DescriptionsDirection;
  /** 全局标签对齐方式。 */
  labelAlign?: DescriptionsAlign;
  /** 全局内容对齐方式。 */
  contentAlign?: DescriptionsAlign;
  /** 无边框模式是否在非空标签后显示冒号。 */
  colon?: boolean;
  /** 全局标签样式。 */
  labelStyle?: CSSProperties;
  /** 全局内容样式。 */
  contentStyle?: CSSProperties;
}

/** 描述项配置属性。 */
export interface ExDescriptionsItemProps {
  /** 标签文本。 */
  label?: string;
  /** 占据的逻辑列数，规范后不会超过父组件 column。 */
  span?: number;
  /** 当前标签对齐方式。 */
  labelAlign?: DescriptionsAlign;
  /** 当前内容对齐方式。 */
  contentAlign?: DescriptionsAlign;
  /** 当前标签类名。 */
  labelClass?: DescriptionsClass;
  /** 当前内容类名。 */
  contentClass?: DescriptionsClass;
  /** 当前标签样式。 */
  labelStyle?: CSSProperties;
  /** 当前内容样式。 */
  contentStyle?: CSSProperties;
}

/** 描述列表插槽。 */
export interface ExDescriptionsSlots {
  /** 仅放置 ExDescriptionsItem 配置节点。 */
  default?: () => VNode[];
  /** 自定义标题。 */
  title?: () => VNode[];
  /** 标题行右侧操作区。 */
  extra?: () => VNode[];
}

/** 描述项插槽。 */
export interface ExDescriptionsItemSlots {
  /** 字段内容。 */
  default?: () => VNode[];
  /** 自定义标签。 */
  label?: () => VNode[];
}
