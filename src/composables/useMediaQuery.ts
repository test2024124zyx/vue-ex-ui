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

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    try {
      mediaQueryList = window.matchMedia(query);
      matches.value = mediaQueryList.matches;
    } catch {
      // 不支持的查询保持调用方提供的初始值，不污染宿主控制台。
    }
  }

  const updateMatches = (event: MediaQueryListEvent | MediaQueryList): void => {
    matches.value = event.matches;
  };

  onMounted(() => {
    if (!mediaQueryList) return;

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
  xs: '(max-width: 575px)',
  sm: '(min-width: 576px) and (max-width: 767px)',
  md: '(min-width: 768px) and (max-width: 991px)',
  lg: '(min-width: 992px) and (max-width: 1199px)',
  xl: '(min-width: 1200px) and (max-width: 1599px)',
  xxl: '(min-width: 1600px)',
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1199px)',
  desktop: '(min-width: 1200px)',
} as const;

export function useBreakpoints(): {
  [K in keyof typeof breakpointQueries]: Ref<boolean>;
} {
  return useMediaQueries(breakpointQueries);
}
