import type { CSSProperties } from 'vue';
import type { ColorFormat } from './utils';

export type { ColorFormat } from './utils';

/** 颜色选择器尺寸。 */
export type ColorPickerSize = 'small' | 'medium' | 'large';

/** 颜色选择器属性。 */
export interface ExColorPickerProps {
  /** 当前颜色，支持十六进制、rgb 与 rgba 字符串。 */
  modelValue?: string;
  /** 是否禁用全部交互。 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 组件尺寸。 */
  size?: ColorPickerSize;
  /** 是否展示并输出透明度。 */
  showAlpha?: boolean;
  /** 对外输出的颜色格式。 */
  format?: ColorFormat;
  /** 可快速选择的预设颜色。 */
  predefine?: readonly string[];
  /** 是否展示清空按钮。 */
  clearable?: boolean;
  /** 面板是否传送到 body。 */
  teleported?: boolean;
  /** 面板自定义类名。 */
  popperClass?: string;
  /** 根元素自定义类名。 */
  class?: string | string[] | Record<string, boolean>;
  /** 根元素自定义样式。 */
  style?: string | CSSProperties;
}

/** 颜色选择器事件。 */
export interface ExColorPickerEmits {
  /** 当前颜色发生实时变化。 */
  'update:modelValue': [value: string];
  /** 一次输入、选择或拖拽正式提交。 */
  change: [value: string];
  /** 用户正在调整颜色。 */
  'active-change': [value: string];
  /** 触发器获得焦点。 */
  focus: [event: FocusEvent];
  /** 触发器失去焦点。 */
  blur: [event: FocusEvent];
  /** 当前颜色被清空。 */
  clear: [];
  /** 面板可见状态发生变化。 */
  'visible-change': [visible: boolean];
}

/** 颜色选择器公开方法。 */
export interface ExColorPickerExposed {
  /** 聚焦触发器。 */
  focus: () => void;
  /** 移除触发器焦点。 */
  blur: () => void;
}
