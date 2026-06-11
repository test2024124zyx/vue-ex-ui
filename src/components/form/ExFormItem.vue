<template>
  <div :class="formItemClasses" :style="formItemStyles" :data-field="prop">
    <!-- 标签 -->
    <div v-if="showLabel" :class="labelClasses" :style="labelStyles">
      <span v-if="label" :class="labelTextClasses">
        {{ label }}
        <span v-if="showColon && showColonMark" class="ex-form-item__colon">:</span>
      </span>
      <slot name="label" />
    </div>

    <!-- 内容区域 -->
    <div class="ex-form-item__content">
      <!-- 表单控件 -->
      <div class="ex-form-item__control">
        <slot />

        <!-- 反馈图标 -->
        <div v-if="actualHasFeedback && feedbackIcon" :class="feedbackClasses">
          <ex-icon :icon="feedbackIcon" :size="16" />
        </div>
      </div>

      <!-- 帮助文本 -->
      <div v-if="help && !displayError" class="ex-form-item__help">
        {{ help }}
      </div>

      <!-- 错误消息 -->
      <transition name="ex-form-item-error">
        <div
          v-if="displayError"
          class="ex-form-item__error"
          role="alert"
          :aria-live="validateStatus === 'validating' ? 'polite' : 'assertive'"
        >
          <ex-icon icon="error-warning-line" :size="14" class="ex-form-item__error-icon" />
          {{ displayError }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted, watch, useSlots } from 'vue';
import type {
  ExFormItemProps,
  ExFormItemEmits,
  FormContext,
  FormItemContext,
  FormValidateStatus,
  FormRule,
} from './types';
import { validateField, getFieldValue, setFieldValue } from './utils';
import ExIcon from '../icon/ExIcon.vue';
import { useI18n } from '../../locale';
import { deepClone } from '../../utils/clone';

defineOptions({
  name: 'ExFormItem',
});

const props = withDefaults(defineProps<ExFormItemProps>(), {
  labelAlign: 'left',
  labelPlacement: 'left',
  // 不设默认值：未显式传入时根据校验规则中的 required 自动推断
  required: undefined,
  hasFeedback: false,
  showColon: true,
  size: 'medium',
});

const emit = defineEmits<ExFormItemEmits>();

const slots = useSlots();
const { t } = useI18n();

// 注入表单上下文
const formContext = inject<FormContext | undefined>('exFormContext', undefined);

// 响应式状态
const validateStatus = ref<FormValidateStatus>('');
const validateMessage = ref('');
const isValidating = ref(false);
const initialValue = ref<unknown>(undefined);

// 计算属性
const actualSize = computed(() => {
  return props.size || formContext?.props?.size || 'medium';
});

const actualLabelAlign = computed(() => {
  return props.labelAlign || formContext?.props?.labelAlign || 'right';
});

const actualLabelPlacement = computed(() => {
  return props.labelPlacement || formContext?.props?.labelPlacement || 'left';
});

const actualShowColon = computed(() => {
  return props.showColon ?? formContext?.props?.showColon ?? true;
});

const actualHasFeedback = computed(() => {
  return props.hasFeedback ?? formContext?.props?.hasFeedback ?? false;
});

const actualLabelWidth = computed(() => {
  const width = props.labelWidth || formContext?.props?.labelWidth;
  if (typeof width === 'number') {
    return `${width}px`;
  }
  return width;
});

const isRequired = computed(() => {
  if (props.required !== undefined) {
    return props.required;
  }

  if (props.prop && formContext?.rules?.[props.prop]) {
    const rules = Array.isArray(formContext.rules[props.prop])
      ? (formContext.rules[props.prop] as FormRule[])
      : [formContext.rules[props.prop] as FormRule];

    return rules.some(rule => rule.required);
  }

  return false;
});

const showLabel = computed(() => {
  return !!(props.label || slots.label);
});

const showRequiredMark = computed(() => {
  return isRequired.value && actualLabelPlacement.value !== 'top';
});

const showColonMark = computed(() => {
  return actualShowColon.value && actualLabelPlacement.value !== 'top';
});

const actualValidateStatus = computed(() => {
  return props.validateStatus || validateStatus.value;
});

const displayError = computed(() => {
  return props.error || (actualValidateStatus.value === 'error' ? validateMessage.value : '');
});

const feedbackIcon = computed(() => {
  if (!actualHasFeedback.value) return '';

  switch (actualValidateStatus.value) {
    case 'success':
      return 'check-circle-line';
    case 'warning':
      return 'error-warning-line';
    case 'error':
      return 'close-circle-line';
    case 'validating':
      return 'loader-4-line';
    default:
      return '';
  }
});

const formItemClasses = computed(() => {
  const classes = [
    'ex-form-item',
    `ex-form-item--${actualLabelPlacement.value}`,
    `ex-form-item--${actualSize.value}`,
  ];

  if (isRequired.value) classes.push('is-required');
  if (actualValidateStatus.value) classes.push(`is-${actualValidateStatus.value}`);
  if (actualHasFeedback.value) classes.push('has-feedback');
  if (props.help) classes.push('has-help');
  if (displayError.value) classes.push('has-error-message');
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const formItemStyles = computed(() => {
  return props.customStyle || {};
});

const labelClasses = computed(() => {
  return ['ex-form-item__label', `ex-form-item__label--${actualLabelAlign.value}`];
});

const labelStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (actualLabelWidth.value && actualLabelPlacement.value === 'left') {
    styles.width = actualLabelWidth.value;
  }

  return styles;
});

const labelTextClasses = computed(() => {
  const classes = ['ex-form-item__label-text'];

  if (isRequired.value && showRequiredMark.value) {
    classes.push('is-required');
  }

  return classes;
});

const feedbackClasses = computed(() => {
  return ['ex-form-item__feedback', `ex-form-item__feedback--${actualValidateStatus.value}`];
});

// 表单项上下文
const formItemContext: FormItemContext = {
  prop: props.prop || '',
  props,
  validateStatus: validateStatus.value,
  validateMessage: validateMessage.value,
  validate: validateFieldMethod,
  resetField: resetFieldMethod,
  clearValidate: clearValidateMethod,
};

// 方法
async function validateFieldMethod(trigger?: string): Promise<{ valid: boolean; error?: string }> {
  if (!props.prop || !formContext) {
    return { valid: true };
  }

  const rules = getRules();
  if (!rules || rules.length === 0) {
    return { valid: true };
  }

  // 过滤触发器
  const filteredRules = trigger
    ? rules.filter(rule => {
        if (!rule.trigger) return true;
        const triggers = Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger];
        return triggers.includes(trigger as 'blur' | 'change' | 'input');
      })
    : rules;

  if (filteredRules.length === 0) {
    return { valid: true };
  }

  const value = getFieldValue(formContext.model, props.prop);

  validateStatus.value = 'validating';
  isValidating.value = true;

  try {
    const result = await validateField(filteredRules, value, props.prop);

    if (result.valid) {
      validateStatus.value = 'success';
      validateMessage.value = '';
    } else {
      validateStatus.value = 'error';
      validateMessage.value = result.error || t('common.validationError') || '验证失败';
    }

    emit('validate-status-change', validateStatus.value, validateMessage.value);

    return { valid: result.valid, error: result.error };
  } catch (error) {
    validateStatus.value = 'error';
    validateMessage.value = error instanceof Error ? error.message : String(error);

    emit('validate-status-change', validateStatus.value, validateMessage.value);

    return { valid: false, error: validateMessage.value };
  } finally {
    isValidating.value = false;
  }
}

function resetFieldMethod() {
  if (!props.prop || !formContext) return;

  setFieldValue(formContext.model, props.prop, initialValue.value);

  clearValidateMethod();
}

function clearValidateMethod() {
  validateStatus.value = '';
  validateMessage.value = '';
  emit('validate-status-change', validateStatus.value, validateMessage.value);
}

function getRules(): FormRule[] {
  const rules: FormRule[] = [];

  // 组件级规则
  if (props.rules) {
    const componentRules = Array.isArray(props.rules) ? props.rules : [props.rules];
    rules.push(...componentRules);
  }

  // 表单级规则
  if (props.prop && formContext?.rules[props.prop]) {
    const formRules = Array.isArray(formContext.rules[props.prop])
      ? (formContext.rules[props.prop] as FormRule[])
      : [formContext.rules[props.prop] as FormRule];
    rules.push(...formRules);
  }

  return rules;
}

// 暴露实例方法
defineExpose({
  validate: validateFieldMethod,
  resetField: resetFieldMethod,
  clearValidate: clearValidateMethod,
});

// 生命周期
onMounted(() => {
  if (formContext && props.prop) {
    formContext.addField(formItemContext);
    // 存储初始值
    initialValue.value = deepClone(getFieldValue(formContext.model, props.prop));
  }
});

onUnmounted(() => {
  if (formContext && props.prop) {
    formContext.removeField(formItemContext);
  }
});

// 监听验证状态变化
watch(
  () => props.validateStatus,
  newStatus => {
    if (newStatus) {
      validateStatus.value = newStatus;
    }
  }
);

// 监听错误消息变化
watch(
  () => props.error,
  newError => {
    if (newError) {
      validateStatus.value = 'error';
      validateMessage.value = newError;
    }
  }
);
</script>

<style scoped lang="scss" src="./ExFormItem.scss"></style>
