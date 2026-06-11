/**
 * 裁剪形状
 */
export type CropShape = 'rect' | 'circle';

/**
 * 裁剪模式
 */
export type CropMode = 'free' | 'fixed';

/**
 * 裁剪区域
 */
export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 裁剪结果
 */
export interface CropResult {
  /** 裁剪后的Blob */
  blob: Blob;
  /** 裁剪后的DataURL */
  dataUrl: string;
  /** 裁剪区域 */
  area: CropArea;
  /** 原始图片尺寸 */
  originalSize: { width: number; height: number };
  /** 裁剪后尺寸 */
  croppedSize: { width: number; height: number };
}

/**
 * 图片裁剪组件属性
 */
export interface ExImageCropProps {
  /** 图片URL或File对象 */
  src: string | File;
  /** 裁剪形状 */
  shape?: CropShape;
  /** 裁剪模式 */
  mode?: CropMode;
  /** 固定宽高比 */
  aspectRatio?: number;
  /** 初始裁剪区域 */
  initialArea?: Partial<CropArea>;
  /** 最小裁剪宽度 */
  minWidth?: number;
  /** 最小裁剪高度 */
  minHeight?: number;
  /** 最大裁剪宽度 */
  maxWidth?: number;
  /** 最大裁剪高度 */
  maxHeight?: number;
  /** 输出图片质量 0-1 */
  quality?: number;
  /** 输出图片格式 */
  outputType?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** 是否显示网格 */
  showGrid?: boolean;
  /** 网格行数 */
  gridRows?: number;
  /** 网格列数 */
  gridCols?: number;
  /** 是否可缩放 */
  zoomable?: boolean;
  /** 是否可旋转 */
  rotatable?: boolean;
  /** 缩放步长 */
  zoomStep?: number;
  /** 旋转步长 */
  rotateStep?: number;
  /** 最小缩放 */
  minZoom?: number;
  /** 最大缩放 */
  maxZoom?: number;
  /** 背景色 */
  backgroundColor?: string;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 工具栏位置 */
  toolbarPosition?: 'top' | 'bottom';
}

/**
 * 图片裁剪组件事件
 */
export interface ExImageCropEmits {
  /** 裁剪区域变化 */
  change: [area: CropArea];
  /** 裁剪完成 */
  crop: [result: CropResult];
  /** 取消裁剪 */
  cancel: [];
  /** 图片加载完成 */
  load: [size: { width: number; height: number }];
  /** 图片加载失败 */
  error: [error: Error];
  /** 缩放变化 */
  zoom: [scale: number];
  /** 旋转变化 */
  rotate: [angle: number];
}

/**
 * 图片裁剪组件暴露的方法
 */
export interface ExImageCropExposed {
  /** 执行裁剪 */
  crop: () => Promise<CropResult>;
  /** 重置裁剪区域 */
  reset: () => void;
  /** 放大 */
  zoomIn: () => void;
  /** 缩小 */
  zoomOut: () => void;
  /** 顺时针旋转 */
  rotateRight: () => void;
  /** 逆时针旋转 */
  rotateLeft: () => void;
  /** 设置裁剪区域 */
  setArea: (area: Partial<CropArea>) => void;
  /** 获取裁剪区域 */
  getArea: () => CropArea;
  /** 获取组件DOM元素 */
  getElement: () => HTMLDivElement | null;
}
