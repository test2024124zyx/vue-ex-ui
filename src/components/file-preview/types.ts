import type { ExFilePreviewError } from './errors';

/** 浏览器内建能力支持的预览类型。 */
export type PreviewType = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'code' | 'unknown';

/** 可预览文件描述。 */
export interface PreviewFile {
  /** 文件地址，仅接受相对地址、HTTP(S)、Blob 或与类型匹配的 data 地址。 */
  url: string;
  /** 文件显示名称。 */
  name?: string;
  /** 文件显式预览类型，优先级高于组件级 type。 */
  type?: PreviewType;
  /** 文件 MIME 类型，用于没有显式类型时识别内容。 */
  mimeType?: string;
}

/** 字符串、文件描述或浏览器 Blob/File 均可作为预览来源。 */
export type PreviewSource = string | PreviewFile | Blob;

/** 文件预览组件属性。 */
export interface ExFilePreviewProps {
  /** 单个预览来源；files 非空时优先使用 files。 */
  file?: PreviewSource;
  /** 多文件预览来源。 */
  files?: PreviewSource[];
  /** 受控的当前文件索引。 */
  currentIndex?: number;
  /** 非受控模式的初始文件索引。 */
  defaultCurrentIndex?: number;
  /** 文件未声明类型时使用的组件级兜底类型。 */
  type?: PreviewType;
  /** 受控显示状态。 */
  visible?: boolean;
  /** 是否显示顶部工具栏。 */
  showToolbar?: boolean;
  /** 是否显示下载请求按钮。 */
  showDownload?: boolean;
  /** 是否显示关闭请求按钮。 */
  showClose?: boolean;
  /** 受控图片缩放比例。 */
  scale?: number;
  /** 非受控模式的初始缩放比例。 */
  defaultScale?: number;
  /** 受控图片旋转角度。 */
  rotate?: number;
  /** 非受控模式的初始旋转角度。 */
  defaultRotate?: number;
  /** 是否允许图片缩放。 */
  zoomable?: boolean;
  /** 是否允许图片旋转。 */
  rotatable?: boolean;
  /** 最小缩放比例，必须大于 0。 */
  minScale?: number;
  /** 最大缩放比例；小于最小值时按最小值处理。 */
  maxScale?: number;
  /** 单次缩放步长，必须大于 0。 */
  scaleStep?: number;
  /** 单次旋转角度，非法值按 90 度处理。 */
  rotateStep?: number;
  /** 文本或代码可读取的最大 UTF-8 字节数。 */
  maxTextBytes?: number;
  /** 遮罩背景。 */
  maskBackground?: string;
  /** 点击遮罩是否请求关闭。 */
  maskClosable?: boolean;
  /** Escape 是否请求关闭。 */
  closeOnEscape?: boolean;
  /** 是否锁定页面滚动。 */
  lockScroll?: boolean;
  /** 是否显示真实逐行代码行号。 */
  showLineNumbers?: boolean;
  /** 自定义浮层层级；未设置时跟随全局配置。 */
  zIndex?: number;
  /** 无文件名时使用的对话框无障碍名称。 */
  ariaLabel?: string;
}

/** 文件预览组件事件。 */
export interface ExFilePreviewEmits {
  /** 请求父级同步显示状态。 */
  'update:visible': [visible: boolean];
  /** 用户发起关闭请求。 */
  'close-request': [];
  /** 用户发起下载请求；组件不伪造下载结果。 */
  'download-request': [file: PreviewFile];
  /** 请求父级同步当前索引。 */
  'update:currentIndex': [index: number];
  /** 用户发起文件导航请求。 */
  'navigation-request': [index: number, file: PreviewFile];
  /** 请求父级同步缩放比例。 */
  'update:scale': [scale: number];
  /** 请求父级同步旋转角度。 */
  'update:rotate': [rotate: number];
  /** 当前文件已具备预览条件。 */
  ready: [file: PreviewFile, index: number];
  /** 当前文件加载或校验失败。 */
  error: [error: ExFilePreviewError, file: PreviewFile, index: number];
}

/** 文件预览组件暴露的请求方法。 */
export interface ExFilePreviewExposed {
  /** 请求切换到上一文件。 */
  requestPrevious: () => void;
  /** 请求切换到下一文件。 */
  requestNext: () => void;
  /** 请求放大图片。 */
  requestZoomIn: () => void;
  /** 请求缩小图片。 */
  requestZoomOut: () => void;
  /** 请求把图片缩放重置到 100% 或最近的有效边界。 */
  requestResetZoom: () => void;
  /** 请求顺时针旋转图片。 */
  requestRotateClockwise: () => void;
  /** 请求逆时针旋转图片。 */
  requestRotateCounterclockwise: () => void;
  /** 请求把图片旋转重置为 0 度。 */
  requestResetRotation: () => void;
  /** 发出当前文件下载请求。 */
  requestDownload: () => void;
  /** 发出关闭请求。 */
  requestClose: () => void;
  /** 获取预览对话框元素。 */
  getElement: () => HTMLDivElement | null;
}

/** 文件预览具名插槽。 */
export interface ExFilePreviewSlots {
  toolbar?: (props: { file: PreviewFile; index: number }) => unknown;
  footer?: (props: { file: PreviewFile; index: number }) => unknown;
}
