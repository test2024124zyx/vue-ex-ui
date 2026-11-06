/**
 * 头像形状
 */
export type AvatarShape = 'circle' | 'square';

/**
 * 头像尺寸
 */
export type AvatarSize = 'small' | 'medium' | 'large' | number;

/**
 * 头像类型
 */
export type AvatarType = 'image' | 'icon' | 'text';

/**
 * 头像组件属性接口
 */
export interface ExAvatarProps {
  /** 头像尺寸 */
  size?: AvatarSize;
  /** 头像形状 */
  shape?: AvatarShape;
  /** 是否启用头像点击交互；启用后根节点使用原生 button 语义。 */
  clickable?: boolean;
  /** 图片地址 */
  src?: string;
  /** 图片srcset属性 */
  srcset?: string;
  /** 图片 alt 属性；传入空字符串可将图片标记为装饰内容。 */
  alt?: string;
  /** 响应式图片尺寸描述。 */
  sizes?: string;
  /** 图片加载策略。 */
  loading?: 'eager' | 'lazy';
  /** 图片解码策略。 */
  decoding?: 'sync' | 'async' | 'auto';
  /** 图片引用策略。 */
  referrerPolicy?: ReferrerPolicy;

  /** 文字内容（当没有图片和图标时显示首个完整字素） */
  text?: string;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 文字颜色 */
  textColor?: string;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 跨域设置 */
  crossOrigin?: 'anonymous' | 'use-credentials' | '';
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 鼠标悬停提示 */
  title?: string;
}

/**
 * 头像组件事件接口
 */
export interface ExAvatarEmits {
  /** 图片加载错误事件 */
  error: [event: Event];
  /** 图片加载成功事件 */
  load: [event: Event];
  /** 点击事件 */
  click: [event: MouseEvent];
}

/**
 * 头像组件暴露的方法接口
 */
export interface ExAvatarExposed {
  /** 获取头像DOM元素 */
  getElement: () => HTMLElement | null;
  /** 重新加载图片 */
  reload: () => void;
}

/**
 * 头像组合组件属性接口
 */
export interface ExAvatarGroupProps {
  /** 最大显示数量 */
  maxCount?: number;
  /** 超出数量的样式 */
  maxStyle?: Record<string, string | number>;
  /** 头像组的无障碍名称。 */
  ariaLabel?: string;
  /** 头像尺寸 */
  size?: AvatarSize;
  /** 头像形状 */
  shape?: AvatarShape;
  /** 相邻头像间距；负值表示重叠。 */
  spacing?: number | string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

export interface ExAvatarGroupEmits {
  /** 点击溢出计数头像时返回隐藏数量。 */
  overflowClick: [count: number];
}
