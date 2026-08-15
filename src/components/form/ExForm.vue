<template>
  <form
    ref="formRef"
    :class="formClasses"
    :style="formStyles"
    :name="name"
    :aria-busy="isValidating ? 'true' : undefined"
    :aria-disabled="props.disabled ? 'true' : undefined"
    @submit="handleSubmit"
    @reset="handleReset"
  >
    <slot></slot>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, provide, nextTick, watch } from 'vue';
import type {
  ExFormProps,
  ExFormEmits,
  FormInstance,
  FormContext,
  FormItemContext,
  FormItemValidateResult,
  FormValidateResult,
  FormValidateError,
} from './types';
import { useI18n } from '../../locale';
import { logger } from '../../utils/logger';
import { getFieldValue as getModelValue, setFieldValue as setModelValue } from './utils';
import { FORM_CONTEXT_INJECTION_KEY } from './use-form-item';
import { useComponentSize } from '../config-provider';

defineOptions({
  name: 'ExForm',
});

const props = withDefaults(defineProps<ExFormProps>(), {
  layout: 'vertical',
  labelAlign: 'left',
  showColon: true,
  hasFeedback: false,
  disabled: false,
  readonly: false,
  validateOnRuleChange: true,
  scrollToError: true,
  focusToError: true,
});

const emit = defineEmits<ExFormEmits>();

const { t } = useI18n();

// 统一错误字段的滚动行为，避免在多个调用点重复硬编码配置。
const DEFAULT_SCROLL_OPTIONS = {
  behavior: 'smooth',
  block: 'center',
} as const;
const FOCUSABLE_FIELD_SELECTOR =
  'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [role="combobox"], [tabindex]:not([tabindex="-1"])';

// 响应式状态
const formRef = ref<HTMLFormElement>();
const fields = new Map<string, FormItemContext[]>();
const isValidating = ref(false);
let latestValidationId = 0;
const componentSize = useComponentSize(computed(() => props.size));

// 计算属性
const formClasses = computed(() => {
  const classes = ['ex-form', `ex-form--${props.layout}`, `ex-form--${componentSize.value}`];

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
  notifyFieldValidate,
  resetField: resetFieldMethod,
  clearValidate: clearValidateMethod,
});

// 提供表单上下文
provide(FORM_CONTEXT_INJECTION_KEY, formContext);

// 同步 model / rules 引用：父级整体替换 model 或 rules 对象时，
// 上下文需指向最新引用，否则 FormItem 取值/取规则会用到旧对象。
watch(
  () => props.model,
  newModel => {
    formContext.model = newModel || {};
  }
);

watch(
  () => props.rules,
  newRules => {
    formContext.rules = newRules || {};
    // validateOnRuleChange：规则变化后重新校验已注册字段（不滚动）
    if (props.validateOnRuleChange) {
      fields.forEach(fieldGroup => {
        fieldGroup.forEach(field => {
          void field.validate();
        });
      });
    }
  },
  { deep: true }
);

// 方法
function addField(field: FormItemContext) {
  if (field.prop) {
    const fieldGroup = fields.get(field.prop) || [];
    if (!fieldGroup.includes(field)) {
      fieldGroup.push(field);
      fields.set(field.prop, fieldGroup);
    }
  }
}

function removeField(field: FormItemContext) {
  fields.forEach((fieldGroup, prop) => {
    const index = fieldGroup.indexOf(field);
    if (index < 0) return;

    fieldGroup.splice(index, 1);
    if (fieldGroup.length === 0) {
      fields.delete(prop);
    }
  });
}

async function validateFieldMethod(
  prop: string,
  trigger?: string
): Promise<FormItemValidateResult> {
  const fieldGroup = fields.get(prop) || [];
  if (fieldGroup.length === 0) {
    return { valid: true };
  }

  const results = await Promise.all(fieldGroup.map(field => field.validate(trigger)));
  if (results.some(result => result.outOfDate)) {
    return { valid: false, outOfDate: true };
  }

  const firstError = results.find(result => !result.valid);
  return firstError || { valid: true };
}

// 将 FormItem 的验证结果转换为 Form 对外统一的字段验证事件。
function notifyFieldValidate(prop: string, result: FormItemValidateResult) {
  const errors = result.valid
    ? []
    : [
        {
          field: prop,
          message: result.error || t('common.validationError'),
          value: getFieldValue(prop),
        },
      ];

  emit('field-validate', prop, { valid: result.valid, errors });
}

function resetFieldMethod(prop: string) {
  invalidateFormValidation();
  fields.get(prop)?.forEach(field => field.resetField());
}

function clearValidateMethod(prop: string) {
  invalidateFormValidation();
  fields.get(prop)?.forEach(field => field.clearValidate());
}

function invalidateFormValidation() {
  latestValidationId += 1;
  isValidating.value = false;
}

// 验证整个表单
async function validate(
  callback?: (valid: boolean, errors?: FormValidateError[]) => void
): Promise<FormValidateResult> {
  const validationId = ++latestValidationId;
  isValidating.value = true;

  try {
    const results = await Promise.all(
      Array.from(fields.entries()).flatMap(([prop, fieldGroup]) =>
        fieldGroup.map(async field => {
          try {
            const result = await field.validate();
            return { prop, result };
          } catch (error) {
            logger.error(
              `An unexpected error occurred during validation for field "${prop}".`,
              error
            );
            return {
              prop,
              result: {
                valid: false,
                error: error instanceof Error ? error.message : String(error),
              },
            } satisfies { prop: string; result: FormItemValidateResult };
          }
        })
      )
    );

    if (validationId !== latestValidationId) {
      return { valid: false, errors: [], outOfDate: true };
    }

    if (results.some(({ result }) => result.outOfDate)) {
      return { valid: false, errors: [], outOfDate: true };
    }

    const errors = results
      .filter(({ result }) => !result.valid)
      .map(({ prop, result }) => createValidationError(prop, result.error));
    const valid = results.every(({ result }) => result.valid);
    const result = { valid, errors };

    if (callback) {
      callback(valid, errors.length > 0 ? errors : undefined);
    }

    // 滚动到第一个错误字段，并将键盘焦点交给对应控件。
    if (!valid && props.scrollToError && errors.length > 0 && errors[0]) {
      await nextTick();
      scrollToField(errors[0].field);
      if (props.focusToError) {
        focusField(errors[0].field);
      }
    }

    return result;
  } finally {
    if (validationId === latestValidationId) {
      isValidating.value = false;
    }
  }
}

// 验证指定字段
async function validateField(
  fieldProps: string | string[],
  callback?: (valid: boolean, errors?: FormValidateError[]) => void
): Promise<FormValidateResult> {
  const validationId = ++latestValidationId;
  const propsArray = Array.isArray(fieldProps) ? fieldProps : [fieldProps];
  isValidating.value = true;

  try {
    const entries: Array<{ prop: string; field?: FormItemContext }> = [];
    propsArray.forEach(prop => {
      const fieldGroup = fields.get(prop) || [];
      if (fieldGroup.length === 0) {
        entries.push({ prop });
      } else {
        fieldGroup.forEach(field => entries.push({ prop, field }));
      }
    });
    const results = await Promise.all(
      entries.map(async ({ prop, field }) => {
        if (!field) return { prop, result: { valid: true } satisfies FormItemValidateResult };
        try {
          const result = await field.validate();
          return { prop, result };
        } catch (error) {
          logger.error(
            `An unexpected error occurred during validation for field "${prop}".`,
            error
          );
          return {
            prop,
            result: {
              valid: false,
              error: error instanceof Error ? error.message : String(error),
            },
          } satisfies { prop: string; result: FormItemValidateResult };
        }
      })
    );

    if (validationId !== latestValidationId) {
      return { valid: false, errors: [], outOfDate: true };
    }

    if (results.some(({ result }) => result.outOfDate)) {
      return { valid: false, errors: [], outOfDate: true };
    }

    const errors = results
      .filter(({ result }) => !result.valid)
      .map(({ prop, result }) => createValidationError(prop, result.error));
    const valid = results.every(({ result }) => result.valid);
    const result = { valid, errors };

    if (callback) {
      callback(valid, errors.length > 0 ? errors : undefined);
    }

    return result;
  } finally {
    if (validationId === latestValidationId) {
      isValidating.value = false;
    }
  }
}

function createValidationError(prop: string, message?: string): FormValidateError {
  return {
    field: prop,
    message: message || t('common.validationError'),
    value: getFieldValue(prop),
  };
}

function findFieldElement(prop: string): HTMLElement | null {
  const root = formRef.value;
  const candidates = root
    ? Array.from(root.querySelectorAll<HTMLElement>('[data-field]'))
    : typeof document === 'undefined'
      ? []
      : Array.from(document.querySelectorAll<HTMLElement>('[data-field]'));

  return candidates.find(element => element.getAttribute('data-field') === prop) || null;
}

// 滚动到指定字段（限定在当前表单根节点内，避免多个表单同名 prop 互相干扰）。
function scrollToField(prop: string, options?: ExFormProps['scrollIntoViewOptions']) {
  const element = findFieldElement(prop);
  if (!element || options === false) {
    return;
  }

  const scrollOptions =
    options === true || options === undefined ? DEFAULT_SCROLL_OPTIONS : options;
  if (typeof element.scrollIntoView === 'function') {
    element.scrollIntoView(scrollOptions);
  }
}

function focusField(prop: string) {
  const element = findFieldElement(prop);
  const target = element?.querySelector<HTMLElement>(FOCUSABLE_FIELD_SELECTOR) || element;
  if (!target || typeof target.focus !== 'function') {
    return;
  }

  try {
    target.focus({ preventScroll: true });
  } catch {
    target.focus();
  }
}

// 重置表单字段
function resetFields(fieldProps?: string | string[]) {
  const propsArray = fieldProps
    ? Array.isArray(fieldProps)
      ? fieldProps
      : [fieldProps]
    : Array.from(fields.keys());

  invalidateFormValidation();

  propsArray.forEach(prop => {
    fields.get(prop)?.forEach(field => field.resetField());
  });
}

// 清除验证结果
function clearValidate(fieldProps?: string | string[]) {
  const propsArray = fieldProps
    ? Array.isArray(fieldProps)
      ? fieldProps
      : [fieldProps]
    : Array.from(fields.keys());

  invalidateFormValidation();

  propsArray.forEach(prop => {
    fields.get(prop)?.forEach(field => field.clearValidate());
  });
}

// 获取字段值（支持 a.b.c 嵌套路径）
function getFieldValue(prop: string): unknown {
  return getModelValue(formContext.model, prop);
}

// 设置字段值（支持 a.b.c 嵌套路径）
function setFieldValue(prop: string, value: unknown) {
  if (formContext.model) {
    setModelValue(formContext.model, prop, value);
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
    fieldProps.forEach(prop => {
      values[prop] = getModelValue(formContext.model, prop);
    });
    return values;
  }

  return { ...formContext.model };
}

// 设置多个字段值（支持 a.b.c 嵌套路径）
function setFieldsValue(values: Record<string, unknown>) {
  if (formContext.model) {
    Object.keys(values).forEach(prop => {
      setModelValue(formContext.model, prop, values[prop]);
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
