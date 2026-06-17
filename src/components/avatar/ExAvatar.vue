<template>
  <div
    ref="avatarRef"
    :class="avatarClasses"
    :style="avatarStyles"
    :aria-label="computedAriaLabel"
    :title="computedTitle"
    @click="handleClick"
  >
    <!-- 图片头像 -->
    <img
      v-if="showImage"
      :src="src"
      :srcset="srcset"
      :alt="computedAlt"
      :draggable="draggable"
      :crossorigin="crossOrigin"
      class="ex-avatar__image"
      @load="handleLoad"
      @error="handleError"
    >

    <!-- 图片加载失败提示 -->
    <div
      v-else-if="props.src && imageError"
      class="ex-avatar__error"
      :title="t('avatar.clickToReload')"
      :aria-label="t('avatar.retryLoad')"
      role="button"
      tabindex="0"
      @click="reload"
      @keydown.enter="reload"
      @keydown.space.prevent="reload"
    >
      <slot name="error">
        <span class="ex-avatar__error-text">{{ t('avatar.loadError') }}</span>
      </slot>
    </div>

    <!-- 图标头像插槽 -->
    <div
      v-else-if="$slots.icon"
      class="ex-avatar__icon"
    >
      <slot name="icon" />
    </div>

    <!-- 文字头像 -->
    <span
      v-else-if="displayText"
      ref="textRef"
      class="ex-avatar__text"
      :style="textStyles"
    >
      {{ displayText }}
    </span>

    <!-- 默认插槽 -->
    <slot v-else />
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref, nextTick, watch, useSlots } from 'vue';
import type { ExAvatarProps, ExAvatarEmits, ExAvatarExposed } from './types';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExAvatar',
});

const props = withDefaults(defineProps<ExAvatarProps>(), {
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  shape: 'circle',
  draggable: false,
  gap: 4,
});

const emit = defineEmits<ExAvatarEmits>();
const slots = useSlots();
const { t } = useI18n();

// 使用全局尺寸配置 - 只在 size 不是数字时使用
const componentSize = useComponentSize(
  computed(() => (typeof props.size === 'number' ? undefined : props.size))
);

const avatarRef = ref<HTMLElement>();
const textRef = ref<HTMLElement>();
const imageError = ref(false);
const textScale = ref(1);

// 计算属性
const showImage = computed(() => {
  return props.src && !imageError.value;
});

const displayText = computed(() => {
  if (props.text) {
    return props.text;
  }
  return '';
});

// 国际化计算属性
const computedAlt = computed(() => {
  return props.alt || t('avatar.alt');
});

const computedAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel;

  if (showImage.value) return t('avatar.imageAvatar');
  if (slots.icon) return t('avatar.iconAvatar');
  if (displayText.value) return t('avatar.textAvatar');

  return t('avatar.userAvatar');
});

const computedTitle = computed(() => {
  if (imageError.value && props.src) {
    return t('avatar.clickToReload');
  }
  return props.title || computedAriaLabel.value;
});

const avatarClasses = computed(() => {
  // 如果 props.size 是数字，使用它；否则使用 componentSize
  const effectiveSize = typeof props.size === 'number' ? props.size : componentSize.value;

  const classes = [
    'ex-avatar',
    `ex-avatar--${props.shape}`,
    `ex-avatar--${typeof effectiveSize === 'number' ? 'custom' : effectiveSize}`,
  ];

  if (showImage.value) classes.push('ex-avatar--image');
  else if (slots.icon) classes.push('ex-avatar--icon');
  else if (displayText.value) classes.push('ex-avatar--text');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const avatarStyles = computed(() => {
  const styles: Record<string, string> = {};

  // 尺寸 - 如果 props.size 是数字，使用它作为自定义尺寸
  if (typeof props.size === 'number') {
    styles.width = `${props.size}px`;
    styles.height = `${props.size}px`;
    styles.fontSize = `${Math.max(props.size / 2.5, 14)}px`;
  }

  // 背景颜色
  if (props.backgroundColor) {
    styles.backgroundColor = props.backgroundColor;
  }

  // 文字颜色
  if (props.textColor) {
    styles.color = props.textColor;
  }

  // 合并用户自定义样式
  if (props.style) {
    if (typeof props.style === 'string') {
      return `${Object.entries(styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')}; ${props.style}`;
    } else {
      Object.assign(styles, props.style);
    }
  }

  return styles;
});

const textStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (textScale.value !== 1) {
    styles.transform = `scale(${textScale.value})`;
  }

  if (props.gap) {
    styles.marginLeft = `${props.gap}px`;
    styles.marginRight = `${props.gap}px`;
  }

  return styles;
});

// 计算文字缩放
const calculateTextScale = async () => {
  if (!displayText.value || !textRef.value || !avatarRef.value) {
    return;
  }

  await nextTick();

  const textElement = textRef.value;
  const avatarElement = avatarRef.value;

  if (!textElement || !avatarElement) return;

  const textWidth = textElement.scrollWidth;
  const avatarWidth = avatarElement.offsetWidth;
  const maxWidth = avatarWidth - props.gap * 2;

  if (textWidth > maxWidth) {
    textScale.value = maxWidth / textWidth;
  } else {
    textScale.value = 1;
  }
};

// 事件处理
const handleLoad = (event: Event) => {
  imageError.value = false;
  emit('load', event);
};

const handleError = (event: Event) => {
  imageError.value = true;
  emit('error', event);
};

const handleClick = (event: MouseEvent) => {
  emit('click', event);
};

// 暴露的方法
const getElement = () => {
  return avatarRef.value || null;
};

const reload = () => {
  if (props.src) {
    imageError.value = false;
    // 强制重新加载图片
    const img = avatarRef.value?.querySelector('img');
    if (img) {
      const src = img.src;
      img.src = '';
      img.src = src;
    }
  }
};

// 监听文字变化，重新计算缩放
watch(
  [displayText, () => props.size, componentSize, () => props.gap],
  () => {
    calculateTextScale();
  },
  { flush: 'post' }
);

defineExpose<ExAvatarExposed>({
  getElement,
  reload,
});
</script>
<style lang="scss" scoped src="./ExAvatar.scss"></style>
