<template>
  <div
    ref="linkRef"
    class="ex-anchor-link"
    :class="{ 'is-active': isActive }"
  >
    <a
      :href="safeHref"
      :aria-disabled="!safeHref || undefined"
      :class="['ex-anchor-link__title', { 'is-active': isActive }]"
      :title="title"
      @click.prevent="handleClick"
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

const safeHref = computed(() => normalizeLinkHref(props.href));
const isActive = computed(
  () => safeHref.value !== undefined && anchor?.activeLink.value === safeHref.value
);

const handleClick = () => {
  const href = safeHref.value;
  if (href === undefined) return;
  if (linkRef.value && anchor) {
    anchor.handleClick({ href, title: props.title, element: linkRef.value });
  }
  emit('click', href);
};

const syncLink = (href: string | undefined, title: string) => {
  if (!linkRef.value || !anchor) return;
  if (href === undefined) anchor.unregisterLink(linkRef.value);
  else anchor.updateLink(linkRef.value, href, title);
};

onMounted(() => syncLink(safeHref.value, props.title));
watch([safeHref, () => props.title], ([href, title]) => syncLink(href, title));

onBeforeUnmount(() => {
  if (anchor) {
    if (linkRef.value) anchor.unregisterLink(linkRef.value);
  }
});
</script>

<style scoped lang="scss" src="./ExAnchorLink.scss"></style>
