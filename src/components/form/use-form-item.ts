import { computed, inject, provide, useAttrs } from 'vue';
import type { ComputedRef, InjectionKey } from 'vue';
import type { FormContext, FormSize, FormValidateStatus } from './types';
import { useComponentSize } from '../config-provider/composables';
import { createSharedInjectionKey } from '../../utils/shared-runtime';

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
  /** 控件输入时调用；延迟提交模型的控件可提供当前编辑值快照进行 input 校验。 */
  onFieldInput?: (snapshot?: { value: unknown }) => void;
  /** 编辑草稿被撤销时，只清理已不对应确认值的校验，不伪造 blur/change 事件。 */
  onFieldDraftDiscard?: () => void;
  /** 显式重置代次；即使模型值没有改变，也通知控件撤销本地草稿和延迟任务。 */
  resetRevision?: ComputedRef<number>;
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
  createSharedInjectionKey('form-item');

/** Form 与 FormItem 之间使用独立的注入键，避免与业务层字符串注入发生冲突。 */
export const FORM_CONTEXT_INJECTION_KEY: InjectionKey<FormContext> =
  createSharedInjectionKey('form');

/** FormItem 内部使用：向子控件提供字段上下文 */
export function provideFormItem(context: FormItemFieldContext): void {
  provide(FORM_ITEM_INJECTION_KEY, context);
}

/** 表单控件使用：获取所在 FormItem 的字段上下文（不在 FormItem 内时为 null） */
export function useFormItem(): FormItemFieldContext | null {
  return inject(FORM_ITEM_INJECTION_KEY, null);
}

interface FormFieldProps {
  disabled?: boolean;
  readonly?: boolean;
  size?: FormSize;
  ariaLabel?: string;
  ariaLabelledby?: string;
  ariaDescribedby?: string;
}

/** 合并描述 ID 时保留业务补充信息及字段错误，并去除重复引用。 */
export function mergeAriaIds(...values: Array<unknown>): string | undefined {
  const ids = values.flatMap(value => (typeof value === 'string' ? value.split(/\s+/) : []));
  return [...new Set(ids.filter(Boolean))].join(' ') || undefined;
}

/** 输入控件共同消费字段状态，避免各自遗漏 Form 的只读、禁用及可访问性契约。 */
export function useFormFieldState(props: FormFieldProps) {
  const formItem = useFormItem();
  const attrs = useAttrs();
  const disabled = computed(() => Boolean(props.disabled || formItem?.disabled?.value));
  const readonly = computed(() => Boolean(props.readonly || formItem?.readonly?.value));
  const interactive = computed(() => !disabled.value && !readonly.value);
  const size = useComponentSize(computed(() => props.size ?? formItem?.size?.value));
  const labelledBy = computed(() => {
    const explicit = props.ariaLabelledby || attrs['aria-labelledby'];
    if (typeof explicit === 'string' && explicit) return explicit;
    return props.ariaLabel || attrs['aria-label'] ? undefined : formItem?.labelId?.value;
  });
  const describedBy = computed(() =>
    mergeAriaIds(props.ariaDescribedby, attrs['aria-describedby'], formItem?.describedBy?.value)
  );
  const invalid = computed(() => formItem?.status?.value === 'error');
  const ariaAttrs = computed(() => ({
    'aria-labelledby': labelledBy.value,
    'aria-describedby': describedBy.value,
    'aria-invalid': invalid.value || undefined,
    'aria-errormessage': invalid.value ? formItem?.describedBy?.value : undefined,
    'aria-disabled': disabled.value || undefined,
    'aria-readonly': readonly.value || undefined,
  }));
  return {
    formItem,
    disabled,
    readonly,
    interactive,
    size,
    labelledBy,
    describedBy,
    invalid,
    ariaAttrs,
  };
}
