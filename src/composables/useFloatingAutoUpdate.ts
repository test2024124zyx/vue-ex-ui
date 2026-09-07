import { nextTick, onBeforeUnmount, watch } from 'vue';
import type { Ref, WatchSource } from 'vue';

/** 动态定位属性与内容尺寸共用更新任务；销毁和隐藏后不再测量布局。 */
export function useFloatingAutoUpdate(
  active: Readonly<Ref<boolean>>,
  elements: Ref<HTMLElement | undefined>[],
  sources: WatchSource[],
  update: () => void
) {
  let disposed = false;
  let observer: ResizeObserver | undefined;
  let frame: number | undefined;
  let revision = 0;
  const cancel = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  };
  const schedule = () => {
    if (disposed || !active.value || frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      if (!disposed && active.value) update();
    });
  };
  watch(
    [active, ...elements],
    async () => {
      const currentRevision = ++revision;
      observer?.disconnect();
      observer = undefined;
      cancel();
      await nextTick();
      if (
        disposed ||
        currentRevision !== revision ||
        !active.value ||
        !elements.every(element => element.value)
      )
        return;
      update();
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(schedule);
        elements.forEach(element => observer!.observe(element.value!));
      }
    },
    { immediate: true, flush: 'post' }
  );
  watch(
    sources,
    async () => {
      await nextTick();
      if (!disposed && active.value) update();
    },
    { deep: true }
  );
  onBeforeUnmount(() => {
    disposed = true;
    observer?.disconnect();
    cancel();
  });
  return schedule;
}
