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
        v-if="checkboxGroupContext && props.value !== undefined"
        :id="checkboxId"
        ref="checkboxRef"
        type="checkbox"
        :class="inputClasses"
        :checked="nativeChecked"
        :disabled="currentDisabled"
        :aria-disabled="currentDisabled || undefined"
        :readonly="currentReadonly"
        :name="currentName"
        :value="props.value ?? undefined"
        :tabindex="props.tabindex"
        :required="props.required"
        :aria-label="props.ariaLabel"
        :aria-labelledby="ariaLabelledBy"
        :aria-describedby="ariaDescribedBy"
        :aria-controls="isIndeterminate ? props.ariaControls : undefined"
        :aria-invalid="ariaInvalid"
        :aria-readonly="currentReadonly || undefined"
        @click="handleReadonlyGuard"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.space.prevent="handleSpaceKey"
      />
      <input
        v-else
        :id="checkboxId"
        ref="checkboxRef"
        :checked="nativeChecked"
        type="checkbox"
        :class="inputClasses"
        :disabled="currentDisabled"
        :aria-disabled="currentDisabled || undefined"
        :readonly="currentReadonly"
        :name="currentName"
        :value="props.value ?? undefined"
        :tabindex="props.tabindex"
        :required="props.required"
        :aria-label="props.ariaLabel"
        :aria-labelledby="ariaLabelledBy"
        :aria-describedby="ariaDescribedBy"
        :aria-controls="isIndeterminate ? props.ariaControls : undefined"
        :aria-invalid="ariaInvalid"
        :aria-readonly="currentReadonly || undefined"
        @click="handleReadonlyGuard"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.space.prevent="handleSpaceKey"
      />

      <!-- 自定义复选框外观 -->
      <span
        :class="checkboxBoxClasses"
        aria-hidden="true"
      >
        <!-- 选中状态图标 -->
        <ex-icon
          v-if="isChecked && !isIndeterminate"
          icon="check-line"
          class="ex-checkbox__check-icon"
          :size="iconSize"
        />
        <!-- 中间状态图标 -->
        <ex-icon
          v-else-if="isIndeterminate"
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
        <slot name="label">
          <slot>{{ props.label }}</slot>
        </slot>
      </span>
    </label>

    <!-- 底部信息 -->
    <div
      v-if="showBottomInfo"
      class="ex-checkbox__bottom"
    >
      <!-- 帮助文本 -->
      <div
        v-if="props.helpText || $slots.help"
        :id="`${checkboxId}-help`"
        class="ex-checkbox__help"
      >
        <slot name="help">
          {{ props.helpText }}
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
import {
  computed,
  ref,
  watch,
  useSlots,
  inject,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  nextTick,
} from 'vue';
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
import { checkboxGroupContextKey } from './context';

defineOptions({
  name: 'ExCheckbox',
});

const props = withDefaults(defineProps<ExCheckboxProps>(), {
  modelValue: false,
  size: undefined,
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

// 所在 FormItem 的字段上下文，同时承接尺寸、状态和表单校验语义。
const formItem = useFormItem();

// 使用全局尺寸配置；组件显式尺寸和 FormItem 尺寸均高于全局默认值。
const componentSize = useComponentSize(computed(() => props.size ?? formItem?.size?.value));

// 注入 CheckboxGroup 上下文（如果存在）
const checkboxGroupContext = inject(checkboxGroupContextKey, null);
const instance = getCurrentInstance();

// 生成唯一 ID；显式 id 用于表单关联和自动化测试，未提供时保持实例唯一。
const generatedCheckboxId = generateId('ex-checkbox');
const checkboxId = computed(() => props.id?.trim() || generatedCheckboxId);

// 引用
const checkboxRef = ref<HTMLInputElement>();

// 状态
const isFocused = ref(false);
const validationErrorMessage = ref('');
watch(
  () => formItem?.resetRevision?.value,
  () => {
    validationErrorMessage.value = '';
  },
  { flush: 'post' }
);
const isIndeterminate = ref(props.indeterminate);

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

// 原生 checked 只反映真实值；半选状态单独管理，避免把 mixed 错误地当成选中。
const nativeChecked = computed(() => {
  if (checkboxGroupContext && props.value !== undefined) {
    return checkboxGroupContext.modelValue.value.includes(props.value);
  }
  return checkboxValue.value === props.trueValue;
});

const isChecked = computed(() => !isIndeterminate.value && nativeChecked.value);

const hasLabel = computed(() => {
  return Boolean(props.label || slots.default || slots.label);
});

const currentSize = computed(() => {
  // 优先级：组件自己的 size prop > CheckboxGroup 的 size > ConfigProvider 的 size
  if (props.size) {
    return props.size;
  }
  return checkboxGroupContext?.size.value || componentSize.value;
});

const currentShape = computed(() => {
  // 优先级：组件自己的 shape prop > CheckboxGroup 的 shape > 默认方形
  return props.shape ?? checkboxGroupContext?.shape.value ?? 'square';
});

const currentStatus = computed(() => {
  const formStatus = formItem?.status?.value;

  return (
    props.status ??
    checkboxGroupContext?.status.value ??
    (formStatus === 'success' || formStatus === 'warning' || formStatus === 'error'
      ? formStatus
      : undefined) ??
    'default'
  );
});

const currentDisabled = computed(() => {
  return Boolean(
    checkboxGroupContext?.disabled.value || props.disabled || formItem?.disabled?.value
  );
});

const currentReadonly = computed(() => {
  return Boolean(
    checkboxGroupContext?.readonly.value || props.readonly || formItem?.readonly?.value
  );
});

const currentName = computed(() => checkboxGroupContext?.name.value ?? props.name);

// 合并外部、FormItem 和组件内部生成的 ARIA ID，避免覆盖调用方已经提供的描述。
const mergeAriaIds = (...values: Array<string | undefined>) => {
  const ids = new Set<string>();

  values.forEach(value => {
    value
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .forEach(id => ids.add(id));
  });

  return ids.size > 0 ? Array.from(ids).join(' ') : undefined;
};

const ariaLabelledBy = computed(() => {
  if (props.ariaLabelledby) return props.ariaLabelledby;
  if (!props.ariaLabel && !hasLabel.value) return formItem?.labelId?.value;
  return undefined;
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
  if (currentShape.value === 'circle') classes.push('ex-checkbox--circle');
  if (currentStatus.value) classes.push(`ex-checkbox--${currentStatus.value}`);
  if (currentDisabled.value) classes.push('ex-checkbox--disabled');
  if (currentReadonly.value) classes.push('ex-checkbox--readonly');
  if (isFocused.value) classes.push('ex-checkbox--focused');
  if (isChecked.value) classes.push('ex-checkbox--checked');
  if (!hasLabel.value) classes.push('ex-checkbox--no-label');
  if (isIndeterminate.value) classes.push('ex-checkbox--indeterminate');
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
  if (isIndeterminate.value) classes.push('ex-checkbox__box--indeterminate');
  if (currentDisabled.value) classes.push('ex-checkbox__box--disabled');

  return classes;
});

const wrapperStyles = computed(() => {
  return props.customStyle || {};
});

// 显示状态
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

const ariaInvalid = computed(() => (hasErrorState.value ? true : undefined));

const showBottomInfo = computed(() => {
  return props.helpText || slots.help || showErrorMessage.value;
});

const ariaDescribedBy = computed(() => {
  return mergeAriaIds(
    props.ariaDescribedby,
    formItem?.describedBy?.value,
    props.helpText || slots.help ? `${checkboxId.value}-help` : undefined,
    showErrorMessage.value ? `${checkboxId.value}-error` : undefined
  );
});

// 可选项模式需要注册当前实例，以便全选/取消全选正确跳过禁用项。
if (checkboxGroupContext && instance) {
  checkboxGroupContext.registerCheckbox(instance.uid, {
    getValue: () => props.value,
    isDisabled: () => currentDisabled.value,
  });

  onBeforeUnmount(() => {
    checkboxGroupContext.unregisterCheckbox(instance.uid);
  });
}

// 只读/禁用时拦截点击的默认切换行为（独立模式用 v-model 时 change 守卫为时已晚）
const handleReadonlyGuard = (event: MouseEvent) => {
  if (currentDisabled.value || currentReadonly.value) {
    event.preventDefault();
  }
};

// 用户第一次操作半选复选框时，按原生语义进入明确的选中或未选中状态。
const clearIndeterminate = () => {
  if (!isIndeterminate.value) return;

  isIndeterminate.value = false;
  emit('update:indeterminate', false);
  if (checkboxRef.value) checkboxRef.value.indeterminate = false;
};

const restoreNativeState = (target: HTMLInputElement) => {
  target.checked = nativeChecked.value;
  target.indeterminate = isIndeterminate.value;
};

// 事件处理
const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (currentDisabled.value || currentReadonly.value) {
    event.preventDefault();
    restoreNativeState(target);
    return;
  }

  if (checkboxGroupContext && props.value !== undefined) {
    // CheckboxGroup 模式
    const accepted = checkboxGroupContext.updateValue(props.value, target.checked);
    if (accepted) clearIndeterminate();
    else restoreNativeState(target);
  } else {
    // 独立模式
    const value = target.checked ? props.trueValue : props.falseValue;

    emit('update:modelValue', value);
    clearIndeterminate();

    // 验证
    validateCheckbox(value);

    emit('change', value, event);
    formItem?.onFieldChange();
  }
  // 等待父组件处理更新后恢复原生状态，兼容接受、拒绝及转换值的受控场景。
  void nextTick(() => restoreNativeState(target));
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

  const newChecked = !nativeChecked.value;
  if (checkboxGroupContext && props.value !== undefined) {
    const accepted = checkboxGroupContext.updateValue(props.value, newChecked);
    if (accepted) clearIndeterminate();
    else {
      const target = event.target as HTMLInputElement | null;
      if (target) restoreNativeState(target);
    }
  } else {
    const value = newChecked ? props.trueValue : props.falseValue;
    emit('update:modelValue', value);
    clearIndeterminate();
    validateCheckbox(value);
    emit('change', value, event);
    formItem?.onFieldChange();
  }
};

// 验证复选框
const validateCheckbox = (value: boolean | string | number) => {
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

const syncIndeterminate = () => {
  if (checkboxRef.value) checkboxRef.value.indeterminate = isIndeterminate.value;
};

onMounted(syncIndeterminate);
watch(
  () => props.indeterminate,
  newValue => {
    isIndeterminate.value = newValue;
    syncIndeterminate();
  },
  { flush: 'post' }
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
