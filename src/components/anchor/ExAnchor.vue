<template>
  <nav
    ref="anchorRef"
    class="ex-anchor"
    :aria-label="resolvedAriaLabel"
  >
    <div
      class="ex-anchor__ink"
      aria-hidden="true"
    >
      <span
        class="ex-anchor__ink-ball"
        :style="{ top: `${inkTop}px` }"
      ></span>
    </div>
    <div class="ex-anchor__list">
      <slot></slot>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, provide, readonly, ref, watch } from 'vue';
import { useLocale } from '../../locale';
import { ANCHOR_INJECTION_KEY } from './context';
import type { AnchorItem, ExAnchorEmits, ExAnchorExposed, ExAnchorProps } from './types';

defineOptions({ name: 'ExAnchor' });

const props = withDefaults(defineProps<ExAnchorProps>(), {
  offsetTop: 0,
  bounds: 5,
  targetOffset: undefined,
  container: () => window,
});
const emit = defineEmits<ExAnchorEmits>();
const { t } = useLocale('anchor');
const resolvedAriaLabel = computed(() => props.ariaLabel?.trim() || t('label'));

const anchorRef = ref<HTMLElement>();
const activeLink = ref('');
const activeElement = ref<HTMLElement | null>(null);
const inkTop = ref(0);
const links = ref<AnchorItem[]>([]);

let scrollContainer: HTMLElement | Window | null = null;
let animationTimer: ReturnType<typeof setTimeout> | null = null;
let animating = false;
let mounted = false;
const SCROLL_SETTLE_DELAY = 500;

const resolveTarget = (href: string): HTMLElement | null => {
  if (!href) return null;

  if (href.startsWith('#')) {
    try {
      return document.getElementById(decodeURIComponent(href.slice(1)));
    } catch {
      return null;
    }
  }

  try {
    return document.querySelector<HTMLElement>(href);
  } catch {
    return null;
  }
};

/** 显式类型守卫兼容声明生成器对 Window/HTMLElement 联合类型的严格收窄。 */
const isWindowContainer = (container: HTMLElement | Window): container is Window =>
  container === window;

const getOffsetTop = (element: HTMLElement, container: HTMLElement | Window): number => {
  const rect = element.getBoundingClientRect();
  if (isWindowContainer(container)) return rect.top + window.scrollY;

  const containerRect = container.getBoundingClientRect();
  return rect.top - containerRect.top + container.scrollTop;
};

const getScrollTop = (container: HTMLElement | Window): number =>
  isWindowContainer(container)
    ? window.scrollY || document.documentElement.scrollTop
    : container.scrollTop;

const clearAnimationTimer = (): void => {
  if (animationTimer !== null) clearTimeout(animationTimer);
  animationTimer = null;
  animating = false;
};

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrollTo = (href: string): void => {
  if (!scrollContainer) return;
  const target = resolveTarget(href);
  if (!target) return;

  clearAnimationTimer();
  animating = true;
  const offset = props.targetOffset ?? props.offsetTop;
  const top = getOffsetTop(target, scrollContainer) - offset;
  const reduceMotion = prefersReducedMotion();
  scrollContainer.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  if (reduceMotion) {
    animating = false;
    handleScroll();
    return;
  }
  animationTimer = setTimeout(() => {
    animationTimer = null;
    animating = false;
    handleScroll();
  }, SCROLL_SETTLE_DELAY);
};

const updateInkPosition = async (): Promise<void> => {
  await nextTick();
  if (!anchorRef.value || !activeElement.value) {
    inkTop.value = 0;
    return;
  }

  const anchorRect = anchorRef.value.getBoundingClientRect();
  const linkRect = activeElement.value.getBoundingClientRect();
  inkTop.value = linkRect.top - anchorRect.top + linkRect.height / 2;
};

const setActiveFromScroll = (href: string): void => {
  activeElement.value = links.value.find(link => link.href === href)?.element ?? null;
  if (href !== activeLink.value) {
    activeLink.value = href;
    emit('change', href);
  }
  void updateInkPosition();
};

const getCurrentAnchor = (): string => {
  if (!scrollContainer) return '';
  const threshold =
    getScrollTop(scrollContainer) + (props.targetOffset ?? props.offsetTop) + props.bounds;
  const candidates = links.value
    .map(link => {
      const target = resolveTarget(link.href);
      return target ? { href: link.href, offset: getOffsetTop(target, scrollContainer!) } : null;
    })
    .filter((item): item is { href: string; offset: number } => item !== null)
    .sort((left, right) => left.offset - right.offset);

  let current = '';
  for (const candidate of candidates) {
    if (candidate.offset > threshold) break;
    current = candidate.href;
  }
  return current;
};

const handleScroll = (): void => {
  if (!animating) setActiveFromScroll(getCurrentAnchor());
};

const handleLinkClick = (item: AnchorItem): void => {
  setActiveFromScroll(item.href);
  emit('click', item.href, item);
  scrollTo(item.href);
  void updateInkPosition();
};

const registerLink = (item: AnchorItem): void => {
  if (!links.value.some(link => link.element === item.element)) {
    links.value = [...links.value, item];
  }
};

const updateLink = (element: HTMLElement, href: string, title: string): void => {
  links.value = links.value.map(link =>
    link.element === element ? { href, title, element } : link
  );
  if (activeElement.value === element) activeLink.value = href;
  handleScroll();
};

const unregisterLink = (element: HTMLElement): void => {
  links.value = links.value.filter(link => link.element !== element);
  if (activeElement.value === element) {
    activeElement.value = null;
    activeLink.value = '';
  }
};

provide(ANCHOR_INJECTION_KEY, {
  activeLink: readonly(activeLink),
  registerLink,
  updateLink,
  unregisterLink,
  handleClick: handleLinkClick,
});

const removeListeners = (): void => {
  scrollContainer?.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleScroll);
  scrollContainer = null;
};

const addListeners = (): void => {
  scrollContainer = props.container();
  scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleScroll, { passive: true });
};

watch(
  () => props.container,
  () => {
    if (!mounted) return;
    removeListeners();
    addListeners();
    handleScroll();
  }
);
watch([() => props.offsetTop, () => props.targetOffset, () => props.bounds], handleScroll);

onMounted(() => {
  mounted = true;
  addListeners();
  handleScroll();
});

onBeforeUnmount(() => {
  mounted = false;
  removeListeners();
  clearAnimationTimer();
});

defineExpose<ExAnchorExposed>({
  scrollToAnchor: scrollTo,
  getElement: () => anchorRef.value ?? null,
});
</script>

<style scoped lang="scss" src="./ExAnchor.scss"></style>
