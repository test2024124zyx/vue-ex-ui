<template>
  <div
    :class="groupClasses"
    :style="groupStyles"
    role="radiogroup"
    :aria-labelledby="labelId"
    :aria-describedby="ariaDescribedBy"
  >
    <!-- 标签 -->
    <label v-if="label || $slots.label" :id="labelId" class="ex-radio-group__label">
      <slot name="label">
        {{ label }}
        <span v-if="required" class="ex-radio-group__required">*</span>
      </slot>
    </label>

    <!-- 单选框容器 -->
    <div class="ex-radio-group__content">
      <slot />
    </div>

    <!-- 底部信息 -->
    <div v-if="showBottomInfo" class="ex-radio-group__bottom">
      <!-- 帮助文本 -->
      <div v-if="helpText || $slots.help" :id="`${groupId}-help`" class="ex-radio-group__help">
        <slot name="help">
          {{ helpText }}
        </slot>
      </div>

      <!-- 错误信息 -->
      <transition name="ex-radio-group-error">
        <div
          v-if="showErrorMessage"
          :id="`${groupId}-error`"
          class="ex-radio-group__error"
          role="alert"
          aria-live="polite"
        >
          <ex-icon icon="error-warning-line" :size="14" class="ex-radio-group__error-icon" />
          <slot name="error">
            {{ currentErrorMessage }}
          </slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, provide, useSlots } from 'vue';
import type {
  ExRadioGroupProps,
  ExRadioGroupEmits,
  ExRadioGroupSlots,
  ExRadioGroupInstance,
  RadioValue,
} from './types';
import ExIcon from '../icon/ExIcon.vue';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExRadioGroup',
});

const props = withDefaults(defineProps<ExRadioGroupProps>(), {
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  status: 'default',
  disabled: false,
  readonly: false,
  vertical: false,
  required: false,
});

const emit = defineEmits<ExRadioGroupEmits>();

defineSlots<ExRadioGroupSlots>();

const slots = useSlots();
const { t } = useI18n();

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

const groupId = `ex-radio-group-${Math.random().toString(36).substring(2, 11)}`;
const labelId = `${groupId}-label`;

const currentErrorMessage = ref('');

// 计算属性
const showErrorMessage = computed(() => {
  return Boolean(currentErrorMessage.value) || props.status === 'error';
});

const showBottomInfo = computed(() => {
  return props.helpText || slots.help || showErrorMessage.value;
});

const ariaDescribedBy = computed(() => {
  const ids: string[] = [];

  if (props.helpText || slots.help) {
    ids.push(`${groupId}-help`);
  }

  if (showErrorMessage.value) {
    ids.push(`${groupId}-error`);
  }

  return ids.length > 0 ? ids.join(' ') : undefined;
});

// 样式类
const groupClasses = computed(() => {
  const classes = ['ex-radio-group'];

  if (componentSize.value) classes.push(`ex-radio-group--${componentSize.value}`);
  if (props.status) classes.push(`ex-radio-group--${props.status}`);
  if (props.disabled) classes.push('ex-radio-group--disabled');
  if (props.readonly) classes.push('ex-radio-group--readonly');
  if (props.vertical) classes.push('ex-radio-group--vertical');
  if (props.status === 'error' || showErrorMessage.value) {
    classes.push('ex-radio-group--error');
  }
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const groupStyles = computed(() => {
  return props.customStyle || {};
});

// 更新值的方法
const updateValue = (value: RadioValue) => {
  if (props.disabled || props.readonly) return;

  // 验证
  validateGroup(value);

  emit('update:modelValue', value);
  emit('change', value);
};

// 验证单选框组
const validateGroup = (value: RadioValue) => {
  if (!props.rules || props.rules.length === 0) {
    currentErrorMessage.value = '';
    return true;
  }

  for (const rule of props.rules) {
    const result = rule(value);
    if (result !== true) {
      currentErrorMessage.value =
        typeof result === 'string' ? result : t('common.validationError') || '验证失败';
      return false;
    }
  }

  currentErrorMessage.value = '';
  return true;
};

// 监听错误信息变化
watch(
  () => props.errorMessage,
  newError => {
    if (newError) {
      currentErrorMessage.value = newError;
    }
  },
  { immediate: true }
);

// 提供上下文给子 Radio 组件
provide('radioGroup', {
  modelValue: computed(() => props.modelValue),
  name: props.name,
  size: computed(() => componentSize.value),
  status: props.status,
  disabled: props.disabled,
  readonly: props.readonly,
  updateValue,
});

// 暴露方法
const getValue = (): string | number | boolean => {
  return props.modelValue || '';
};

const setValue = (value: RadioValue) => {
  if (props.disabled || props.readonly) return;

  emit('update:modelValue', value);
  emit('change', value);
};

const getRadioGroupElement = () => {
  return null;
};

defineExpose<ExRadioGroupInstance>({
  getValue,
  setValue,
  getRadioGroupElement,
});
</script>

<style scoped lang="scss" src="./ExRadioGroup.scss"></style>
