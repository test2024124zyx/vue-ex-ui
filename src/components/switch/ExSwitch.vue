<template>
  <div
    :class="switchClasses"
    :style="switchStyles"
    @click="handleClick"
  >
    <!-- 开关前文本 -->
    <span
      v-if="inactiveText && !inlinePrompt"
      class="ex-switch__label ex-switch__label--left"
      :class="{ 'is-active': !isChecked }"
    >
      {{ inactiveText }}
    </span>

    <!-- 开关主体 -->
    <div
      class="ex-switch__core"
      :class="{ 'is-checked': isChecked }"
      :style="coreStyle"
    >
      <!-- 内联文本 -->
      <span
        v-if="inlinePrompt && hasText"
        class="ex-switch__inner"
      >
        <span class="ex-switch__inner-text">
          <slot
            v-if="isChecked"
            name="active"
          >
            {{ activeText }}
          </slot>
          <slot
            v-else
            name="inactive"
          >
            {{ inactiveText }}
          </slot>
        </span>
      </span>

      <!-- 开关按钮 -->
      <div class="ex-switch__action">
        <div
          v-if="loading"
          class="ex-switch__loading"
        >
          <div class="ex-switch__spinner"></div>
        </div>
      </div>

      <!-- 隐藏的原生 input -->
      <input
        :id="id"
        ref="inputRef"
        type="checkbox"
        class="ex-switch__input"
        role="switch"
        :name="name"
        :disabled="isInteractionDisabled"
        :required="required"
        :checked="isChecked"
        :aria-checked="isChecked"
        v-bind="fieldAriaAttrs"
        :aria-disabled="isInteractionDisabled"
        :aria-label="ariaLabel"
        @change="handleChange"
        @click.stop="handleNativeClick"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
      />
    </div>

    <!-- 开关后文本 -->
    <span
      v-if="activeText && !inlinePrompt"
      class="ex-switch__label ex-switch__label--right"
      :class="{ 'is-active': isChecked }"
    >
      {{ activeText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useSlots, nextTick } from 'vue';
import type { ExSwitchProps, ExSwitchEmits, ExSwitchInstance } from './types';
import { useFormFieldState } from '../form/use-form-item';

defineOptions({
  name: 'ExSwitch',
});

const props = withDefaults(defineProps<ExSwitchProps>(), {
  modelValue: false,
  activeValue: true,
  inactiveValue: false,
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  disabled: false,
  loading: false,
  inlinePrompt: false,
  required: false,
});

const emit = defineEmits<ExSwitchEmits>();

const inputRef = ref<HTMLInputElement>();
const isFocused = ref(false);

const {
  formItem,
  disabled,
  interactive,
  size: componentSize,
  ariaAttrs: fieldAriaAttrs,
} = useFormFieldState(props);

// 计算属性
const isChecked = computed(() => {
  return props.modelValue === props.activeValue;
});

const isInteractionDisabled = computed(() => disabled.value || props.loading);
const canChange = computed(() => interactive.value && !props.loading);

const slots = useSlots();

const hasText = computed(() => {
  return !!(props.activeText || props.inactiveText || slots.active || slots.inactive);
});

const switchClasses = computed(() => {
  const classes = ['ex-switch', `ex-switch--${componentSize.value}`];

  if (isChecked.value) classes.push('is-checked');
  if (disabled.value) classes.push('is-disabled');
  if (props.loading) classes.push('is-loading');
  if (isFocused.value) classes.push('is-focused');
  if (hasText.value) classes.push('has-text');
  if (props.inlinePrompt && hasText.value) classes.push('has-inline-prompt');
  if (props.validateStatus) classes.push(`is-${props.validateStatus}`);
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const switchStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  if (props.customStyle) {
    Object.assign(styles, props.customStyle);
  }

  return styles;
});

const coreStyle = computed(() => {
  const styles: Record<string, string> = {};

  if (isChecked.value && props.activeColor) {
    styles.backgroundColor = props.activeColor;
    styles.borderColor = props.activeColor;
  } else if (!isChecked.value && props.inactiveColor) {
    styles.backgroundColor = props.inactiveColor;
    styles.borderColor = props.inactiveColor;
  }

  return styles;
});

// 事件处理
const handleClick = (event: MouseEvent) => {
  if (!canChange.value) {
    event.preventDefault();
    return;
  }

  toggle();
};

// 原生 checkbox 不支持 readonly，必须在默认切换动作前阻止修改。
const handleNativeClick = (event: MouseEvent) => {
  if (!canChange.value) event.preventDefault();
};

const handleChange = (event: Event) => {
  if (!canChange.value) {
    event.preventDefault();
    (event.target as HTMLInputElement).checked = isChecked.value;
    return;
  }

  const target = event.target as HTMLInputElement;
  const newValue = target.checked ? props.activeValue : props.inactiveValue;

  emit('update:modelValue', newValue);
  emit('change', newValue);
  formItem?.onFieldChange();
  // 使用本轮渲染后的模型恢复原生 checked，父组件拒绝更新时也保持一致。
  void nextTick(() => {
    target.checked = isChecked.value;
  });
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
  const togglesValue =
    event.code === 'Space' || event.code === 'Enter' || event.key === ' ' || event.key === 'Enter';
  if (!togglesValue || event.isComposing) return;
  event.preventDefault();
  if (!canChange.value) return;
  toggle();
  emit('keydown', event);
};

// 暴露方法
const focus = () => {
  inputRef.value?.focus();
};

const blur = () => {
  inputRef.value?.blur();
};

const toggle = () => {
  if (!canChange.value) return;

  const newValue = isChecked.value ? props.inactiveValue : props.activeValue;
  emit('update:modelValue', newValue);
  emit('change', newValue);
  formItem?.onFieldChange();
};

defineExpose<ExSwitchInstance>({
  focus,
  blur,
  toggle,
});
</script>

<style scoped lang="scss" src="./ExSwitch.scss"></style>
