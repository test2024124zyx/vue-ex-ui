import { computed, onBeforeUnmount, onBeforeUpdate, onUpdated, ref, watch } from 'vue';
import type { Ref } from 'vue';

const DEFAULT_PAGE_COUNT = 7;
const BOUNDARY_PAGE_COUNT = 2;
const DIRECTION_BUTTON_COUNT = 2;
const MINIMUM_PAGE_COUNT = BOUNDARY_PAGE_COUNT + 1;

interface PaginationOptions {
  total: Ref<number>;
  current: Ref<number>;
  showPages: () => number;
  simple: () => boolean;
}

/** 按实际按钮尺寸计算容量，测量节点始终保留，避免删减页码后宽度反复振荡。 */
export function useResponsivePagination(
  root: Ref<HTMLElement | undefined>,
  itemsRef: Ref<HTMLDivElement | undefined>,
  measureRef: Ref<HTMLSpanElement | undefined>,
  options: PaginationOptions
) {
  const itemWidth = ref(0);
  const gap = ref(0);
  const availableWidth = ref(0);
  let observer: ResizeObserver | undefined;
  let frame: number | undefined;
  let previousFocus: HTMLElement | undefined;

  const maximumPages = computed(() => {
    const requested = options.showPages();
    const valid = Number.isFinite(requested) ? Math.floor(requested) : DEFAULT_PAGE_COUNT;
    // 页码上限使用奇数；首尾与当前页优先保留。
    return Math.min(
      options.total.value,
      Math.max(MINIMUM_PAGE_COUNT, valid - (valid % 2 === 0 ? 1 : 0))
    );
  });
  const minimumPages = computed(() =>
    Math.min(
      options.total.value,
      options.current.value > 1 && options.current.value < options.total.value
        ? MINIMUM_PAGE_COUNT
        : BOUNDARY_PAGE_COUNT
    )
  );

  function createPages(count: number) {
    const middleCount = Math.max(0, count - BOUNDARY_PAGE_COUNT);
    const start = Math.max(
      2,
      Math.min(
        options.current.value - Math.floor(middleCount / 2),
        options.total.value - middleCount
      )
    );
    const pages = Array.from({ length: middleCount }, (_, index) => start + index);
    return {
      pages,
      previousMore: pages.length > 0 && pages[0]! > 2,
      nextMore: pages.length > 0 && pages[pages.length - 1]! < options.total.value - 1,
    };
  }

  const preferred = computed(() => createPages(maximumPages.value));
  const buttonCount = (pageCount: number, layout: ReturnType<typeof createPages>) =>
    pageCount + DIRECTION_BUTTON_COUNT + Number(layout.previousMore) + Number(layout.nextMore);
  const widthFor = (count: number) => count * itemWidth.value + Math.max(0, count - 1) * gap.value;
  const itemsStyle = computed(() => {
    if (itemWidth.value <= 0 || options.simple()) return undefined;
    return {
      '--ex-pagination-measured-item-width': `${itemWidth.value}px`,
      flexBasis: `${widthFor(buttonCount(maximumPages.value, preferred.value))}px`,
      minWidth: `min(100%, ${widthFor(minimumPages.value + DIRECTION_BUTTON_COUNT)}px)`,
    };
  });

  const layout = computed(() => {
    if (itemWidth.value <= 0 || availableWidth.value <= 0) return preferred.value;
    const capacity = Math.floor((availableWidth.value + gap.value) / (itemWidth.value + gap.value));
    // 优先保留省略号；最少页码仍放不下时隐藏省略号，首尾与当前页保持可操作。
    for (
      let count = Math.min(maximumPages.value, capacity - DIRECTION_BUTTON_COUNT);
      count >= minimumPages.value;
      count--
    ) {
      const candidate = createPages(count);
      if (buttonCount(count, candidate) <= capacity) return candidate;
    }
    return { ...createPages(minimumPages.value), previousMore: false, nextMore: false };
  });

  function measure() {
    if (!itemsRef.value || !measureRef.value) return;
    const width = Math.max(
      ...Array.from(measureRef.value.children, child => child.getBoundingClientRect().width)
    );
    if (width <= 0) return;
    itemWidth.value = Math.ceil(width);
    gap.value = Number.parseFloat(getComputedStyle(itemsRef.value).columnGap) || 0;
    availableWidth.value = itemsRef.value.getBoundingClientRect().width;
  }

  function cancelMeasurement() {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
  }

  function scheduleMeasurement() {
    if (frame !== undefined) return;
    // 下一帧再改变页码布局，避免在 ResizeObserver 的同一轮通知内再次触发尺寸变化。
    frame = requestAnimationFrame(() => {
      frame = undefined;
      measure();
    });
  }

  watch(
    [root, itemsRef, measureRef],
    () => {
      observer?.disconnect();
      cancelMeasurement();
      if (!root.value || !itemsRef.value || !measureRef.value) return;
      observer = new ResizeObserver(scheduleMeasurement);
      [root.value, itemsRef.value, ...measureRef.value.children].forEach(element =>
        observer!.observe(element)
      );
      measure();
    },
    { flush: 'post' }
  );

  onBeforeUpdate(() => {
    const active = root.value?.ownerDocument.activeElement;
    previousFocus =
      active instanceof HTMLElement && itemsRef.value?.contains(active) ? active : undefined;
  });
  onUpdated(() => {
    if (previousFocus && !previousFocus.isConnected) {
      const current = itemsRef.value?.querySelector<HTMLElement>(
        '[aria-current="page"]:not(:disabled)'
      );
      const fallback = itemsRef.value?.querySelector<HTMLElement>(
        'button:not(:disabled), input:not(:disabled)'
      );
      (current ?? fallback)?.focus({ preventScroll: true });
    }
    previousFocus = undefined;
    measure();
  });
  onBeforeUnmount(() => {
    observer?.disconnect();
    cancelMeasurement();
  });

  return { itemsStyle, layout };
}
