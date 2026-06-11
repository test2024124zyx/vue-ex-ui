<template>
  <div
    ref="providerRef"
    :class="providerClasses"
    :style="providerStyles"
    :data-theme="theme"
    :data-namespace="namespace"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, toRef, watch } from 'vue';
import type {
  ExConfigProviderProps,
  ConfigContext,
} from './types';
import {
  CONFIG_PROVIDER_INJECTION_KEY,
  DEFAULT_CONFIG,
} from './types';
import { setLocale } from '../../locale';

defineOptions({
  name: 'ExConfigProvider',
});

const props = withDefaults(defineProps<ExConfigProviderProps>(), {
  theme: DEFAULT_CONFIG.theme,
  locale: DEFAULT_CONFIG.locale,
  size: DEFAULT_CONFIG.size,
  neonEffect: DEFAULT_CONFIG.neonEffect,
  animation: DEFAULT_CONFIG.animation,
  namespace: DEFAULT_CONFIG.namespace,
  zIndex: DEFAULT_CONFIG.zIndex,
});

const providerRef = ref<HTMLDivElement>();

// 响应式配置
const theme = toRef(props, 'theme');
const locale = toRef(props, 'locale');
const size = toRef(props, 'size');
const neonEffect = toRef(props, 'neonEffect');
const animation = toRef(props, 'animation');
const namespace = toRef(props, 'namespace');
const zIndex = toRef(props, 'zIndex');

// 提供配置上下文
const configContext: ConfigContext = {
  theme,
  locale,
  size,
  neonEffect,
  animation,
  namespace,
  zIndex,
};

provide(CONFIG_PROVIDER_INJECTION_KEY, configContext);

// 计算属性
const providerClasses = computed(() => {
  const classes = [
    `${namespace.value}-config-provider`,
    `${namespace.value}-theme-${theme.value}`,
    `${namespace.value}-size-${size.value}`,
  ];

  if (!neonEffect.value) {
    classes.push(`${namespace.value}-no-neon`);
  }

  if (!animation.value) {
    classes.push(`${namespace.value}-no-animation`);
  }

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

// 监听语言变化，更新全局语言
watch(
  locale,
  (newLocale) => {
    setLocale(newLocale);
  },
  { immediate: true }
);

// 监听主题变化，更新 body 的 data-theme 属性
watch(
  theme,
  (newTheme, oldTheme) => {
    if (typeof document !== 'undefined') {
      // 添加过渡类
      if (oldTheme && animation.value) {
        document.documentElement.classList.add('ex-theme-transitioning');
      }

      // 更新主题属性
      document.documentElement.setAttribute('data-theme', newTheme);

      // 移除过渡类
      if (oldTheme && animation.value) {
        setTimeout(() => {
          document.documentElement.classList.remove('ex-theme-transitioning');
        }, 300);
      }

      // 触发自定义事件
      const event = new CustomEvent('ex-theme-change', {
        detail: { oldTheme, newTheme, timestamp: Date.now() },
      });
      document.dispatchEvent(event);
    }
  },
  { immediate: true }
);

// 监听动画偏好，更新 CSS 变量
watch(
  animation,
  (enabled) => {
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.documentElement.style.removeProperty('--ex-motion-duration-fast');
        document.documentElement.style.removeProperty('--ex-motion-duration-base');
        document.documentElement.style.removeProperty('--ex-motion-duration-medium');
        document.documentElement.style.removeProperty('--ex-motion-duration-slow');
      } else {
        document.documentElement.style.setProperty('--ex-motion-duration-fast', '0ms');
        document.documentElement.style.setProperty('--ex-motion-duration-base', '0ms');
        document.documentElement.style.setProperty('--ex-motion-duration-medium', '0ms');
        document.documentElement.style.setProperty('--ex-motion-duration-slow', '0ms');
      }
    }
  },
  { immediate: true }
);

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
