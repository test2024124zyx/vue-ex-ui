import { computed, inject, unref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import { useI18n, type SupportedLocale } from '../../locale';
import type { ComponentSize, ConfigContext, Theme } from './types';
import { CONFIG_PROVIDER_INJECTION_KEY, DEFAULT_CONFIG } from './types';
import type { ZIndexLayer } from './z-index';
import { resolveZIndexLayer } from './z-index';
import { getTheme } from '../../composables/useTheme';
import { resolveThemeOverrides } from './theme-overrides';

/** 获取最近一层配置；未使用提供者时返回稳定的只读默认值。 */
export function useConfig(): ConfigContext {
  const composer = useI18n();
  return (
    inject(CONFIG_PROVIDER_INJECTION_KEY, null) ?? {
      theme: computed(getTheme),
      themeOverrides: computed(() => DEFAULT_CONFIG.themeOverrides),
      locale: computed(() => composer.locale.value as SupportedLocale),
      size: computed(() => DEFAULT_CONFIG.size),
      neonEffect: computed(() => DEFAULT_CONFIG.neonEffect),
      animation: computed(() => DEFAULT_CONFIG.animation),
      zIndex: computed(() => DEFAULT_CONFIG.zIndex),
    }
  );
}

export function useGlobalConfig(): ConfigContext {
  return useConfig();
}

export function useConfigTheme(): ComputedRef<Theme> {
  const config = useConfig();
  return computed(() => unref(config.theme));
}

/** 浮层使用相同品牌变量；返回只读派生值，避免子组件改写父级配置。 */
export function useThemeOverrides(): ComputedRef<Record<string, string>> {
  const config = useConfig();
  return computed(() => resolveThemeOverrides(config.themeOverrides?.value));
}

export function useLocale(): ComputedRef<SupportedLocale> {
  const config = useConfig();
  return computed(() => unref(config.locale));
}

export function useGlobalSize(): ComputedRef<ComponentSize> {
  const config = useConfig();
  return computed(() => unref(config.size));
}

export function useComponentSize(
  componentSize?: Ref<ComponentSize | undefined> | ComponentSize
): ComputedRef<ComponentSize> {
  const globalSize = useGlobalSize();
  return computed(() => unref(componentSize) ?? globalSize.value);
}

export function useNeonEffect(): ComputedRef<boolean> {
  const config = useConfig();
  return computed(() => unref(config.neonEffect));
}

export function useAnimation(): ComputedRef<boolean> {
  const config = useConfig();
  return computed(() => unref(config.animation));
}

export function useZIndex(offset = 0): ComputedRef<number> {
  const config = useConfig();
  return computed(() => unref(config.zIndex) + offset);
}

/** 按统一语义层级解析最近 ConfigProvider 的最终 z-index。 */
export function useZIndexLayer(layer: ZIndexLayer): ComputedRef<number> {
  const config = useConfig();
  return computed(() => resolveZIndexLayer(unref(config.zIndex), layer));
}
