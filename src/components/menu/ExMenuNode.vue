<template>
  <ExSubMenu
    v-if="item.children?.length"
    :item-key="item.key"
    :title="item.label"
    :disabled="item.disabled"
    :popup-placement="item.popupPlacement"
  >
    <template
      v-if="item.icon"
      #icon
    >
      <ExIcon
        :icon="item.icon"
        aria-hidden="true"
      />
    </template>

    <ExMenuNode
      v-for="child in item.children"
      :key="child.key"
      :item="child"
    />
  </ExSubMenu>

  <ExMenuItem
    v-else
    :item-key="item.key"
    :disabled="item.disabled"
    :href="item.href"
    :target="item.target"
    :rel="item.rel"
  >
    <template
      v-if="item.icon"
      #icon
    >
      <ExIcon
        :icon="item.icon"
        aria-hidden="true"
      />
    </template>
    {{ item.label }}
  </ExMenuItem>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import ExMenuItem from './ExMenuItem.vue';
import ExSubMenu from './ExSubMenu.vue';
import type { MenuItem } from './types';

defineOptions({ name: 'ExMenuNode' });

defineProps<{
  item: MenuItem;
}>();
</script>
