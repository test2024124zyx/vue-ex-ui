<template>
  <div
    :class="groupClasses"
    :style="groupStyles"
  >
    <template
      v-for="(vnode, index) in displayAvatars"
      :key="vnode.key ?? index"
    >
      <slot
        name="avatar"
        :vnode="vnode"
        :index="index"
      >
        <AvatarGroupItem
          :vnode="vnode"
          :size="size"
          :shape="shape"
        />
      </slot>
    </template>

    <button
      v-if="hasOverflow"
      type="button"
      class="ex-avatar-group__overflow"
      :aria-label="overflowAriaLabel"
      :title="overflowAriaLabel"
      @click="handleOverflowClick"
    >
      <ExAvatar
        :size="size"
        :shape="shape"
        :style="maxStyle"
        aria-hidden="true"
        class="ex-avatar-group__overflow-avatar"
      >
        <span class="ex-avatar-group__overflow-count">{{ overflowText }}</span>
      </ExAvatar>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Fragment, computed, isVNode, useSlots } from 'vue';
import type { Component, VNode } from 'vue';
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { useI18n } from '../../locale';
import AvatarGroupItem from './AvatarGroupItem';
import ExAvatar from './ExAvatar.vue';
import type { ExAvatarGroupEmits, ExAvatarGroupProps } from './types';

defineOptions({ name: 'ExAvatarGroup' });

const props = withDefaults(defineProps<ExAvatarGroupProps>(), {
  spacing: '8px',
});
const emit = defineEmits<ExAvatarGroupEmits>();
defineSlots<{
  default?: () => VNode[];
  avatar?: (props: { vnode: VNode; index: number }) => VNode[];
}>();

const slots = useSlots();
const { t } = useI18n();

const flattenVNodes = (nodes: unknown[]): VNode[] =>
  nodes.flatMap(node => {
    if (!isVNode(node)) return [];
    if (node.type === Fragment && Array.isArray(node.children)) {
      return flattenVNodes(node.children);
    }
    return [node];
  });

const isAvatarVNode = (vnode: VNode): boolean => {
  if (vnode.type === ExAvatar) return true;
  if (typeof vnode.type !== 'object') return false;
  const component = vnode.type as Component & { __name?: string };
  return component.name === 'ExAvatar' || component.__name === 'ExAvatar';
};

const avatars = computed(() => flattenVNodes(slots.default?.() ?? []).filter(isAvatarVNode));
const visibleLimit = computed(() => {
  if (props.maxCount === undefined) return Number.POSITIVE_INFINITY;
  if (!Number.isFinite(props.maxCount)) return 0;
  return Math.max(0, Math.trunc(props.maxCount));
});
const displayAvatars = computed(() => avatars.value.slice(0, visibleLimit.value));
const overflowCount = computed(() => Math.max(0, avatars.value.length - visibleLimit.value));
const hasOverflow = computed(() => overflowCount.value > 0);
const overflowText = computed(() => `+${overflowCount.value}`);
const overflowAriaLabel = computed(() => t('avatar.groupMore', { count: overflowCount.value }));

const groupClasses = computed(() => ['ex-avatar-group', ...normalizeCustomClass(props.class)]);

const groupStyles = computed(() => {
  const styles: Record<string, string | number> = {
    '--ex-avatar-overlap': typeof props.spacing === 'number' ? `${props.spacing}px` : props.spacing,
  };

  if (!props.style) return styles;
  if (typeof props.style === 'string') {
    const generated = Object.entries(styles)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ');
    return `${generated}; ${props.style}`;
  }
  return { ...styles, ...props.style };
});

const handleOverflowClick = (): void => emit('overflowClick', overflowCount.value);
</script>

<style scoped lang="scss" src="./ExAvatarGroup.scss"></style>
