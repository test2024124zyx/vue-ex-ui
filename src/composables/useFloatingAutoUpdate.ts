import { nextTick, onBeforeUnmount, watch } from 'vue';
import type { Ref, WatchSource } from 'vue';
import { createFrameTask } from '../utils/frame-task';

type Active = Readonly<Ref<boolean>>;

function listenToViewport(active: Active, task: ReturnType<typeof createFrameTask>) {
  const detach = () => {
    task.cancel();
    if (typeof window === 'undefined') return;
    window.removeEventListener('resize', task.schedule);
    window.removeEventListener('scroll', task.schedule, true);
  };
  watch(
    active,
    enabled => {
      if (!enabled) return detach();
      if (typeof window === 'undefined') return;
      window.addEventListener('resize', task.schedule);
      window.addEventListener('scroll', task.schedule, { capture: true, passive: true });
    },
    { immediate: true }
  );
  onBeforeUnmount(detach);
}

/** 仅在浮层可见时跟踪滚动和视口尺寸。 */
export function useViewportPosition(active: Active, update: () => void): void {
  listenToViewport(
    active,
    createFrameTask(() => {
      if (active.value) update();
    })
  );
}

/** 动态定位属性与内容尺寸共用更新任务；销毁和隐藏后不再测量布局。 */
export function useFloatingAutoUpdate(
  active: Active,
  elements: Ref<HTMLElement | undefined>[],
  sources: WatchSource[],
  update: () => void,
  options?: { viewport?: boolean }
) {
  let disposed = false;
  let observer: ResizeObserver | undefined;
  let revision = 0;
  const task = createFrameTask(() => {
    if (!disposed && active.value) update();
  });
  const schedule = () => {
    if (!disposed && active.value) task.schedule();
  };
  if (options?.viewport) listenToViewport(active, { schedule, cancel: task.cancel });
  watch(
    [active, ...elements],
    async () => {
      const currentRevision = ++revision;
      observer?.disconnect();
      observer = undefined;
      task.cancel();
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
    task.cancel();
  });
  return schedule;
}
