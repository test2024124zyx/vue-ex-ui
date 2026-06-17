import type { PropType } from 'vue';

export type WatermarkType = 'text' | 'image';

/**
 * 水印组件属性接口
 */
export interface ExWatermarkProps {
  /** 水印类型：文本或图片 */
  type?: WatermarkType;
  /** 是否全屏显示 */
  fullPage?: boolean;
  /** 是否重复平铺 */
  repeat?: boolean;
  /** 旋转角度（度） */
  angle?: number;
  /** 水平间距（px） */
  gapX?: number;
  /** 垂直间距（px） */
  gapY?: number;
  /** 水平偏移（px） */
  offsetX?: number;
  /** 垂直偏移（px） */
  offsetY?: number;
  /** CSS z-index 层级 */
  zIndex?: number;
  /** 透明度 (0-1) */
  opacity?: number;
  /** CSS pointer-events 属性 */
  pointerEvents?: 'none' | 'auto';
  /** 文本是否可选中 */
  selectable?: boolean;
  /** 文本内容，为空时使用国际化配置。支持字符串或字符串数组（多行） */
  text?: string | string[];
  /** 字体族 */
  fontFamily?: string;
  /** 字体大小（px） */
  fontSize?: number;
  /** 字重 */
  fontWeight?: 'normal' | 'bold' | number;
  /** 文本颜色 */
  color?: string;
  /** 多行文本的行间距（px），仅在 text 为数组时生效 */
  lineHeight?: number;
  /** 图片地址 */
  imageSrc?: string;
  /** 图片宽度（px） */
  imageWidth?: number;
  /** 图片高度（px） */
  imageHeight?: number;
  /** 图片跨域设置 */
  crossOrigin?: 'anonymous' | 'use-credentials';
  /** 窗口变化时自动重绘 */
  responsive?: boolean;
  /** 高分屏适配 */
  dprAware?: boolean;
  /** 重绘节流间隔（ms） */
  throttleMs?: number;
  /** 启用防篡改保护（使用 MutationObserver 监听 DOM 变化） */
  antiTamper?: boolean;
}

export const watermarkPropDefs = {
  type: { type: String as PropType<WatermarkType>, default: 'text' },
  fullPage: { type: Boolean, default: true },
  repeat: { type: Boolean, default: true },
  angle: { type: Number, default: -30 },
  gapX: { type: Number, default: 120 },
  gapY: { type: Number, default: 120 },
  offsetX: { type: Number, default: 0 },
  offsetY: { type: Number, default: 0 },
  zIndex: { type: Number, default: 900 },
  opacity: { type: Number, default: 0.3 },
  pointerEvents: { type: String as PropType<'none' | 'auto'>, default: 'none' },
  selectable: { type: Boolean, default: false },
  text: { type: [String, Array] as PropType<string | string[]>, default: '' },
  fontFamily: { type: String, default: 'system-ui' },
  fontSize: { type: Number, default: 14 },
  fontWeight: { type: [String, Number] as PropType<'normal' | 'bold' | number>, default: 'normal' },
  color: { type: String, default: 'rgba(0,0,0,0.8)' },
  lineHeight: { type: Number, default: 20 },
  imageSrc: { type: String, default: '' },
  imageWidth: { type: Number, default: 120 },
  imageHeight: { type: Number, default: 64 },
  crossOrigin: { type: String as PropType<'anonymous' | 'use-credentials'>, default: undefined },
  responsive: { type: Boolean, default: true },
  dprAware: { type: Boolean, default: true },
  throttleMs: { type: Number, default: 100 },
  antiTamper: { type: Boolean, default: false },
};
