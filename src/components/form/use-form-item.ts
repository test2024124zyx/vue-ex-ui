import { inject, provide } from 'vue';
import type { ComputedRef, InjectionKey } from 'vue';
import type { FormSize, FormValidateStatus } from './types';

/**
 * FormItem 提供给表单控件的字段上下文。
 *
 * 表单控件（Input/Select/Checkbox 等）在输入、值变化或失焦时调用对应回调，
 * FormItem 据此按 rules 中配置的 trigger（'input' / 'blur' / 'change'）自动触发校验，
 * 从而打通 Form 验证链路（无需手动调用 form.validate）。
 */
export interface FormItemFieldContext {
  /** 控件失焦时调用（触发 trigger: 'blur' 的规则校验） */
  onFieldBlur: () => void;
  /** 控件值变化时调用（触发 trigger: 'change' 的规则校验） */
  onFieldChange: () => void;
  /** 控件输入时调用（触发 trigger: 'input' 的规则校验） */
  onFieldInput?: () => void;
  /** FormItem 标签的可访问名称 ID */
  labelId?: ComputedRef<string | undefined>;
  /** FormItem 帮助或错误消息的可访问描述 ID */
  describedBy?: ComputedRef<string | undefined>;
  /** FormItem 当前校验状态 */
  status?: ComputedRef<FormValidateStatus>;
  /** FormItem 当前错误消息 */
  errorMessage?: ComputedRef<string>;
  /** 从 Form 继承的控件尺寸 */
  size?: ComputedRef<FormSize>;
  /** 从 Form 继承的禁用状态 */
  disabled?: ComputedRef<boolean>;
  /** 从 Form 继承的只读状态 */
  readonly?: ComputedRef<boolean>;
}

export const FORM_ITEM_INJECTION_KEY: InjectionKey<FormItemFieldContext> =
  Symbol('exFormItemContext');

/** FormItem 内部使用：向子控件提供字段上下文 */
export function provideFormItem(context: FormItemFieldContext): void {
  provide(FORM_ITEM_INJECTION_KEY, context);
}

/** 表单控件使用：获取所在 FormItem 的字段上下文（不在 FormItem 内时为 null） */
export function useFormItem(): FormItemFieldContext | null {
  return inject(FORM_ITEM_INJECTION_KEY, null);
}
