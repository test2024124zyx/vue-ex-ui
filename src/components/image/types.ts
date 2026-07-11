export type ImageLength = string | number;
export type ImageFit = 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

/** 图片组件属性。 */
export interface ExImageProps {
  /** 主图地址。 */
  src: string;
  /** 原生图片替代文本；装饰性图片应显式传空字符串。 */
  alt: string;
  /** 仅在显式设置时写入原生 title。 */
  title?: string;
  /** 宽度；非负数字和纯数字字符串按像素处理。 */
  width?: ImageLength;
  /** 高度；非负数字和纯数字字符串按像素处理。 */
  height?: ImageLength;
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
}

export interface ExImageEmits {
  load: [event: Event];
  error: [event: Event];
  preview: [];
}

export interface ExImageExposed {
  /** 获取承载图片状态的根元素。 */
  getElement: () => HTMLDivElement | null;
}
