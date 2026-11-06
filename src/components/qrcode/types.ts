/**
 * 二维码错误纠正级别
 */
export type QRCodeLevel = 'L' | 'M' | 'Q' | 'H';

/**
 * 二维码类型
 */
export type QRCodeType = 'default' | 'primary' | 'success' | 'warning' | 'danger';

/**
 * 二维码组件属性
 */
export interface ExQRCodeProps {
  /** 二维码内容 */
  value: string;
  /** 二维码大小 */
  size?: number;
  /** 错误纠正级别 */
  level?: QRCodeLevel;
  /** 背景颜色 */
  bgColor?: string;
  /** 前景颜色 */
  fgColor?: string;
  /** 是否包含边距 */
  includeMargin?: boolean;
  /** 是否显示边框 */
  bordered?: boolean;
  /** 边框圆角 */
  borderRadius?: number;
  /** 中心图标大小 */
  iconSize?: number;
  /** 二维码类型 */
  type?: QRCodeType;
  /** 错误提示文本 */
  errorText?: string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 二维码组件暴露的方法
 */
export interface ExQRCodeExposed {
  /** 获取二维码DOM元素 */
  getElement: () => HTMLDivElement | null;
  /** 下载二维码 */
  download: (filename?: string) => void;
  /** 获取二维码数据URL */
  toDataURL: (type?: 'image/png' | 'image/jpeg') => string;
  /** 刷新二维码 */
  refresh: () => Promise<void>;
}

export interface ExQRCodeEmits {
  /** 二维码生成、Logo 加载或导出失败时触发 */
  error: [error: Error];
}
