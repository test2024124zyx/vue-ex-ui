import { nextTick, onMounted, onUnmounted, ref, toRefs, watch } from 'vue';
import { useConfigTheme } from '../config-provider/composables';
import { useTheme } from '../../composables/useTheme';
import { throttle } from '../../utils/throttle';
import { normalizeNumber, renderWatermarkTile } from './watermark-utils';
import type { ExWatermarkProps } from './types';

interface ElementSnapshot {
  className: string;
  style: string | null;
  ariaHidden: string | null;
}

interface WatermarkCallbacks {
  onError?: (error: Error) => void;
  onRemove?: () => void;
}

const DEFAULT_THROTTLE_DELAY = 100;
const DEFAULT_CANVAS_COLOR = 'rgba(0, 0, 0, 0.8)';
const DEFAULT_CANVAS_FONT = 'system-ui, sans-serif';
const PASSIVE_RESIZE_OPTIONS: AddEventListenerOptions = { passive: true };

const captureElement = (element: HTMLElement): ElementSnapshot => ({
  className: element.className,
  style: element.getAttribute('style'),
  ariaHidden: element.getAttribute('aria-hidden'),
});

const restoreAttribute = (element: HTMLElement, name: string, value: string | null): void => {
  if (value === null) element.removeAttribute(name);
  else element.setAttribute(name, value);
};

/**
 * 管理 Canvas 水印绘制、窗口重绘和防篡改生命周期。
 */
export function useWatermark(
  props: ExWatermarkProps,
  t: (key: string) => string,
  containerRef: { value: HTMLElement | null },
  overlayRef: { value: HTMLElement | null },
  callbacks: WatermarkCallbacks = {}
) {
  const overlayDataUrl = ref('');
  const tileWidth = ref(0);
  const tileHeight = ref(0);
  const configTheme = useConfigTheme();
  const { theme: documentTheme } = useTheme();

  let mounted = false;
  let renderRequestId = 0;
  let mutationObserver: MutationObserver | null = null;
  let overlaySnapshot: ElementSnapshot | null = null;
  let containerSnapshot: ElementSnapshot | null = null;
  let internalDomUpdate = false;
  let resizeListener: (() => void) | null = null;
  let throttledResize: ReturnType<typeof throttle> | null = null;

  const resolveText = (): string | string[] => {
    if (Array.isArray(props.text)) return props.text;
    return props.text || t('watermark.text') || 'Watermark';
  };

  const resolveCanvasStyle = (): { color: string; fontFamily: string } => {
    const overlay = overlayRef.value;
    if (!overlay || typeof window === 'undefined') {
      return {
        color: props.color?.trim() || DEFAULT_CANVAS_COLOR,
        fontFamily: props.fontFamily?.trim() || DEFAULT_CANVAS_FONT,
      };
    }

    const computedStyle = window.getComputedStyle(overlay);
    return {
      color: props.color?.trim() || computedStyle.color || DEFAULT_CANVAS_COLOR,
      fontFamily: props.fontFamily?.trim() || computedStyle.fontFamily || DEFAULT_CANVAS_FONT,
    };
  };

  const captureProtectionSnapshot = (): void => {
    if (!containerRef.value || !overlayRef.value) return;
    containerSnapshot = captureElement(containerRef.value);
    overlaySnapshot = captureElement(overlayRef.value);
  };

  const finishInternalDomUpdate = async (): Promise<void> => {
    internalDomUpdate = true;
    await nextTick();
    captureProtectionSnapshot();
    internalDomUpdate = false;
  };

  /** 重绘当前水印；只提交最后一次异步请求的结果。 */
  const refresh = async (): Promise<void> => {
    const requestId = ++renderRequestId;
    const canvasStyle = resolveCanvasStyle();
    const tile = await renderWatermarkTile({
      props,
      text: resolveText(),
      color: canvasStyle.color,
      fontFamily: canvasStyle.fontFamily,
      onError: error => {
        if (requestId === renderRequestId) callbacks.onError?.(error);
      },
    });
    if (!mounted || requestId !== renderRequestId) return;

    overlayDataUrl.value = tile.dataUrl;
    tileWidth.value = tile.width;
    tileHeight.value = tile.height;
    await finishInternalDomUpdate();
  };

  const toDataURL = (): string => overlayDataUrl.value;

  const observeProtectedElements = (): void => {
    if (!mutationObserver || !containerRef.value) return;
    mutationObserver.observe(containerRef.value, {
      attributes: true,
      childList: true,
      subtree: true,
      attributeFilter: ['aria-hidden', 'class', 'hidden', 'style'],
    });
  };

  const restoreProtectedElements = (wasRemoved: boolean): void => {
    const container = containerRef.value;
    const overlay = overlayRef.value;
    if (!container || !overlay || !containerSnapshot || !overlaySnapshot) return;

    mutationObserver?.disconnect();
    if (!container.contains(overlay)) container.insertBefore(overlay, container.firstChild);

    container.className = containerSnapshot.className;
    restoreAttribute(container, 'style', containerSnapshot.style);
    overlay.className = overlaySnapshot.className;
    restoreAttribute(overlay, 'style', overlaySnapshot.style);
    restoreAttribute(overlay, 'aria-hidden', overlaySnapshot.ariaHidden);
    overlay.hidden = false;
    observeProtectedElements();

    if (wasRemoved) callbacks.onRemove?.();
  };

  const startAntiTamper = (): void => {
    if (!mounted || !props.antiTamper || !containerRef.value || !overlayRef.value) return;
    mutationObserver?.disconnect();
    captureProtectionSnapshot();
    mutationObserver = new MutationObserver(mutations => {
      if (internalDomUpdate) return;

      const container = containerRef.value;
      const overlay = overlayRef.value;
      if (!container || !overlay) return;
      const wasRemoved = mutations.some(mutation =>
        Array.from(mutation.removedNodes).some(node => node === overlay)
      );
      const wasModified = mutations.some(
        mutation =>
          mutation.type === 'attributes' &&
          (mutation.target === overlay || mutation.target === container)
      );
      if (wasRemoved || wasModified) restoreProtectedElements(wasRemoved);
    });
    observeProtectedElements();
  };

  const stopAntiTamper = (): void => {
    mutationObserver?.disconnect();
    mutationObserver = null;
  };

  const removeResizeListener = (): void => {
    if (resizeListener && typeof window !== 'undefined') {
      window.removeEventListener('resize', resizeListener, PASSIVE_RESIZE_OPTIONS);
    }
    throttledResize?.cancel();
    throttledResize = null;
    resizeListener = null;
  };

  const bindResizeListener = (): void => {
    removeResizeListener();
    if (!mounted || !props.responsive || typeof window === 'undefined') return;

    const delay = normalizeNumber(props.throttleMs, DEFAULT_THROTTLE_DELAY, 0);
    throttledResize = throttle(() => void refresh(), delay);
    resizeListener = () => throttledResize?.();
    window.addEventListener('resize', resizeListener, PASSIVE_RESIZE_OPTIONS);
  };

  const {
    type,
    repeat,
    staggered,
    text,
    width,
    height,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    textAlign,
    color,
    lineHeight,
    imageSrc,
    imageWidth,
    imageHeight,
    crossOrigin,
    angle,
    gapX,
    gapY,
    dprAware,
  } = toRefs(props);

  watch(
    [
      type,
      repeat,
      staggered,
      text,
      width,
      height,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      textAlign,
      color,
      lineHeight,
      imageSrc,
      imageWidth,
      imageHeight,
      crossOrigin,
      angle,
      gapX,
      gapY,
      dprAware,
    ],
    () => void refresh(),
    { deep: true }
  );

  watch([configTheme, documentTheme], async () => {
    await nextTick();
    await refresh();
  });

  watch(
    () => [
      props.fullPage,
      props.offsetX,
      props.offsetY,
      props.opacity,
      props.zIndex,
      props.pointerEvents,
      props.selectable,
    ],
    () => void finishInternalDomUpdate()
  );

  watch(() => [props.responsive, props.throttleMs], bindResizeListener);

  watch(
    () => props.antiTamper,
    async enabled => {
      if (!enabled) {
        stopAntiTamper();
        return;
      }
      await nextTick();
      startAntiTamper();
    }
  );

  onMounted(async () => {
    mounted = true;
    await nextTick();
    bindResizeListener();
    startAntiTamper();
    await refresh();
  });

  onUnmounted(() => {
    mounted = false;
    renderRequestId += 1;
    removeResizeListener();
    stopAntiTamper();
  });

  return {
    overlayDataUrl,
    tileWidth,
    tileHeight,
    refresh,
    toDataURL,
  };
}
