export type IconSize = number | string;

/** 图标组件属性。 */
export interface ExIconProps {
  /** 内置 SVG 注册名；未知名称不会伪造替代图形。 */
  icon?: string;
  /** 字体图标类名。 */
  name?: string;
  /** 字体图标前缀，例如 fas。 */
  prefix?: string;
  /** 图片地址。 */
  src?: string;
  /** 图标的可访问文本；图片和交互图标可将其作为名称。 */
  alt?: string;
  /** 根元素的显式无障碍名称。 */
  ariaLabel?: string;
  /** 图形尺寸；非负数字按像素处理，也可传 CSS 长度。 */
  size?: IconSize;
  /** 图标颜色；图片来源设置后会使用单色 mask。 */
  color?: string;
  /** 静态旋转角度。 */
  rotate?: number;
  /** 是否持续旋转。 */
  spin?: boolean;
  /** 是否渲染为原生 button。 */
  clickable?: boolean;
  /** 是否禁用交互按钮。 */
  disabled?: boolean;
  /** 兼容性附加类名；新代码可直接使用 class。 */
  customClass?: string;
}

export interface ExIconEmits {
  /** 仅交互图标被原生按钮激活时发出。 */
  click: [event: MouseEvent];
}
