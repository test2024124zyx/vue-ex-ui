export interface ExDividerProps {
  /** 分割线类型：水平/垂直 */
  type?: 'horizontal' | 'vertical';
  /** 文字位置：左/中/右（仅水平分割线有效） */
  orientation?: 'left' | 'center' | 'right';
  /** 标题和最近 left/right 边框之间的距离 */
  orientationMargin?: string | number;
  /** 是否虚线 */
  dashed?: boolean;
  /** 分割线粗细 */
  size?: 'small' | 'default' | 'large' | number;
  /** 分割线上下间距 */
  margin?: string | number;
  /** 文字是否显示为普通正文样式 */
  plain?: boolean;
  /** 分割线颜色 */
  color?: string;
}
