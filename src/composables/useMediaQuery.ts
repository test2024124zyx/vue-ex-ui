import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { Ref } from 'vue';

export interface UseMediaQueryOptions {
  /** SSR 或不支持媒体查询时使用的初始值。 */
  initialValue?: boolean;
}

/**
 * 监听媒体查询并随组件作用域自动清理。
 */
export function useMediaQuery(query: string, options: UseMediaQueryOptions = {}): Ref<boolean> {
  if (!query.trim()) {
    throw new TypeError('[ExUI] 媒体查询不能为空');
  }

  const matches = ref(options.initialValue ?? false);
  let mediaQueryList: MediaQueryList | null = null;

  const updateMatches = (event: MediaQueryListEvent | MediaQueryList): void => {
    matches.value = event.matches;
  };

  onMounted(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    try {
      mediaQueryList = window.matchMedia(query);
      matches.value = mediaQueryList.matches;
    } catch {
      // 不支持的查询保持调用方提供的初始值，不污染宿主控制台。
      return;
    }

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', updateMatches);
    } else {
      mediaQueryList.addListener(updateMatches);
    }
  });

  onBeforeUnmount(() => {
    if (!mediaQueryList) return;

    if (typeof mediaQueryList.removeEventListener === 'function') {
      mediaQueryList.removeEventListener('change', updateMatches);
    } else {
      mediaQueryList.removeListener(updateMatches);
    }
    mediaQueryList = null;
  });

  return matches;
}

export function useMediaQueries<T extends Record<string, string>>(
  queries: T
): { [K in keyof T]: Ref<boolean> } {
  const result = {} as { [K in keyof T]: Ref<boolean> };

  for (const key of Object.keys(queries) as Array<keyof T>) {
    const query = queries[key];
    if (typeof query !== 'string') {
      throw new TypeError(`[ExUI] 媒体查询 ${String(key)} 必须是字符串`);
    }
    result[key] = useMediaQuery(query);
  }

  return result;
}

export const breakpointQueries = {
  xs: '(max-width: 479px)',
  sm: '(min-width: 480px) and (max-width: 767px)',
  md: '(min-width: 768px) and (max-width: 1023px)',
  lg: '(min-width: 1024px) and (max-width: 1279px)',
  xl: '(min-width: 1280px) and (max-width: 1535px)',
  xxl: '(min-width: 1536px)',
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1279px)',
  desktop: '(min-width: 1280px)',
} as const;

export function useBreakpoints(): {
  [K in keyof typeof breakpointQueries]: Ref<boolean>;
} {
  return useMediaQueries(breakpointQueries);
}
