import type { ExtractPropTypes, PropType } from 'vue';

export const flexProps = {
  /**
   * flex-direction 的值
   */
  direction: {
    type: String as PropType<'row' | 'row-reverse' | 'column' | 'column-reverse'>,
    default: 'row',
  },
  /**
   * flex-wrap 的值
   */
  wrap: {
    type: String as PropType<'nowrap' | 'wrap' | 'wrap-reverse'>,
    default: 'nowrap',
  },
  /**
   * justify-content 的值
   */
  justify: {
    type: String as PropType<
      'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
    >,
    default: 'flex-start',
  },
  /**
   * align-items 的值
   */
  align: {
    type: String as PropType<'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'>,
    default: 'flex-start',
  },
  /**
   * align-content 的值
   */
  alignContent: {
    type: String as PropType<
      'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch'
    >,
    default: 'stretch',
  },
  /**
   * 间隙大小，支持数字、预设值或字符串
   * 预设值：'xs'(4px), 'sm'(8px), 'md'(16px), 'lg'(24px), 'xl'(32px)
   */
  gap: {
    type: [String, Number] as PropType<string | number | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>,
    default: undefined,
  },
  /**
   * 行间隙，支持数字、预设值或字符串
   */
  rowGap: {
    type: [String, Number] as PropType<string | number | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>,
    default: undefined,
  },
  /**
   * 列间隙，支持数字、预设值或字符串
   */
  columnGap: {
    type: [String, Number] as PropType<string | number | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>,
    default: undefined,
  },
  /**
   * 是否为内联 flex
   */
  inline: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否垂直布局
   */
  vertical: {
    type: Boolean,
    default: false,
  },
} as const;

export const flexItemProps = {
  /**
   * flex-grow 的值
   */
  grow: {
    type: Number,
    default: 0,
  },
  /**
   * flex-shrink 的值
   */
  shrink: {
    type: Number,
    default: 1,
  },
  /**
   * flex-basis 的值
   */
  basis: {
    type: [String, Number] as PropType<string | number>,
    default: 'auto',
  },
  /**
   * flex 简写属性
   */
  flex: {
    type: [String, Number] as PropType<string | number>,
    default: undefined,
  },
  /**
   * align-self 的值
   */
  alignSelf: {
    type: String as PropType<
      'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
    >,
    default: 'auto',
  },
  /**
   * order 的值
   */
  order: {
    type: Number,
    default: 0,
  },
} as const;

export type FlexProps = ExtractPropTypes<typeof flexProps>;
export type FlexItemProps = ExtractPropTypes<typeof flexItemProps>;
