<template>
  <button
    v-if="!isEditing"
    type="button"
    :class="buttonClasses"
    :aria-label="buttonTextComputed"
    @click="startEdit"
  >
    <slot name="icon">
      <ExIcon
        icon="add-line"
        :size="iconSize"
      />
    </slot>
    <span class="ex-tag-input__text">{{ buttonTextComputed }}</span>
  </button>
  <span
    v-else
    class="ex-tag-input__editing"
  >
    <span
      ref="wrapperRef"
      class="ex-tag-input__wrapper"
    >
      <input
        ref="inputRef"
        v-model="inputValue"
        :class="inputClasses"
        :aria-label="placeholderComputed"
        :aria-invalid="duplicateMessage ? 'true' : undefined"
        :aria-describedby="duplicateMessage ? duplicateFeedbackId : undefined"
        :placeholder="placeholderComputed"
        :maxlength="maxlength"
        @blur="handleBlur"
        @keydown.enter.prevent="handleConfirm"
        @keydown.esc.prevent="handleCancel"
      />
      <button
        type="button"
        class="ex-tag-input__action ex-tag-input__action--confirm"
        :aria-label="t('confirm')"
        :title="t('confirm')"
        @pointerdown.prevent
        @click="handleConfirm"
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
        @pointerdown.prevent
        @click="handleCancel"
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
import { ref, computed, nextTick, watch } from 'vue';
import type { ExTagInputEmits, ExTagInputProps } from './types';
import ExIcon from '../icon/ExIcon.vue';
import { useComponentSize } from '../config-provider/composables';
import { useLocale } from '../../locale';
import { generateId } from '../../utils/id';

defineOptions({
  name: 'ExTagInput',
});

const props = withDefaults(defineProps<ExTagInputProps>(), {
  maxlength: 20,
  existingTags: () => [],
  validateDuplicate: true,
});

const emit = defineEmits<ExTagInputEmits>();

const { t } = useLocale('tag');

const INPUT_ICON_SIZES = {
  large: 16,
  medium: 14,
  small: 12,
} as const;

const inputRef = ref<HTMLInputElement>();
const wrapperRef = ref<HTMLElement>();
const isEditing = ref(false);
const inputValue = ref('');
const duplicateValue = ref('');
const duplicateFeedbackId = generateId('ex-tag-input-feedback');

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// 多语言支持
const buttonTextComputed = computed(() => props.buttonText || t('addTagButton'));
const placeholderComputed = computed(() => props.placeholder || t('inputPlaceholder'));
const duplicateMessage = computed(() =>
  duplicateValue.value ? t('duplicate', { value: duplicateValue.value }) : ''
);

const iconSize = computed(() => INPUT_ICON_SIZES[componentSize.value]);

const buttonClasses = computed(() => [
  'ex-tag-input__button',
  `ex-tag-input__button--${componentSize.value}`,
]);

const inputClasses = computed(() => [
  'ex-tag-input__input',
  `ex-tag-input__input--${componentSize.value}`,
]);

// 输入内容变化后清除上一次重复提示。
watch(inputValue, () => {
  duplicateValue.value = '';
});

const startEdit = () => {
  isEditing.value = true;
  duplicateValue.value = '';
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const handleConfirm = () => {
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
  inputValue.value = '';
  duplicateValue.value = '';
  isEditing.value = false;
};

const handleCancel = () => {
  inputValue.value = '';
  duplicateValue.value = '';
  isEditing.value = false;
  emit('cancel');
};

const handleBlur = (event: FocusEvent) => {
  const nextTarget = event.relatedTarget;

  if (nextTarget instanceof Node && wrapperRef.value?.contains(nextTarget)) {
    return;
  }

  if (isEditing.value) {
    handleCancel();
  }
};
</script>

<style lang="scss" scoped>
@use '../../styles/mixins' as *;

.ex-tag-input {
  &__editing {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    max-width: 100%;
  }

  &__button {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    gap: var(--ex-spacing-1);
    padding: var(--ex-spacing-1) var(--ex-spacing-3);
    min-height: var(--ex-button-touch-target);
    background: var(--ex-color-bg-secondary);
    border: 1px dashed var(--ex-color-border-primary);
    border-radius: var(--ex-radius-md);
    color: var(--ex-color-text-secondary);
    font-size: var(--ex-text-sm);
    font-family: inherit;
    cursor: pointer;
    touch-action: manipulation;
    user-select: none;
    @include transition((color, background-color, border-color, box-shadow, transform));

    &:focus-visible {
      outline: var(--ex-input-focus-ring-width) solid var(--ex-color-border-focus);
      outline-offset: 2px;
    }

    &:hover {
      color: var(--ex-color-neon-blue-500);
      border-color: var(--ex-color-neon-blue-500);
      background: var(--ex-color-bg-hover);
      box-shadow: 0 0 10px var(--ex-color-primary-alpha-20);
    }

    &:active {
      transform: translateY(1px);
    }

    &--large {
      padding: var(--ex-spacing-2) var(--ex-spacing-4);
      font-size: var(--ex-text-base);
    }

    &--medium {
      padding: var(--ex-spacing-1) var(--ex-spacing-3);
      font-size: var(--ex-text-sm);
    }

    &--small {
      padding: 0 var(--ex-spacing-2);
      font-size: var(--ex-text-xs);
    }
  }

  &__text {
    line-height: 1;
  }

  &__wrapper {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    gap: var(--ex-spacing-1);
    padding: 2px;
    background: var(--ex-color-bg-secondary);
    border: 1px solid var(--ex-color-border-primary);
    border-radius: var(--ex-radius-md);
    @include transition((background-color, border-color, box-shadow));

    &:focus-within {
      border-color: var(--ex-color-border-focus);
      box-shadow: 0 0 0 2px var(--ex-color-primary-alpha-30);
    }
  }

  &__feedback {
    flex-basis: 100%;
    margin-top: var(--ex-spacing-1);
    color: var(--ex-color-error);
    font-size: var(--ex-text-xs);
    line-height: var(--ex-leading-normal);
  }

  &__input {
    padding: var(--ex-spacing-1) var(--ex-spacing-2);
    background: transparent;
    border: 1px solid transparent;
    color: var(--ex-color-text-primary);
    font-size: var(--ex-text-sm);
    font-family: inherit;
    line-height: var(--ex-leading-normal);
    outline: none;
    min-width: var(--ex-tag-input-input-min-width-md);
    flex: 1;

    &::placeholder {
      color: var(--ex-color-text-disabled);
    }

    &--large {
      padding: var(--ex-spacing-2) var(--ex-spacing-3);
      font-size: var(--ex-text-base);
      min-width: var(--ex-tag-input-input-min-width-lg);
    }

    &--medium {
      padding: var(--ex-spacing-1) var(--ex-spacing-2);
      font-size: var(--ex-text-sm);
      min-width: var(--ex-tag-input-input-min-width-md);
    }

    &--small {
      padding: 0 var(--ex-spacing-1);
      font-size: var(--ex-text-xs);
      min-width: var(--ex-tag-input-input-min-width-sm);
    }
  }

  &__action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: var(--ex-tag-input-action-size);
    height: var(--ex-tag-input-action-size);
    padding: 0;
    border: 0;
    font: inherit;
    border-radius: var(--ex-radius-sm);
    cursor: pointer;
    touch-action: manipulation;
    flex-shrink: 0;
    @include transition((color, background-color, box-shadow, transform));

    &:hover {
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }

    &:focus-visible {
      outline: var(--ex-input-focus-ring-width) solid var(--ex-color-border-focus);
      outline-offset: 2px;
    }

    &--confirm {
      color: var(--ex-color-success);
      background: var(--ex-color-success-alpha-10);

      &:hover {
        background: var(--ex-color-success-alpha-20);
        box-shadow: 0 0 8px var(--ex-color-success-alpha-40);
      }
    }

    &--cancel {
      color: var(--ex-color-text-secondary);
      background: var(--ex-color-white-alpha-05);

      &:hover {
        color: var(--ex-color-error);
        background: var(--ex-color-error-alpha-10);
        box-shadow: 0 0 8px var(--ex-color-error-alpha-40);
      }
    }
  }
}

// 高对比度模式
@media (prefers-contrast: high), (prefers-contrast: more), (forced-colors: active) {
  .ex-tag-input {
    &__button {
      border-width: var(--ex-input-focus-ring-width);
    }

    &__input {
      border-color: currentColor;
      border-width: var(--ex-input-focus-ring-width);
    }

    &__wrapper {
      border-color: CanvasText;
      box-shadow: none;
    }

    &__action {
      border: 1px solid CanvasText;
      background: Canvas;
      color: CanvasText;
      box-shadow: none;
    }

    &__feedback {
      color: CanvasText;
    }
  }
}
</style>
