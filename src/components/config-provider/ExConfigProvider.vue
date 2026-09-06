<template>
  <div
    ref="providerRef"
    :class="providerClasses"
    :style="providerStyles"
    :data-theme="theme"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, inject, provide, ref } from 'vue';
import type { ExConfigProviderProps, ConfigContext } from './types';
import { CONFIG_PROVIDER_INJECTION_KEY, DEFAULT_CONFIG } from './types';
import { LOCALE_INJECTION_KEY } from '../../locale';
import { provideComponentServiceScope } from './service-scope';
import { createZIndexCssVariables, normalizeZIndexBase } from './z-index';
import { getTheme } from '../../composables/useTheme';
import { resolveThemeOverrides } from './theme-overrides';

defineOptions({
  name: 'ExConfigProvider',
});

const props = defineProps<ExConfigProviderProps>();

const providerRef = ref<HTMLDivElement>();
const parentConfig = inject(CONFIG_PROVIDER_INJECTION_KEY, null);

// 局部显式配置优先；根主题跟随全局状态，避免 Teleport 面板与页面明暗不一致。
const theme = computed(() => props.theme ?? parentConfig?.theme.value ?? getTheme());
const themeOverrides = computed(() =>
  resolveThemeOverrides(parentConfig?.themeOverrides?.value, props.themeOverrides, props.style)
);
const locale = computed(() => props.locale ?? parentConfig?.locale.value ?? DEFAULT_CONFIG.locale);
const size = computed(() => props.size ?? parentConfig?.size.value ?? DEFAULT_CONFIG.size);
const neonEffect = computed(
  () => props.neonEffect ?? parentConfig?.neonEffect.value ?? DEFAULT_CONFIG.neonEffect
);
const animation = computed(
  () => props.animation ?? parentConfig?.animation.value ?? DEFAULT_CONFIG.animation
);
const zIndex = computed(() =>
  normalizeZIndexBase(props.zIndex, parentConfig?.zIndex.value ?? DEFAULT_CONFIG.zIndex)
);

// 提供配置上下文
const configContext: ConfigContext = {
  theme,
  themeOverrides,
  locale,
  size,
  neonEffect,
  animation,
  zIndex,
};

provide(CONFIG_PROVIDER_INJECTION_KEY, configContext);
provide(LOCALE_INJECTION_KEY, locale);
provideComponentServiceScope();

// 计算属性
const providerClasses = computed(() => {
  const classes = ['ex-config-provider', `ex-theme-${theme.value}`, `ex-size-${size.value}`];

  if (!neonEffect.value) {
    classes.push('ex-no-neon');
  }

  if (!animation.value) {
    classes.push('ex-no-animation');
  }

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const providerStyles = computed(() => {
  const styles: Record<string, string> = {
    display: 'contents',
    ...themeOverrides.value,
  };

  // z-index 基础值
  if (zIndex.value !== DEFAULT_CONFIG.zIndex) {
    Object.assign(styles, createZIndexCssVariables(zIndex.value));
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

// 暴露的方法
const getElement = () => providerRef.value || null;

defineExpose({
  getElement,
});
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-config-provider {
  display: contents;
}

// 禁用霓虹效果
.ex-no-neon {
  :deep([class^='ex-']),
  :deep([class*=' ex-']) {
    box-shadow: none !important;
    text-shadow: none !important;
    filter: none !important;
  }

  // 头像的渐变伪元素不属于阴影，需要显式关闭霓虹层。
  :deep(.ex-avatar--clickable::before) {
    display: none !important;
  }
}

// 禁用动画
.ex-no-animation {
  :deep([class^='ex-']),
  :deep([class*=' ex-']) {
    transition: none !important;
    animation: none !important;
  }

  // 伪元素撕裂层不继承宿主节点的 animation 属性，需要单独关闭。
  :deep(.ex-typography--glitch::before),
  :deep(.ex-typography--glitch::after) {
    animation: none !important;
  }

  // 全局关闭动画时同时移除头像和头像组的状态变换。
  :deep(.ex-avatar--clickable:hover),
  :deep(.ex-avatar--clickable:active),
  :deep(.ex-avatar--clickable > .ex-avatar__image:hover),
  :deep(.ex-avatar-group__overflow:hover),
  :deep(.ex-avatar-group__overflow:active) {
    transform: none !important;
  }
}

// 尊重用户的动画偏好
@media (prefers-reduced-motion: reduce) {
  .ex-config-provider {
    :deep([class^='ex-']),
    :deep([class*=' ex-']) {
      transition: none !important;
      animation: none !important;
    }

    :deep(.ex-typography--glitch::before),
    :deep(.ex-typography--glitch::after) {
      animation: none !important;
    }
  }
}
</style>
