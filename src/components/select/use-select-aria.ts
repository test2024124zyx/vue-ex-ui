import { computed } from 'vue';
import type { Ref } from 'vue';
import { mergeAriaIds } from '../form/use-form-item';
import type { FormItemFieldContext } from '../form/use-form-item';

/** 将表单和外部属性合并到实际交互控件，避免装饰容器重复拥有组合框语义。 */
export function useSelectAria(
  attrs: Record<string, unknown>,
  formItem: FormItemFieldContext | null,
  placeholder: Ref<string>
) {
  const readAttr = (name: string): string | undefined => {
    const value = attrs[name];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'boolean') return String(value);
    return undefined;
  };
  const triggerAttrs = computed<Record<string, unknown>>(() => {
    const forwarded = { ...attrs };
    delete forwarded.class;
    delete forwarded.style;
    return forwarded;
  });
  const externalAriaLabel = computed(() => readAttr('aria-label'));
  const labelledBy = computed(() =>
    mergeAriaIds(
      readAttr('aria-labelledby'),
      externalAriaLabel.value ? undefined : formItem?.labelId?.value
    )
  );
  const describedBy = computed(() =>
    mergeAriaIds(readAttr('aria-describedby'), formItem?.describedBy?.value)
  );
  const errorMessageId = computed(() => {
    const externalId = readAttr('aria-errormessage');
    if (externalId) return externalId;
    if (formItem?.status?.value === 'error' && formItem.errorMessage?.value) {
      return formItem.describedBy?.value;
    }
    return undefined;
  });
  const ariaInvalid = computed<'true' | 'false' | 'grammar' | 'spelling' | undefined>(() => {
    const externalValue = readAttr('aria-invalid');
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
    () => externalAriaLabel.value || (labelledBy.value ? undefined : placeholder.value)
  );
  return { triggerAttrs, labelledBy, describedBy, errorMessageId, ariaInvalid, accessibleLabel };
}
