import { computed, inject, unref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { SupportedLocale } from '../../locale';
import type { ComponentSize, ConfigContext, Theme } from './types';
import { CONFIG_PROVIDER_INJECTION_KEY, DEFAULT_CONFIG } from './types';

/** 获取最近一层配置；未使用提供者时返回稳定的只读默认值。 */
export function useConfig(): ConfigContext {
  return (
    inject(CONFIG_PROVIDER_INJECTION_KEY, null) ?? {
      theme: computed(() => DEFAULT_CONFIG.theme),
      locale: computed(() => DEFAULT_CONFIG.locale),
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
