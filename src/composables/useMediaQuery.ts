/**
 * useMediaQuery - 响应式媒体查询 Hook
 * 用于安全地监听媒体查询变化，自动处理内存清理
 */

import { ref, onMounted, onUnmounted, Ref } from 'vue'

export interface UseMediaQueryOptions {
  /**
   * 初始值（用于 SSR）
   */
  initialValue?: boolean
}

/**
 * 监听媒体查询
 * @param query - 媒体查询字符串，如 '(max-width: 768px)'
 * @param options - 配置选项
 * @returns 是否匹配的响应式引用
 */
export function useMediaQuery(
  query: string,
  options: UseMediaQueryOptions = {}
): Ref<boolean> {
  const { initialValue = false } = options
  const matches = ref(initialValue)

  // SSR 安全检查
  if (typeof window === 'undefined') {
    return matches
  }

  let mediaQueryList: MediaQueryList | null = null

  const updateMatches = (e: MediaQueryListEvent | MediaQueryList) => {
    matches.value = e.matches
  }

  onMounted(() => {
    try {
      mediaQueryList = window.matchMedia(query)
      
      // 设置初始值
      matches.value = mediaQueryList.matches

      // 添加监听器（兼容新旧 API）
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener('change', updateMatches)
      } else {
        // 兼容旧版浏览器
        mediaQueryList.addListener(updateMatches)
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`Failed to create media query: ${query}`, error);
      }
    }
  })

  onUnmounted(() => {
    if (mediaQueryList) {
      try {
        // 移除监听器（兼容新旧 API）
        if (mediaQueryList.removeEventListener) {
          mediaQueryList.removeEventListener('change', updateMatches)
        } else {
          // 兼容旧版浏览器
          mediaQueryList.removeListener(updateMatches)
        }
      } catch (error) {
        console.warn('Failed to remove media query listener', error)
      }
      mediaQueryList = null
    }
  })

  return matches
}

/**
 * 监听多个媒体查询
 * @param queries - 媒体查询对象，键为名称，值为查询字符串
 * @returns 匹配结果的响应式对象
 */
export function useMediaQueries<T extends Record<string, string>>(
  queries: T
): Record<keyof T, Ref<boolean>> {
  const result = {} as Record<keyof T, Ref<boolean>>

  for (const key in queries) {
    const queryValue = queries[key]
    if (queryValue) {
      result[key] = useMediaQuery(queryValue)
    }
  }

  return result
}

/**
 * 预定义的断点查询
 */
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
} as const

/**
 * 使用预定义断点
 * @returns 各断点的匹配状态
 */
export function useBreakpoints() {
  return useMediaQueries(breakpointQueries)
}
