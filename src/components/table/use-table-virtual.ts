import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type ComputedRef,
  type Ref,
  type ComponentPublicInstance,
} from 'vue';
import type { ExTableProps } from './types';
import type { DisplayTableRow } from './use-table-rows';

export const DEFAULT_ROW_HEIGHT = 48;
export const DEFAULT_VIRTUAL_HEIGHT = 400;
export const DEFAULT_VIRTUAL_BUFFER = 6;
const DEFAULT_DETAIL_HEIGHT = 120;
const positive = (value: number | undefined, fallback: number) =>
  Number.isFinite(value) && (value ?? 0) > 0 ? value! : fallback;

/** 数据行保持固定高度，详情行按实测高度定位；跨度窗口完整包含合并锚点。 */
export function useTableVirtual(
  props: ExTableProps,
  rows: ComputedRef<DisplayTableRow[]>,
  container: Ref<HTMLDivElement | undefined>,
  hasDetails: (row: DisplayTableRow) => boolean,
  extendRange: (start: number, end: number) => { start: number; end: number }
) {
  const scrollTop = ref(0);
  const measurementRevision = ref(0);
  const detailHeights = new Map<string | number, number>();
  const rowHeights = new Map<string | number, number>();
  const elements = new Map<string, Element>();
  const elementKeys = new WeakMap<Element, { key: string | number; detail: boolean }>();
  let observer: ResizeObserver | undefined;
  let raf: number | undefined;
  const normalizedRowHeight = computed(() => positive(props.rowHeight, DEFAULT_ROW_HEIGHT));
  const viewportHeight = computed(() =>
    positive(
      props.virtualHeight,
      positive(
        typeof props.maxHeight === 'number' ? props.maxHeight : undefined,
        DEFAULT_VIRTUAL_HEIGHT
      )
    )
  );
  const useVirtual = computed(() => Boolean(props.virtual && rows.value.length));
  const dynamicRows = computed(() => props.layout === 'card' || Boolean(props.editable));
  const offsets = computed(() => {
    void measurementRevision.value;
    const result = [0];
    for (const row of rows.value)
      result.push(
        result[result.length - 1]! +
          (dynamicRows.value
            ? (rowHeights.get(row.key) ?? normalizedRowHeight.value)
            : normalizedRowHeight.value) +
          (hasDetails(row)
            ? (detailHeights.get(row.key) ??
              positive(props.expandedRowHeight, DEFAULT_DETAIL_HEIGHT))
            : 0)
      );
    return result;
  });
  const findOffset = (position: number) => {
    let low = 0;
    let high = rows.value.length;
    while (low < high) {
      const middle = Math.floor((low + high + 1) / 2);
      if (offsets.value[middle]! <= position) low = middle;
      else high = middle - 1;
    }
    return Math.min(low, Math.max(0, rows.value.length - 1));
  };
  const virtualRange = computed(() => {
    if (!useVirtual.value) return { start: 0, end: rows.value.length };
    const buffer =
      Number.isFinite(props.virtualBuffer) && (props.virtualBuffer ?? -1) >= 0
        ? Math.floor(props.virtualBuffer!)
        : DEFAULT_VIRTUAL_BUFFER;
    const top = Math.min(
      scrollTop.value,
      Math.max(0, offsets.value[offsets.value.length - 1]! - viewportHeight.value)
    );
    const start = Math.max(0, findOffset(top) - buffer);
    const end = Math.min(
      rows.value.length,
      findOffset(top + viewportHeight.value - 1) + 1 + buffer
    );
    return extendRange(start, end);
  });
  const renderRows = computed(() =>
    rows.value.slice(virtualRange.value.start, virtualRange.value.end)
  );
  const topSpacerHeight = computed(() =>
    useVirtual.value ? offsets.value[virtualRange.value.start]! : 0
  );
  const bottomSpacerHeight = computed(() =>
    useVirtual.value
      ? offsets.value[offsets.value.length - 1]! - offsets.value[virtualRange.value.end]!
      : 0
  );
  const handleVirtualScroll = () => {
    if (!useVirtual.value || !container.value || raf !== undefined) return;
    raf = requestAnimationFrame(() => {
      raf = undefined;
      scrollTop.value = container.value?.scrollTop ?? 0;
    });
  };
  function measure(measured: Element[]) {
    const anchor = findOffset(scrollTop.value);
    const oldOffset = offsets.value[anchor] ?? 0;
    let changed = false;
    for (const element of measured) {
      const identity = elementKeys.get(element);
      if (!identity) continue;
      const elementId = `${identity.detail ? 'detail' : 'row'}:${typeof identity.key}:${identity.key}`;
      if (elements.get(elementId) !== element) continue;
      const style = getComputedStyle(element);
      const height =
        element.getBoundingClientRect().height +
        (Number.parseFloat(style.marginTop) || 0) +
        (Number.parseFloat(style.marginBottom) || 0);
      const cache = identity.detail ? detailHeights : rowHeights;
      if (height > 0 && height !== cache.get(identity.key)) {
        cache.set(identity.key, height);
        changed = true;
      }
    }
    if (changed) {
      measurementRevision.value += 1;
      // 可见窗口上方的缓冲行发生变化时，保持用户正在阅读的行位置。
      const correction = (offsets.value[anchor] ?? 0) - oldOffset;
      if (correction && container.value) {
        container.value.scrollTop += correction;
        scrollTop.value = container.value.scrollTop;
      }
    }
  }
  function setMeasuredRef(
    key: string | number,
    instance: Element | ComponentPublicInstance | null,
    detail: boolean
  ) {
    const element = instance instanceof Element ? instance : undefined;
    const identity = `${detail ? 'detail' : 'row'}:${typeof key}:${key}`;
    const old = elements.get(identity);
    if (old === element) return;
    if (old) {
      observer?.unobserve(old);
      elementKeys.delete(old);
      elements.delete(identity);
    }
    if (!element) return;
    elements.set(identity, element);
    elementKeys.set(element, { key, detail });
    observer?.observe(element);
    nextTick(() => {
      if (elements.get(identity) === element) measure([element]);
    });
  }
  const setDetailRef = (key: string | number, instance: Element | ComponentPublicInstance | null) =>
    setMeasuredRef(key, props.virtual ? instance : null, true);
  const setRowRef = (key: string | number, instance: Element | ComponentPublicInstance | null) => {
    setMeasuredRef(key, props.virtual && dynamicRows.value ? instance : null, false);
  };
  onMounted(() => {
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(entries => measure(entries.map(entry => entry.target)));
      for (const element of elements.values()) observer.observe(element);
    }
  });
  watch(rows, value => {
    const keys = new Set(value.map(row => row.key));
    for (const key of detailHeights.keys()) if (!keys.has(key)) detailHeights.delete(key);
    for (const key of rowHeights.keys()) if (!keys.has(key)) rowHeights.delete(key);
  });
  watch(
    [offsets, viewportHeight],
    () => {
      if (!useVirtual.value || !container.value) return;
      const maximum = Math.max(0, offsets.value[offsets.value.length - 1]! - viewportHeight.value);
      if (container.value.scrollTop > maximum) {
        container.value.scrollTop = maximum;
        scrollTop.value = maximum;
      }
    },
    { flush: 'post' }
  );
  onBeforeUnmount(() => {
    observer?.disconnect();
    elements.clear();
    detailHeights.clear();
    rowHeights.clear();
    if (raf !== undefined) cancelAnimationFrame(raf);
  });
  return {
    useVirtual,
    dynamicRows,
    normalizedRowHeight,
    viewportHeight,
    renderRows,
    topSpacerHeight,
    bottomSpacerHeight,
    handleVirtualScroll,
    setDetailRef,
    setRowRef,
  };
}
