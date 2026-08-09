<template>
  <button
    v-if="!isEditing"
    type="button"
    :class="buttonClasses"
    :aria-label="buttonTextComputed"
    @click="startEdit"
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

<style lang="scss" scoped src="./ExTagInput.scss"></style>
