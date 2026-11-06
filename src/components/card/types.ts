/**
 * 卡片类型
 */
export type CardType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * 卡片尺寸
 */
export type CardSize = 'small' | 'medium' | 'large';

/**
 * 卡片阴影
 */
export type CardShadow = 'none' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | 'neon';

/**
 * 卡片组件属性接口
 */
export interface ExCardProps {
  /** 卡片类型 */
  type?: CardType;
  /** 卡片尺寸 */
  size?: CardSize;
  /** 阴影效果 */
  shadow?: CardShadow;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 是否可悬停 */
  hoverable?: boolean;
  /** 是否加载中 */
  loading?: boolean;
  /** 封面图片 URL */
  cover?: string;
  /** 封面图片高度 */
  coverHeight?: string | number;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 头部样式 */
  headerStyle?: string | Record<string, string | number>;
  /** 内容样式 */
  bodyStyle?: string | Record<string, string | number>;
  /** 底部样式 */
  footerStyle?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 点击监听器作为属性参与响应式更新，保持 @click 的使用方式。 */
  onClick?: ((event: MouseEvent) => void) | Array<(event: MouseEvent) => void>;
  /** 单次点击仍由 Vue 的事件分发器控制。 */
  onClickOnce?: ((event: MouseEvent) => void) | Array<(event: MouseEvent) => void>;
}

/**
 * 卡片组件事件接口
 */
export interface ExCardEmits {
  /** 点击事件 */
  click: [event: MouseEvent];
}

/**
 * 卡片组件暴露的方法接口
 */
export interface ExCardExposed {
  /** 获取卡片DOM元素 */
  getElement: () => HTMLDivElement | null;
}
