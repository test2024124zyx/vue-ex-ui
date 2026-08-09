import type { SpaceGap } from './space-utils';

export interface ExSpaceProps {
  /** 方向：水平或垂直 */
  direction?: 'horizontal' | 'vertical';
  /** 间距：预设、非负像素值或 CSS 长度 */
  size?: SpaceGap;
  /** 是否换行（仅水平方向时常用） */
  wrap?: boolean;
  /** 交叉轴对齐 */
  align?: 'start' | 'center' | 'end';
  /** 主轴对齐 */
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
}
