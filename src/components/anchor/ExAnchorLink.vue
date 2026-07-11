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
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { ANCHOR_INJECTION_KEY } from './context';
import type { ExAnchorLinkProps, ExAnchorLinkEmits } from './types';

defineOptions({
  name: 'ExAnchorLink',
});

const props = defineProps<ExAnchorLinkProps>();
const emit = defineEmits<ExAnchorLinkEmits>();

const linkRef = ref<HTMLDivElement>();

const anchor = inject(ANCHOR_INJECTION_KEY, null);

const isActive = computed(() => anchor?.activeLink.value === props.href);

const handleClick = () => {
  if (linkRef.value && anchor) {
    anchor.handleClick({ href: props.href, title: props.title, element: linkRef.value });
  }
  emit('click', props.href);
};

onMounted(() => {
  if (linkRef.value && anchor) {
    anchor.registerLink({ href: props.href, title: props.title, element: linkRef.value });
  }
});

watch([() => props.href, () => props.title], ([href, title]) => {
  if (linkRef.value && anchor) {
    anchor.updateLink(linkRef.value, href, title);
  }
});

onBeforeUnmount(() => {
  if (anchor) {
    if (linkRef.value) anchor.unregisterLink(linkRef.value);
  }
});
</script>

<style scoped lang="scss" src="./ExAnchorLink.scss"></style>
