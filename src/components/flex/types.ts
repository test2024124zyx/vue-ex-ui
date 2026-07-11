import type { FlexLength } from './flex-utils';

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';
export type FlexJustify =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';
export type FlexAlign = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
export type FlexAlignContent =
  | 'flex-start'
  | 'flex-end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch';
export type FlexAlignSelf = 'auto' | FlexAlign;

/** Flex 容器属性。 */
export interface ExFlexProps {
  direction?: FlexDirection;
  wrap?: FlexWrap;
  justify?: FlexJustify;
  align?: FlexAlign;
  alignContent?: FlexAlignContent;
  gap?: FlexLength;
  rowGap?: FlexLength;
  columnGap?: FlexLength;
  inline?: boolean;
  /** column 的便捷别名；启用时覆盖 direction。 */
  vertical?: boolean;
}

/** Flex 子项属性。 */
export interface ExFlexItemProps {
  grow?: number;
  shrink?: number;
  basis?: FlexLength;
  /** 设置后优先于 grow、shrink 和 basis。 */
  flex?: FlexLength;
  alignSelf?: FlexAlignSelf;
  order?: number;
}

export type FlexProps = ExFlexProps;
export type FlexItemProps = ExFlexItemProps;
