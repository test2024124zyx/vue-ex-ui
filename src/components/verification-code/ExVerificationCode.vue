<script setup lang="ts">
/**
 * ExVerificationCode 验证码输入组件
 * 专业的 OTP/验证码输入组件，采用分离式输入格子设计
 */
import { ref, computed, watch, onMounted, onUnmounted, nextTick, useId } from 'vue';
import type {
  ExVerificationCodeProps,
  ExVerificationCodeEmits,
  ExVerificationCodeExposed,
} from './types';
import { isValidChar, filterValidChars } from './types';
import { useI18n } from '../../locale';
import { useComponentSize, useNeonEffect, useAnimation } from '../config-provider/composables';
import ExIcon from '../icon/ExIcon.vue';

defineOptions({ name: 'ExVerificationCode' });

const props = withDefaults(defineProps<ExVerificationCodeProps>(), {
  modelValue: '',
  length: 6,
  inputMode: 'numeric',
  size: undefined, // 使用全局配置
  variant: 'neon',
  disabled: false,
  readonly: false,
  status: 'default',
  mask: false,
  showMaskToggle: false,
  maskDelay: 300,
  autoSubmit: false,
  autoSubmitDelay: 500,
  autofocus: false,
  separatorPositions: () => [],
  separator: '-',
  placeholder: '',
  label: '',
  required: false,
  helpText: '',
  errorMessage: '',
  loading: false,
  customClass: '',
  ariaLabel: '',
});

// 使用全局配置
const componentSize = useComponentSize(computed(() => props.size));
const neonEffect = useNeonEffect();
const animation = useAnimation();

const emit = defineEmits<ExVerificationCodeEmits>();

// 国际化
const { t } = useI18n();

// 组件引用
const containerRef = ref<HTMLDivElement | null>(null);
const hiddenInputRef = ref<HTMLInputElement | null>(null);
const idSuffix = useId().replace(/:/g, '');
const inputId = `ex-verification-code-${idSuffix}`;
const labelId = `${inputId}-label`;
const helpId = `${inputId}-help`;

const MIN_CODE_LENGTH = 1;
const MAX_CODE_LENGTH = 12;
const DEFAULT_CODE_LENGTH = 6;
const normalizedLength = computed(() => {
  const length = Number(props.length);
  if (Number.isNaN(length)) return DEFAULT_CODE_LENGTH;
  if (!Number.isFinite(length)) return length > 0 ? MAX_CODE_LENGTH : MIN_CODE_LENGTH;
  return Math.min(MAX_CODE_LENGTH, Math.max(MIN_CODE_LENGTH, Math.trunc(length)));
});

// 内部状态
const cells = ref<string[]>(Array(normalizedLength.value).fill(''));
const focusedIndex = ref(0);
const isFocused = ref(false);
const isMasked = ref(props.mask);
const isPendingSubmit = ref(false);
const lastInputIndex = ref(-1);

// 定时器
let autoSubmitTimer: ReturnType<typeof setTimeout> | null = null;
let maskDelayTimer: ReturnType<typeof setTimeout> | null = null;

// 计算属性：当前值
const currentValue = computed(() => cells.value.join(''));

// 计算属性：是否完成
const isComplete = computed(() => {
  return cells.value.every(cell => cell !== '') && cells.value.length === normalizedLength.value;
});

// 计算属性：组件类名
const componentClasses = computed(() => {
  return [
    'ex-verification-code',
    `ex-verification-code--${componentSize.value}`,
    `ex-verification-code--${props.variant}`,
    {
      'ex-verification-code--disabled': props.disabled,
      'ex-verification-code--readonly': props.readonly,
      'ex-verification-code--focused': isFocused.value,
      'ex-verification-code--error': props.status === 'error',
      'ex-verification-code--success': props.status === 'success',
      'ex-verification-code--warning': props.status === 'warning',
      'ex-verification-code--loading': props.loading,
      'ex-verification-code--pending': isPendingSubmit.value,
      'ex-verification-code--no-neon': !neonEffect.value,
      'ex-verification-code--no-animation': !animation.value,
    },
    props.customClass,
  ];
});

// 计算属性：格子样式
const cellStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.cellWidth) {
    style.width = typeof props.cellWidth === 'number' ? `${props.cellWidth}px` : props.cellWidth;
  }
  return style;
});

const cellsStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.cellGap) {
    style.gap = typeof props.cellGap === 'number' ? `${props.cellGap}px` : props.cellGap;
  }
  return style;
});

// 计算属性：隐藏输入框的属性
const hiddenInputAttrs = computed(() => {
  return {
    inputmode: (props.inputMode === 'numeric' ? 'numeric' : 'text') as 'numeric' | 'text',
    pattern: props.inputMode === 'numeric' ? '[0-9]*' : undefined,
    autocomplete: 'one-time-code' as const,
  };
});

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newValue => {
    if (newValue !== currentValue.value) {
      const filtered = filterValidChars(newValue || '', props.inputMode);
      const chars = filtered.slice(0, normalizedLength.value).split('');
      cells.value = [...chars, ...Array(normalizedLength.value - chars.length).fill('')];
    }
  },
  { immediate: true }
);

// 监听 length 变化
watch(
  () => props.length,
  () => {
    const newLength = normalizedLength.value;
    const previousValue = currentValue.value;
    const currentChars = cells.value.filter(c => c !== '');
    cells.value = [
      ...currentChars.slice(0, newLength),
      ...Array(Math.max(0, newLength - currentChars.length)).fill(''),
    ];
    if (focusedIndex.value >= newLength) {
      focusedIndex.value = Math.max(0, newLength - 1);
    }
    const nextValue = currentValue.value;
    if (nextValue !== previousValue) {
      emit('update:modelValue', nextValue);
      emit('input', nextValue);
      emit('change', nextValue);
      cancelAutoSubmit();
    }
  }
);

watch(
  () => props.inputMode,
  () => {
    const previousValue = currentValue.value;
    const filtered = filterValidChars(previousValue, props.inputMode)
      .slice(0, normalizedLength.value)
      .split('');
    cells.value = [...filtered, ...Array(normalizedLength.value - filtered.length).fill('')];
    if (currentValue.value !== previousValue) updateValue();
  }
);

watch(
  () => [props.disabled, props.readonly, props.autoSubmit] as const,
  ([disabled, readonly, autoSubmit]) => {
    if (disabled || readonly || !autoSubmit) cancelAutoSubmit();
  }
);

// 监听 mask 属性变化
watch(
  () => props.mask,
  newMask => {
    isMasked.value = newMask;
  }
);

/**
 * 更新值并触发事件
 */
function updateValue() {
  const value = currentValue.value;
  emit('update:modelValue', value);
  emit('input', value);
  emit('change', value);

  // 检查是否完成
  if (isComplete.value) {
    emit('complete', value);
    handleAutoSubmit();
  } else {
    cancelAutoSubmit();
  }
}

/**
 * 处理自动提交
 */
function handleAutoSubmit() {
  if (!props.autoSubmit || props.disabled || props.readonly) return;

  cancelAutoSubmit();
  isPendingSubmit.value = true;

  autoSubmitTimer = setTimeout(() => {
    if (isComplete.value && props.autoSubmit && !props.disabled && !props.readonly) {
      emit('submit', currentValue.value);
    }
    isPendingSubmit.value = false;
  }, props.autoSubmitDelay);
}

/**
 * 取消自动提交
 */
function cancelAutoSubmit() {
  if (autoSubmitTimer) {
    clearTimeout(autoSubmitTimer);
    autoSubmitTimer = null;
  }
  isPendingSubmit.value = false;
}

/**
 * 获取第一个空格子的索引
 */
function getFirstEmptyIndex(): number {
  return cells.value.findIndex(c => c === '');
}

/**
 * 处理输入
 */
function handleInput(event: Event) {
  if (props.disabled || props.readonly) return;

  const input = event.target as HTMLInputElement;
  const value = input.value;

  if (!value) return;

  const chars = filterValidChars(value, props.inputMode);
  if (!chars) {
    input.value = '';
    return;
  }

  // 顺序输入限制：如果当前位置之前有空格子，自动跳转到第一个空格子
  const firstEmptyIndex = getFirstEmptyIndex();
  if (firstEmptyIndex !== -1 && firstEmptyIndex < focusedIndex.value) {
    focusedIndex.value = firstEmptyIndex;
  }

  const availableLength = normalizedLength.value - focusedIndex.value;
  const inputChars = chars.slice(0, availableLength).split('');
  inputChars.forEach((char, offset) => {
    if (isValidChar(char, props.inputMode)) {
      const targetIndex = focusedIndex.value + offset;
      cells.value[targetIndex] = char;
      lastInputIndex.value = targetIndex;
    }
  });

  if (inputChars.length > 0) {
    // 处理遮罩延迟
    if (props.mask && props.maskDelay > 0) {
      if (maskDelayTimer) clearTimeout(maskDelayTimer);
      maskDelayTimer = setTimeout(() => {
        lastInputIndex.value = -1;
      }, props.maskDelay);
    }

    const firstEmptyIndex = getFirstEmptyIndex();
    focusedIndex.value = firstEmptyIndex === -1 ? normalizedLength.value - 1 : firstEmptyIndex;

    updateValue();
  }

  input.value = '';
}

/**
 * 处理键盘事件
 */
function handleKeyDown(event: KeyboardEvent) {
  if (props.disabled || props.readonly) {
    event.preventDefault();
    return;
  }

  const key = event.key;

  switch (key) {
    case 'Backspace':
      handleBackspace();
      event.preventDefault();
      break;
    case 'Delete':
      handleDelete();
      event.preventDefault();
      break;
    case 'ArrowLeft':
      if (focusedIndex.value > 0) {
        focusedIndex.value--;
      }
      event.preventDefault();
      break;
    case 'ArrowRight': {
      // 顺序输入限制：不能向右移动到空格子之后
      const firstEmptyIndex = getFirstEmptyIndex();
      const maxAllowedIndex = firstEmptyIndex !== -1 ? firstEmptyIndex : normalizedLength.value - 1;
      if (focusedIndex.value < maxAllowedIndex) {
        focusedIndex.value++;
      }
      event.preventDefault();
      break;
    }
    case 'Home':
      focusedIndex.value = 0;
      event.preventDefault();
      break;
    case 'End': {
      // 顺序输入限制：End 键跳转到第一个空格子或最后一个已填充的格子
      const emptyIndex = getFirstEmptyIndex();
      focusedIndex.value = emptyIndex !== -1 ? emptyIndex : normalizedLength.value - 1;
      event.preventDefault();
      break;
    }
  }
}

/**
 * 处理 Backspace
 */
function handleBackspace() {
  if (cells.value[focusedIndex.value] !== '') {
    // 当前格子有内容，清空当前格子
    cells.value[focusedIndex.value] = '';
  } else if (focusedIndex.value > 0) {
    // 当前格子为空，移动到前一个格子并清空
    focusedIndex.value--;
    cells.value[focusedIndex.value] = '';
  }
  updateValue();
}

/**
 * 处理 Delete（删除并左移）
 */
function handleDelete() {
  if (cells.value[focusedIndex.value] !== '') {
    // 删除当前格子并左移后续内容
    for (let i = focusedIndex.value; i < normalizedLength.value - 1; i++) {
      cells.value[i] = cells.value[i + 1] ?? '';
    }
    cells.value[normalizedLength.value - 1] = '';
    updateValue();
  }
}

/**
 * 处理粘贴
 * 顺序输入限制：始终从第一个空格子开始粘贴
 */
function handlePaste(event: ClipboardEvent) {
  if (props.disabled || props.readonly) {
    event.preventDefault();
    return;
  }

  event.preventDefault();
  const pastedText = event.clipboardData?.getData('text') || '';
  const validChars = filterValidChars(pastedText, props.inputMode);

  if (!validChars) return;

  // 顺序输入限制：从第一个空格子开始粘贴
  const startIndex = getFirstEmptyIndex();
  if (startIndex === -1) {
    // 所有格子都已填充，不执行粘贴
    return;
  }

  // 从第一个空格子开始填充
  const chars = validChars.slice(0, normalizedLength.value - startIndex).split('');
  chars.forEach((char, index) => {
    const targetIndex = startIndex + index;
    if (targetIndex < normalizedLength.value) {
      cells.value[targetIndex] = char;
    }
  });

  // 更新焦点位置到下一个空格子
  const newFirstEmpty = getFirstEmptyIndex();
  focusedIndex.value = newFirstEmpty !== -1 ? newFirstEmpty : normalizedLength.value - 1;

  updateValue();
}

/**
 * 处理格子点击
 * 顺序输入限制：只能点击已填充的格子或第一个空格子
 */
function handleCellClick(index: number) {
  if (props.disabled) return;

  const firstEmptyIndex = getFirstEmptyIndex();

  // 如果点击的位置超过第一个空格子，自动跳转到第一个空格子
  if (firstEmptyIndex !== -1 && index > firstEmptyIndex) {
    focusedIndex.value = firstEmptyIndex;
  } else {
    focusedIndex.value = index;
  }

  hiddenInputRef.value?.focus();
}

/**
 * 处理聚焦
 */
function handleFocus(event: FocusEvent) {
  isFocused.value = true;
  emit('focus', event, focusedIndex.value);
}

/**
 * 处理失焦
 */
function handleBlur(event: FocusEvent) {
  isFocused.value = false;
  emit('blur', event);
}

/**
 * 切换遮罩显示
 */
function toggleMask() {
  isMasked.value = !isMasked.value;
}

/**
 * 获取格子显示内容
 */
function getCellDisplay(index: number): string {
  const value = cells.value[index];
  if (!value) return '';

  if (isMasked.value) {
    // 如果是最近输入的格子且在延迟期内，显示原字符
    if (lastInputIndex.value === index) {
      return value;
    }
    return '•';
  }
  return value;
}

/**
 * 判断是否应该显示分隔符
 */
function shouldShowSeparator(index: number): boolean {
  return props.separatorPositions.includes(index + 1) && index < normalizedLength.value - 1;
}

/**
 * 获取格子的 ARIA 标签
 */
// 暴露的方法
function focus() {
  // 顺序输入限制：聚焦到第一个空格子
  const firstEmptyIndex = getFirstEmptyIndex();
  focusedIndex.value = firstEmptyIndex !== -1 ? firstEmptyIndex : normalizedLength.value - 1;
  hiddenInputRef.value?.focus();
}

function blur() {
  hiddenInputRef.value?.blur();
}

function clear() {
  cells.value = Array(normalizedLength.value).fill('');
  focusedIndex.value = 0;
  cancelAutoSubmit();
  emit('clear');
  emit('update:modelValue', '');
  emit('change', '');
}

function setValue(value: string) {
  const filtered = filterValidChars(value || '', props.inputMode);
  const chars = filtered.slice(0, normalizedLength.value).split('');
  cells.value = [...chars, ...Array(normalizedLength.value - chars.length).fill('')];
  updateValue();
}

function getValue(): string {
  return currentValue.value;
}

function getElement(): HTMLDivElement | null {
  return containerRef.value;
}

function submit() {
  if (isComplete.value) {
    emit('submit', currentValue.value);
  }
}

// 生命周期
onMounted(() => {
  if (props.autofocus) {
    nextTick(() => {
      focus();
    });
  }
});

onUnmounted(() => {
  cancelAutoSubmit();
  if (maskDelayTimer) {
    clearTimeout(maskDelayTimer);
  }
});

// 暴露方法
defineExpose<ExVerificationCodeExposed>({
  focus,
  blur,
  clear,
  setValue,
  getValue,
  getElement,
  submit,
});
</script>

<template>
  <div
    ref="containerRef"
    :class="componentClasses"
    :style="customStyle"
  >
    <!-- 标签 -->
    <label
      v-if="label"
      :id="labelId"
      :for="inputId"
      class="ex-verification-code__label"
    >
      {{ label }}
      <span
        v-if="required"
        class="ex-verification-code__required"
      >
        *
      </span>
    </label>

    <!-- 格子容器 -->
    <div
      class="ex-verification-code__cells"
      :style="cellsStyle"
      :aria-label="label ? undefined : ariaLabel || t('verificationCode.ariaLabel')"
      :aria-labelledby="label ? labelId : undefined"
      role="group"
    >
      <!-- 隐藏的输入框（用于移动端键盘和自动填充） -->
      <input
        :id="inputId"
        ref="hiddenInputRef"
        class="ex-verification-code__hidden-input"
        type="text"
        :inputmode="hiddenInputAttrs.inputmode"
        :pattern="hiddenInputAttrs.pattern"
        :autocomplete="hiddenInputAttrs.autocomplete"
        :disabled="disabled"
        :readonly="readonly"
        :aria-label="label ? undefined : ariaLabel || t('verificationCode.ariaLabel')"
        :aria-labelledby="label ? labelId : undefined"
        :aria-describedby="helpText || errorMessage ? helpId : undefined"
        :aria-invalid="status === 'error' ? 'true' : undefined"
        :aria-required="required ? 'true' : undefined"
        :required="required"
        @input="handleInput"
        @keydown="handleKeyDown"
        @paste="handlePaste"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <!-- 格子 -->
      <template
        v-for="(_, index) in cells"
        :key="index"
      >
        <div
          :class="[
            'ex-verification-code__cell',
            {
              'ex-verification-code__cell--focused': isFocused && focusedIndex === index,
              'ex-verification-code__cell--filled': cells[index] !== '',
              'ex-verification-code__cell--error': status === 'error',
              'ex-verification-code__cell--success': status === 'success',
              'ex-verification-code__cell--warning': status === 'warning',
            },
          ]"
          :style="cellStyle"
          aria-hidden="true"
          @click="handleCellClick(index)"
        >
          <span class="ex-verification-code__cell-content">
            {{ getCellDisplay(index) || placeholder }}
          </span>
          <!-- 光标 -->
          <span
            v-if="isFocused && focusedIndex === index && !cells[index]"
            class="ex-verification-code__cursor"
          ></span>
        </div>

        <!-- 分隔符 -->
        <span
          v-if="shouldShowSeparator(index)"
          class="ex-verification-code__separator"
        >
          {{ separator }}
        </span>
      </template>

      <!-- 遮罩切换按钮 -->
      <button
        v-if="showMaskToggle && mask"
        type="button"
        class="ex-verification-code__mask-toggle"
        :aria-label="isMasked ? t('verificationCode.showCode') : t('verificationCode.hideCode')"
        @click="toggleMask"
      >
        <ExIcon
          :icon="isMasked ? 'eye-line' : 'eye-off-line'"
          :size="16"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- 加载指示器 -->
    <div
      v-if="loading"
      class="ex-verification-code__loading"
    >
      <span class="ex-verification-code__loading-spinner"></span>
    </div>

    <!-- 帮助文本 / 错误信息 -->
    <div
      v-if="helpText || errorMessage"
      :id="helpId"
      :class="[
        'ex-verification-code__help',
        { 'ex-verification-code__help--error': status === 'error' && errorMessage },
      ]"
    >
      {{ status === 'error' && errorMessage ? errorMessage : helpText }}
    </div>
  </div>
</template>

<style scoped lang="scss" src="./ExVerificationCode.scss"></style>
