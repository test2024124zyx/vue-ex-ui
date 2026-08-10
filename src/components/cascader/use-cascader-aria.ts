import { computed, type ComputedRef } from 'vue';
import type { FormItemFieldContext } from '../form/use-form-item';

type AriaInvalidValue = 'true' | 'false' | 'grammar' | 'spelling';

// 这些属性由组件根据真实状态维护，不能被外部 attrs 覆盖。
const CONTROLLED_TRIGGER_ATTRIBUTES = [
  'class',
  'style',
  'id',
  'value',
  'placeholder',
  'disabled',
  'readonly',
  'role',
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-errormessage',
  'aria-invalid',
  'aria-disabled',
  'aria-readonly',
  'aria-autocomplete',
  'aria-haspopup',
  'aria-expanded',
  'aria-controls',
  'aria-activedescendant',
] as const;

interface UseCascaderAriaOptions {
  attrs: Record<string, unknown>;
  formItem: FormItemFieldContext | null;
  currentPlaceholder: ComputedRef<string>;
  effectiveDisabled: ComputedRef<boolean>;
  effectiveReadonly: ComputedRef<boolean>;
}

// 读取外部 ARIA 属性时统一清洗空字符串和布尔值，避免渲染出无效标记。
const readAttr = (attrs: Record<string, unknown>, name: string): string | undefined => {
  const value = attrs[name];
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value === true) return 'true';
  if (value === false) return 'false';
  return undefined;
};

// 合并外部与 FormItem 提供的可访问性 ID，保持首次出现顺序并去重。
const mergeAriaIds = (...values: Array<string | undefined>): string | undefined => {
  const ids = values.flatMap(value => value?.split(/\s+/) ?? []).filter(Boolean);
  return ids.length > 0 ? Array.from(new Set(ids)).join(' ') : undefined;
};

/** 集中维护 Cascader 的真实输入控件属性，避免主组件混入属性转发细节。 */
export function useCascaderAria({
  attrs,
  formItem,
  currentPlaceholder,
  effectiveDisabled,
  effectiveReadonly,
}: UseCascaderAriaOptions) {
  const externalAriaLabel = computed(() => readAttr(attrs, 'aria-label'));
  const labelledBy = computed(() =>
    mergeAriaIds(
      readAttr(attrs, 'aria-labelledby'),
      externalAriaLabel.value ? undefined : formItem?.labelId?.value
    )
  );
  const describedBy = computed(() =>
    mergeAriaIds(readAttr(attrs, 'aria-describedby'), formItem?.describedBy?.value)
  );
  const errorMessageId = computed(() => {
    const externalId = readAttr(attrs, 'aria-errormessage');
    if (externalId) return externalId;
    if (formItem?.status?.value === 'error' && formItem.errorMessage?.value) {
      return formItem.describedBy?.value;
    }
    return undefined;
  });
  const ariaInvalid = computed<AriaInvalidValue | undefined>(() => {
    const externalValue = readAttr(attrs, 'aria-invalid');
    if (
      externalValue === 'true' ||
      externalValue === 'false' ||
      externalValue === 'grammar' ||
      externalValue === 'spelling'
    ) {
      return externalValue;
    }
    return formItem?.status?.value === 'error' ? 'true' : undefined;
  });
  const accessibleLabel = computed(
    () => externalAriaLabel.value || (labelledBy.value ? undefined : currentPlaceholder.value)
  );

  const rootAttrs = computed<Record<string, unknown>>(() => {
    const forwarded = { ...attrs };
    for (const key of Object.keys(forwarded)) {
      if (
        key === 'id' ||
        key === 'name' ||
        key === 'autocomplete' ||
        key === 'role' ||
        key === 'tabindex' ||
        key.startsWith('aria-') ||
        key === 'disabled' ||
        key === 'readonly' ||
        key === 'value' ||
        key === 'placeholder'
      ) {
        delete forwarded[key];
      }
    }
    delete forwarded.class;
    delete forwarded.style;
    return forwarded;
  });

  const triggerAttrs = computed<Record<string, unknown>>(() => {
    const forwarded = { ...attrs };
    for (const key of CONTROLLED_TRIGGER_ATTRIBUTES) delete forwarded[key];
    return forwarded;
  });

  return {
    accessibleLabel,
    labelledBy,
    describedBy,
    errorMessageId,
    ariaInvalid,
    rootAttrs,
    triggerAttrs,
    effectiveDisabled,
    effectiveReadonly,
  };
}
