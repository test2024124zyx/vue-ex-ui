<template>
  <component
    :is="tag"
    :class="iconClasses"
    :style="iconStyles"
    :role="clickable && !disabled ? 'button' : undefined"
    :tabindex="clickable && !disabled ? 0 : undefined"
    :aria-disabled="clickable && disabled ? true : undefined"
    v-bind="$attrs"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- 插槽内容优先级最高 (SVG) -->
    <slot v-if="hasSlotContent" />

    <!-- 内置 SVG 图标：内容来自静态内置注册表（getBuiltinIcon），无用户输入，可信。 -->
    <!-- eslint-disable vue/no-v-html -->
    <svg
      v-else-if="builtinIconBody"
      viewBox="0 0 24 24"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      v-html="builtinIconBody"
    />
    <!-- eslint-enable vue/no-v-html -->

    <!-- 图片单色着色（mask） -->
    <span
      v-else-if="src && effectiveMonochrome"
      class="ex-icon__image-mask"
      :style="imageMaskVars"
    />

    <!-- 图片图标 -->
    <img
      v-else-if="src"
      :src="src"
      :alt="alt || 'icon'"
      class="ex-icon__image"
    >

    <!-- 字体图标 -->
    <i
      v-else-if="name"
      :class="fontIconClasses"
    />

    <!-- 默认SVG图标 -->
    <svg
      v-else
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </svg>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue';
import type { ExIconProps } from './types';
import { getBuiltinIcon } from './icons';

defineOptions({
  name: 'ExIcon',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExIconProps>(), {
  tag: 'span',
  size: 16,
  clickable: false,
  disabled: false,
  spin: false,
  rotate: 0,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const slots = useSlots();

// 检查是否有插槽内容
const hasSlotContent = computed(() => {
  return !!slots.default;
});

// 内置 SVG 图标内容（静态注册表，内容可信，v-html 安全）
const builtinIconBody = computed(() => {
  return props.icon ? getBuiltinIcon(props.icon) : '';
});

// 图标类名
const iconClasses = computed(() => {
  return [
    'ex-icon',
    props.customClass,
    {
      'ex-icon--clickable': props.clickable && !props.disabled,
      'ex-icon--disabled': props.disabled,
      'ex-icon--spin': props.spin,
      'ex-icon--colored': props.color && hasSlotContent.value,
    },
  ];
});

// 字体图标类名
const fontIconClasses = computed(() => {
  if (!props.name) return [];

  const classes: string[] = [];

  if (props.prefix) {
    classes.push(props.prefix);
    classes.push(`${props.prefix}-${props.name}`);
  } else {
    classes.push(props.name);
  }

  return classes;
});

// 图标样式
const iconStyles = computed(() => {
  const styles: Record<string, string> = {};

  // 大小设置
  if (props.size) {
    const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size;
    styles.fontSize = sizeValue;
    styles.width = sizeValue;
    styles.height = sizeValue;
  }

  // 颜色设置
  if (props.color) {
    styles.color = props.color;
  }

  // 旋转设置
  if (props.rotate && props.rotate !== 0) {
    styles.transform = `rotate(${props.rotate}deg)`;
  }

  return styles;
});

/* 根据 color/monochrome 决定是否启用图片单色着色 */
const effectiveMonochrome = computed(() => {
  return !!props.color;
});

// 图片 mask 着色变量：在 monochrome 模式下提供 CSS 变量驱动 mask
const imageMaskVars = computed(() => {
  if (props.src && effectiveMonochrome.value) {
    return { '--ex-icon-src': `url("${props.src}")` };
  }
  return {};
});

// 点击处理
const handleClick = (event: MouseEvent) => {
  // 如果禁用，阻止事件传播
  if (props.disabled) {
    event.stopPropagation();
    event.preventDefault();
    return;
  }

  // 始终 emit 点击事件，让父组件决定如何处理
  // clickable 属性只影响样式（光标、悬停效果等）
  emit('click', event);
};

// 键盘处理：仅在可点击图标（role=button）上响应 Enter / Space，
// 与原生 button 行为一致，保证键盘可达性
const handleKeydown = (event: KeyboardEvent) => {
  if (!props.clickable || props.disabled) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emit('click', event as unknown as MouseEvent);
  }
};
</script>
<style lang="scss" src="./ExIcon.scss" scoped></style>
