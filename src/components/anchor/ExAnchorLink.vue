<template>
  <div ref="linkRef" class="ex-anchor-link" :class="{ 'is-active': isActive }">
    <a
      :href="href"
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
import { ref, inject, computed, onMounted, onBeforeUnmount } from 'vue';
import type { ExAnchorLinkProps, ExAnchorLinkEmits } from './types';

defineOptions({
  name: 'ExAnchorLink',
});

const props = defineProps<ExAnchorLinkProps>();
const emit = defineEmits<ExAnchorLinkEmits>();

const linkRef = ref<HTMLDivElement>();

const anchor = inject<{
  registerLink: (href: string, title: string, element: HTMLElement) => void;
  unregisterLink: (href: string) => void;
  activeLink: { value: string };
  handleClick: (href: string, element: HTMLElement) => void;
}>('anchor');

const isActive = computed(() => anchor?.activeLink.value === props.href);

const handleClick = () => {
  if (linkRef.value && anchor) {
    anchor.handleClick(props.href, linkRef.value);
  }
  emit('click', props.href);
};

onMounted(() => {
  if (linkRef.value && anchor) {
    anchor.registerLink(props.href, props.title, linkRef.value);
  }
});

onBeforeUnmount(() => {
  if (anchor) {
    anchor.unregisterLink(props.href);
  }
});
</script>

<style scoped lang="scss" src="./ExAnchorLink.scss"></style>
