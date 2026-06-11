import type { ExtractPropTypes, PropType } from 'vue';

export const gridProps = {
  /**
   * 栅格间隔，可以是数字或数组 [水平间隔, 垂直间隔]
   * 预设值：'xs'(4px), 'sm'(8px), 'md'(16px), 'lg'(24px), 'xl'(32px)
   */
  gutter: {
    type: [Number, Array, String] as PropType<number | [number, number] | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>,
    default: 0,
  },
  /**
   * 布局模式
   */
  justify: {
    type: String as PropType<
      'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'
    >,
    default: 'start',
  },
  /**
   * 垂直对齐方式
   */
  align: {
    type: String as PropType<'top' | 'middle' | 'bottom' | 'stretch'>,
    default: 'top',
  },
  /**
   * 是否自动换行
   */
  wrap: {
    type: Boolean,
    default: true,
  },
} as const;

export const gridItemProps = {
  /**
   * 栅格占位格数，为 0 时相当于 display: none
   * 设置为 'auto' 时自动等宽分配剩余空间
   */
  span: {
    type: [Number, String] as PropType<number | 'auto'>,
    default: 24,
  },
  /**
   * 栅格左侧的间隔格数，间隔内不可以有栅格
   */
  offset: {
    type: Number,
    default: 0,
  },
  /**
   * 栅格向右移动格数
   */
  push: {
    type: Number,
    default: 0,
  },
  /**
   * 栅格向左移动格数
   */
  pull: {
    type: Number,
    default: 0,
  },
  /**
   * 栅格顺序，使用 flex order 属性
   */
  order: {
    type: Number,
    default: 0,
  },
  /**
   * <480px 响应式栅格，可为栅格数或一个包含其他属性的对象
   */
  xs: {
    type: [Number, Object] as PropType<number | ResponsiveValue>,
    default: undefined,
  },
  /**
   * ≥480px 响应式栅格，可为栅格数或一个包含其他属性的对象
   */
  sm: {
    type: [Number, Object] as PropType<number | ResponsiveValue>,
    default: undefined,
  },
  /**
   * ≥768px 响应式栅格，可为栅格数或一个包含其他属性的对象
   */
  md: {
    type: [Number, Object] as PropType<number | ResponsiveValue>,
    default: undefined,
  },
  /**
   * ≥1024px 响应式栅格，可为栅格数或一个包含其他属性的对象
   */
  lg: {
    type: [Number, Object] as PropType<number | ResponsiveValue>,
    default: undefined,
  },
  /**
   * ≥1280px 响应式栅格，可为栅格数或一个包含其他属性的对象
   */
  xl: {
    type: [Number, Object] as PropType<number | ResponsiveValue>,
    default: undefined,
  },
  /**
   * ≥1536px 响应式栅格，可为栅格数或一个包含其他属性的对象
   */
  xxl: {
    type: [Number, Object] as PropType<number | ResponsiveValue>,
    default: undefined,
  },
} as const;

export interface ResponsiveValue {
  span?: number;
  offset?: number;
  push?: number;
  pull?: number;
  order?: number;
}

export type GridProps = ExtractPropTypes<typeof gridProps>;
export type GridItemProps = ExtractPropTypes<typeof gridItemProps>;
