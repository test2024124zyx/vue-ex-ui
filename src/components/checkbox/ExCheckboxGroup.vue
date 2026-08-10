<template>
  <div
    :id="groupId"
    ref="groupRef"
    :class="groupClasses"
    :style="groupStyles"
    role="group"
    :aria-label="props.ariaLabel || undefined"
    :aria-labelledby="ariaLabelledBy"
    :aria-describedby="ariaDescribedBy"
    :aria-required="props.required || undefined"
    :aria-invalid="hasErrorState || undefined"
    :aria-disabled="currentDisabled || undefined"
    :aria-readonly="currentReadonly || undefined"
  >
    <!-- 标签 -->
    <div
      v-if="props.label || $slots.label"
      :id="labelId"
      class="ex-checkbox-group__label"
    >
      <slot name="label">
        {{ props.label }}
        <span
          v-if="props.required"
          class="ex-checkbox-group__required"
        >
          *
        </span>
      </slot>
    </div>

    <!-- 复选框容器 -->
    <div class="ex-checkbox-group__content">
      <template v-if="props.options !== undefined">
        <ExCheckbox
          v-for="(option, index) in props.options"
          :key="`${typeof option.value}-${option.value}-${index}`"
          :value="option.value"
          :disabled="option.disabled"
        >
          <slot
            name="option"
            :option="option"
            :index="index"
          >
            {{ option.label }}
          </slot>
        </ExCheckbox>
      </template>
      <slot v-else></slot>
    </div>

    <!-- 底部信息 -->
    <div
      v-if="showBottomInfo"
      class="ex-checkbox-group__bottom"
    >
      <!-- 帮助文本 -->
      <div
        v-if="props.helpText || $slots.help"
        :id="`${groupId}-help`"
        class="ex-checkbox-group__help"
      >
        <slot name="help">
          {{ props.helpText }}
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
          <ex-icon
            icon="error-warning-line"
            :size="14"
            class="ex-checkbox-group__error-icon"
          />
          <slot name="error">
            {{ currentErrorMessage }}
          </slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, provide, useSlots } from 'vue';
import type {
  ExCheckboxGroupProps,
  ExCheckboxGroupEmits,
  ExCheckboxGroupSlots,
  ExCheckboxGroupInstance,
} from './types';
import ExIcon from '../icon/ExIcon.vue';
import ExCheckbox from './ExCheckbox.vue';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';
import { generateId } from '../../utils/id';
import { checkboxGroupContextKey, type CheckboxRegistration } from './context';
import { useFormItem } from '../form/use-form-item';

defineOptions({
  name: 'ExCheckboxGroup',
});

const props = withDefaults(defineProps<ExCheckboxGroupProps>(), {
  modelValue: () => [],
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  status: undefined,
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

// 所在 FormItem 的字段上下文，同时承接尺寸、状态和表单校验语义。
const formItem = useFormItem();

// 使用全局尺寸配置；组件显式尺寸和 FormItem 尺寸高于全局默认值。
const componentSize = useComponentSize(computed(() => props.size ?? formItem?.size?.value));

// 生成唯一 ID；显式 id 用于外部关联和自动化测试。
const generatedGroupId = generateId('ex-checkbox-group');
const groupId = computed(() => props.id?.trim() || generatedGroupId);
const labelId = computed(() => `${groupId.value}-label`);
const groupRef = ref<HTMLDivElement>();
const registrations = new Map<number, CheckboxRegistration>();

// 状态
const validationErrorMessage = ref('');
const hasGroupLabel = computed(() => Boolean(props.label || slots.label));

// 计算属性
const currentStatus = computed(() => {
  const formStatus = formItem?.status?.value;

  return (
    props.status ??
    (formStatus === 'success' || formStatus === 'warning' || formStatus === 'error'
      ? formStatus
      : undefined) ??
    'default'
  );
});

const currentDisabled = computed(() => {
  return Boolean(props.disabled || formItem?.disabled?.value);
});

const currentReadonly = computed(() => {
  return Boolean(props.readonly || formItem?.readonly?.value);
});

const currentShape = computed(() => props.shape ?? 'square');

const currentErrorMessage = computed(() => {
  return (
    validationErrorMessage.value ||
    props.errorMessage?.trim() ||
    formItem?.errorMessage?.value ||
    ''
  );
});

const hasErrorState = computed(() => {
  return currentStatus.value === 'error' || Boolean(currentErrorMessage.value);
});

const showErrorMessage = computed(() => {
  return hasErrorState.value && (Boolean(currentErrorMessage.value) || Boolean(slots.error));
});

const showBottomInfo = computed(() => {
  return props.helpText || slots.help || showErrorMessage.value;
});

const ariaDescribedBy = computed(() => {
  const ids = new Set<string>();
  const addIds = (value: string | undefined) => {
    value
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .forEach(id => ids.add(id));
  };

  addIds(props.ariaDescribedby);
  addIds(formItem?.describedBy?.value);
  if (props.helpText || slots.help) addIds(`${groupId.value}-help`);
  if (showErrorMessage.value) addIds(`${groupId.value}-error`);

  return ids.size > 0 ? Array.from(ids).join(' ') : undefined;
});

const ariaLabelledBy = computed(() => {
  if (props.ariaLabelledby) return props.ariaLabelledby;
  if (hasGroupLabel.value) return labelId.value;
  if (!props.ariaLabel) return formItem?.labelId?.value;
  return undefined;
});

// 样式类
const groupClasses = computed(() => {
  const classes = ['ex-checkbox-group'];

  if (componentSize.value) classes.push(`ex-checkbox-group--${componentSize.value}`);
  if (currentShape.value === 'circle') classes.push('ex-checkbox-group--circle');
  if (currentStatus.value) classes.push(`ex-checkbox-group--${currentStatus.value}`);
  if (currentDisabled.value) classes.push('ex-checkbox-group--disabled');
  if (currentReadonly.value) classes.push('ex-checkbox-group--readonly');
  if (props.vertical) classes.push('ex-checkbox-group--vertical');
  if (hasErrorState.value) {
    classes.push('ex-checkbox-group--error');
  }
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const groupStyles = computed(() => {
  return props.customStyle || {};
});

const normalizedMin = computed(() => {
  if (props.min === undefined || !Number.isFinite(props.min)) return 0;
  return Math.max(0, Math.trunc(props.min));
});

const normalizedMax = computed(() => {
  if (props.max === undefined || !Number.isFinite(props.max)) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.trunc(props.max));
});

const commitValue = (value: Array<string | number>) => {
  const uniqueValue = [...new Set(value)];
  validateGroup(uniqueValue);
  emit('update:modelValue', uniqueValue);
  emit('change', uniqueValue);
  formItem?.onFieldChange();
};

// 返回是否接受本次切换，子组件据此恢复原生 checked 状态。
const updateValue = (value: string | number, checked: boolean): boolean => {
  if (currentDisabled.value || currentReadonly.value) return false;

  const newValue = [...props.modelValue];
  const index = newValue.indexOf(value);

  if (checked && index === -1) {
    // 检查最大选择数量
    if (newValue.length >= normalizedMax.value) {
      return false;
    }
    newValue.push(value);
  } else if (!checked && index > -1) {
    // 检查最小选择数量
    if (newValue.length <= normalizedMin.value) {
      return false;
    }
    newValue.splice(index, 1);
  } else {
    return true;
  }

  commitValue(newValue);
  return true;
};

// 验证复选框组
const validateGroup = (value: Array<string | number>) => {
  if (!props.rules || props.rules.length === 0) {
    validationErrorMessage.value = '';
    return true;
  }

  for (const rule of props.rules) {
    const result = rule(value);
    if (result !== true) {
      validationErrorMessage.value =
        typeof result === 'string' ? result : t('common.validationError');
      return false;
    }
  }

  validationErrorMessage.value = '';
  return true;
};

// 提供上下文给子 Checkbox 组件。
// size/status/disabled/readonly 用 getter 暴露，确保子组件读取时建立
// 响应式依赖——Group 运行时改变这些属性能正确传播到所有子项。
const registerCheckbox = (uid: number, registration: CheckboxRegistration) => {
  registrations.set(uid, registration);
};

const unregisterCheckbox = (uid: number) => {
  registrations.delete(uid);
};

provide(checkboxGroupContextKey, {
  modelValue: computed(() => props.modelValue),
  name: computed(() => props.name),
  size: componentSize,
  shape: currentShape,
  status: currentStatus,
  disabled: currentDisabled,
  readonly: currentReadonly,
  updateValue,
  registerCheckbox,
  unregisterCheckbox,
});

const getAvailableOptions = () => {
  if (props.options !== undefined) return props.options;

  return Array.from(registrations.values())
    .map(registration => {
      const value = registration.getValue();
      return value === undefined
        ? null
        : { value, label: String(value), disabled: registration.isDisabled() };
    })
    .filter((option): option is NonNullable<typeof option> => option !== null);
};

// 暴露方法
const checkAll = () => {
  if (currentDisabled.value || currentReadonly.value) return;

  const result = [...new Set(props.modelValue)];
  for (const option of getAvailableOptions()) {
    if (!option.disabled && !result.includes(option.value) && result.length < normalizedMax.value) {
      result.push(option.value);
    }
  }
  commitValue(result);
};

const uncheckAll = () => {
  if (currentDisabled.value || currentReadonly.value) return;

  const options = getAvailableOptions();
  const disabledValues = new Set(
    options.filter(option => option.disabled).map(option => option.value)
  );
  const result = props.modelValue.filter(value => disabledValues.has(value));

  for (const value of props.modelValue) {
    if (result.length >= normalizedMin.value) break;
    if (!result.includes(value)) result.push(value);
  }
  commitValue(result);
};

const toggleAll = () => {
  if (currentDisabled.value || currentReadonly.value) return;

  const enabledValues = getAvailableOptions()
    .filter(option => !option.disabled)
    .map(option => option.value);
  const allEnabledChecked =
    enabledValues.length > 0 && enabledValues.every(value => props.modelValue.includes(value));

  if (allEnabledChecked) uncheckAll();
  else checkAll();
};

const getCheckboxGroupElement = () => {
  return groupRef.value || null;
};

defineExpose<ExCheckboxGroupInstance>({
  checkAll,
  uncheckAll,
  toggleAll,
  getCheckboxGroupElement,
});
</script>

<style scoped lang="scss" src="./ExCheckboxGroup.scss"></style>
