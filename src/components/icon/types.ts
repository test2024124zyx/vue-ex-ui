export interface ExIconProps {
  /** 图标名称 (用于字体图标) */
  name?: string;
  /** 图标前缀 (如 'fas', 'far', 'fab') */
  prefix?: string;
  /** 图片路径 (用于图片图标) */
  src?: string;
  /** 图片alt文本 */
  alt?: string;
  /** 图标大小 */
  size?: number | string;
  /** 图标颜色 */
  color?: string;
  /** 旋转角度 */
  rotate?: number;
  /** 是否旋转动画 */
  spin?: boolean;
  /** 是否可点击 */
  clickable?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 自定义类名 */
  customClass?: string;
  /** HTML标签 */
  tag?: string;
}

export interface ExIconEmits {
  click: [event: MouseEvent];
}
