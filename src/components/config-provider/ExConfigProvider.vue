<template>
  <div ref="providerRef" :class="providerClasses" :style="providerStyles" :data-theme="theme">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, provide, ref, toRef } from 'vue';
import type { ExConfigProviderProps, ConfigContext } from './types';
import { CONFIG_PROVIDER_INJECTION_KEY, DEFAULT_CONFIG } from './types';
import { LOCALE_INJECTION_KEY } from '../../locale';

defineOptions({
  name: 'ExConfigProvider',
});

const props = withDefaults(defineProps<ExConfigProviderProps>(), {
  theme: DEFAULT_CONFIG.theme,
  locale: DEFAULT_CONFIG.locale,
  size: DEFAULT_CONFIG.size,
  neonEffect: DEFAULT_CONFIG.neonEffect,
  animation: DEFAULT_CONFIG.animation,
  zIndex: DEFAULT_CONFIG.zIndex,
});

const providerRef = ref<HTMLDivElement>();

// 响应式配置
const theme = toRef(props, 'theme');
const locale = toRef(props, 'locale');
const size = toRef(props, 'size');
const neonEffect = toRef(props, 'neonEffect');
const animation = toRef(props, 'animation');
const zIndex = toRef(props, 'zIndex');

// 提供配置上下文
const configContext: ConfigContext = {
  theme,
  locale,
  size,
  neonEffect,
  animation,
  zIndex,
};

provide(CONFIG_PROVIDER_INJECTION_KEY, configContext);
provide(LOCALE_INJECTION_KEY, locale);

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
  const styles: Record<string, string> = {};

  // z-index 基础值
  if (zIndex.value !== DEFAULT_CONFIG.zIndex) {
    styles['--ex-z-index-base'] = String(zIndex.value);
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
  width: 100%;
  height: 100%;
}

// 禁用霓虹效果
.ex-no-neon {
  :deep(*) {
    box-shadow: none !important;
    text-shadow: none !important;
  }
}

// 禁用动画
.ex-no-animation {
  :deep(*) {
    transition: none !important;
    animation: none !important;
  }
}

// 尊重用户的动画偏好
@media (prefers-reduced-motion: reduce) {
  .ex-config-provider {
    :deep(*) {
      transition: none !important;
      animation: none !important;
    }
  }
}
</style>
