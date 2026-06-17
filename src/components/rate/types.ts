import type { CSSProperties } from 'vue';

// 评分组件尺寸
export type RateSize = 'small' | 'medium' | 'large';

// 评分组件属性
export interface ExRateProps {
  /** 绑定值 */
  modelValue?: number;
  /** 最大分值 */
  max?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 是否允许半选 */
  allowHalf?: boolean;
  /** 是否显示分数 */
  showScore?: boolean;
  /** 分数模板 */
  scoreTemplate?: string;
  /** 尺寸 */
  size?: RateSize;
  /** 图标颜色 */
  color?: string;
  /** 未选中图标颜色 */
  voidColor?: string;
  /** 禁用时的颜色 */
  disabledVoidColor?: string;
  /** 图标类名数组 */
  iconClasses?: string[];
  /** 未选中图标类名 */
  voidIconClass?: string;
  /** 禁用时的图标类名 */
  disabledVoidIconClass?: string;
  /** 是否显示文字 */
  showText?: boolean;
  /** 显示文字数组 */
  texts?: string[];
  /** 文字颜色 */
  textColor?: string;
  /** 自定义类名 */
  customClass?: string;
  /** 自定义样式 */
  customStyle?: string | CSSProperties;
}

// 评分组件插槽
export interface ExRateSlots {
  /** 未选中图标插槽 */
  'icon-void'?: (props: { index: number }) => unknown;
  /** 选中图标插槽 */
  'icon-active'?: (props: { index: number }) => unknown;
}

// 评分组件事件
export interface ExRateEmits {
  /** 值更新事件 */
  'update:modelValue': [value: number];
  /** 值变化事件 */
  change: [value: number];
}

// 评分组件实例
export interface ExRateInstance {
  /** 设置当前值 */
  setCurrentValue: (value: number) => void;
  /** 重置评分 */
  resetCurrentValue: () => void;
}
