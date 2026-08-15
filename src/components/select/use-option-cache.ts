import { ref, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import type { SelectOption, SelectValue } from './types';

const REMOTE_OPTION_CACHE_LIMIT = 200;

/** 为远程分页保留近期选项，并保证当前已选标签不会被淘汰。 */
export function useRemoteOptionCache(
  options: ComputedRef<SelectOption[]>,
  remote: () => boolean,
  modelValue: () => SelectValue,
  multiple: () => boolean
): Ref<Map<string | number, SelectOption>> {
  const cache = ref(new Map<string | number, SelectOption>());

  watch(
    [options, remote, modelValue, multiple],
    ([nextOptions, isRemote, value, isMultiple]) => {
      if (!isRemote) {
        cache.value = new Map();
        return;
      }

      const nextCache = new Map(cache.value);
      nextOptions.forEach(option => {
        // 重新插入可把当前页刷新为最近使用顺序。
        nextCache.delete(option.value);
        nextCache.set(option.value, option);
      });
      const selectedValues = new Set<string | number>(
        isMultiple
          ? Array.isArray(value)
            ? value
            : []
          : typeof value === 'string' || typeof value === 'number'
            ? [value]
            : []
      );
      const targetSize = Math.max(REMOTE_OPTION_CACHE_LIMIT, selectedValues.size);
      for (const key of nextCache.keys()) {
        if (nextCache.size <= targetSize) break;
        if (!selectedValues.has(key)) nextCache.delete(key);
      }
      cache.value = nextCache;
    },
    { immediate: true }
  );

  return cache;
}
