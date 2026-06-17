/**
 * 箭头显示时机
 */
export type CarouselArrow = 'always' | 'hover' | 'never';

/**
 * 指示器位置
 */
export type CarouselIndicatorPosition = 'top' | 'bottom' | 'left' | 'right' | 'outside';

/**
 * 轮播方向
 */
export type CarouselDirection = 'horizontal' | 'vertical';

/**
 * 切换效果
 */
export type CarouselEffect = 'slide' | 'fade';

/**
 * 轮播组件属性接口
 */
export interface ExCarouselProps {
  /** 当前激活的索引 */
  modelValue?: number;
  /** 轮播高度 */
  height?: string | number;
  /** 是否自动播放 */
  autoplay?: boolean;
  /** 自动播放间隔（毫秒） */
  interval?: number;
  /** 是否循环播放 */
  loop?: boolean;
  /** 箭头显示时机 */
  arrow?: CarouselArrow;
  /** 指示器位置 */
  indicatorPosition?: CarouselIndicatorPosition;
  /** 是否显示指示器 */
  showIndicators?: boolean;
  /** 鼠标悬停时暂停自动播放 */
  pauseOnHover?: boolean;
  /** 轮播方向 */
  direction?: CarouselDirection;
  /** 切换效果 */
  effect?: CarouselEffect;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 轮播组件事件接口
 */
export interface ExCarouselEmits {
  /** 当前激活索引变化事件 */
  'update:modelValue': [index: number];
  /** 切换事件 */
  change: [current: number, prev: number];
}

/**
 * 轮播组件暴露的方法接口
 */
export interface ExCarouselExposed {
  /** 切换到下一张 */
  next: () => void;
  /** 切换到上一张 */
  prev: () => void;
  /** 切换到指定索引 */
  goTo: (index: number) => void;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}

/**
 * 轮播项组件属性接口
 */
export interface ExCarouselItemProps {
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}
