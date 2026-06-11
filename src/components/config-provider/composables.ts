// ExUI Config Provider Composables
// 配置提供者组合式 API

import { inject, computed, unref } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import type { ConfigContext, Theme, ComponentSize } from './types';
import { CONFIG_PROVIDER_INJECTION_KEY, DEFAULT_CONFIG } from './types';
import type { SupportedLocale } from '../../locale';

/**
 * 使用配置上下文
 */
export function useConfig(): ConfigContext {
  const config = inject(CONFIG_PROVIDER_INJECTION_KEY, null);

  if (!config) {
    // 如果没有提供配置，返回默认配置
    return {
      theme: computed(() => DEFAULT_CONFIG.theme),
      locale: computed(() => DEFAULT_CONFIG.locale),
      size: computed(() => DEFAULT_CONFIG.size),
      neonEffect: computed(() => DEFAULT_CONFIG.neonEffect),
      animation: computed(() => DEFAULT_CONFIG.animation),
      namespace: computed(() => DEFAULT_CONFIG.namespace),
      zIndex: computed(() => DEFAULT_CONFIG.zIndex),
    } as ConfigContext;
  }

  return config;
}

/**
 * 使用全局配置（useConfig 的别名，更语义化）
 */
export function useGlobalConfig(): ConfigContext {
  return useConfig();
}

/**
 * 使用主题（从 ConfigProvider 获取）
 */
export function useConfigTheme(): ComputedRef<Theme> {
  const config = useConfig();
  return computed(() => unref(config.theme));
}

/**
 * 使用主题切换（带设置功能）
 * 注意：这个函数返回的 setTheme 只在 ConfigProvider 内部有效
 * 如果需要全局主题切换，请使用 src/composables/useTheme.ts 中的 API
 */
export function useThemeSwitch(): {
  theme: ComputedRef<Theme>;
  setTheme: (theme: Theme) => void;
} {
  const config = useConfig();
  const theme = computed(() => unref(config.theme));

  const setTheme = (newTheme: Theme) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  return {
    theme,
    setTheme,
  };
}

/**
 * 使用语言
 */
export function useLocale(): ComputedRef<SupportedLocale> {
  const config = useConfig();
  return computed(() => unref(config.locale));
}

/**
 * 使用全局尺寸
 */
export function useGlobalSize(): ComputedRef<ComponentSize> {
  const config = useConfig();
  return computed(() => unref(config.size));
}

/**
 * 使用组件尺寸（支持组件级别覆盖）
 */
export function useComponentSize(
  componentSize?: Ref<ComponentSize | undefined> | ComponentSize
): ComputedRef<ComponentSize> {
  const globalSize = useGlobalSize();

  return computed(() => {
    const size = unref(componentSize);
    return size || globalSize.value;
  });
}

/**
 * 使用霓虹效果
 */
export function useNeonEffect(): ComputedRef<boolean> {
  const config = useConfig();
  return computed(() => unref(config.neonEffect));
}

/**
 * 使用动画
 */
export function useAnimation(): ComputedRef<boolean> {
  const config = useConfig();
  return computed(() => unref(config.animation));
}

/**
 * 使用命名空间
 */
export function useNamespace(block?: string): {
  namespace: ComputedRef<string>;
  b: ComputedRef<string>;
  e: (element: string) => ComputedRef<string>;
  m: (modifier: string) => ComputedRef<string>;
  em: (element: string, modifier: string) => ComputedRef<string>;
  is: (name: string, state?: boolean | Ref<boolean>) => ComputedRef<string>;
} {
  const config = useConfig();
  const namespace = computed(() => unref(config.namespace));

  // Block
  const b = computed(() => {
    return block ? `${namespace.value}-${block}` : namespace.value;
  });

  // Element
  const e = (element: string) => {
    return computed(() => `${b.value}__${element}`);
  };

  // Modifier
  const m = (modifier: string) => {
    return computed(() => `${b.value}--${modifier}`);
  };

  // Element + Modifier
  const em = (element: string, modifier: string) => {
    return computed(() => `${b.value}__${element}--${modifier}`);
  };

  // State
  const is = (name: string, state?: boolean | Ref<boolean>) => {
    return computed(() => {
      const stateValue = state !== undefined ? unref(state) : true;
      return stateValue ? `is-${name}` : '';
    });
  };

  return {
    namespace,
    b,
    e,
    m,
    em,
    is,
  };
}

/**
 * 使用 z-index
 */
export function useZIndex(offset: number = 0): ComputedRef<number> {
  const config = useConfig();
  return computed(() => unref(config.zIndex) + offset);
}
