import { computed, onBeforeUpdate, ref } from 'vue';
import type { ComputedRef } from 'vue';

/** 插槽、attrs 和 vnode 监听器不保证响应式，在组件更新前使其派生缓存失效。 */
export function useRenderComputed<T>(getter: () => T): ComputedRef<T> {
  const revision = ref(0);
  onBeforeUpdate(() => {
    revision.value += 1;
  });
  return computed(() => {
    void revision.value;
    return getter();
  });
}
