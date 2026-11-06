<template>
  <nav
    class="ex-breadcrumb"
    :class="[
      `ex-breadcrumb--${componentSize}`,
      {
        'ex-breadcrumb--clickable': clickable,
      },
    ]"
    role="navigation"
    :aria-label="t('breadcrumb.ariaLabel')"
  >
    <ol class="ex-breadcrumb__list">
      <template v-if="displayItems.length <= maxVisibleItems">
        <ExBreadcrumbItem
          v-for="(item, index) in displayItems"
          :key="index"
          :item="item"
          :index="index"
          :is-last="index === displayItems.length - 1"
          :separator="separator"
          :size="componentSize"
          :clickable="clickable"
          @click="handleItemClick(item, index)"
        >
          <template
            v-if="$slots.icon"
            #icon="{ item: slotItem, index: slotIndex }"
          >
            <slot
              name="icon"
              :item="slotItem"
              :index="slotIndex"
            />
          </template>
          <template
            v-if="$slots.separator"
            #separator
          >
            <slot name="separator" />
          </template>
        </ExBreadcrumbItem>
      </template>

      <!-- 当项目过多时显示省略 -->
      <template v-else-if="displayItems[0]">
        <!-- 第一项 -->
        <ExBreadcrumbItem
          :item="displayItems[0]"
          :index="0"
          :is-last="false"
          :separator="separator"
          :size="componentSize"
          :clickable="clickable"
          @click="handleItemClick(displayItems[0]!, 0)"
        >
          <template
            v-if="$slots.icon"
            #icon="{ item: slotItem, index: slotIndex }"
          >
            <slot
              name="icon"
              :item="slotItem"
              :index="slotIndex"
            />
          </template>
          <template
            v-if="$slots.separator"
            #separator
          >
            <slot name="separator" />
          </template>
        </ExBreadcrumbItem>

        <!-- 省略号 -->
        <li class="ex-breadcrumb__item ex-breadcrumb__ellipsis">
          <span class="ex-breadcrumb__text">...</span>
          <span
            v-if="separator || $slots.separator"
            class="ex-breadcrumb__separator"
            aria-hidden="true"
          >
            <slot
              v-if="$slots.separator"
              name="separator"
            />
            <span v-else>{{ separator || '/' }}</span>
          </span>
        </li>

        <!-- 最后几项 -->
        <ExBreadcrumbItem
          v-for="(item, index) in lastItems"
          :key="`last-${index}`"
          :item="item"
          :index="displayItems.length - lastItems.length + index"
          :is-last="index === lastItems.length - 1"
          :separator="separator"
          :size="componentSize"
          :clickable="clickable"
          @click="handleItemClick(item, displayItems.length - lastItems.length + index)"
        >
          <template
            v-if="$slots.icon"
            #icon="{ item: slotItem, index: slotIndex }"
          >
            <slot
              name="icon"
              :item="slotItem"
              :index="slotIndex"
            />
          </template>
          <template
            v-if="$slots.separator"
            #separator
          >
            <slot name="separator" />
          </template>
        </ExBreadcrumbItem>
      </template>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useComponentSize } from '../config-provider/composables';
import type { BreadcrumbProps, BreadcrumbEmits, BreadcrumbItem } from './types';
import ExBreadcrumbItem from './ExBreadcrumbItem.vue';
import { useI18n } from '../../locale';

defineOptions({
  name: 'ExBreadcrumb',
});

const props = withDefaults(defineProps<BreadcrumbProps>(), {
  items: () => [],
  separator: '/',
  maxItems: undefined,
  size: undefined,
  clickable: true,
});

const emit = defineEmits<BreadcrumbEmits>();
const componentSize = useComponentSize(computed(() => props.size));

const { t } = useI18n();

// 显示的项目
const displayItems = computed(() => props.items || []);

const maxVisibleItems = computed(() => {
  if (props.maxItems === undefined) return Number.POSITIVE_INFINITY;
  if (!Number.isFinite(props.maxItems)) return 2;
  return Math.max(2, Math.trunc(props.maxItems));
});

// 当项目过多时，显示的最后几项
const lastItems = computed(() => {
  if (displayItems.value.length <= maxVisibleItems.value) {
    return [];
  }

  // 显示最后 maxItems - 1 项（减去第一项）
  const lastCount = maxVisibleItems.value - 1;
  return displayItems.value.slice(-lastCount);
});

// 处理项目点击
const handleItemClick = (item: BreadcrumbItem, index: number) => {
  if (!props.clickable || item.disabled) {
    return;
  }

  emit('click', item, index);
};
</script>

<style scoped lang="scss" src="./ExBreadcrumb.scss"></style>
