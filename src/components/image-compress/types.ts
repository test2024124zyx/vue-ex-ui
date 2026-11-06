export type CompressMode = 'quality' | 'size' | 'dimension';
export type ImageOutputType = 'image/png' | 'image/jpeg' | 'image/webp';
export type ImageCompressSource = string | Blob;

export interface ImageDimension {
  width: number;
  height: number;
}

export interface ImageCompressSourceInfo {
  originalSize: number;
  originalType: string;
  originalDimension: ImageDimension;
}

export interface CompressResult extends ImageCompressSourceInfo {
  blob: Blob;
  compressedSize: number;
  compressionRatio: number;
  compressedDimension: ImageDimension;
  outputType: ImageOutputType;
  /** PNG 为无损编码，不存在可声明的质量参数。 */
  qualityUsed: number | null;
  mode: CompressMode;
}

export interface CompressOptions {
  mode?: CompressMode;
  /** 有损格式编码质量，运行时会限制在 0.01 到 1。 */
  quality?: number;
  /** size 模式的最大输出大小，单位 KB；无法达到时 Promise 会拒绝。 */
  targetSize?: number;
  maxWidth?: number;
  maxHeight?: number;
  outputType?: ImageOutputType;
  /** 仅控制 dimension 模式的尺寸计算。 */
  keepAspectRatio?: boolean;
  /** JPEG 不支持透明通道，绘制前使用该颜色填充画布。 */
  backgroundColor?: string;
  signal?: AbortSignal;
}

export interface ExImageCompressProps {
  src: ImageCompressSource;
  mode?: CompressMode;
  quality?: number;
  targetSize?: number;
  maxWidth?: number;
  maxHeight?: number;
  outputType?: ImageOutputType;
  keepAspectRatio?: boolean;
  backgroundColor?: string;
  autoCompress?: boolean;
  showPreview?: boolean;
  showComparison?: boolean;
}

export interface ExImageCompressEmits {
  start: [];
  compress: [result: CompressResult];
  error: [error: Error];
  load: [info: ImageCompressSourceInfo];
}

export interface ExImageCompressExposed {
  compress: () => Promise<CompressResult>;
  download: (filename?: string) => void;
  getResult: () => CompressResult | null;
  reset: () => void;
  getElement: () => HTMLDivElement | null;
}
