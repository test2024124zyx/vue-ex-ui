<template>
  <div ref="listRef" :class="listClasses" :style="listStyles">
    <!-- 列表项 -->
    <div
      v-for="(item, index) in data"
      :key="getItemKey(item, index)"
      :class="getItemClasses(item)"
      @click="handleItemClick(item, index, $event)"
    >
      <div class="ex-list__item-content">
        <!-- 左侧内容 -->
        <div class="ex-list__item-main">
          <!-- 图标/头像 -->
          <div v-if="$slots.icon || item.icon || item.avatar" class="ex-list__item-prefix">
            <slot name="icon" :item="item" :index="index">
              <img
                v-if="item.avatar"
                :src="item.avatar"
                :alt="item.title"
                class="ex-list__item-avatar"
              />
              <img
                v-else-if="item.icon"
                :src="item.icon"
                :alt="item.title"
                class="ex-list__item-icon"
                width="24"
                height="24"
              />
            </slot>
          </div>

          <!-- 标题和描述 -->
          <div class="ex-list__item-body">
            <div v-if="$slots.title || item.title" class="ex-list__item-title">
              <slot name="title" :item="item" :index="index">
                {{ item.title }}
              </slot>
            </div>
            <div v-if="$slots.description || item.description" class="ex-list__item-description">
              <slot name="description" :item="item" :index="index">
                {{ item.description }}
              </slot>
            </div>
          </div>
        </div>

        <!-- 右侧额外内容 -->
        <div v-if="$slots.extra || item.extra" class="ex-list__item-extra">
          <slot name="extra" :item="item" :index="index">
            {{ item.extra }}
          </slot>
        </div>
      </div>
    </div>

    <!-- 空数据 -->
    <div v-if="!data || data.length === 0" class="ex-list__empty">
      <slot name="empty">
        <ExIcon
          icon="inbox-line"
          :size="48"
          style="opacity: 0.3; margin-bottom: 12px"
          aria-hidden="true"
        />
        <p>{{ emptyText || t('empty') }}</p>
      </slot>
    </div>

    <!-- 加载遮罩 -->
    <div v-if="loading" class="ex-list__loading">
      <div class="ex-list__loading-spinner" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref } from 'vue';
import type { ExListProps, ExListEmits, ExListExposed, ListItem } from './types';
import { useLocale } from '../../locale';

defineOptions({
  name: 'ExList',
});

const props = withDefaults(defineProps<ExListProps>(), {
  data: () => [],
  size: 'medium',
  bordered: false,
  split: true,
  hoverable: true,
  loading: false,
  itemKey: 'key',
});

const emit = defineEmits<ExListEmits>();

const listRef = ref<HTMLDivElement>();
const { t } = useLocale('list');

// 计算属性
const listClasses = computed(() => {
  const classes = ['ex-list', `ex-list--${props.size}`];

  if (props.bordered) classes.push('ex-list--bordered');
  if (props.split) classes.push('ex-list--split');
  if (props.hoverable) classes.push('ex-list--hoverable');
  if (props.loading) classes.push('ex-list--loading');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const listStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const getItemClasses = (item: ListItem) => {
  const classes = ['ex-list__item'];
  if (item.disabled) classes.push('ex-list__item--disabled');
  return classes;
};

// 获取列表项的唯一 key
const getItemKey = (item: ListItem, index: number): string | number => {
  const key = item[props.itemKey];
  return typeof key === 'string' || typeof key === 'number' ? key : index;
};

// 事件处理
const handleItemClick = (item: ListItem, index: number, event: MouseEvent) => {
  if (!props.loading && !item.disabled) {
    emit('item-click', item, index, event);
  }
};

// 暴露的方法
const getElement = () => listRef.value || null;

defineExpose<ExListExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExList.scss"></style>
