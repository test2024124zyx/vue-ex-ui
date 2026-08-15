export type GridGutterPreset = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type GridGutter = number | [number, number] | GridGutterPreset;
export type GridJustify =
  'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
export type GridAlign = 'top' | 'middle' | 'bottom' | 'stretch';
export type GridSpan = number | 'auto';

/** 单个响应式断点可覆盖的栅格字段。未设置字段继承较小断点。 */
export interface ResponsiveValue {
  span?: GridSpan;
  offset?: number;
  push?: number;
  pull?: number;
  order?: number;
}

/** 栅格容器属性。 */
export interface ExGridProps {
  /** 栅格间隔，数组顺序为 [水平, 垂直]。 */
  gutter?: GridGutter;
  justify?: GridJustify;
  align?: GridAlign;
  wrap?: boolean;
}

/** 栅格项属性。 */
export interface ExGridItemProps {
  /** 0 隐藏，1 至 24 表示列数，auto 平分剩余空间。 */
  span?: GridSpan;
  offset?: number;
  push?: number;
  pull?: number;
  order?: number;
  /** 小于 480px。 */
  xs?: GridSpan | ResponsiveValue;
  /** 大于等于 480px。 */
  sm?: GridSpan | ResponsiveValue;
  /** 大于等于 768px。 */
  md?: GridSpan | ResponsiveValue;
  /** 大于等于 1024px。 */
  lg?: GridSpan | ResponsiveValue;
  /** 大于等于 1280px。 */
  xl?: GridSpan | ResponsiveValue;
  /** 大于等于 1536px。 */
  xxl?: GridSpan | ResponsiveValue;
}

/** 兼容组件命名习惯的类型别名。 */
export type GridProps = ExGridProps;
export type GridItemProps = ExGridItemProps;
