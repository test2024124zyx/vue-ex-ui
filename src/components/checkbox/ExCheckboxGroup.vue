<template>
  <div
    :class="groupClasses"
    :style="groupStyles"
    role="group"
    :aria-labelledby="labelId"
    :aria-describedby="ariaDescribedBy"
  >
    <!-- 标签 -->
    <label v-if="label || $slots.label" :id="labelId" class="ex-checkbox-group__label">
      <slot name="label">
        {{ label }}
        <span v-if="required" class="ex-checkbox-group__required">*</span>
      </slot>
    </label>

    <!-- 复选框容器 -->
    <div class="ex-checkbox-group__content">
      <slot />
    </div>

    <!-- 底部信息 -->
    <div v-if="showBottomInfo" class="ex-checkbox-group__bottom">
      <!-- 帮助文本 -->
      <div v-if="helpText || $slots.help" :id="`${groupId}-help`" class="ex-checkbox-group__help">
        <slot name="help">
          {{ helpText }}
        </slot>
      </div>

      <!-- 错误信息 -->
      <transition name="ex-checkbox-group-error">
        <div
          v-if="showErrorMessage"
          :id="`${groupId}-error`"
          class="ex-checkbox-group__error"
          role="alert"
          aria-live="polite"
        >
          <ex-icon icon="error-warning-line" :size="14" class="ex-checkbox-group__error-icon" />
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
  ExCheckboxGroupProps,
  ExCheckboxGroupEmits,
  ExCheckboxGroupSlots,
  ExCheckboxGroupInstance,
} from './types';
import ExIcon from '../icon/ExIcon.vue';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExCheckboxGroup',
});

const props = withDefaults(defineProps<ExCheckboxGroupProps>(), {
  modelValue: () => [],
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  status: 'default',
  disabled: false,
  readonly: false,
  vertical: false,
  required: false,
});

const emit = defineEmits<ExCheckboxGroupEmits>();

defineSlots<ExCheckboxGroupSlots>();

// 获取 slots 和国际化
const slots = useSlots();
const { t } = useI18n();

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// 生成唯一 ID
const groupId = `ex-checkbox-group-${Math.random().toString(36).substring(2, 11)}`;
const labelId = `${groupId}-label`;

// 状态
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
  const classes = ['ex-checkbox-group'];

  if (componentSize.value) classes.push(`ex-checkbox-group--${componentSize.value}`);
  if (props.status) classes.push(`ex-checkbox-group--${props.status}`);
  if (props.disabled) classes.push('ex-checkbox-group--disabled');
  if (props.readonly) classes.push('ex-checkbox-group--readonly');
  if (props.vertical) classes.push('ex-checkbox-group--vertical');
  if (props.status === 'error' || showErrorMessage.value) {
    classes.push('ex-checkbox-group--error');
  }
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const groupStyles = computed(() => {
  return props.customStyle || {};
});

// 更新值的方法
const updateValue = (value: string | number, checked: boolean) => {
  if (props.disabled || props.readonly) return;

  const newValue = [...props.modelValue];
  const index = newValue.indexOf(value);

  if (checked && index === -1) {
    // 检查最大选择数量
    if (props.max !== undefined && newValue.length >= props.max) {
      return;
    }
    newValue.push(value);
  } else if (!checked && index > -1) {
    // 检查最小选择数量
    if (props.min !== undefined && newValue.length <= props.min) {
      return;
    }
    newValue.splice(index, 1);
  }

  // 验证
  validateGroup(newValue);

  emit('update:modelValue', newValue);
  emit('change', newValue);
};

// 验证复选框组
const validateGroup = (value: Array<string | number>) => {
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

// 提供上下文给子 Checkbox 组件
provide('checkboxGroup', {
  modelValue: computed(() => props.modelValue),
  name: props.name,
  size: componentSize.value,
  status: props.status,
  disabled: props.disabled,
  readonly: props.readonly,
  updateValue,
});

// 暴露方法
const checkAll = () => {
  if (props.disabled || props.readonly || !props.options) return;

  const allValues = props.options.filter(option => !option.disabled).map(option => option.value);

  emit('update:modelValue', allValues);
  emit('change', allValues);
};

const uncheckAll = () => {
  if (props.disabled || props.readonly) return;

  emit('update:modelValue', []);
  emit('change', []);
};

const toggleAll = () => {
  if (props.disabled || props.readonly || !props.options) return;

  const allValues = props.options.filter(option => !option.disabled).map(option => option.value);

  const newValue = props.modelValue.length === allValues.length ? [] : allValues;

  emit('update:modelValue', newValue);
  emit('change', newValue);
};

const getCheckboxGroupElement = () => {
  return null; // 可以根据需要返回实际的 DOM 元素
};

defineExpose<ExCheckboxGroupInstance>({
  checkAll,
  uncheckAll,
  toggleAll,
  getCheckboxGroupElement,
});
</script>

<style scoped lang="scss" src="./ExCheckboxGroup.scss"></style>
