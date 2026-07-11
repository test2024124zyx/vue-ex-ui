<template>
  <div
    ref="groupRef"
    :class="groupClasses"
    :style="groupStyles"
    role="group"
    :aria-labelledby="hasGroupLabel ? labelId : undefined"
    :aria-describedby="ariaDescribedBy"
    :aria-required="required || undefined"
    :aria-invalid="showErrorMessage"
    :aria-disabled="disabled || undefined"
    :aria-readonly="readonly || undefined"
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
      <template v-if="options !== undefined">
        <ExCheckbox
          v-for="(option, index) in options"
          :key="`${typeof option.value}-${option.value}-${index}`"
          :value="option.value"
          :disabled="option.disabled"
        >
          <slot name="option" :option="option" :index="index">
            {{ option.label }}
          </slot>
        </ExCheckbox>
      </template>
      <slot v-else />
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
import ExCheckbox from './ExCheckbox.vue';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';
import { generateId } from '../../utils/id';
import { checkboxGroupContextKey, type CheckboxRegistration } from './context';

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
const groupId = generateId('ex-checkbox-group');
const labelId = `${groupId}-label`;
const groupRef = ref<HTMLDivElement>();
const registrations = new Map<number, CheckboxRegistration>();

// 状态
const currentErrorMessage = ref('');
const hasGroupLabel = computed(() => Boolean(props.label || slots.label));

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
};

// 返回是否接受本次切换，子组件据此恢复原生 checked 状态。
const updateValue = (value: string | number, checked: boolean): boolean => {
  if (props.disabled || props.readonly) return false;

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
    currentErrorMessage.value = '';
    return true;
  }

  for (const rule of props.rules) {
    const result = rule(value);
    if (result !== true) {
      currentErrorMessage.value = typeof result === 'string' ? result : t('common.validationError');
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
    // 父级清空 errorMessage 时同步清除，避免残留旧错误
    currentErrorMessage.value = newError || '';
  },
  { immediate: true }
);

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
  status: computed(() => props.status),
  disabled: computed(() => props.disabled),
  readonly: computed(() => props.readonly),
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
  if (props.disabled || props.readonly) return;

  const result = [...new Set(props.modelValue)];
  for (const option of getAvailableOptions()) {
    if (!option.disabled && !result.includes(option.value) && result.length < normalizedMax.value) {
      result.push(option.value);
    }
  }
  commitValue(result);
};

const uncheckAll = () => {
  if (props.disabled || props.readonly) return;

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
  if (props.disabled || props.readonly) return;

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
