<template>
  <div
    :class="formItemClasses"
    :style="formItemStyles"
    :data-field="prop"
  >
    <!-- 标签 -->
    <div
      v-if="showLabel"
      :id="formItemLabelId"
      :class="labelClasses"
      :style="labelStyles"
    >
      <span
        v-if="showRequiredMark"
        class="ex-form-item__required-mark"
        aria-hidden="true"
      >
        *
      </span>
      <span
        v-if="label"
        :class="labelTextClasses"
      >
        {{ label }}
        <span
          v-if="showColonMark"
          class="ex-form-item__colon"
        >
          :
        </span>
      </span>
      <slot name="label"></slot>
    </div>

    <!-- 内容区域 -->
    <div class="ex-form-item__content">
      <!-- 表单控件 -->
      <div class="ex-form-item__control">
        <slot></slot>

        <!-- 反馈图标 -->
        <div
          v-if="actualHasFeedback && feedbackIcon"
          :class="feedbackClasses"
        >
          <ex-icon
            :icon="feedbackIcon"
            :size="16"
          />
        </div>
      </div>

      <!-- 帮助文本 -->
      <div
        v-if="help && !displayError"
        :id="formItemMessageId"
        class="ex-form-item__help"
      >
        {{ help }}
      </div>

      <!-- 错误消息 -->
      <transition name="ex-form-item-error">
        <div
          v-if="displayError"
          :id="formItemMessageId"
          class="ex-form-item__error"
          role="alert"
          :aria-live="actualValidateStatus === 'validating' ? 'polite' : 'assertive'"
        >
          <ex-icon
            icon="error-warning-line"
            :size="14"
            class="ex-form-item__error-icon"
          />
          {{ displayError }}
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, nextTick, onMounted, onUnmounted, watch, useSlots } from 'vue';
import type {
  ExFormItemProps,
  ExFormItemEmits,
  FormItemContext,
  FormItemValidateResult,
  FormValidateStatus,
  FormRule,
} from './types';
import { validateField, getFieldValue, setFieldValue } from './utils';
import { FORM_CONTEXT_INJECTION_KEY, provideFormItem } from './use-form-item';
import ExIcon from '../icon/ExIcon.vue';
import { useI18n } from '../../locale';
import { deepClone } from '../../utils/clone';
import { generateId } from '../../utils/id';
import { useComponentSize } from '../config-provider';

defineOptions({
  name: 'ExFormItem',
});

// 可继承的展示类 prop（labelAlign / labelPlacement / size / showColon / hasFeedback）
// 一律不设默认值，保持 undefined，以便 actualXxx 计算属性按
// 「FormItem 自身 > Form 上下文 > 终值」的优先级正确回退继承 Form 的配置。
const props = withDefaults(defineProps<ExFormItemProps>(), {
  // 不设默认值：未显式传入时根据校验规则中的 required 自动推断
  required: undefined,
  // 布尔型可继承 prop 必须显式置 undefined，否则 Vue 的布尔 prop 转换会把
  // 缺省值变成 false，导致 actualXxx 的 `?? 上下文 ?? 终值` 回退失效。
  showColon: undefined,
  hasFeedback: undefined,
});

const emit = defineEmits<ExFormItemEmits>();

const slots = useSlots();
const { t } = useI18n();

// 注入表单上下文
const formContext = inject(FORM_CONTEXT_INJECTION_KEY, undefined);

// 响应式状态
const validateStatus = ref<FormValidateStatus>('');
const validateMessage = ref('');
const isValidating = ref(false);
const initialValue = ref<unknown>(undefined);
let latestValidationId = 0;
let isMounted = false;
let validationScheduled = false;
let resettingField = false;
type FieldValidationTrigger = 'blur' | 'change' | 'input';
const pendingValidationTriggers = new Set<FieldValidationTrigger>();

// 使用实例级 ID 建立标签、控件与反馈消息之间的稳定关联。
const generatedId = generateId('ex-form-item');

// 兜底：直接监听 model 中字段值的变化触发 change 校验，
// 覆盖未显式接入字段上下文的控件（含程序化赋值）
watch(
  () => (formContext && props.prop ? getFieldValue(formContext.model, props.prop) : undefined),
  () => {
    if (!formContext || !props.prop || resettingField) return;
    scheduleFieldValidation('change');
  },
  { deep: true, flush: 'sync' }
);

// 计算属性
const actualSize = useComponentSize(computed(() => props.size ?? formContext?.props?.size));

const actualLabelAlign = computed(() => {
  return props.labelAlign ?? formContext?.props?.labelAlign ?? 'left';
});

const actualLabelPlacement = computed(() => {
  if (props.labelPlacement !== undefined) {
    return props.labelPlacement;
  }

  if (formContext?.props?.labelPlacement !== undefined) {
    return formContext.props.labelPlacement;
  }

  if (!formContext) {
    return 'left';
  }

  return formContext.props.layout === 'horizontal' || formContext.props.layout === 'inline'
    ? 'left'
    : 'top';
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

  return getRules().some(rule => rule.required);
});

const showLabel = computed(() => {
  return !!(props.label || slots.label);
});

const showRequiredMark = computed(() => {
  return isRequired.value;
});

const showColonMark = computed(() => {
  return actualShowColon.value && actualLabelPlacement.value !== 'top';
});

const actualValidateStatus = computed(() => {
  if (props.validateStatus !== undefined) {
    return props.validateStatus;
  }

  return props.error ? 'error' : validateStatus.value;
});

const displayError = computed(() => {
  return props.error !== undefined
    ? props.error
    : actualValidateStatus.value === 'error'
      ? validateMessage.value
      : '';
});

const formItemLabelId = computed(() => {
  return showLabel.value ? `${generatedId}-label` : undefined;
});

const formItemMessageId = computed(() => {
  return props.help || displayError.value ? `${generatedId}-message` : undefined;
});

const formItemDisabled = computed(() => Boolean(formContext?.props?.disabled));

const formItemReadonly = computed(() => Boolean(formContext?.props?.readonly));

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
  return ['ex-form-item__label-text'];
});

const feedbackClasses = computed(() => {
  return ['ex-form-item__feedback', `ex-form-item__feedback--${actualValidateStatus.value}`];
});

// 向子表单控件提供字段上下文：同步传递校验状态、尺寸及可访问性信息。
provideFormItem({
  onFieldBlur: () => {
    if (props.prop && formContext) {
      scheduleFieldValidation('blur');
    }
  },
  onFieldChange: () => {
    if (props.prop && formContext) {
      scheduleFieldValidation('change');
    }
  },
  onFieldInput: () => {
    if (props.prop && formContext) {
      scheduleFieldValidation('input');
    }
  },
  labelId: formItemLabelId,
  describedBy: formItemMessageId,
  status: actualValidateStatus,
  errorMessage: displayError,
  size: actualSize,
  disabled: formItemDisabled,
  readonly: formItemReadonly,
});

// 表单项上下文
const formItemContext: FormItemContext = {
  get prop() {
    return props.prop || '';
  },
  props,
  get validateStatus() {
    return validateStatus.value;
  },
  get validateMessage() {
    return validateMessage.value;
  },
  validate: validateFieldMethod,
  resetField: resetFieldMethod,
  clearValidate: clearValidateMethod,
};

// 方法
function scheduleFieldValidation(trigger: FieldValidationTrigger) {
  pendingValidationTriggers.add(trigger);
  if (validationScheduled) return;

  validationScheduled = true;
  void nextTick(async () => {
    validationScheduled = false;
    const triggers = Array.from(pendingValidationTriggers);
    pendingValidationTriggers.clear();
    if (!isMounted || !props.prop || !formContext || triggers.length === 0) return;
    await validateFieldMethod(triggers);
  });
}

async function validateFieldMethod(trigger?: string | string[]): Promise<FormItemValidateResult> {
  if (!props.prop || !formContext) {
    return { valid: true };
  }

  const rules = getRules();
  if (!rules || rules.length === 0) {
    invalidateFieldValidation();
    clearValidationState();
    return { valid: true };
  }

  // 过滤触发器
  const filteredRules = trigger
    ? rules.filter(rule => {
        if (!rule.trigger) return true;
        const ruleTriggers = Array.isArray(rule.trigger) ? rule.trigger : [rule.trigger];
        const requestedTriggers = Array.isArray(trigger) ? trigger : [trigger];
        return requestedTriggers.some(item =>
          ruleTriggers.includes(item as FieldValidationTrigger)
        );
      })
    : rules;

  if (filteredRules.length === 0) {
    return { valid: true };
  }

  const validationId = ++latestValidationId;
  const value = getFieldValue(formContext.model, props.prop);

  validateStatus.value = 'validating';
  isValidating.value = true;

  try {
    const result = await validateField(filteredRules, value, props.prop, t);

    if (validationId !== latestValidationId) {
      return { valid: false, outOfDate: true };
    }

    if (result.valid) {
      validateStatus.value = 'success';
      validateMessage.value = '';
    } else {
      validateStatus.value = 'error';
      validateMessage.value = result.error || t('common.validationError');
    }

    emit('validate-status-change', validateStatus.value, validateMessage.value);

    const validationResult = { valid: result.valid, error: result.error };
    formContext.notifyFieldValidate(props.prop, validationResult);

    return validationResult;
  } catch (error) {
    if (validationId !== latestValidationId) {
      return { valid: false, outOfDate: true };
    }

    validateStatus.value = 'error';
    validateMessage.value = error instanceof Error ? error.message : String(error);

    emit('validate-status-change', validateStatus.value, validateMessage.value);

    const validationResult = { valid: false, error: validateMessage.value };
    formContext.notifyFieldValidate(props.prop, validationResult);

    return validationResult;
  } finally {
    if (validationId === latestValidationId) {
      isValidating.value = false;
    }
  }
}

function resetFieldMethod() {
  if (!props.prop || !formContext) return;

  invalidateFieldValidation();
  // 重置时复制快照，且仅屏蔽本次写入，后续同步修改仍然可以触发校验。
  resettingField = true;
  try {
    setFieldValue(formContext.model, props.prop, deepClone(initialValue.value));
  } finally {
    resettingField = false;
  }
  clearValidationState();
}

function clearValidateMethod() {
  invalidateFieldValidation();
  clearValidationState();
}

function invalidateFieldValidation() {
  latestValidationId += 1;
  isValidating.value = false;
  validationScheduled = false;
  pendingValidationTriggers.clear();
}

function clearValidationState() {
  isValidating.value = false;
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
  isMounted = true;
  if (formContext && props.prop) {
    formContext.addField(formItemContext);
    // 存储初始值
    initialValue.value = deepClone(getFieldValue(formContext.model, props.prop));
  }
});

onUnmounted(() => {
  isMounted = false;
  invalidateFieldValidation();
  if (formContext) {
    formContext.removeField(formItemContext);
  }
});

watch(
  () => props.prop,
  newProp => {
    if (!isMounted || !formContext) return;

    formContext.removeField(formItemContext);
    invalidateFieldValidation();
    clearValidationState();
    initialValue.value = newProp ? deepClone(getFieldValue(formContext.model, newProp)) : undefined;
    if (newProp) {
      formContext.addField(formItemContext);
    }
  }
);

// 监听验证状态变化
watch(
  () => props.validateStatus,
  (newStatus, oldStatus) => {
    if (newStatus !== undefined) {
      validateStatus.value = newStatus;
    } else if (oldStatus !== undefined && props.error === undefined) {
      validateStatus.value = '';
      validateMessage.value = '';
    }
  },
  { immediate: true }
);

// 监听错误消息变化
watch(
  () => props.error,
  (newError, oldError) => {
    if (newError !== undefined && newError) {
      validateStatus.value = 'error';
      validateMessage.value = newError;
    } else if (
      (newError === '' || (newError === undefined && oldError !== undefined)) &&
      props.validateStatus === undefined
    ) {
      validateStatus.value = '';
      validateMessage.value = '';
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss" src="./ExFormItem.scss"></style>
