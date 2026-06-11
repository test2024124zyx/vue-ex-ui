import { inject, provide } from 'vue';
import type { InjectionKey } from 'vue';

/**
 * FormItem 提供给表单控件的字段上下文。
 *
 * 表单控件（Input/Select/Checkbox 等）在值变化或失焦时调用对应回调，
 * FormItem 据此按 rules 中配置的 trigger（'blur' / 'change'）自动触发校验，
 * 从而打通 Form 验证链路（无需手动调用 form.validate）。
 */
export interface FormItemFieldContext {
  /** 控件失焦时调用（触发 trigger: 'blur' 的规则校验） */
  onFieldBlur: () => void;
  /** 控件值变化时调用（触发 trigger: 'change' 的规则校验） */
  onFieldChange: () => void;
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
