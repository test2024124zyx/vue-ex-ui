// BarCode Component Types
// 条码组件类型定义

import type { CSSProperties } from 'vue';

/**
 * 条码格式类型
 */
export type BarcodeFormat =
  | 'CODE128' // CODE128 (默认，最常用)
  | 'CODE39' // CODE39
  | 'EAN13' // EAN-13 (商品条码)
  | 'EAN8' // EAN-8
  | 'UPC' // UPC-A
  | 'ITF14' // ITF-14
  | 'MSI' // MSI
  | 'pharmacode' // Pharmacode
  | 'codabar'; // Codabar

/**
 * 条码组件 Props
 */
export interface ExBarcodeProps {
  /** 条码值，最多 256 个 UTF-16 代码单元 */
  value: string;
  /** 条码格式 */
  format?: BarcodeFormat;
  /** 模块宽度；有限正数，最大 8 */
  width?: number;
  /** 条码高度；有限正数，最大 2048 */
  height?: number;
  /** 是否显示文本 */
  displayValue?: boolean;
  /** 文本位置 */
  textPosition?: 'top' | 'bottom';
  /** 文本边距；范围 0—1024 */
  textMargin?: number;
  /** 字体大小；有限正数，最大 256 */
  fontSize?: number;
  /** 字体 */
  font?: string;
  /** 文本对齐 */
  textAlign?: 'left' | 'center' | 'right';
  /** 线条颜色 */
  lineColor?: string;
  /** 背景颜色 */
  background?: string;
  /** 统一边距；范围 0—1024 */
  margin?: number;
  /** 顶部边距；范围 0—1024 */
  marginTop?: number;
  /** 底部边距；范围 0—1024 */
  marginBottom?: number;
  /** 左侧边距；范围 0—1024 */
  marginLeft?: number;
  /** 右侧边距；范围 0—1024 */
  marginRight?: number;
  /** 是否平滑 */
  flat?: boolean;
  /** 条码样式类型 */
  type?: 'default' | 'neon' | 'gaming';
  /** 是否显示边框 */
  bordered?: boolean;
  /** 圆角 */
  borderRadius?: number;
  /** 错误提示文本 */
  errorText?: string;
  /** 无障碍标签 */
  ariaLabel?: string;
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: CSSProperties | string;
}

/**
 * 条码组件 Slots
 */
export interface ExBarcodeSlots {
  /** 错误状态插槽 */
  error?: (props: { error: string }) => unknown;
}

/**
 * 条码组件暴露的方法
 */
export interface ExBarcodeExposed {
  /** 获取 DOM 元素 */
  getElement: () => HTMLElement | null;
  /** 下载条码；超过浏览器像素预算时不创建下载 */
  download: (filename?: string) => void;
  /** 获取条码数据URL（异步：超过浏览器像素预算或组件卸载时返回空字符串） */
  toDataURL: (type?: 'image/png' | 'image/jpeg') => Promise<string>;
  /** 刷新条码 */
  refresh: () => Promise<void>;
}

/**
 * 条码生成选项
 */
export interface BarcodeOptions {
  format?: BarcodeFormat;
  width?: number;
  height?: number;
  displayValue?: boolean;
  text?: string;
  fontOptions?: string;
  font?: string;
  textAlign?: 'left' | 'center' | 'right';
  textPosition?: 'top' | 'bottom';
  textMargin?: number;
  fontSize?: number;
  background?: string;
  lineColor?: string;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  flat?: boolean;
  valid?: (valid: boolean) => void;
}
