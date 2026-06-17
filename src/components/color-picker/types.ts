export type { ColorFormat } from './utils';

/** 颜色选择器尺寸 */
export type ColorPickerSize = 'small' | 'medium' | 'large';

/**
 * ColorPicker 组件属性
 */
export interface ExColorPickerProps {
  /** 绑定值（hex 或 rgb(a) 字符串） */
  modelValue?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 尺寸 */
  size?: ColorPickerSize;
  /** 是否支持透明度选择 */
  showAlpha?: boolean;
  /** 输出格式 */
  format?: 'hex' | 'rgb';
  /** 预定义颜色 */
  predefine?: string[];
  /** 是否可清空 */
  clearable?: boolean;
  /** 弹层是否传送到 body */
  teleported?: boolean;
  /** 弹层自定义类名 */
  popperClass?: string;
  /** 自定义类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * ColorPicker 组件事件
 */
export interface ExColorPickerEmits {
  /** 更新绑定值 */
  'update:modelValue': [value: string];
  /** 确认/提交时触发 */
  change: [value: string];
  /** 拖动选择过程中实时触发 */
  'active-change': [value: string];
  /** 获得焦点 */
  focus: [event: FocusEvent];
  /** 失去焦点 */
  blur: [event: FocusEvent];
  /** 清空 */
  clear: [];
  /** 面板显隐变化 */
  'visible-change': [visible: boolean];
}

/**
 * ColorPicker 暴露方法
 */
export interface ExColorPickerExposed {
  /** 聚焦 */
  focus: () => void;
  /** 失焦 */
  blur: () => void;
}
