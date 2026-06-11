<template>
  <span v-if="!isEditing" :class="buttonClasses" @click="startEdit">
    <slot name="icon">
      <ExIcon icon="add-line" :size="iconSize" />
    </slot>
    <span class="ex-tag-input__text">{{ buttonTextComputed }}</span>
  </span>
  <span v-else class="ex-tag-input__wrapper">
    <input
      ref="inputRef"
      v-model="inputValue"
      :class="inputClasses"
      :placeholder="placeholderComputed"
      :maxlength="maxlength"
      @blur="handleBlur"
      @keyup.enter="handleConfirm"
      @keyup.esc="handleCancel"
    />
    <span
      class="ex-tag-input__action ex-tag-input__action--confirm"
      :title="t('tag.confirm')"
      @click="handleConfirm"
    >
      <ExIcon icon="check-line" :size="14" />
    </span>
    <span
      class="ex-tag-input__action ex-tag-input__action--cancel"
      :title="t('tag.cancel')"
      @click="handleCancel"
    >
      <ExIcon icon="close-line" :size="14" />
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import type { TagSize } from './types';
import ExIcon from '../icon/ExIcon.vue';
import { useComponentSize } from '../config-provider/composables';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExTagInput',
});

export interface ExTagInputProps {
  /** 按钮文本 */
  buttonText?: string;
  /** 输入框占位符 */
  placeholder?: string;
  /** 尺寸 */
  size?: TagSize;
  /** 最大长度 */
  maxlength?: number;
  /** 已存在的标签列表，用于验证重复 */
  existingTags?: string[];
  /** 是否验证重复 */
  validateDuplicate?: boolean;
}

const props = withDefaults(defineProps<ExTagInputProps>(), {
  buttonText: undefined,
  placeholder: undefined,
  size: undefined,
  maxlength: 20,
  existingTags: () => [],
  validateDuplicate: true,
});

const emit = defineEmits<{
  confirm: [value: string];
  cancel: [];
  duplicate: [value: string];
}>();

const { t } = useI18n();

const inputRef = ref<HTMLInputElement>();
const isEditing = ref(false);
const inputValue = ref('');

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// 多语言支持
const buttonTextComputed = computed(() => props.buttonText || t('tag.addTagButton'));
const placeholderComputed = computed(() => props.placeholder || t('tag.inputPlaceholder'));

const iconSize = computed(() => {
  const sizeMap = {
    large: 16,
    medium: 14,
    small: 12,
  };
  return sizeMap[componentSize.value as keyof typeof sizeMap] || 14;
});

const buttonClasses = computed(() => [
  'ex-tag-input__button',
  `ex-tag-input__button--${componentSize.value}`,
]);

const inputClasses = computed(() => [
  'ex-tag-input__input',
  `ex-tag-input__input--${componentSize.value}`,
]);

const startEdit = () => {
  isEditing.value = true;
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
  if (props.validateDuplicate && props.existingTags?.includes(value)) {
    emit('duplicate', value);
    return;
  }

  emit('confirm', value);
  inputValue.value = '';
  isEditing.value = false;
};

const handleCancel = () => {
  inputValue.value = '';
  isEditing.value = false;
  emit('cancel');
};

const handleBlur = () => {
  // 延迟处理，让点击确认/取消按钮的事件先触发
  setTimeout(() => {
    if (isEditing.value) {
      handleCancel();
    }
  }, 200);
};
</script>

<style lang="scss" scoped>
@use '../../styles/mixins' as *;

.ex-tag-input {
  &__button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    background: var(--ex-color-bg-secondary);
    border: 1px dashed var(--ex-color-border-primary);
    border-radius: var(--ex-radius-md);
    color: var(--ex-color-text-secondary);
    font-size: var(--ex-font-size-sm);
    cursor: pointer;
    transition: all var(--ex-transition-base);
    user-select: none;

    &:hover {
      color: var(--ex-color-neon-blue-500);
      border-color: var(--ex-color-neon-blue-500);
      background: var(--ex-color-bg-hover);
      box-shadow: 0 0 10px rgba(41, 171, 226, 0.2);
    }

    &:active {
      transform: scale(0.98);
    }

    &--large {
      padding: 6px 16px;
      font-size: var(--ex-font-size-base);
    }

    &--medium {
      padding: 4px 12px;
      font-size: var(--ex-font-size-sm);
    }

    &--small {
      padding: 2px 8px;
      font-size: var(--ex-font-size-xs);
    }
  }

  &__text {
    line-height: 1;
  }

  &__wrapper {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px;
    background: var(--ex-color-bg-secondary);
    border: 1px solid var(--ex-color-border-primary);
    border-radius: var(--ex-radius-md);
  }

  &__input {
    padding: 4px 8px;
    background: transparent;
    border: none;
    color: var(--ex-color-text-primary);
    font-size: var(--ex-font-size-sm);
    outline: none;
    min-width: 100px;
    flex: 1;

    &::placeholder {
      color: var(--ex-color-text-placeholder);
    }

    &--large {
      padding: 6px 12px;
      font-size: var(--ex-font-size-base);
      min-width: 120px;
    }

    &--medium {
      padding: 4px 8px;
      font-size: var(--ex-font-size-sm);
      min-width: 100px;
    }

    &--small {
      padding: 2px 6px;
      font-size: var(--ex-font-size-xs);
      min-width: 80px;
    }
  }

  &__action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: var(--ex-radius-sm);
    cursor: pointer;
    transition: all var(--ex-transition-base);
    flex-shrink: 0;

    &:hover {
      transform: scale(1.15);
    }

    &:active {
      transform: scale(0.9);
    }

    &--confirm {
      color: var(--ex-color-success-500);
      background: rgba(82, 196, 26, 0.1);

      &:hover {
        background: rgba(82, 196, 26, 0.2);
        box-shadow: 0 0 8px rgba(82, 196, 26, 0.4);
      }
    }

    &--cancel {
      color: var(--ex-color-text-secondary);
      background: rgba(255, 255, 255, 0.05);

      &:hover {
        color: var(--ex-color-danger-500);
        background: rgba(245, 34, 45, 0.1);
        box-shadow: 0 0 8px rgba(245, 34, 45, 0.4);
      }
    }
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .ex-tag-input {
    &__button {
      border-width: 2px;
    }

    &__input {
      border-width: 2px;
    }
  }
}
</style>
