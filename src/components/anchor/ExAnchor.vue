<template>
  <div ref="anchorRef" class="ex-anchor">
    <div class="ex-anchor__ink">
      <span class="ex-anchor__ink-ball" :style="{ top: `${inkTop}px` }" />
    </div>
    <div class="ex-anchor__list">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide, onMounted, onBeforeUnmount, nextTick } from 'vue';
import type { ExAnchorProps, ExAnchorEmits, ExAnchorExposed } from './types';

defineOptions({
  name: 'ExAnchor',
});

const props = withDefaults(defineProps<ExAnchorProps>(), {
  offsetTop: 0,
  bounds: 5,
  targetOffset: undefined,
  container: () => window,
});

const emit = defineEmits<ExAnchorEmits>();

const anchorRef = ref<HTMLDivElement>();
const activeLink = ref('');
const inkTop = ref(0);
const links = ref<Array<{ href: string; title: string; element: HTMLElement }>>([]);

let scrollContainer: HTMLElement | Window;
let animating = false;

// 提供给 AnchorLink 使用
provide('anchor', {
  registerLink: (href: string, title: string, element: HTMLElement) => {
    links.value.push({ href, title, element });
  },
  unregisterLink: (href: string) => {
    const index = links.value.findIndex(link => link.href === href);
    if (index > -1) {
      links.value.splice(index, 1);
    }
  },
  activeLink,
  handleClick: (href: string, element: HTMLElement) => {
    handleLinkClick(href, element);
  },
});

const getOffsetTop = (element: HTMLElement, container: HTMLElement | Window): number => {
  if (!element) return 0;

  if (container === window) {
    const rect = element.getBoundingClientRect();
    return rect.top + window.pageYOffset;
  }

  const containerElement = container as HTMLElement;
  const rect = element.getBoundingClientRect();
  const containerRect = containerElement.getBoundingClientRect();
  return rect.top - containerRect.top + containerElement.scrollTop;
};

const getScroll = (container: HTMLElement | Window): number => {
  if (container === window) {
    return window.pageYOffset || document.documentElement.scrollTop;
  }
  return (container as HTMLElement).scrollTop;
};

const scrollTo = (href: string) => {
  const targetElement = document.querySelector(href) as HTMLElement;
  if (!targetElement) return;

  animating = true;

  const offsetTop = getOffsetTop(targetElement, scrollContainer);
  const targetOffsetTop = props.targetOffset !== undefined ? props.targetOffset : props.offsetTop;
  const scrollTop = offsetTop - targetOffsetTop;

  if (scrollContainer === window) {
    window.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });
  } else {
    (scrollContainer as HTMLElement).scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });
  }

  setTimeout(() => {
    animating = false;
  }, 500);
};

const handleLinkClick = (href: string, element: HTMLElement) => {
  activeLink.value = href;
  emit('click', href, { href, title: '', element });
  scrollTo(href);
  updateInkPosition();
};

const getCurrentAnchor = (): string => {
  const scrollTop = getScroll(scrollContainer);
  const targetOffsetTop = props.targetOffset !== undefined ? props.targetOffset : props.offsetTop;

  for (let i = links.value.length - 1; i >= 0; i--) {
    const link = links.value[i];
    // 检查 link 是否存在
    if (!link) continue;

    const target = document.querySelector(link.href) as HTMLElement;
    if (!target) continue;

    const offsetTop = getOffsetTop(target, scrollContainer);
    if (scrollTop + targetOffsetTop >= offsetTop - props.bounds) {
      return link.href;
    }
  }

  return '';
};

const handleScroll = () => {
  if (animating) return;

  const currentAnchor = getCurrentAnchor();
  if (currentAnchor !== activeLink.value) {
    activeLink.value = currentAnchor;
    emit('change', currentAnchor);
    updateInkPosition();
  }
};

const updateInkPosition = async () => {
  await nextTick();

  if (!anchorRef.value || !activeLink.value) {
    inkTop.value = 0;
    return;
  }

  const activeElement = anchorRef.value.querySelector(
    `.ex-anchor-link[href="${activeLink.value}"]`
  ) as HTMLElement;

  if (activeElement) {
    const anchorRect = anchorRef.value.getBoundingClientRect();
    const activeRect = activeElement.getBoundingClientRect();
    inkTop.value = activeRect.top - anchorRect.top + activeRect.height / 2;
  }
};

const addListeners = () => {
  scrollContainer = props.container();
  scrollContainer.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleScroll);
};

const removeListeners = () => {
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll);
  }
  window.removeEventListener('resize', handleScroll);
};

onMounted(() => {
  addListeners();
  nextTick(() => {
    handleScroll();
  });
});

onBeforeUnmount(() => {
  removeListeners();
});

const scrollToAnchor = (href: string) => {
  scrollTo(href);
};

const getElement = () => anchorRef.value || null;

defineExpose<ExAnchorExposed>({
  scrollToAnchor,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExAnchor.scss"></style>
