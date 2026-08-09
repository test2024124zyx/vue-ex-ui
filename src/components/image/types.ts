export type ImageLength = string | number;
export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
export type ImageFetchPriority = 'high' | 'low' | 'auto';

/** 图片组件属性。 */
export interface ExImageProps {
  /** 主图地址。 */
  src: string;
  /** 原生图片替代文本；装饰性图片应显式传空字符串。 */
  alt: string;
  /** 仅在显式设置时写入原生 title。 */
  title?: string;
  /** 响应式候选图片地址，直接映射到原生 srcset 属性。 */
  srcset?: string;
  /** 响应式候选图片的尺寸提示，直接映射到原生 sizes 属性。 */
  sizes?: string;
  /** 原生资源调度优先级。 */
  fetchPriority?: ImageFetchPriority;
  /** 宽度；非负数字和纯数字字符串按像素处理。 */
  width?: ImageLength;
  /** 高度；非负数字和纯数字字符串按像素处理。 */
  height?: ImageLength;
  /** 预留布局高度的宽高比，例如 16 / 9 或 1.777。 */
  aspectRatio?: ImageLength;
  /** 图片裁切模式。 */
  fit?: ImageFit;
  /** 圆角；非负数字按像素处理。 */
  radius?: ImageLength;
  /** 是否使用原生懒加载。 */
  lazy?: boolean;
  /** 是否提供内置全屏预览按钮。 */
  preview?: boolean;
  /** 高清预览地址，缺省时使用主图地址。 */
  previewSrc?: string;
  /** 主图失败后是否显示内置重试按钮。 */
  retry?: boolean;
}

export interface ExImageEmits {
  load: [event: Event];
  error: [event: Event];
  preview: [];
  previewLoad: [event: Event];
  previewError: [event: Event];
  retry: [];
}

export interface ExImageExposed {
  /** 获取承载图片状态的根元素。 */
  getElement: () => HTMLDivElement | null;
  /** 重新创建主图节点并发起一次加载。 */
  reload: () => void;
}
