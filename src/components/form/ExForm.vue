<template>
  <form
    :class="formClasses"
    :style="formStyles"
    :name="name"
    @submit="handleSubmit"
    @reset="handleReset"
  >
    <slot />
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, provide, nextTick } from 'vue';
import type {
  ExFormProps,
  ExFormEmits,
  FormInstance,
  FormContext,
  FormItemContext,
  FormValidateResult,
  FormValidateError,
} from './types';
import { useI18n } from '../../locale';
import { logger } from '../../utils/logger';

defineOptions({
  name: 'ExForm',
});

const props = withDefaults(defineProps<ExFormProps>(), {
  layout: 'vertical',
  size: 'medium',
  labelAlign: 'left',
  labelPlacement: 'left',
  showColon: true,
  hasFeedback: false,
  disabled: false,
  readonly: false,
  validateOnRuleChange: true,
  scrollToError: true,
});

const emit = defineEmits<ExFormEmits>();

const { t: _t } = useI18n();

// 响应式状态
const fields = ref<Map<string, FormItemContext>>(new Map());
const isValidating = ref(false);

// 计算属性
const formClasses = computed(() => {
  const classes = [
    'ex-form',
    `ex-form--${props.layout}`,
    `ex-form--${props.size}`,
  ];

  if (props.disabled) classes.push('is-disabled');
  if (props.readonly) classes.push('is-readonly');
  if (props.hasFeedback) classes.push('has-feedback');
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const formStyles = computed(() => {
  return props.customStyle || {};
});

// 表单上下文
const formContext: FormContext = reactive({
  props,
  model: props.model || {},
  rules: props.rules || {},
  addField,
  removeField,
  validateField: validateFieldMethod,
  resetField: resetFieldMethod,
  clearValidate: clearValidateMethod,
});

// 提供表单上下文
provide('exFormContext', formContext);

// 方法
function addField(field: FormItemContext) {
  if (field.prop) {
    fields.value.set(field.prop, field);
  }
}

function removeField(field: FormItemContext) {
  if (field.prop) {
    fields.value.delete(field.prop);
  }
}

async function validateFieldMethod(
  prop: string,
  trigger?: string
): Promise<{ valid: boolean; error?: string }> {
  const field = fields.value.get(prop);
  if (!field) {
    return { valid: true };
  }

  return await field.validate(trigger);
}

function resetFieldMethod(prop: string) {
  const field = fields.value.get(prop);
  if (field) {
    field.resetField();
  }
}

function clearValidateMethod(prop: string) {
  const field = fields.value.get(prop);
  if (field) {
    field.clearValidate();
  }
}

// 验证整个表单
async function validate(
  callback?: (valid: boolean, errors?: FormValidateError[]) => void
): Promise<FormValidateResult> {
  if (isValidating.value) {
    return { valid: false, errors: [] };
  }

  isValidating.value = true;
  const errors: FormValidateError[] = [];

  try {
    const promises = Array.from(fields.value.entries()).map(async ([prop, field]) => {
      try {
        const result = await field.validate();
        if (!result.valid && result.error) {
          errors.push({
            field: prop,
            message: result.error,
            value: getFieldValue(prop),
          });
        }
        return result.valid;
      } catch (error) {
        logger.error(
          `An unexpected error occurred during validation for field "${prop}".`,
          error
        );
        errors.push({
          field: prop,
          message: error instanceof Error ? error.message : String(error),
          value: getFieldValue(prop),
        });
        return false;
      }
    });

    const results = await Promise.all(promises);
    const valid = results.every((result) => result);

    const result = { valid, errors };

    if (callback) {
      callback(valid, errors.length > 0 ? errors : undefined);
    }

    // 滚动到第一个错误字段
    if (!valid && props.scrollToError && errors.length > 0 && errors[0]) {
      await nextTick();
      scrollToField(errors[0].field);
    }

    return result;
  } finally {
    isValidating.value = false;
  }
}

// 验证指定字段
async function validateField(
  fieldProps: string | string[],
  callback?: (valid: boolean, errors?: FormValidateError[]) => void
): Promise<FormValidateResult> {
  const propsArray = Array.isArray(fieldProps) ? fieldProps : [fieldProps];
  const errors: FormValidateError[] = [];

  const promises = propsArray.map(async (prop) => {
    const field = fields.value.get(prop);
    if (!field) {
      return true;
    }

    try {
      const result = await field.validate();
      if (!result.valid && result.error) {
        errors.push({
          field: prop,
          message: result.error,
          value: getFieldValue(prop),
        });
      }
      return result.valid;
    } catch (error) {
      logger.error(
        `An unexpected error occurred during validation for field "${prop}".`,
        error
      );
      errors.push({
        field: prop,
        message: error instanceof Error ? error.message : String(error),
        value: getFieldValue(prop),
      });
      return false;
    }
  });

  const results = await Promise.all(promises);
  const valid = results.every((result) => result);

  const result = { valid, errors };

  if (callback) {
    callback(valid, errors.length > 0 ? errors : undefined);
  }

  return result;
}

// 重置表单字段
function resetFields(fieldProps?: string | string[]) {
  const propsArray = fieldProps
    ? Array.isArray(fieldProps)
      ? fieldProps
      : [fieldProps]
    : Array.from(fields.value.keys());

  propsArray.forEach((prop) => {
    const field = fields.value.get(prop);
    if (field) {
      field.resetField();
    }
  });
}

// 清除验证结果
function clearValidate(fieldProps?: string | string[]) {
  const propsArray = fieldProps
    ? Array.isArray(fieldProps)
      ? fieldProps
      : [fieldProps]
    : Array.from(fields.value.keys());

  propsArray.forEach((prop) => {
    const field = fields.value.get(prop);
    if (field) {
      field.clearValidate();
    }
  });
}

// 滚动到指定字段
function scrollToField(prop: string) {
  const element = document.querySelector(`[data-field="${prop}"]`);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// 获取字段值
function getFieldValue(prop: string): unknown {
  return formContext.model[prop];
}

// 设置字段值
function setFieldValue(prop: string, value: unknown) {
  if (formContext.model) {
    formContext.model[prop] = value;
    emit('field-change', prop, value);
  }
}

// 获取所有字段值
function getFieldsValue(fieldProps?: string[]): Record<string, unknown> {
  if (!formContext.model) {
    return {};
  }

  if (fieldProps) {
    const values: Record<string, unknown> = {};
    fieldProps.forEach((prop) => {
      if (prop in formContext.model) {
        values[prop] = formContext.model[prop];
      }
    });
    return values;
  }

  return { ...formContext.model };
}

// 设置多个字段值
function setFieldsValue(values: Record<string, unknown>) {
  if (formContext.model) {
    Object.keys(values).forEach((prop) => {
      formContext.model[prop] = values[prop];
      emit('field-change', prop, values[prop]);
    });
  }
}

// 事件处理
function handleSubmit(event: Event) {
  event.preventDefault();
  emit('submit', event);
}

function handleReset(event: Event) {
  resetFields();
  emit('reset', event);
}

// 暴露实例方法
const formInstance: FormInstance = {
  validate,
  validateField,
  resetFields,
  clearValidate,
  scrollToField,
  getFieldValue,
  setFieldValue,
  getFieldsValue,
  setFieldsValue,
};

defineExpose(formInstance);
</script>

<style scoped lang="scss" src="./ExForm.scss"></style>
