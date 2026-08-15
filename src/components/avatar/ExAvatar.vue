<template>
  <component
    :is="rootTag"
    ref="avatarRef"
    :class="avatarClasses"
    :style="avatarStyles"
    :type="rootTag === 'button' ? 'button' : undefined"
    :role="rootRole"
    :aria-label="rootAriaLabel"
    :title="computedTitle"
    @click="handleClick"
  >
    <!-- 图片头像；通过 props 对象读取原生属性，避免模板将新增属性解析为不存在的实例字段。 -->
    <img
      v-if="showImage"
      :src="props.src"
      :srcset="props.srcset"
      :sizes="props.sizes"
      :alt="computedAlt"
      :aria-label="imageAriaLabel"
      :aria-hidden="imageAriaHidden"
      :draggable="props.draggable"
      :crossorigin="props.crossOrigin"
      :loading="props.loading"
      :decoding="props.decoding"
      :referrerpolicy="props.referrerPolicy"
      class="ex-avatar__image"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- 图片加载失败提示 -->
    <button
      v-else-if="props.src && imageError"
      type="button"
      class="ex-avatar__error"
      :title="t('avatar.clickToReload')"
      :aria-label="t('avatar.retryLoad')"
      @click.stop="reload"
    >
      <slot name="error">
        <span class="ex-avatar__error-text">{{ t('avatar.loadError') }}</span>
      </slot>
    </button>

    <!-- 图标头像插槽 -->
    <div
      v-else-if="hasIconSlot"
      class="ex-avatar__icon"
    >
      <slot name="icon"></slot>
    </div>

    <!-- 文字头像 -->
    <span
      v-else-if="displayText"
      class="ex-avatar__text"
    >
      {{ displayText }}
    </span>

    <!-- 默认插槽 -->
    <slot v-else></slot>
  </component>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref, useSlots, watch } from 'vue';
import type { Slots } from 'vue';
import { getFirstGrapheme } from '../../utils/text';
import { hasRenderableContent } from '../../utils/vnode';
import type { ExAvatarProps, ExAvatarEmits, ExAvatarExposed } from './types';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExAvatar',
});

const props = withDefaults(defineProps<ExAvatarProps>(), {
  size: undefined, // 改为 undefined，让 useComponentSize 处理默认值
  shape: 'circle',
  clickable: false,
  draggable: false,
  loading: 'eager',
  decoding: 'async',
});

const emit = defineEmits<ExAvatarEmits>();
const slots: Slots = useSlots();
const { t } = useI18n();

const avatarSizePresets = ['small', 'medium', 'large'] as const;
type AvatarSizePreset = (typeof avatarSizePresets)[number];
const minimumCustomSize = 1;
const customFontSizeMinimum = 14;
const customFontSizeScale = 2.5;

const isAvatarSizePreset = (value: ExAvatarProps['size']): value is AvatarSizePreset =>
  typeof value === 'string' && avatarSizePresets.includes(value as AvatarSizePreset);

const customSize = computed(() => {
  if (typeof props.size !== 'number') return undefined;
  if (!Number.isFinite(props.size) || props.size < minimumCustomSize) return undefined;
  return props.size;
});

// 使用全局尺寸配置；无效的运行时尺寸回退到最近一层 ConfigProvider。
const componentSize = useComponentSize(
  computed(() => (isAvatarSizePreset(props.size) ? props.size : undefined))
);

const avatarRef = ref<HTMLElement>();
const imageError = ref(false);

// 计算属性
const showImage = computed(() => {
  return Boolean(props.src) && !imageError.value;
});

const displayText = computed(() => {
  return getFirstGrapheme(props.text ?? '');
});
const hasIconSlot = computed<boolean>(() => hasRenderableContent(slots.icon?.({})));

// 国际化计算属性
const computedAlt = computed(() => {
  return props.alt ?? t('avatar.alt');
});

const computedAriaLabel = computed(() => {
  if (props.ariaLabel !== undefined) return props.ariaLabel;

  if (showImage.value) return props.alt?.trim() || t('avatar.imageAvatar');
  if (hasIconSlot.value) return t('avatar.iconAvatar');
  if (displayText.value) return props.text?.trim() || t('avatar.textAvatar');

  return t('avatar.userAvatar');
});

const computedTitle = computed(() => {
  if (imageError.value && props.src) {
    return t('avatar.clickToReload');
  }
  return props.title || undefined;
});

// 图片失败时根节点必须降级为普通容器，避免在 button 内嵌套重试 button。
const rootTag = computed<'button' | 'div'>(() =>
  props.clickable && !imageError.value ? 'button' : 'div'
);

const imageAriaLabel = computed(() => {
  if (!showImage.value || rootTag.value === 'button') return undefined;
  return props.ariaLabel;
});

const imageAriaHidden = computed<'true' | undefined>(() =>
  rootTag.value === 'button' ? 'true' : undefined
);

// 图片由 img 自己提供语义；文字和图标头像需要由容器提供图像语义。
const rootRole = computed(() => {
  if (imageError.value || rootTag.value === 'button' || showImage.value) return undefined;
  return 'img';
});

// 可点击头像必须拥有名称，静态图片则避免与 img.alt 产生重复朗读。
const rootAriaLabel = computed(() => {
  if (imageError.value || showImage.value) {
    return rootTag.value === 'button' ? computedAriaLabel.value : undefined;
  }
  return computedAriaLabel.value;
});

const effectiveSize = computed(() => customSize.value ?? componentSize.value);

const avatarClasses = computed(() => {
  const classes = [
    'ex-avatar',
    `ex-avatar--${props.shape}`,
    `ex-avatar--${customSize.value === undefined ? effectiveSize.value : 'custom'}`,
  ];

  if (props.clickable && !imageError.value) classes.push('ex-avatar--clickable');
  if (showImage.value) classes.push('ex-avatar--image');
  else if (hasIconSlot.value) classes.push('ex-avatar--icon');
  else if (displayText.value) classes.push('ex-avatar--text');
  if (imageError.value && props.src) classes.push('ex-avatar--error');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const avatarStyles = computed(() => {
  const styles: Record<string, string> = {};

  // 尺寸 - 只有有限且为正数的尺寸才作为自定义尺寸使用。
  if (customSize.value !== undefined) {
    styles.width = `${customSize.value}px`;
    styles.height = `${customSize.value}px`;
    styles.fontSize = `${Math.max(customSize.value / customFontSizeScale, customFontSizeMinimum)}px`;
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
  if (!props.clickable || imageError.value) return;
  emit('click', event);
};

// 暴露的方法
const getElement = () => {
  return avatarRef.value || null;
};

const reload = () => {
  if (props.src) imageError.value = false;
};

watch(
  () => props.src,
  () => {
    // 新图片地址必须获得独立加载机会，不能继承上一地址的失败状态。
    imageError.value = false;
  }
);

defineExpose<ExAvatarExposed>({
  getElement,
  reload,
});
</script>
<style lang="scss" scoped src="./ExAvatar.scss"></style>
