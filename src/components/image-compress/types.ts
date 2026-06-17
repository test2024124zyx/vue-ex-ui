/**
 * 压缩模式
 */
export type CompressMode = 'quality' | 'size' | 'dimension';

/**
 * 压缩结果
 */
export interface CompressResult {
  /** 压缩后的Blob */
  blob: Blob;
  /** 压缩后的DataURL */
  dataUrl: string;
  /** 原始文件大小（字节） */
  originalSize: number;
  /** 压缩后文件大小（字节） */
  compressedSize: number;
  /** 压缩率 */
  compressionRatio: number;
  /** 原始尺寸 */
  originalDimension: { width: number; height: number };
  /** 压缩后尺寸 */
  compressedDimension: { width: number; height: number };
}

/**
 * 图片压缩组件属性
 */
export interface ExImageCompressProps {
  /** 图片源（URL或File） */
  src: string | File;
  /** 压缩模式 */
  mode?: CompressMode;
  /** 压缩质量 0-1 */
  quality?: number;
  /** 目标文件大小（KB） */
  targetSize?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 最大高度 */
  maxHeight?: number;
  /** 输出格式 */
  outputType?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** 是否保持宽高比 */
  keepAspectRatio?: boolean;
  /** 是否自动压缩 */
  autoCompress?: boolean;
  /** 是否显示预览 */
  showPreview?: boolean;
  /** 是否显示对比 */
  showComparison?: boolean;
  /** 压缩算法（质量优先/速度优先） */
  algorithm?: 'quality' | 'speed';
}

/**
 * 图片压缩组件事件
 */
export interface ExImageCompressEmits {
  /** 压缩开始 */
  start: [];
  /** 压缩进度 */
  progress: [percent: number];
  /** 压缩完成 */
  compress: [result: CompressResult];
  /** 压缩失败 */
  error: [error: Error];
  /** 图片加载完成 */
  load: [size: { width: number; height: number }];
}

/**
 * 图片压缩组件暴露的方法
 */
export interface ExImageCompressExposed {
  /** 执行压缩 */
  compress: () => Promise<CompressResult>;
  /** 下载压缩后的图片 */
  download: (filename?: string) => void;
  /** 获取压缩结果 */
  getResult: () => CompressResult | null;
  /** 重置 */
  reset: () => void;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}
