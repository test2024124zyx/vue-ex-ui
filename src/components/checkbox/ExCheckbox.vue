<template>
  <div
    :class="wrapperClasses"
    :style="wrapperStyles"
  >
    <!-- 复选框容器 -->
    <label
      :class="checkboxClasses"
      :for="checkboxId"
    >
      <!-- 隐藏的原生复选框 -->
      <input
        v-if="checkboxGroupContext"
        :id="checkboxId"
        ref="checkboxRef"
        type="checkbox"
        :class="inputClasses"
        :checked="isChecked"
        :disabled="currentDisabled"
        :readonly="currentReadonly"
        :required="required"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="showErrorMessage"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.space.prevent="handleSpaceKey"
      >
      <input
        v-else
        :id="checkboxId"
        ref="checkboxRef"
        v-model="checkboxValue"
        type="checkbox"
        :class="inputClasses"
        :disabled="currentDisabled"
        :readonly="currentReadonly"
        :required="required"
        :true-value="trueValue"
        :false-value="falseValue"
        :aria-describedby="ariaDescribedBy"
        :aria-invalid="showErrorMessage"
        @click="handleReadonlyGuard"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.space.prevent="handleSpaceKey"
      >

      <!-- 自定义复选框外观 -->
      <span :class="checkboxBoxClasses">
        <!-- 选中状态图标 -->
        <ex-icon
          v-if="isChecked && !indeterminate"
          icon="check-line"
          class="ex-checkbox__check-icon"
          :size="iconSize"
        />
        <!-- 中间状态图标 -->
        <ex-icon
          v-else-if="indeterminate"
          icon="subtract-line"
          class="ex-checkbox__indeterminate-icon"
          :size="iconSize"
        />
      </span>

      <!-- 标签文本 -->
      <span
        v-if="hasLabel"
        class="ex-checkbox__label-text"
      >
        <slot>{{ label }}</slot>
      </span>
    </label>

    <!-- 底部信息 -->
    <div
      v-if="showBottomInfo"
      class="ex-checkbox__bottom"
    >
      <!-- 帮助文本 -->
      <div
        v-if="helpText || $slots.help"
        :id="`${checkboxId}-help`"
        class="ex-checkbox__help"
      >
        <slot name="help">
          {{ helpText }}
        </slot>
      </div>

      <!-- 错误信息 -->
      <transition name="ex-checkbox-error">
        <div
          v-if="showErrorMessage"
          :id="`${checkboxId}-error`"
          class="ex-checkbox__error"
          role="alert"
          aria-live="polite"
        >
          <ex-icon
            icon="error-warning-line"
            :size="14"
            class="ex-checkbox__error-icon"
          />
          <slot name="error">
            {{ currentErrorMessage }}
          </slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch, useSlots, inject } from 'vue';
import type {
  ExCheckboxProps,
  ExCheckboxEmits,
  ExCheckboxSlots,
  ExCheckboxInstance,
} from './types';
import ExIcon from '../icon/ExIcon.vue';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';
import { generateId } from '../../utils/id';
import { useFormItem } from '../form/use-form-item';

defineOptions({
  name: 'ExCheckbox',
});

const props = withDefaults(defineProps<ExCheckboxProps>(), {
  size: undefined,
  status: 'default',
  trueValue: true,
  falseValue: false,
  disabled: false,
  readonly: false,
  indeterminate: false,
  required: false,
});

const emit = defineEmits<ExCheckboxEmits>();

defineSlots<ExCheckboxSlots>();

// 获取slots和国际化
const slots = useSlots();
const { t } = useI18n();

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// 所在 FormItem 的字段上下文（用于 blur 自动校验）
const formItem = useFormItem();

// 注入 CheckboxGroup 上下文（如果存在）
const checkboxGroupContext = inject<{
  modelValue: import('vue').ComputedRef<Array<string | number>>;
  name?: string;
  size?: string;
  status?: string;
  disabled?: boolean;
  readonly?: boolean;
  updateValue: (value: string | number, checked: boolean) => void;
} | null>('checkboxGroup', null);

// 生成唯一ID
const checkboxId = generateId('ex-checkbox');

// 引用
const checkboxRef = ref<HTMLInputElement>();

// 状态
const isFocused = ref(false);
const currentErrorMessage = ref('');

// 计算属性
const checkboxValue = computed({
  get: () => {
    if (checkboxGroupContext && props.value !== undefined) {
      const isIncluded = checkboxGroupContext.modelValue.value.includes(props.value);
      return isIncluded;
    }
    return props.modelValue;
  },
  set: checked => {
    if (checkboxGroupContext && props.value !== undefined) {
      checkboxGroupContext.updateValue(props.value, checked as boolean);
    } else if (checked !== undefined) {
      emit('update:modelValue', checked);
    }
  },
});

const isChecked = computed(() => {
  if (checkboxGroupContext && props.value !== undefined) {
    return checkboxGroupContext.modelValue.value.includes(props.value);
  }
  return checkboxValue.value === props.trueValue;
});

const hasLabel = computed(() => {
  return Boolean(props.label || slots.default);
});

const currentSize = computed(() => {
  // 优先级：组件自己的 size prop > CheckboxGroup 的 size > ConfigProvider 的 size
  if (props.size) {
    return props.size;
  }
  return checkboxGroupContext?.size || componentSize.value;
});

const currentStatus = computed(() => {
  return checkboxGroupContext?.status || props.status;
});

const currentDisabled = computed(() => {
  return checkboxGroupContext?.disabled || props.disabled;
});

const currentReadonly = computed(() => {
  return checkboxGroupContext?.readonly || props.readonly;
});

const iconSize = computed(() => {
  const sizeMap = {
    small: 12,
    medium: 14,
    large: 16,
  };
  return sizeMap[currentSize.value as keyof typeof sizeMap] || 14;
});

// 样式类
const wrapperClasses = computed(() => {
  const classes = ['ex-checkbox'];

  if (currentSize.value) classes.push(`ex-checkbox--${currentSize.value}`);
  if (currentStatus.value) classes.push(`ex-checkbox--${currentStatus.value}`);
  if (currentDisabled.value) classes.push('ex-checkbox--disabled');
  if (currentReadonly.value) classes.push('ex-checkbox--readonly');
  if (isFocused.value) classes.push('ex-checkbox--focused');
  if (isChecked.value) classes.push('ex-checkbox--checked');
  if (props.indeterminate) classes.push('ex-checkbox--indeterminate');
  if (currentStatus.value === 'error' || showErrorMessage.value) {
    classes.push('ex-checkbox--error');
  }
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const checkboxClasses = computed(() => {
  const classes = ['ex-checkbox__wrapper'];
  if (currentDisabled.value) classes.push('ex-checkbox__wrapper--disabled');
  return classes;
});

const inputClasses = computed(() => {
  return ['ex-checkbox__input'];
});

const checkboxBoxClasses = computed(() => {
  const classes = ['ex-checkbox__box'];

  if (isChecked.value) classes.push('ex-checkbox__box--checked');
  if (props.indeterminate) classes.push('ex-checkbox__box--indeterminate');
  if (currentDisabled.value) classes.push('ex-checkbox__box--disabled');

  return classes;
});

const wrapperStyles = computed(() => {
  return props.customStyle || {};
});

// 显示状态
const showErrorMessage = computed(() => {
  return Boolean(currentErrorMessage.value) || currentStatus.value === 'error';
});

const showBottomInfo = computed(() => {
  return props.helpText || slots.help || showErrorMessage.value;
});

const ariaDescribedBy = computed(() => {
  const ids: string[] = [];

  if (props.helpText || slots.help) {
    ids.push(`${checkboxId}-help`);
  }

  if (showErrorMessage.value) {
    ids.push(`${checkboxId}-error`);
  }

  return ids.length > 0 ? ids.join(' ') : undefined;
});

// 只读/禁用时拦截点击的默认切换行为（独立模式用 v-model 时 change 守卫为时已晚）
const handleReadonlyGuard = (event: MouseEvent) => {
  if (currentDisabled.value || currentReadonly.value) {
    event.preventDefault();
  }
};

// 事件处理
const handleChange = (event: Event) => {
  if (currentDisabled.value || currentReadonly.value) {
    event.preventDefault();
    return;
  }

  const target = event.target as HTMLInputElement;

  if (checkboxGroupContext && props.value !== undefined) {
    // CheckboxGroup 模式
    checkboxGroupContext.updateValue(props.value, target.checked);
  } else {
    // 独立模式
    const value = target.checked ? props.trueValue : props.falseValue;

    // 验证
    validateCheckbox(value);

    emit('change', value, event);
  }
};

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true;
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false;
  emit('blur', event);
  formItem?.onFieldBlur();
};

// 空格键切换：preventDefault 阻止原生切换后手动更新，
// 并补发 change（与点击路径行为一致，含验证）
const handleSpaceKey = (event: KeyboardEvent) => {
  if (currentDisabled.value || currentReadonly.value) return;

  const newChecked = !isChecked.value;
  if (checkboxGroupContext && props.value !== undefined) {
    checkboxGroupContext.updateValue(props.value, newChecked);
  } else {
    const value = newChecked ? props.trueValue : props.falseValue;
    emit('update:modelValue', value);
    validateCheckbox(value);
    emit('change', value, event);
  }
};

// 验证复选框
const validateCheckbox = (value: boolean | string | number) => {
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

// 暴露方法
const focus = () => {
  checkboxRef.value?.focus();
};

const blur = () => {
  checkboxRef.value?.blur();
};

const getCheckboxElement = () => {
  return checkboxRef.value || null;
};

defineExpose<ExCheckboxInstance>({
  focus,
  blur,
  getCheckboxElement,
});
</script>

<style scoped lang="scss" src="./ExCheckbox.scss"></style>
