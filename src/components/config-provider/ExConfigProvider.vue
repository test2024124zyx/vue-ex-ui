<template>
  <div
    :ref="bindProviderElement"
    :class="providerClasses"
    :style="providerStyles"
    :data-theme="theme"
    :data-ex-provider="providerId"
  >
    <EffectStyles />
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, getCurrentInstance, h, inject, onBeforeUnmount, provide, ref } from 'vue';
import type { ExConfigProviderProps, ConfigContext } from './types';
import { CONFIG_PROVIDER_INJECTION_KEY, DEFAULT_CONFIG } from './types';
import { LOCALE_INJECTION_KEY, useLocale } from '../../locale';
import { createProviderEffectStyles } from './effect-styles';
import { provideComponentServiceScope, registerServiceScopeElement } from './service-scope';
import { createZIndexCssVariables, normalizeZIndexBase } from './z-index';
import { getTheme } from '../../composables/useTheme';
import { resolveThemeOverrides } from './theme-overrides';
import { generateUUID } from '../../utils/id';

defineOptions({
  name: 'ExConfigProvider',
});

const props = withDefaults(defineProps<ExConfigProviderProps>(), {
  animation: undefined,
  neonEffect: undefined,
});

const providerRef = ref<HTMLDivElement>();
const parentConfig = inject(CONFIG_PROVIDER_INJECTION_KEY, null);
const inheritedLocale = useLocale('common').locale;
// 独立 App 的 useId 会重复；使用文档内唯一标识，并在水合 setup 中复用服务端根节点。
const hydrationRoot = getCurrentInstance()?.vnode.el;
const hydrationId =
  hydrationRoot?.nodeType === 1 ? hydrationRoot.getAttribute('data-ex-provider') : null;
const providerId =
  typeof hydrationId === 'string' && /^[0-9a-f]+(?:-[0-9a-f]+)*$/.test(hydrationId)
    ? hydrationId
    : generateUUID();
const EffectStyles = () =>
  // CSS 是内部规则与已校验标识组成，避免 SSR 把 style 原始文本中的引号转成 HTML 实体。
  h('style', {
    innerHTML: createProviderEffectStyles(providerId, animation.value, neonEffect.value),
  });

// 局部显式配置优先；根主题跟随全局状态，避免 Teleport 面板与页面明暗不一致。
const theme = computed(() => props.theme ?? parentConfig?.theme.value ?? getTheme());
const themeOverrides = computed(() =>
  resolveThemeOverrides(parentConfig?.themeOverrides?.value, props.themeOverrides, props.style)
);
const locale = computed(() => props.locale ?? parentConfig?.locale.value ?? inheritedLocale.value);
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
const serviceScope = provideComponentServiceScope();
let unregisterScopeElement: (() => void) | undefined;
// 函数 ref 在指令 mounted 前注册容器，支持同一模板中的 Provider 默认插槽。
const bindProviderElement = (element: unknown): void => {
  unregisterScopeElement?.();
  providerRef.value = element instanceof HTMLDivElement ? element : undefined;
  unregisterScopeElement = providerRef.value
    ? registerServiceScopeElement(providerRef.value, serviceScope)
    : undefined;
};
onBeforeUnmount(() => unregisterScopeElement?.());

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
  Object.assign(styles, createZIndexCssVariables(zIndex.value));

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
