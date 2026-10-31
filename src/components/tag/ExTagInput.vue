<template>
  <button
    v-if="!isEditing"
    :id="id"
    ref="buttonRef"
    type="button"
    v-bind="{ ...$attrs, ...fieldAriaAttrs }"
    :class="buttonClasses"
    :disabled="effectiveDisabled"
    :aria-label="getAriaLabel(buttonTextComputed)"
    :aria-disabled="!interactive || undefined"
    :aria-readonly="undefined"
    :aria-busy="fieldStatus === 'validating' || undefined"
    @click="startEdit"
    @blur="handleButtonBlur"
  >
    <span class="ex-tag-input__button-content">
      <slot name="icon">
        <ExIcon
          icon="add-line"
          :size="iconSize"
        />
      </slot>
      <span class="ex-tag-input__text">{{ buttonTextComputed }}</span>
    </span>
  </button>
  <span
    v-else
    v-bind="$attrs"
    class="ex-tag-input__editing"
  >
    <span
      ref="wrapperRef"
      class="ex-tag-input__wrapper"
    >
      <input
        :id="id"
        ref="inputRef"
        v-bind="fieldAriaAttrs"
        :value="inputValue"
        :class="inputClasses"
        :disabled="effectiveDisabled"
        :readonly="effectiveReadonly"
        :aria-label="getAriaLabel(placeholderComputed)"
        :aria-invalid="invalid || Boolean(duplicateMessage) || undefined"
        :aria-describedby="inputDescribedBy"
        :aria-busy="fieldStatus === 'validating' || undefined"
        :placeholder="placeholderComputed"
        :maxlength="maxlength"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @input="handleInput"
        @compositionstart="handleCompositionStart"
        @compositionend="handleCompositionEnd"
      />
      <button
        type="button"
        class="ex-tag-input__action ex-tag-input__action--confirm"
        :aria-label="t('confirm')"
        :title="t('confirm')"
        :disabled="!interactive"
        @pointerdown.prevent
        @click="handleConfirm"
        @blur="handleBlur"
      >
        <ExIcon
          icon="check-line"
          :size="iconSize"
        />
      </button>
      <button
        type="button"
        class="ex-tag-input__action ex-tag-input__action--cancel"
        :aria-label="t('cancel')"
        :title="t('cancel')"
        :disabled="effectiveDisabled"
        @pointerdown.prevent
        @click="handleCancel"
        @blur="handleBlur"
      >
        <ExIcon
          icon="close-line"
          :size="iconSize"
        />
      </button>
    </span>
    <span
      v-if="duplicateMessage"
      :id="duplicateFeedbackId"
      class="ex-tag-input__feedback"
      role="alert"
    >
      {{ duplicateMessage }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, useAttrs } from 'vue';
import type { ExTagInputEmits, ExTagInputProps } from './types';
import ExIcon from '../icon/ExIcon.vue';
import { mergeAriaIds, useFormFieldState } from '../form/use-form-item';
import { useLocale } from '../../locale';
import { generateId } from '../../utils/id';
import { isComposingKeyboardEvent } from '../../utils/keyboard';

defineOptions({
  name: 'ExTagInput',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExTagInputProps>(), {
  maxlength: 20,
  existingTags: () => [],
  validateDuplicate: true,
});

const emit = defineEmits<ExTagInputEmits>();
const attrs = useAttrs();
const {
  formItem,
  disabled: effectiveDisabled,
  readonly: effectiveReadonly,
  interactive,
  size: componentSize,
  ariaAttrs: fieldAriaAttrs,
  invalid,
} = useFormFieldState(props);

const { t } = useLocale('tag');

const INPUT_ICON_SIZES = {
  large: 16,
  medium: 14,
  small: 12,
} as const;

const inputRef = ref<HTMLInputElement>();
const buttonRef = ref<HTMLButtonElement>();
const wrapperRef = ref<HTMLElement>();
const isEditing = ref(false);
const isComposing = ref(false);
const inputValue = ref('');
const duplicateValue = ref('');
const duplicateFeedbackId = generateId('ex-tag-input-feedback');

// 多语言支持
const buttonTextComputed = computed(() => props.buttonText || t('addTagButton'));
const placeholderComputed = computed(() => props.placeholder || t('inputPlaceholder'));
const duplicateMessage = computed(() =>
  duplicateValue.value ? t('duplicate', { value: duplicateValue.value }) : ''
);
const fieldStatus = computed(() =>
  duplicateMessage.value ? 'error' : (formItem?.status?.value ?? '')
);
const inputDescribedBy = computed(() =>
  mergeAriaIds(
    fieldAriaAttrs.value['aria-describedby'],
    duplicateMessage.value ? duplicateFeedbackId : undefined
  )
);
const getAriaLabel = (fallback: string) => {
  const explicit = props.ariaLabel || attrs['aria-label'];
  if (typeof explicit === 'string' && explicit) return explicit;
  return fieldAriaAttrs.value['aria-labelledby'] ? undefined : fallback;
};
const stateClasses = computed(() => ({
  'is-disabled': effectiveDisabled.value,
  'is-readonly': effectiveReadonly.value,
  ...(fieldStatus.value ? { [`is-${fieldStatus.value}`]: true } : {}),
}));

const iconSize = computed(() => INPUT_ICON_SIZES[componentSize.value]);

const buttonClasses = computed(() => [
  'ex-tag-input__button',
  `ex-tag-input__button--${componentSize.value}`,
  stateClasses.value,
]);

const inputClasses = computed(() => [
  'ex-tag-input__input',
  `ex-tag-input__input--${componentSize.value}`,
  stateClasses.value,
]);

// 输入内容变化后清除上一次重复提示。
watch(inputValue, () => {
  duplicateValue.value = '';
});

// 状态切换使旧草稿失效；这不是用户取消，不发事件也不抢回焦点。
watch(interactive, enabled => {
  if (enabled) return;
  inputValue.value = '';
  duplicateValue.value = '';
  isEditing.value = false;
  isComposing.value = false;
});

watch(
  () => formItem?.resetRevision?.value,
  () => {
    // 重置不是用户确认或取消，不发业务事件，也不让旧输入节点继续提交草稿。
    inputValue.value = '';
    duplicateValue.value = '';
    isEditing.value = false;
    isComposing.value = false;
  },
  { flush: 'post' }
);

const startEdit = (event: MouseEvent) => {
  if (!interactive.value || isEditing.value || event.currentTarget !== buttonRef.value) return;
  isEditing.value = true;
  duplicateValue.value = '';
  nextTick(() => {
    if (interactive.value && isEditing.value) inputRef.value?.focus();
  });
};

const finishEditing = (restoreFocus = true) => {
  isEditing.value = false;
  isComposing.value = false;
  if (restoreFocus)
    nextTick(() => {
      if (interactive.value && !isEditing.value) buttonRef.value?.focus();
    });
};

const handleInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input !== inputRef.value) return;
  if (!interactive.value || !isEditing.value) {
    input.value = inputValue.value;
    return;
  }
  if (isComposing.value || inputValue.value === input.value) return;
  inputValue.value = input.value;
  formItem?.onFieldInput?.();
};

const handleCompositionStart = (event: CompositionEvent) => {
  if (interactive.value && isEditing.value && event.target === inputRef.value)
    isComposing.value = true;
};

const handleCompositionEnd = (event: CompositionEvent) => {
  if (event.target !== inputRef.value) return;
  isComposing.value = false;
  handleInput(event);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (
    !interactive.value ||
    !isEditing.value ||
    event.currentTarget !== inputRef.value ||
    isComposing.value ||
    isComposingKeyboardEvent(event)
  )
    return;
  if (event.key === 'Enter') {
    event.preventDefault();
    handleConfirm();
  } else if (event.key === 'Escape') {
    event.preventDefault();
    handleCancel();
  }
};

const handleConfirm = (event?: MouseEvent) => {
  if (event && !wrapperRef.value?.contains(event.currentTarget as Node)) return;
  if (!interactive.value || !isEditing.value || isComposing.value) return;
  const value = inputValue.value.trim();

  if (!value) {
    handleCancel();
    return;
  }

  // 验证重复
  const isDuplicate = props.existingTags?.some(existingTag => existingTag.trim() === value);
  if (props.validateDuplicate && isDuplicate) {
    duplicateValue.value = value;
    emit('duplicate', value);
    return;
  }

  emit('confirm', value);
  formItem?.onFieldChange();
  inputValue.value = '';
  duplicateValue.value = '';
  finishEditing();
};

const handleCancel = (eventOrRestoreFocus: Event | boolean = true) => {
  if (
    eventOrRestoreFocus instanceof Event &&
    !wrapperRef.value?.contains(eventOrRestoreFocus.currentTarget as Node)
  )
    return;
  if (!interactive.value || !isEditing.value) return;
  inputValue.value = '';
  duplicateValue.value = '';
  finishEditing(eventOrRestoreFocus !== false);
  emit('cancel');
};

const handleBlur = (event: FocusEvent) => {
  if (!wrapperRef.value?.contains(event.currentTarget as Node)) return;
  const nextTarget = event.relatedTarget;

  if (nextTarget instanceof Node && wrapperRef.value?.contains(nextTarget)) {
    return;
  }

  if (isEditing.value) {
    handleCancel(false);
    if (interactive.value) formItem?.onFieldBlur();
  }
};

const handleButtonBlur = () => {
  if (!isEditing.value && interactive.value) formItem?.onFieldBlur();
};
</script>

<style lang="scss" scoped src="./ExTagInput.scss"></style>
