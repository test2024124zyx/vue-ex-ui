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
import { createFrameTask } from '../../utils/frame-task';
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

const isValidSelector = (selector: string): boolean => {
  // 排除脚本协议，同时允许标签伪类等选择器的目标稍后挂载。
  if (!selector || /^(?:java|vb)script:/i.test(selector.replace(/[\t\n\r]/g, ''))) return false;
  try {
    // 在空片段验证语法，实际滚动时才查询页面目标。
    document.createDocumentFragment().querySelector(selector);
    return true;
  } catch {
    return false;
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
  const viewportTop = isWindowContainer(scrollContainer)
    ? window.scrollY
      ? 0
      : document.documentElement.scrollTop
    : scrollContainer.getBoundingClientRect().top;
  const threshold = viewportTop + (props.targetOffset ?? props.offsetTop) + props.bounds;
  let nearestTop = -Infinity;
  let current = '';
  for (const link of links.value) {
    const target = resolveTarget(link.href);
    if (!target) continue;
    // 按可见位置单次选取最近锚点，保留相同位置时后注册条目优先。
    const top = target.getBoundingClientRect().top;
    if (top <= threshold && top >= nearestTop) {
      nearestTop = top;
      current = link.href;
    }
  }
  return current;
};

const handleScroll = (): void => {
  scrollTask.cancel();
  if (!animating) setActiveFromScroll(getCurrentAnchor());
};
const scrollTask = createFrameTask(handleScroll);

const handleLinkClick = (item: AnchorItem): void => {
  setActiveFromScroll(item.href);
  emit('click', item.href, item);
  scrollTo(item.href);
};

const updateLink = (element: HTMLElement, href: string, title: string): void => {
  const items = [...links.value];
  const index = items.findIndex(link => link.element === element);
  items[index === -1 ? items.length : index] = { element, href, title };
  links.value = items;
  if (!mounted) return;

  // 平滑滚动期间仍沿用已选条目，但变更地址必须经过同一事件出口。
  if (animating && activeElement.value === element) setActiveFromScroll(href);
};

const unregisterLink = (element: HTMLElement): void => {
  links.value = links.value.filter(link => link.element !== element);
  if (mounted && animating && activeElement.value === element) {
    clearAnimationTimer();
  }
};

watch(
  links,
  () => {
    // 等待动态子项完成挂载或移除，再统一计算活动项并发布真实变化。
    if (mounted) handleScroll();
  },
  { flush: 'post' }
);

provide(ANCHOR_INJECTION_KEY, {
  activeLink: readonly(activeLink),
  isValidSelector,
  updateLink,
  unregisterLink,
  handleClick: handleLinkClick,
});

const removeListeners = (): void => {
  scrollTask.cancel();
  scrollContainer?.removeEventListener('scroll', scrollTask.schedule);
  window.removeEventListener('resize', scrollTask.schedule);
  scrollContainer = null;
};

const addListeners = (): void => {
  scrollContainer = props.container();
  scrollContainer.addEventListener('scroll', scrollTask.schedule, { passive: true });
  window.addEventListener('resize', scrollTask.schedule, { passive: true });
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
