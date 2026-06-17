/**
 * 骨架屏动画类型
 */
export type SkeletonAnimation = 'pulse' | 'wave' | 'none';

/**
 * 骨架屏形状
 */
export type SkeletonShape = 'circle' | 'square' | 'rounded';

/**
 * 骨架屏尺寸
 */
export type SkeletonSize = 'small' | 'default' | 'large';

/**
 * 骨架屏变体类型
 */
export type SkeletonVariant =
  | 'text'
  | 'avatar'
  | 'title'
  | 'paragraph'
  | 'image'
  | 'button'
  | 'card'
  | 'list'
  | 'table'
  | 'article'
  | 'custom'
  | 'rect';

/**
 * 骨架屏项
 */
export interface SkeletonItem {
  type: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  shape?: SkeletonShape;
}

/**
 * 骨架屏模板
 */
export type SkeletonTemplate = 'article' | 'list' | 'card' | 'table' | 'custom';

/**
 * 骨架屏模板配置
 */
export interface SkeletonTemplateConfig {
  name: string;
  items: SkeletonItem[];
  width: number;
  height: number;
}

/**
 * 骨架屏头像配置
 */
export interface SkeletonAvatar {
  size?: string | number;
  shape?: SkeletonShape;
  active?: boolean;
}

/**
 * 骨架屏段落配置
 */
export interface SkeletonParagraph {
  rows?: number;
  width?: (string | number)[] | string;
  active?: boolean;
}

/**
 * 骨架屏标题配置
 */
export interface SkeletonTitle {
  width?: string | number;
  active?: boolean;
}

/**
 * 骨架屏渲染选项
 */
export interface SkeletonRenderOptions {
  avatar?: boolean | SkeletonAvatar;
  title?: boolean | SkeletonTitle;
  paragraph?: boolean | SkeletonParagraph;
  animated?: boolean;
  animation?: SkeletonAnimation;
}

/**
 * 骨架屏组件属性接口
 */
export interface ExSkeletonProps {
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 动画类型 */
  animation?: SkeletonAnimation;
  /** 形状 */
  shape?: SkeletonShape;
  /** 尺寸 */
  size?: SkeletonSize;
  /** 变体类型 */
  variant?: SkeletonVariant;
  /** 是否激活状态（显示动画） */
  active?: boolean;
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 重复次数（用于列表） */
  count?: number;
  /** 是否显示头像 */
  avatar?: boolean;
  /** 头像形状 */
  avatarShape?: SkeletonShape;
  /** 头像尺寸 */
  avatarSize?: string | number;
  /** 是否显示标题 */
  title?: boolean;
  /** 标题宽度 */
  titleWidth?: string | number;
  /** 段落行数 */
  rows?: number;
  /** 段落宽度（数组或字符串） */
  rowsWidth?: (string | number)[] | string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 骨架屏组件暴露的方法接口
 */
export interface ExSkeletonExposed {
  /** 获取骨架屏DOM元素 */
  getElement: () => HTMLDivElement | null;
}
