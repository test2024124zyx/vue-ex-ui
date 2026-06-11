export interface ExSpaceProps {
  /** 方向：水平或垂直 */
  direction?: 'horizontal' | 'vertical';
  /** 间距：预设 small|medium|large 或 number(px) */
  size?: 'small' | 'medium' | 'large' | number;
  /** 是否换行（仅水平方向时常用） */
  wrap?: boolean;
  /** 交叉轴对齐 */
  align?: 'start' | 'center' | 'end';
  /** 主轴对齐 */
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
}
