/**
 * 文件预览类型
 */
export type PreviewType = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'code' | 'unknown';

/**
 * 预览文件接口
 */
export interface PreviewFile {
  /** 文件URL */
  url: string;
  /** 文件名 */
  name?: string;
  /** 文件类型 */
  type?: PreviewType;
  /** MIME类型 */
  mimeType?: string;
}

/**
 * 文件预览组件属性
 */
export interface ExFilePreviewProps {
  /** 单个文件URL或文件对象 */
  file?: string | PreviewFile;
  /** 多个文件列表 */
  files?: (string | PreviewFile)[];
  /** 初始显示的文件索引（多文件时） */
  initialIndex?: number;
  /** 文件类型（自动检测） */
  type?: PreviewType;
  /** 是否显示 */
  visible?: boolean;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否显示下载按钮 */
  showDownload?: boolean;
  /** 是否显示关闭按钮 */
  showClose?: boolean;
  /** 图片缩放比例 */
  scale?: number;
  /** 图片旋转角度 */
  rotate?: number;
  /** 是否可缩放 */
  zoomable?: boolean;
  /** 是否可旋转 */
  rotatable?: boolean;
  /** 最小缩放比例 */
  minScale?: number;
  /** 最大缩放比例 */
  maxScale?: number;
  /** 缩放步长 */
  scaleStep?: number;
  /** 旋转步长 */
  rotateStep?: number;
  /** 遮罩层背景色 */
  maskBackground?: string;
  /** 是否点击遮罩关闭 */
  maskClosable?: boolean;
  /** 代码语言（用于代码预览） */
  language?: string;
  /** 是否显示行号（用于代码预览） */
  showLineNumbers?: boolean;
}

/**
 * 文件预览组件事件
 */
export interface ExFilePreviewEmits {
  /** 可见性变化 */
  'update:visible': [visible: boolean];
  /** 关闭 */
  close: [];
  /** 下载 */
  download: [file: PreviewFile];
  /** 缩放变化 */
  'update:scale': [scale: number];
  /** 旋转变化 */
  'update:rotate': [rotate: number];
  /** 加载完成 */
  load: [];
  /** 加载失败 */
  error: [error: Error];
}

/**
 * 文件预览组件暴露的方法
 */
export interface ExFilePreviewExposed {
  /** 上一个文件 */
  prev: () => void;
  /** 下一个文件 */
  next: () => void;
  /** 放大 */
  zoomIn: () => void;
  /** 缩小 */
  zoomOut: () => void;
  /** 重置缩放 */
  resetZoom: () => void;
  /** 顺时针旋转 */
  rotateRight: () => void;
  /** 逆时针旋转 */
  rotateLeft: () => void;
  /** 重置旋转 */
  resetRotate: () => void;
  /** 下载文件 */
  download: () => void;
  /** 关闭预览 */
  close: () => void;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}
