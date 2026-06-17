import { onMounted, onBeforeUnmount } from 'vue';

export function useEventListener<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  listener: (this: Window, ev: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  listener: (this: Document, ev: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): void;
export function useEventListener<E extends HTMLElement>(
  target: E,
  type: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
): void;
export function useEventListener(
  target: EventTarget,
  type: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
) {
  onMounted(() => {
    target.addEventListener(type, listener, options);
  });

  onBeforeUnmount(() => {
    target.removeEventListener(type, listener, options);
  });
}
