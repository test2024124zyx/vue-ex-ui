export type DividerType = 'horizontal' | 'vertical';
export type DividerOrientation = 'left' | 'center' | 'right';
export type DividerPresetSize = 'small' | 'default' | 'large';

/** 分割线属性。 */
export interface ExDividerProps {
  /** 分割线方向。 */
  type?: DividerType;
  /** 水平标题的位置。 */
  orientation?: DividerOrientation;
  /** 标题与最近一侧线段之间的长度或占比，仅 left/right 标题有效。 */
  orientationMargin?: string | number;
  /** 是否使用虚线。 */
  dashed?: boolean;
  /** 预设粗细或正数像素值。 */
  size?: DividerPresetSize | number;
  /** 水平线的上下间距或垂直线的左右间距。 */
  margin?: string | number;
  /** 标题是否使用普通正文权重。 */
  plain?: boolean;
  /** 分割线颜色。 */
  color?: string;
  /** 可选的无障碍名称；普通装饰性分隔线无需设置。 */
  ariaLabel?: string;
}
