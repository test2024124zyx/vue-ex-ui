<template>
  <div
    :class="[
      'ex-input',
      `ex-input--${componentSize}`,
      `ex-input--${variant}`,
      {
        'ex-input--disabled': disabled,
        'ex-input--readonly': readonly,
        'ex-input--focused': isFocused,
        'ex-input--error': actualStatus === 'error',
        'ex-input--success': actualStatus === 'success',
        'ex-input--warning': actualStatus === 'warning',
        'ex-input--with-prepend': $slots.prepend || prepend,
        'ex-input--with-append': $slots.append || append,
        'ex-input--textarea': type === 'textarea',
      },
      customClass,
    ]"
    :style="customStyle"
  >
    <!-- 标签 -->
    <label
      v-if="label || $slots.label"
      :for="inputId"
      class="ex-input__label"
    >
      <slot name="label">
        {{ label }}
        <span
          v-if="required"
          class="ex-input__required"
        >*</span>
      </slot>
    </label>

    <!-- 输入框容器 -->
    <div class="ex-input__wrapper">
      <!-- 前置内容 -->
      <div
        v-if="$slots.prepend || prepend"
        class="ex-input__prepend"
      >
        <slot name="prepend">
          {{ prepend }}
        </slot>
      </div>

      <!-- 输入框主体 -->
      <div class="ex-input__inner">
        <!-- 前缀图标 -->
        <div
          v-if="$slots.prefix"
          class="ex-input__prefix"
        >
          <slot name="prefix" />
        </div>

        <!-- 输入框/文本域 -->
        <component
          :is="type === 'textarea' ? 'textarea' : 'input'"
          :id="inputId"
          ref="inputRef"
          :value="inputValue"
          :class="[
            'ex-input__control',
            {
              'ex-input__control--with-prefix': $slots.prefix,
              'ex-input__control--with-suffix': showSuffix,
            },
          ]"
          :type="actualType"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxlength"
          :minlength="minlength"
          :autofocus="autofocus"
          :autocomplete="autocomplete"
          :rows="rows"
          :aria-invalid="actualStatus === 'error'"
          :aria-describedby="showHelp ? helpTextId : undefined"
          :aria-required="required"
          @input="handleInput"
          @change="handleChange"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          @keyup="handleKeyup"
          @compositionstart="handleCompositionStart"
          @compositionend="handleCompositionEnd"
        />

        <!-- 后缀区域 -->
        <div
          v-if="showSuffix"
          class="ex-input__suffix"
        >
          <!-- 清除图标 -->
          <ex-icon
            v-if="showClearButton"
            class="ex-input__clear-icon"
            icon="close-line"
            :size="16"
            clickable
            :aria-label="t('input.clear')"
            @click.stop="handleClear"
            @mousedown.prevent
          />

          <!-- 密码切换图标 -->
          <ex-icon
            v-if="showPasswordToggle"
            class="ex-input__password-icon"
            :icon="isPasswordVisible ? 'eye-off-line' : 'eye-line'"
            :size="16"
            clickable
            :aria-label="isPasswordVisible ? t('input.hidePassword') : t('input.showPassword')"
            @click.stop="togglePasswordVisibility"
            @mousedown.prevent
          />

          <!-- 字数统计 -->
          <span
            v-if="showWordLimit && maxlength"
            class="ex-input__word-limit"
          >
            {{ currentLength }}/{{ maxlength }}
          </span>

          <!-- 自定义后缀 -->
          <slot name="suffix" />
        </div>
      </div>

      <!-- 后置内容 -->
      <div
        v-if="$slots.append || append"
        class="ex-input__append"
      >
        <slot name="append">
          {{ append }}
        </slot>
      </div>
    </div>

    <!-- 帮助文本/错误信息 -->
    <div
      v-if="showHelp"
      :id="helpTextId"
      class="ex-input__help"
      role="alert"
      :aria-live="actualStatus === 'error' ? 'assertive' : 'polite'"
    >
      <transition
        name="ex-input-help"
        mode="out-in"
      >
        <div
          v-if="actualStatus === 'error' && (actualErrorMessage || $slots.error)"
          key="error"
          class="ex-input__error"
        >
          <ex-icon
            icon="error-warning-line"
            :size="14"
            class="ex-input__error-icon"
            aria-hidden="true"
          />
          <slot name="error">
            {{ actualErrorMessage }}
          </slot>
        </div>
        <div
          v-else-if="actualStatus === 'success'"
          key="success"
          class="ex-input__success"
        >
          <ex-icon
            icon="check-line"
            :size="14"
            class="ex-input__success-icon"
            aria-hidden="true"
          />
          <span class="ex-input__success-text">{{ t('input.validationSuccess') }}</span>
        </div>
        <div
          v-else-if="helpText || $slots.help"
          key="help"
          class="ex-input__help-text"
        >
          <slot name="help">
            {{ helpText }}
          </slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount, useSlots } from 'vue';
import type { ExInputProps, ExInputEmits, ExInputInstance } from './types';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';
import { debounce } from '../../utils/debounce';
import { generateId } from '../../utils/id';
import { useFormItem } from '../form/use-form-item';
import ExIcon from '../icon/ExIcon.vue';

defineOptions({
  name: 'ExInput',
});

const props = withDefaults(defineProps<ExInputProps>(), {
  type: 'text',
  size: undefined,
  status: 'default',
  variant: 'neon',
  disabled: false,
  readonly: false,
  clearable: false,
  showPassword: false,
  showWordLimit: false,
  autofocus: false,
  autocomplete: 'off',
  rows: 3,
});

const emit = defineEmits<ExInputEmits>();

const { t } = useI18n();
const slots = useSlots() as ReturnType<typeof useSlots>;

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// 所在 FormItem 的字段上下文（用于 blur/change 自动校验）
const formItem = useFormItem();

// Refs
const inputRef = ref<HTMLInputElement | HTMLTextAreaElement>();
const inputValue = ref<string | number>('');
const isFocused = ref(false);
const isPasswordVisible = ref(false);
const validationError = ref<string>('');
const isComposing = ref(false); // 输入法状态

// 生成唯一ID
const inputId = generateId('ex-input');
const helpTextId = `${inputId}-help`;

// RAF ID 用于清理
let rafId: number | null = null;

// 计算属性
const actualType = computed(() => {
  if (props.type === 'password' && props.showPassword) {
    return isPasswordVisible.value ? 'text' : 'password';
  }
  return props.type === 'textarea' ? undefined : props.type;
});

const currentLength = computed(() => {
  return String(inputValue.value || '').length;
});

const showClearButton = computed(() => {
  return props.clearable && !props.disabled && !props.readonly && inputValue.value !== '';
});

const showPasswordToggle = computed(() => {
  return props.showPassword && props.type === 'password' && !props.disabled && !props.readonly;
});

const showSuffix = computed<boolean>(() => {
  return !!(
    showClearButton.value ||
    showPasswordToggle.value ||
    (props.showWordLimit && props.maxlength) ||
    slots.suffix
  );
});

const showHelp = computed(() => {
  return (
    (actualStatus.value === 'error' && (actualErrorMessage.value || slots.error)) ||
    props.helpText ||
    slots.help
  );
});

// 实际状态（考虑验证错误）
const actualStatus = computed(() => {
  if (validationError.value) return 'error';
  return props.status;
});

// 实际错误信息（考虑验证错误）
const actualErrorMessage = computed(() => {
  return validationError.value || props.errorMessage;
});

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== inputValue.value) {
      inputValue.value = newValue ?? '';

      // 应用格式化
      if (props.formatter && inputRef.value) {
        nextTick(() => {
          if (inputRef.value) {
            const formattedValue = props.formatter!(String(newValue ?? ''));
            if (inputRef.value.value !== formattedValue) {
              inputRef.value.value = formattedValue;
            }
          }
        });
      }
    }
  },
  { immediate: true }
);

// 自动调整文本域高度（使用防抖优化，减少延迟）
const debouncedAdjustHeight = debounce(() => {
  if (props.type === 'textarea' && props.autosize) {
    adjustTextareaHeight();
  }
}, 50); // 从 100ms 减少到 50ms，提升响应速度

watch(inputValue, () => {
  if (props.type === 'textarea' && props.autosize) {
    debouncedAdjustHeight();
  }
});

// 输入法事件处理
const handleCompositionStart = () => {
  isComposing.value = true;
};

const handleCompositionEnd = (event: CompositionEvent) => {
  isComposing.value = false;
  // 输入法结束后触发一次输入处理
  handleInput(event);
};

// 事件处理
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  let value = target.value;

  // 输入法激活时，暂停验证和格式化
  if (isComposing.value) {
    inputValue.value = value;
    emit('update:modelValue', value);
    emit('input', value, event);
    return;
  }

  // 解析实际值
  if (props.parser) {
    value = props.parser(value);
  }

  inputValue.value = value;
  emit('update:modelValue', value);
  emit('input', value, event);

  // 格式化显示值
  if (props.formatter && inputRef.value) {
    nextTick(() => {
      if (inputRef.value) {
        const formattedValue = props.formatter!(String(value));
        if (inputRef.value.value !== formattedValue) {
          inputRef.value.value = formattedValue;
        }
      }
    });
  }

  // 验证规则
  if (props.rules && props.rules.length > 0) {
    validateInput(value);
  }
};

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  emit('change', target.value, event);
  formItem?.onFieldChange();
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

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event);

  if (event.key === 'Enter') {
    emit('enter', event);
  }
};

const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event);
};

const handleClear = () => {
  // 清除内容
  inputValue.value = '';
  emit('update:modelValue', '');
  emit('clear');
  formItem?.onFieldChange();

  // 聚焦输入框
  nextTick(() => {
    inputRef.value?.focus();
  });
};

const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value;

  nextTick(() => {
    inputRef.value?.focus();
  });
};

// 验证输入（完善实现）
const validateInput = (value: string | number): boolean => {
  if (!props.rules || props.rules.length === 0) {
    validationError.value = '';
    return true;
  }

  for (const rule of props.rules) {
    const result = rule(value);
    if (result !== true) {
      validationError.value = typeof result === 'string' ? result : t('input.validationFailed');
      emit('validation-error', validationError.value);
      return false;
    }
  }

  validationError.value = '';
  return true;
};

// 手动验证方法（供外部调用）
const validate = (): boolean => {
  return validateInput(inputValue.value);
};

// 调整文本域高度（使用 RAF 优化）
const adjustTextareaHeight = () => {
  if (!inputRef.value || props.type !== 'textarea') return;

  const textarea = inputRef.value as HTMLTextAreaElement;

  // 取消之前的 RAF
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
  }

  // 使用 RAF 优化性能
  rafId = requestAnimationFrame(() => {
    if (!inputRef.value) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const autosize = props.autosize;

    if (typeof autosize === 'object') {
      const { minRows, maxRows } = autosize;
      const computedStyle = getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight);

      let height = scrollHeight;

      if (minRows) {
        const minHeight = minRows * lineHeight;
        height = Math.max(height, minHeight);
      }

      if (maxRows) {
        const maxHeight = maxRows * lineHeight;
        height = Math.min(height, maxHeight);
      }

      textarea.style.height = `${height}px`;
    } else {
      textarea.style.height = `${scrollHeight}px`;
    }

    rafId = null;
  });
};

// 暴露的方法
const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

const select = () => {
  inputRef.value?.select();
};

const clear = () => {
  handleClear();
};

const getInputElement = () => {
  return inputRef.value || null;
};

// 生命周期
onMounted(() => {
  if (props.autofocus) {
    nextTick(() => {
      focus();
    });
  }

  if (props.type === 'textarea' && props.autosize) {
    nextTick(() => {
      adjustTextareaHeight();
    });
  }
});

onBeforeUnmount(() => {
  // 清理 RAF
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  // 清理 autosize 防抖待执行的定时器
  debouncedAdjustHeight.cancel();
});

// 暴露实例方法
defineExpose<ExInputInstance>({
  focus,
  blur,
  select,
  clear,
  validate,
  getInputElement,
});
</script>

<style lang="scss" scoped src="./ExInput.scss"></style>
