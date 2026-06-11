<template>
  <button
    ref="buttonRef"
    :class="buttonClasses"
    :style="buttonStyles"
    :type="nativeType"
    :disabled="disabled || loading"
    :autofocus="autofocus"
    :aria-label="ariaLabel"
    @click="handleClick"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- 加载中图标插槽 -->
    <div
      v-if="loading && $slots.loading"
      class="ex-button__loading-icon"
    >
      <slot name="loading" />
    </div>

    <!-- 圆形按钮内容：优先显示图标，否则显示第一个字符 -->
    <template v-if="circle && !loading">
      <!-- 圆形按钮图标（优先显示前缀图标，然后后缀图标） -->
      <div
        v-if="$slots.prefix || $slots.suffix"
        class="ex-button__icon ex-button__icon--circle"
      >
        <slot name="prefix">
          <slot name="suffix" />
        </slot>
      </div>
      <!-- 圆形按钮文字（只显示第一个字符） -->
      <span
        v-else-if="hasSlotContent || $slots.default"
        class="ex-button__circle-text"
      >
        {{ getFirstCharacter() }}
      </span>
    </template>

    <!-- 普通按钮内容 -->
    <template v-else-if="!circle">
      <!-- 左侧图标插槽 -->
      <div
        v-if="$slots.prefix && !loading"
        class="ex-button__icon ex-button__icon--left"
      >
        <slot name="prefix" />
      </div>

      <!-- 按钮内容 -->
      <span
        v-if="hasSlotContent || $slots.default"
        class="ex-button__content"
      >
        <slot />
      </span>

      <!-- 右侧图标插槽 -->
      <div
        v-if="$slots.suffix && !loading"
        class="ex-button__icon ex-button__icon--right"
      >
        <slot name="suffix" />
      </div>
    </template>
  </button>
</template>

<script setup lang="ts">
import { computed, ref, useSlots } from 'vue';
import type { ExButtonProps, ExButtonEmits, ExButtonExposed } from './types';

import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExButton',
});

const props = withDefaults(defineProps<ExButtonProps>(), {
  type: 'primary',
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  shape: 'default',
  plain: false,
  round: false,
  circle: false,
  disabled: false,
  loading: false,
  block: false,
  nativeType: 'button',
  autofocus: false,
});

const emit = defineEmits<ExButtonEmits>();

const slots = useSlots();
const buttonRef = ref<HTMLButtonElement>();


// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

// 计算属性
const buttonClasses = computed(() => {
  const classes = [
    'ex-button',
    `ex-button--${props.type}`,
    `ex-button--${componentSize.value}`,
    `ex-button--${props.shape}`,
  ];

  if (props.plain) classes.push('ex-button--plain');
  if (props.round) classes.push('ex-button--round');
  if (props.circle) classes.push('ex-button--circle');
  if (props.disabled) classes.push('ex-button--disabled');
  if (props.loading) classes.push('ex-button--loading');
  if (props.block) classes.push('ex-button--block');
  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class);
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class);
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  }

  return classes;
});

const buttonStyles = computed(() => {
  if (!props.style) return undefined;

  if (typeof props.style === 'string') {
    return props.style;
  }

  return props.style;
});

const hasSlotContent = computed(() => {
  if (!slots.default) return false;
  const slotContent = slots.default({});
  return slotContent && slotContent.length > 0;
});

// 获取第一个字符（用于圆形按钮）
const getFirstCharacter = () => {
  if (!slots.default) return '';

  try {
    const slotContent = slots.default({});
    if (!slotContent || slotContent.length === 0) return '';

    // 递归提取文本内容
    const extractText = (nodes: unknown[]): string => {
      for (const node of nodes) {
        if (typeof node === 'string') {
          return node;
        }
        if (node && typeof node === 'object' && 'children' in node) {
          const nodeObj = node as { children?: unknown; props?: { children?: unknown } };
          if (typeof nodeObj.children === 'string') {
            return nodeObj.children;
          }
          if (Array.isArray(nodeObj.children)) {
            const text = extractText(nodeObj.children);
            if (text) return text;
          }
        }
        if (node && typeof node === 'object' && 'props' in node) {
          const nodeObj = node as { props?: { children?: unknown } };
          if (nodeObj.props && typeof nodeObj.props.children === 'string') {
            return nodeObj.props.children;
          }
        }
      }
      return '';
    };

    const text = extractText(slotContent);
    return text ? text.charAt(0).toUpperCase() : '';
  } catch (_error) {
    // 静默处理错误，返回空字符串
    return '';
  }
};

// 事件处理
const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  emit('click', event);
};

const handleFocus = (event: FocusEvent) => {
  emit('focus', event);
};

const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
};

// 暴露的方法
const focus = () => {
  buttonRef.value?.focus();
};

const blur = () => {
  buttonRef.value?.blur();
};

const getElement = () => {
  return buttonRef.value || null;
};

defineExpose<ExButtonExposed>({
  focus,
  blur,
  getElement,
});
</script>
<style scoped lang="scss" src="./ExButton.scss"></style>
