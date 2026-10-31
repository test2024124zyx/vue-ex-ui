<template>
  <div
    :class="rootClasses"
    :style="rootStyle"
  >
    <label
      v-if="hasLabel"
      class="ex-input__label"
      :for="controlId"
    >
      <slot name="label">{{ label }}</slot>
      <span
        v-if="required"
        class="ex-input__required"
        aria-hidden="true"
      >
        *
      </span>
    </label>

    <div class="ex-input__wrapper">
      <div
        v-if="hasPrepend"
        class="ex-input__prepend"
      >
        <slot name="prepend">
          {{ prepend }}
        </slot>
      </div>

      <div class="ex-input__inner">
        <span
          v-if="shouldShowPrompt"
          class="ex-input__prompt"
          aria-hidden="true"
        >
          {{ prompt }}
        </span>

        <div
          v-if="hasPrefix"
          class="ex-input__prefix"
        >
          <slot name="prefix"></slot>
        </div>

        <textarea
          v-if="isTextarea"
          v-bind="controlAttrs"
          :id="controlId"
          ref="inputRef"
          class="ex-input__control"
          :value="displayValue"
          :placeholder="placeholder"
          :disabled="effectiveDisabled"
          :readonly="effectiveReadonly"
          :minlength="normalizedMinlength"
          :maxlength="normalizedMaxlength"
          :autofocus="autofocus || undefined"
          :autocomplete="autocomplete"
          :rows="normalizedRows"
          :required="required || undefined"
          :aria-labelledby="controlAriaLabelledby"
          :aria-invalid="controlAriaInvalid"
          :aria-disabled="effectiveDisabled || undefined"
          :aria-readonly="effectiveReadonly || undefined"
          :aria-describedby="controlAriaDescribedby"
          :aria-errormessage="controlAriaErrorMessage"
          @input="handleInput"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          @keyup="handleKeyup"
          @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd"
        ></textarea>

        <input
          v-else
          v-bind="controlAttrs"
          :id="controlId"
          ref="inputRef"
          class="ex-input__control"
          :value="displayValue"
          :type="actualType"
          :placeholder="placeholder"
          :disabled="effectiveDisabled"
          :readonly="effectiveReadonly"
          :minlength="normalizedMinlength"
          :maxlength="normalizedMaxlength"
          :autofocus="autofocus || undefined"
          :autocomplete="autocomplete"
          :required="required || undefined"
          :aria-labelledby="controlAriaLabelledby"
          :aria-invalid="controlAriaInvalid"
          :aria-disabled="effectiveDisabled || undefined"
          :aria-readonly="effectiveReadonly || undefined"
          :aria-describedby="controlAriaDescribedby"
          :aria-errormessage="controlAriaErrorMessage"
          @input="handleInput"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          @keyup="handleKeyup"
          @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd"
        />

        <div
          v-if="showSuffix"
          class="ex-input__suffix"
        >
          <button
            v-if="showClearButton"
            type="button"
            class="ex-input__action ex-input__action--clear"
            :aria-label="t('input.clear')"
            @mousedown.prevent
            @click="handleClear"
          >
            <ExIcon
              icon="close-line"
              :size="16"
              aria-hidden="true"
            />
          </button>

          <button
            v-if="showPasswordToggle"
            type="button"
            class="ex-input__action ex-input__action--password"
            :aria-label="isPasswordVisible ? t('input.hidePassword') : t('input.showPassword')"
            :aria-pressed="isPasswordVisible ? 'true' : 'false'"
            @mousedown.prevent
            @click="togglePasswordVisibility"
          >
            <ExIcon
              :icon="isPasswordVisible ? 'eye-off-line' : 'eye-line'"
              :size="16"
              aria-hidden="true"
            />
          </button>

          <span
            v-if="showWordCounter"
            class="ex-input__word-limit"
            aria-live="polite"
          >
            {{ currentLength }}/{{ normalizedMaxlength }}
          </span>

          <slot
            v-if="hasSuffixSlot"
            name="suffix"
          ></slot>
        </div>
      </div>

      <div
        v-if="hasAppend"
        class="ex-input__append"
      >
        <slot name="append">
          {{ append }}
        </slot>
      </div>
    </div>

    <div
      v-if="showMessage"
      :id="messageId"
      class="ex-input__message"
      :role="messageRole"
      :aria-live="messageAriaLive"
    >
      <Transition
        name="ex-input-message"
        mode="out-in"
      >
        <div
          v-if="showErrorMessage"
          key="error"
          class="ex-input__error"
        >
          <ExIcon
            icon="error-warning-line"
            :size="14"
            aria-hidden="true"
          />
          <slot name="error">
            {{ actualErrorMessage }}
          </slot>
        </div>

        <div
          v-else-if="showSuccessMessage"
          key="success"
          class="ex-input__success"
        >
          <ExIcon
            icon="check-line"
            :size="14"
            aria-hidden="true"
          />
          <span class="ex-input__success-text">{{ t('input.validationSuccess') }}</span>
        </div>

        <div
          v-else
          key="help"
          class="ex-input__help-text"
        >
          <slot name="help">
            {{ helpText }}
          </slot>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  normalizeStyle,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  useSlots,
  watch,
} from 'vue';
import type { AriaAttributes } from 'vue';
import { useComponentSize } from '../config-provider/composables';
import { useFormItem } from '../form/use-form-item';
import ExIcon from '../icon/ExIcon.vue';
import { useI18n } from '../../locale';
import { generateId } from '../../utils/id';
import { isComposingKeyboardEvent } from '../../utils/keyboard';
import { hasRenderableContent } from '../../utils/vnode';
import {
  calculateTextareaHeight,
  mergeAriaTokens,
  normalizeInputValue,
  normalizeNonNegativeInteger,
  normalizePositiveInteger,
  resolveTextareaRows,
} from './input-utils';
import type {
  ExInputEmits,
  ExInputExposed,
  ExInputProps,
  InputModelValue,
  InputValidateTrigger,
} from './types';

defineOptions({
  name: 'ExInput',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExInputProps>(), {
  type: 'text',
  size: undefined,
  status: 'default',
  variant: 'neon',
  prompt: '>',
  showPrompt: true,
  disabled: false,
  readonly: false,
  clearable: false,
  showPassword: false,
  showWordLimit: false,
  autofocus: false,
  required: false,
  rows: 3,
  validateTrigger: 'blur',
});

const emit = defineEmits<ExInputEmits>();
const attrs = useAttrs();
const slots = useSlots();
const { t } = useI18n();
const formItem = useFormItem();
const componentSize = useComponentSize(computed(() => props.size ?? formItem?.size?.value));

const generatedId = generateId('ex-input');
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null);
const isFocused = ref(false);
const isPasswordVisible = ref(false);
const isComposing = ref(false);
const validationError = ref<string | null>(null);

const applyFormatter = (value: string): string =>
  props.formatter ? props.formatter(value) : value;

const normalizeModelOutput = (value: string): InputModelValue => {
  const modifiers = props.modelModifiers;
  const normalizedValue = modifiers?.trim ? value.trim() : value;

  if (modifiers?.number && normalizedValue !== '') {
    const numericValue = Number(normalizedValue);
    if (!Number.isNaN(numericValue)) return numericValue;
  }

  return normalizedValue;
};

const initialValue = normalizeInputValue(props.modelValue);
const rawValue = ref(initialValue);
const displayValue = ref(applyFormatter(initialValue));

const controlId = computed(() => props.id?.trim() || generatedId);
const messageId = computed(() => controlId.value + '-message');
const isTextarea = computed(() => props.type === 'textarea');
const isAutosize = computed(() => isTextarea.value && Boolean(props.autosize));
const actualType = computed(() =>
  props.type === 'password' && props.showPassword && isPasswordVisible.value ? 'text' : props.type
);
const normalizedMinlength = computed(() => normalizeNonNegativeInteger(props.minlength));
const normalizedMaxlength = computed(() => normalizeNonNegativeInteger(props.maxlength));
const normalizedRows = computed(() => normalizePositiveInteger(props.rows, 3));
const currentLength = computed(() => rawValue.value.length);

const hasLabelSlot = computed(() => hasRenderableContent(slots.label?.({})));
const hasPrefix = computed(() => hasRenderableContent(slots.prefix?.({})));
const hasSuffixSlot = computed(() => hasRenderableContent(slots.suffix?.({})));
const hasPrependSlot = computed(() => hasRenderableContent(slots.prepend?.({})));
const hasAppendSlot = computed(() => hasRenderableContent(slots.append?.({})));
const hasHelpSlot = computed(() => hasRenderableContent(slots.help?.({})));
const hasErrorSlot = computed(() => hasRenderableContent(slots.error?.({})));

const hasLabel = computed(() => Boolean(props.label) || hasLabelSlot.value);
const shouldShowPrompt = computed(
  () => props.variant === 'neon' && props.showPrompt && props.prompt.length > 0 && !hasPrefix.value
);
const hasPrepend = computed(() => Boolean(props.prepend) || hasPrependSlot.value);
const hasAppend = computed(() => Boolean(props.append) || hasAppendSlot.value);
const effectiveDisabled = computed(() => props.disabled || Boolean(formItem?.disabled?.value));
const effectiveReadonly = computed(() => props.readonly || Boolean(formItem?.readonly?.value));
const showClearButton = computed(
  () =>
    props.clearable &&
    !effectiveDisabled.value &&
    !effectiveReadonly.value &&
    rawValue.value.length > 0
);
const showPasswordToggle = computed(
  () =>
    props.showPassword &&
    props.type === 'password' &&
    !effectiveDisabled.value &&
    !effectiveReadonly.value
);
const showWordCounter = computed(
  () => props.showWordLimit && normalizedMaxlength.value !== undefined
);
const showSuffix = computed(
  () =>
    showClearButton.value ||
    showPasswordToggle.value ||
    showWordCounter.value ||
    hasSuffixSlot.value
);

const inheritedStatus = computed(() => {
  const status = formItem?.status?.value;
  return status === 'success' || status === 'warning' || status === 'error' ? status : undefined;
});
const actualStatus = computed(() => {
  if (validationError.value !== null) return 'error';
  if (props.status !== 'default') return props.status;
  return inheritedStatus.value ?? 'default';
});
const actualErrorMessage = computed(
  () => validationError.value ?? props.errorMessage?.trim() ?? ''
);
const showErrorMessage = computed(
  () =>
    actualStatus.value === 'error' && (actualErrorMessage.value.length > 0 || hasErrorSlot.value)
);
const showSuccessMessage = computed(() => actualStatus.value === 'success');
const showHelpMessage = computed(() => Boolean(props.helpText) || hasHelpSlot.value);
const showMessage = computed(
  () => showErrorMessage.value || showSuccessMessage.value || showHelpMessage.value
);
const messageRole = computed(() => {
  if (showErrorMessage.value) return 'alert';
  if (showSuccessMessage.value) return 'status';
  return undefined;
});
const messageAriaLive = computed(() => {
  if (showErrorMessage.value) return 'assertive';
  if (showSuccessMessage.value) return 'polite';
  return undefined;
});

const externalAriaLabelledby = computed(() => {
  const value = attrs['aria-labelledby'];
  return typeof value === 'string' ? value : undefined;
});
const externalAriaDescribedby = computed(() => {
  const value = attrs['aria-describedby'];
  return typeof value === 'string' ? value : undefined;
});
const externalAriaErrorMessage = computed(() => {
  const value = attrs['aria-errormessage'];
  return typeof value === 'string' ? value : undefined;
});
const externalAriaInvalid = computed<AriaAttributes['aria-invalid']>(() => {
  const value = attrs['aria-invalid'];
  if (value === true || value === false) return value;
  if (value === 'true' || value === 'false' || value === 'grammar' || value === 'spelling') {
    return value;
  }
  return undefined;
});
const controlAriaLabelledby = computed(() =>
  mergeAriaTokens(
    externalAriaLabelledby.value,
    !hasLabel.value ? formItem?.labelId?.value : undefined
  )
);
const controlAriaDescribedby = computed(() =>
  mergeAriaTokens(
    externalAriaDescribedby.value,
    showMessage.value ? messageId.value : undefined,
    formItem?.describedBy?.value
  )
);
const controlAriaErrorMessage = computed(() => {
  if (showErrorMessage.value) return messageId.value;
  if (inheritedStatus.value === 'error') return formItem?.describedBy?.value;
  return externalAriaErrorMessage.value;
});
const controlAriaInvalid = computed<AriaAttributes['aria-invalid']>(() =>
  actualStatus.value === 'error' || inheritedStatus.value === 'error'
    ? true
    : externalAriaInvalid.value
);

const controlAttrs = computed<Record<string, unknown>>(() => {
  const forwarded = { ...attrs };
  delete forwarded.class;
  delete forwarded.style;
  delete forwarded.id;
  delete forwarded.modelModifiers;
  delete forwarded['aria-labelledby'];
  delete forwarded['aria-describedby'];
  delete forwarded['aria-errormessage'];
  delete forwarded['aria-invalid'];
  return forwarded;
});

const rootClasses = computed(() => [
  'ex-input',
  'ex-input--' + componentSize.value,
  'ex-input--' + props.variant,
  attrs.class,
  {
    'ex-input--disabled': effectiveDisabled.value,
    'ex-input--readonly': effectiveReadonly.value,
    'ex-input--focused': isFocused.value,
    'ex-input--error': actualStatus.value === 'error',
    'ex-input--success': actualStatus.value === 'success',
    'ex-input--warning': actualStatus.value === 'warning',
    'ex-input--with-prepend': hasPrepend.value,
    'ex-input--with-append': hasAppend.value,
    'ex-input--textarea': isTextarea.value,
    'ex-input--autosize': isAutosize.value,
  },
]);
const rootStyle = computed(() => normalizeStyle(attrs.style));

const validateInput = (value: string): boolean => {
  if (!props.rules?.length) {
    validationError.value = null;
    return true;
  }

  for (const rule of props.rules) {
    const result = rule(value);
    if (result === true) continue;

    const message =
      typeof result === 'string' && result.trim() ? result.trim() : t('input.validationFailed');
    validationError.value = message;
    emit('validation-error', message);
    return false;
  }

  validationError.value = null;
  return true;
};

const shouldValidate = (trigger: Exclude<InputValidateTrigger, 'manual'>): boolean => {
  const configuredTriggers = Array.isArray(props.validateTrigger)
    ? props.validateTrigger
    : [props.validateTrigger];

  return configuredTriggers.includes(trigger);
};

// 格式化会改变控件的 value；按格式化前的前缀重新计算光标，避免输入时光标跳到末尾。
const restoreSelectionAfterFormat = (
  target: HTMLInputElement | HTMLTextAreaElement,
  previousValue: string,
  formattedValue: string,
  selectionStart: number | null,
  selectionEnd: number | null
): void => {
  if (selectionStart === null || selectionEnd === null || previousValue === formattedValue) return;

  const mapPosition = (position: number): number => {
    const previousPrefix = previousValue.slice(0, position);
    const parsedPrefix = props.parser ? props.parser(previousPrefix) : previousPrefix;
    const formattedPrefix = applyFormatter(parsedPrefix);
    return Math.min(formattedPrefix.length, formattedValue.length);
  };

  target.setSelectionRange(mapPosition(selectionStart), mapPosition(selectionEnd));
};

const commitNativeValue = (event: Event): void => {
  if (effectiveDisabled.value || effectiveReadonly.value) {
    discardNativeDraft();
    return;
  }
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  const previousValue = target.value;
  const selectionStart = target.selectionStart;
  const selectionEnd = target.selectionEnd;
  const value = props.parser ? props.parser(target.value) : target.value;
  const formattedValue = applyFormatter(value);

  rawValue.value = value;
  displayValue.value = formattedValue;
  if (target.value !== formattedValue) {
    target.value = formattedValue;
    restoreSelectionAfterFormat(
      target,
      previousValue,
      formattedValue,
      selectionStart,
      selectionEnd
    );
  }

  const modelValue = normalizeModelOutput(value);
  if (!props.modelModifiers?.lazy) emit('update:modelValue', modelValue);
  emit('input', modelValue, event);
  if (shouldValidate('input')) {
    validateInput(value);
  } else if (validationError.value !== null) {
    // 非实时校验时，用户开始重新编辑后移除过期的本地错误提示。
    validationError.value = null;
  }
  if (!props.modelModifiers?.lazy && formItem?.onFieldInput) {
    formItem.onFieldInput();
  } else if (!props.modelModifiers?.lazy) {
    // 兼容旧版自定义 FormItem 上下文。
    formItem?.onFieldChange();
  }
  scheduleTextareaHeight();
};

let ignoreCompositionInput: string | null = null;
let discardedComposition = false;

function discardNativeDraft(): void {
  isComposing.value = false;
  ignoreCompositionInput = null;
  displayValue.value = applyFormatter(rawValue.value);
  if (inputRef.value) inputRef.value.value = displayValue.value;
}

watch([effectiveDisabled, effectiveReadonly], ([disabled, readonly]) => {
  if (disabled || readonly) discardNativeDraft();
});

watch(
  () => formItem?.resetRevision?.value,
  () => {
    // 同值重置也必须清除 lazy 草稿、本地错误和仍在进行的输入法组合。
    discardedComposition ||= isComposing.value;
    rawValue.value = normalizeInputValue(props.modelValue);
    validationError.value = null;
    discardNativeDraft();
    scheduleTextareaHeight();
  },
  { flush: 'post' }
);

const handleCompositionStart = (): void => {
  if (effectiveDisabled.value || effectiveReadonly.value) return;
  discardedComposition = false;
  isComposing.value = true;
  ignoreCompositionInput = null;
};

const handleCompositionEnd = (event: CompositionEvent): void => {
  if (discardedComposition) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const cancelledValue = target.value;
    discardedComposition = false;
    discardNativeDraft();
    // 浏览器可能在 compositionend 后补发 input；旧组合结果不能覆盖重置值。
    ignoreCompositionInput = cancelledValue;
    queueMicrotask(() => {
      ignoreCompositionInput = null;
    });
    return;
  }
  if (effectiveDisabled.value || effectiveReadonly.value) {
    discardNativeDraft();
    return;
  }
  if (!isComposing.value) return;
  isComposing.value = false;
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  ignoreCompositionInput = target.value;
  commitNativeValue(event);

  queueMicrotask(() => {
    ignoreCompositionInput = null;
  });
};

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  if (discardedComposition || effectiveDisabled.value || effectiveReadonly.value) {
    discardNativeDraft();
    return;
  }
  if (isComposing.value) {
    displayValue.value = target.value;
    return;
  }
  if (ignoreCompositionInput === target.value) {
    ignoreCompositionInput = null;
    target.value = displayValue.value;
    return;
  }
  commitNativeValue(event);
};

const handleChange = (event: Event): void => {
  if (effectiveDisabled.value || effectiveReadonly.value) {
    discardNativeDraft();
    return;
  }
  const modelValue = normalizeModelOutput(rawValue.value);
  if (props.modelModifiers?.lazy) emit('update:modelValue', modelValue);
  emit('change', modelValue, event);
  if (shouldValidate('change')) validateInput(rawValue.value);
  formItem?.onFieldChange();
};

const handleFocus = (event: FocusEvent): void => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event: FocusEvent): void => {
  isFocused.value = false;
  emit('blur', event);
  if (shouldValidate('blur')) validateInput(rawValue.value);
  formItem?.onFieldBlur();
};

const handleKeydown = (event: KeyboardEvent): void => {
  emit('keydown', event);
  if (event.key === 'Enter' && !isComposing.value && !isComposingKeyboardEvent(event)) {
    emit('enter', event);
  }
};

const handleKeyup = (event: KeyboardEvent): void => {
  emit('keyup', event);
};

const focus: ExInputExposed['focus'] = options => {
  inputRef.value?.focus(options);
};

const handleClear = (): void => {
  if (effectiveDisabled.value || effectiveReadonly.value) return;

  rawValue.value = '';
  displayValue.value = applyFormatter('');
  emit('update:modelValue', '');
  emit('clear');
  if (shouldValidate('input') || shouldValidate('change')) validateInput('');
  formItem?.onFieldChange();
  scheduleTextareaHeight();

  nextTick(() => {
    focus({ preventScroll: true });
  });
};

const togglePasswordVisibility = (): void => {
  const input = inputRef.value;
  if (!(input instanceof HTMLInputElement)) return;

  const selectionStart = input.selectionStart;
  const selectionEnd = input.selectionEnd;
  isPasswordVisible.value = !isPasswordVisible.value;

  nextTick(() => {
    const currentInput = inputRef.value;
    if (!(currentInput instanceof HTMLInputElement)) return;
    currentInput.focus({ preventScroll: true });
    if (selectionStart !== null && selectionEnd !== null) {
      currentInput.setSelectionRange(selectionStart, selectionEnd);
    }
  });
};

let frameId: number | null = null;
let resizeObserver: ResizeObserver | null = null;
let observedWidth: number | null = null;
let hasWindowResizeListener = false;

const clearTextareaHeight = (): void => {
  const textarea = inputRef.value;
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  textarea.style.height = '';
  textarea.style.overflowY = '';
};

const adjustTextareaHeight = (): void => {
  const textarea = inputRef.value;
  if (!(textarea instanceof HTMLTextAreaElement) || !isAutosize.value) return;

  textarea.style.height = '0px';
  const style = window.getComputedStyle(textarea);
  const rows = resolveTextareaRows(props.autosize ?? false, props.rows);
  const result = calculateTextareaHeight({
    scrollHeight: textarea.scrollHeight,
    lineHeight: style.lineHeight,
    fontSize: style.fontSize,
    paddingTop: style.paddingTop,
    paddingBottom: style.paddingBottom,
    borderTopWidth: style.borderTopWidth,
    borderBottomWidth: style.borderBottomWidth,
    minRows: rows.minRows,
    maxRows: rows.maxRows,
  });

  textarea.style.height = String(result.height) + 'px';
  textarea.style.overflowY = result.overflowY;
};

function scheduleTextareaHeight(): void {
  if (!isAutosize.value) return;
  if (frameId !== null) cancelAnimationFrame(frameId);

  frameId = requestAnimationFrame(() => {
    frameId = null;
    adjustTextareaHeight();
  });
}

const handleWindowResize = (): void => {
  scheduleTextareaHeight();
};

const stopResizeTracking = (): void => {
  if (frameId !== null) {
    cancelAnimationFrame(frameId);
    frameId = null;
  }
  resizeObserver?.disconnect();
  resizeObserver = null;
  observedWidth = null;

  if (hasWindowResizeListener) {
    window.removeEventListener('resize', handleWindowResize);
    hasWindowResizeListener = false;
  }
};

const startResizeTracking = (): void => {
  stopResizeTracking();

  const textarea = inputRef.value;
  if (!(textarea instanceof HTMLTextAreaElement) || !isAutosize.value) {
    clearTextareaHeight();
    return;
  }

  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect.width;
      if (width === undefined || width === observedWidth) return;
      observedWidth = width;
      scheduleTextareaHeight();
    });
    resizeObserver.observe(textarea);
  } else {
    window.addEventListener('resize', handleWindowResize, { passive: true });
    hasWindowResizeListener = true;
  }

  scheduleTextareaHeight();
};

watch([() => props.modelValue, () => props.formatter], ([modelValue]) => {
  const value = normalizeInputValue(modelValue);
  const valueChanged = value !== rawValue.value;
  rawValue.value = value;
  displayValue.value = applyFormatter(value);
  if (valueChanged && validationError.value !== null) {
    validationError.value = null;
  }
  scheduleTextareaHeight();
});

watch([() => props.type, () => props.showPassword], () => {
  if (props.type !== 'password' || !props.showPassword) {
    isPasswordVisible.value = false;
  }
});

watch(
  [isAutosize, () => props.autosize, () => props.rows],
  async () => {
    if (!isAutosize.value) {
      stopResizeTracking();
      clearTextareaHeight();
      return;
    }
    await nextTick();
    startResizeTracking();
  },
  {
    deep: true,
    flush: 'post',
  }
);

watch(
  () => props.rules,
  () => {
    if (validationError.value !== null) validateInput(rawValue.value);
  }
);

onMounted(() => {
  startResizeTracking();
});

onBeforeUnmount(() => {
  stopResizeTracking();
});

const blur = (): void => {
  inputRef.value?.blur();
};

const select = (): void => {
  inputRef.value?.select();
};

const clear = (): void => {
  handleClear();
};

const validate = (): boolean => validateInput(rawValue.value);
const getInputElement = (): HTMLInputElement | HTMLTextAreaElement | null => inputRef.value;

defineExpose<ExInputExposed>({
  focus,
  blur,
  select,
  clear,
  validate,
  getInputElement,
});
</script>

<style scoped lang="scss" src="./ExInput.scss"></style>
