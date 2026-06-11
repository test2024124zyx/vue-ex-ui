export interface ExImageProps {
  /** 图片地址 */
  src: string;
  /** 无障碍：替代文本（必填） */
  alt: string;
  /** 可选标题（tooltip） */
  title?: string;
  /** 宽度（number 视为 px） */
  width?: string | number;
  /** 高度（number 视为 px） */
  height?: string | number;
  /** 对齐/裁切模式 */
  fit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** 圆角（CSS 值，建议通过 tokens 覆盖） */
  radius?: string;
  /** 懒加载（原生 loading="lazy"） */
  lazy?: boolean;
  /** 预览模式 */
  preview?: boolean;
}

export type ExImageEmits = {
  (e: 'load', ev: Event): void;
  (e: 'error', ev: Event): void;
  (e: 'preview'): void;
};
