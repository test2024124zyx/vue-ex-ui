<template>
  <div
    ref="linkRef"
    class="ex-anchor-link"
    :class="{ 'is-active': isActive }"
  >
    <a
      :href="safeHref"
      :role="selectorHref ? 'link' : undefined"
      :tabindex="selectorHref ? 0 : undefined"
      :aria-disabled="!scrollHref || undefined"
      :class="['ex-anchor-link__title', { 'is-active': isActive }]"
      :title="title"
      @click.prevent="handleClick"
      @keydown.enter="handleEnter"
    >
      {{ title }}
    </a>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { normalizeLinkHref } from '../link/link-utils';
import { ANCHOR_INJECTION_KEY } from './context';
import type { ExAnchorLinkProps, ExAnchorLinkEmits } from './types';

defineOptions({
  name: 'ExAnchorLink',
});

const props = defineProps<ExAnchorLinkProps>();
const emit = defineEmits<ExAnchorLinkEmits>();

const linkRef = ref<HTMLDivElement>();

const anchor = inject(ANCHOR_INJECTION_KEY, null);

const selectorHref = ref<string>();
const safeHref = computed(() => normalizeLinkHref(props.href));
const scrollHref = computed(() => safeHref.value ?? selectorHref.value);
const isActive = computed(
  () => scrollHref.value !== undefined && anchor?.activeLink.value === scrollHref.value
);

const handleClick = () => {
  const href = scrollHref.value;
  if (href === undefined) return;
  if (linkRef.value && anchor) {
    anchor.handleClick({ href, title: props.title, element: linkRef.value });
  }
  emit('click', href);
};

const handleEnter = (event: KeyboardEvent) => {
  if (!selectorHref.value) return;
  event.preventDefault();
  handleClick();
};

const syncLink = () => {
  if (!linkRef.value || !anchor) return;
  // 选择器仅用于页内定位，原生 href 继续使用协议白名单。
  const selector = typeof props.href === 'string' ? props.href.trim() : '';
  selectorHref.value = !safeHref.value && anchor.isValidSelector(selector) ? selector : undefined;
  const href = scrollHref.value;
  if (href === undefined) anchor.unregisterLink(linkRef.value);
  else anchor.updateLink(linkRef.value, href, props.title);
};

onMounted(syncLink);
watch([() => props.href, () => props.title], syncLink);

onBeforeUnmount(() => {
  if (anchor) {
    if (linkRef.value) anchor.unregisterLink(linkRef.value);
  }
});
</script>

<style scoped lang="scss" src="./ExAnchorLink.scss"></style>
