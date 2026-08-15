<template>
  <div
    ref="listRef"
    v-bind="rootAttrs"
    :class="listClasses"
    :aria-busy="loading"
  >
    <ul
      v-if="data.length > 0"
      class="ex-list__items"
      :class="{ 'ex-list__items--grid': grid }"
      :style="gridStyles"
      :inert="loading ? true : undefined"
    >
      <li
        v-for="row in renderRows"
        :key="row.key"
        class="ex-list__item"
        :class="{ 'ex-list__item--disabled': row.item.disabled }"
        :aria-disabled="row.item.disabled || undefined"
      >
        <button
          v-if="clickable"
          class="ex-list__item-primary-action"
          type="button"
          :disabled="row.item.disabled || loading"
          :aria-label="getItemActionLabel(row.item, row.index)"
          @click="handleItemClick(row.item, row.index, $event)"
        ></button>

        <div class="ex-list__item-surface">
          <slot
            name="item"
            :item="row.item"
            :index="row.index"
          >
            <div class="ex-list__item-content">
              <div class="ex-list__item-main">
                <div
                  v-if="$slots.icon || row.item.icon || row.item.avatar"
                  class="ex-list__item-prefix"
                >
                  <slot
                    name="icon"
                    :item="row.item"
                    :index="row.index"
                  >
                    <!-- 头像为标题的装饰补充，空 alt 避免重复朗读。 -->
                    <img
                      v-if="row.item.avatar"
                      :src="row.item.avatar"
                      alt=""
                      draggable="false"
                      class="ex-list__item-avatar"
                    />
                    <ExIcon
                      v-else-if="row.item.icon"
                      :src="row.item.icon"
                      :size="iconSize"
                      class="ex-list__item-icon"
                      aria-hidden="true"
                    />
                  </slot>
                </div>

                <div class="ex-list__item-body">
                  <div
                    v-if="$slots.title || row.item.title"
                    class="ex-list__item-title"
                  >
                    <slot
                      name="title"
                      :item="row.item"
                      :index="row.index"
                    >
                      {{ row.item.title }}
                    </slot>
                  </div>
                  <div
                    v-if="$slots.description || row.item.description"
                    class="ex-list__item-description"
                  >
                    <slot
                      name="description"
                      :item="row.item"
                      :index="row.index"
                    >
                      {{ row.item.description }}
                    </slot>
                  </div>
                </div>
              </div>

              <div
                v-if="$slots.extra || row.item.extra"
                class="ex-list__item-extra"
              >
                <slot
                  name="extra"
                  :item="row.item"
                  :index="row.index"
                >
                  {{ row.item.extra }}
                </slot>
              </div>
            </div>
          </slot>
        </div>
      </li>
    </ul>

    <div
      v-else-if="!loading"
      class="ex-list__empty"
    >
      <slot name="empty">
        <ExEmpty
          :description="emptyDescription"
          :image-size="normalizedSize"
          type="no-data"
        />
      </slot>
    </div>

    <ExLoading
      v-if="loading"
      :visible="true"
      :fullscreen="false"
      :mask="true"
      :lock-scroll="false"
      :size="normalizedSize"
      :text="loadingDescription"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs } from 'vue';
import { useI18n, useLocale } from '../../locale';
import ExEmpty from '../empty/ExEmpty.vue';
import ExIcon from '../icon/ExIcon.vue';
import ExLoading from '../loading/ExLoading.vue';
import { useComponentSize } from '../config-provider/composables';
import { getListItemKeyCandidate, normalizeListGrid, normalizeListSize } from './list-utils';
import type { ExListEmits, ExListExposed, ExListProps, ListItem } from './types';

defineOptions({
  name: 'ExList',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExListProps>(), {
  data: () => [],
  bordered: false,
  split: true,
  hoverable: false,
  loading: false,
  itemKey: 'key',
  clickable: false,
});
const emit = defineEmits<ExListEmits>();
const attrs = useAttrs();
const { t } = useLocale('list');
const { t: tGlobal } = useI18n();
const listRef = ref<HTMLDivElement | null>(null);
const globalSize = useComponentSize(computed(() => props.size));
const normalizedSize = computed(() => normalizeListSize(globalSize.value));

const OBSOLETE_ATTRS = new Set(['virtual', 'itemheight', 'height']);
const rootAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(
      // 使用正则兼容组件库当前的 ES 构建目标，同时识别 kebab-case 旧属性。
      ([key]) => !OBSOLETE_ATTRS.has(key.replace(/-/g, '').toLowerCase())
    )
  )
);

const listClasses = computed(() => [
  'ex-list',
  `ex-list--${normalizedSize.value}`,
  {
    'ex-list--bordered': props.bordered,
    'ex-list--split': props.split,
    'ex-list--hoverable': props.hoverable,
    'ex-list--loading': props.loading,
    'ex-list--loading-empty': props.loading && props.data.length === 0,
    'ex-list--grid': props.grid !== undefined,
    'ex-list--clickable': props.clickable,
  },
]);

const gridStyles = computed(() => (props.grid ? normalizeListGrid(props.grid) : undefined));
const emptyDescription = computed(() =>
  props.emptyText === undefined ? t('empty') : props.emptyText
);
const loadingDescription = computed(() => props.loadingText ?? t('loading'));
const iconSize = computed(() => ({ small: 20, medium: 24, large: 28 })[normalizedSize.value]);

const getItemActionLabel = (item: ListItem, index: number): string => {
  if (typeof item.ariaLabel === 'string' && item.ariaLabel.trim()) return item.ariaLabel;
  if (typeof item.title === 'string' && item.title.trim()) return item.title;
  if (typeof item.description === 'string' && item.description.trim()) return item.description;
  return `${tGlobal('common.more')} ${index + 1}`;
};

const identityKeys = new WeakMap<ListItem, string>();
let identitySequence = 0;
const getIdentityKey = (item: ListItem): string => {
  const existing = identityKeys.get(item);
  if (existing) return existing;
  identitySequence += 1;
  const key = `ex-list-item-${identitySequence}`;
  identityKeys.set(item, key);
  return key;
};

const renderRows = computed(() => {
  const candidates = props.data.map((item, index) =>
    getListItemKeyCandidate(item, index, props.itemKey)
  );
  const counts = new Map<PropertyKey, number>();
  candidates.forEach(candidate => {
    if (candidate !== undefined) counts.set(candidate, (counts.get(candidate) ?? 0) + 1);
  });
  const identityOccurrences = new Map<string, number>();

  return props.data.map((item, index) => {
    const candidate = candidates[index];
    if (candidate !== undefined && counts.get(candidate) === 1) {
      return { item, index, key: candidate };
    }

    const identity = getIdentityKey(item);
    const occurrence = identityOccurrences.get(identity) ?? 0;
    identityOccurrences.set(identity, occurrence + 1);
    return {
      item,
      index,
      key: occurrence === 0 ? identity : `${identity}:${occurrence}`,
    };
  });
});

const handleItemClick = (item: ListItem, index: number, event: MouseEvent): void => {
  if (!props.clickable || props.loading || item.disabled) return;
  emit('item-click', item, index, event);
};

defineExpose<ExListExposed>({
  getElement: () => listRef.value,
});
</script>

<style scoped lang="scss" src="./ExList.scss"></style>
