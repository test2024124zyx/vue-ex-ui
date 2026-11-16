import { computed, onBeforeUnmount, onMounted, shallowRef, watch, type Ref } from 'vue';
import { createFrameTask } from '../../utils/frame-task';

export const CODE_WINDOW_MIN_LINES = 500;
export const CODE_WINDOW_MAX_HEIGHT = '24rem';
const INITIAL_ROWS = 32;
const OVERSCAN_ROWS = 6;

interface WindowLayout {
  total: number;
  lineHeight: number;
  insetTop: number;
  width: number;
  topAt: (index: number) => number;
  topAtOffset?: (offset: number) => number | undefined;
}

export function useCodeWindow(
  source: Readonly<Ref<string>>,
  lineCount: Readonly<Ref<number>>,
  wraps: Readonly<Ref<boolean>>,
  scroller: Ref<HTMLDivElement | undefined>,
  measurement: Ref<HTMLDivElement | undefined>
) {
  const active = computed(() => lineCount.value >= CODE_WINDOW_MIN_LINES);
  const offsets = computed(() => {
    const text = source.value;
    const result = [0];
    let index = text.indexOf('\n');
    while (index >= 0) {
      result.push(index + 1);
      index = text.indexOf('\n', index + 1);
    }
    return result;
  });
  const range = shallowRef<{
    start: number;
    end: number;
    top: number;
    bottom: number;
    width: number;
  }>();
  let layout: WindowLayout | undefined;
  let observer: ResizeObserver | undefined;

  function rowAt(position: number): number {
    const current = layout;
    if (!current) return 0;
    let low = 0;
    let high = lineCount.value;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (current.topAt(middle) <= position) low = middle + 1;
      else high = middle;
    }
    return Math.max(0, low - 1);
  }

  function updateRange(): void {
    const element = scroller.value;
    if (!element || !layout) return;
    const count = lineCount.value;
    const first = Math.max(0, element.scrollTop - layout.insetTop);
    const start = Math.max(0, rowAt(first) - OVERSCAN_ROWS);
    const end = Math.min(count, rowAt(first + element.clientHeight) + 1 + OVERSCAN_ROWS);
    const top = layout.topAt(start);
    const bottom = Math.max(0, layout.total - layout.topAt(end));
    const previous = range.value;
    if (
      previous?.start === start &&
      previous.end === end &&
      previous.top === top &&
      previous.bottom === bottom &&
      previous.width === layout.width
    )
      return;
    range.value = { start, end, top, bottom, width: layout.width };
  }
  const frame = createFrameTask(updateRange);

  function measure(): void {
    const element = measurement.value;
    const viewport = scroller.value;
    const view = viewport?.ownerDocument.defaultView;
    if (!active.value || !element || !viewport || !view) {
      layout = undefined;
      range.value = undefined;
      return;
    }
    const style = view.getComputedStyle(element);
    const styledLineHeight = Number.parseFloat(style.lineHeight);
    if (!viewport.clientHeight || !styledLineHeight) return;
    const count = lineCount.value;
    const insetTop = Number.parseFloat(style.top) || 0;
    if (!wraps.value) {
      const total = element.offsetHeight || count * styledLineHeight;
      const lineHeight = total / count;
      layout = {
        lineHeight,
        insetTop,
        total,
        width: element.offsetWidth + (Number.parseFloat(style.left) || 0),
        topAt: index => index * lineHeight,
      };
    } else {
      const text = element.firstChild;
      if (!(text instanceof Text)) return;
      const starts = offsets.value;
      const total = element.offsetHeight || element.getBoundingClientRect().height;
      if (!total) return;
      const lineHeight = styledLineHeight;
      const probe = element.ownerDocument.createRange();
      const readTop = (offset: number) => {
        const start = Math.min(offset, text.length - 1);
        probe.setStart(text, start);
        probe.setEnd(text, start + 1);
        const rect = probe.getClientRects()[0];
        if (!rect) return undefined;
        const bounds = element.getBoundingClientRect();
        // 使用当前边界消除滚动平移和缩放，结果保存在未变换的布局坐标中。
        const scale = bounds.height / total;
        return scale ? (rect.top - bounds.top) / scale : undefined;
      };
      const origin = readTop(0);
      if (origin === undefined) return;
      const topAtOffset = (offset: number) => {
        const top = readTop(offset);
        // 直接采用每个起点的布局坐标，避免分数行高在长文件中累积误差。
        return top === undefined ? undefined : Math.max(0, top - origin);
      };
      const positions = new Map([
        [0, 0],
        [count, total],
      ]);
      // 软换行由浏览器按真实字体和宽度排版，按需查询逻辑行的起始位置。
      const topAt = (index: number): number => {
        const known = positions.get(index);
        if (known !== undefined) return known;
        const result = topAtOffset(starts[index]!) ?? index * lineHeight;
        positions.set(index, result);
        return result;
      };
      layout = { lineHeight, insetTop, total, width: 0, topAt, topAtOffset };
    }
    updateRange();
  }

  const syncObserver = () => {
    observer?.disconnect();
    if (active.value && observer && scroller.value && measurement.value) {
      observer.observe(scroller.value);
      observer.observe(measurement.value);
    }
    measure();
  };
  onMounted(() => {
    if (typeof ResizeObserver !== 'undefined') observer = new ResizeObserver(measure);
    syncObserver();
  });
  watch([active, scroller, measurement], syncObserver, { flush: 'post' });
  watch([source, wraps], measure, { flush: 'post' });
  onBeforeUnmount(() => {
    observer?.disconnect();
    frame.cancel();
  });

  function revealCaret(editor: HTMLTextAreaElement): void {
    const viewport = scroller.value;
    if (!layout || !viewport || editor.ownerDocument.activeElement !== editor) return;
    const caret =
      editor.selectionDirection === 'backward' ? editor.selectionStart : editor.selectionEnd;
    const starts = offsets.value;
    let low = 0;
    let high = starts.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if (starts[middle]! <= caret) low = middle + 1;
      else high = middle;
    }
    const top =
      (layout.topAtOffset?.(caret) ?? layout.topAt(Math.max(0, low - 1))) + layout.insetTop;
    const bottom = top + layout.lineHeight;
    if (top < viewport.scrollTop) viewport.scrollTop = top;
    else if (bottom > viewport.scrollTop + viewport.clientHeight) {
      viewport.scrollTop = bottom - viewport.clientHeight;
    }
    updateRange();
  }

  const start = computed(() => (active.value ? (range.value?.start ?? 0) : 0));
  const end = computed(() =>
    active.value ? (range.value?.end ?? Math.min(INITIAL_ROWS, lineCount.value)) : lineCount.value
  );
  const top = computed(() => `${range.value?.top ?? 0}px`);
  const bottom = computed(() =>
    range.value
      ? `${range.value.bottom}px`
      : `calc(${lineCount.value - end.value} * 1em * var(--ex-code-line-height))`
  );
  const width = computed(() => (range.value?.width ? `${range.value.width}px` : undefined));
  const onScroll = () => {
    if (active.value) frame.schedule();
  };
  return { active, start, end, top, bottom, width, onScroll, revealCaret };
}
