import type { CSSProperties } from 'vue';

/** Typography 组件属性接口 */
export interface ExTypographyProps {
  /** 文本内容 */
  text?: string;
  /** HTML 标签类型 */
  tag?: TypographyTag;
  /** 文本变体 */
  variant?: TypographyVariant;
  /** 文本大小 */
  size?: TypographySize;
  /**
   * 文本颜色：可填主题色名（如 'primary' / 'text-secondary'，映射为 var(--ex-color-*)），
   * 也可直接填原始 CSS 颜色值（如 '#fff' / 'rgb(...)' / 'var(...)'）。
   */
  color?: TypographyColor | (string & {});
  /** 是否截断文本 */
  truncate?: boolean;
  /** 是否使用渐变色 */
  gradient?: boolean;
  /** 是否使用霓虹发光效果 */
  glow?: boolean;
  /** 是否居中对齐 */
  center?: boolean;
  /** 是否加粗 */
  bold?: boolean;
  /** 是否斜体 */
  italic?: boolean;
  /** 是否下划线 */
  underline?: boolean;
  /** 最大行数（用于多行截断，传入小数时按不超过它的整数处理） */
  maxLines?: number;
  /** 自定义样式 */
  customStyle?: CSSProperties;
}

/** Typography 变体类型 */
export type TypographyVariant = 'display' | 'heading' | 'title' | 'body' | 'caption' | 'overline';

/** Typography 尺寸类型 */
export type TypographySize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

/** Typography 颜色类型 */
export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'danger'
  | 'info'
  | 'text-primary'
  | 'text-secondary'
  | 'text-tertiary'
  | 'text-inverse'
  | 'text-disabled'
  | 'white'
  | 'black';

/** Typography HTML 标签类型 */
export type TypographyTag =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'div'
  | 'label';
