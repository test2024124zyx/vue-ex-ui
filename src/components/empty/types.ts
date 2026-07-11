import type { VNode } from 'vue';

/** Empty 内置图片尺寸。 */
export type ExEmptyPresetSize = 'small' | 'medium' | 'large';

/** Empty 内置文案场景。 */
export type ExEmptyType = 'default' | 'no-data' | 'no-result' | 'error' | 'network-error';

/** Empty 组件属性。 */
export interface ExEmptyProps {
  /** 外部图片地址；空白地址会被忽略。 */
  image?: string;
  /** 外部图片的可访问名称；未提供时图片按装饰处理。 */
  imageAlt?: string;
  /** 预设尺寸或正数像素值。 */
  imageSize?: ExEmptyPresetSize | number;
  /** 描述文字；显式空字符串用于隐藏默认描述。 */
  description?: string;
  /** 是否显示整个图片区域，包括属性图片和图片插槽。 */
  showImage?: boolean;
  /** 未显式传入描述时使用的内置文案场景。 */
  type?: ExEmptyType;
}

/** Empty 组件事件。 */
export interface ExEmptyEmits {
  /** 外部图片加载失败。 */
  'image-error': [event: Event];
}

/** Empty 组件插槽。 */
export interface ExEmptySlots {
  /** 自定义图片。 */
  image?: () => VNode[];
  /** 自定义描述。 */
  description?: () => VNode[];
  /** 操作区域。 */
  default?: () => VNode[];
}
