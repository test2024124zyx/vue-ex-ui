<template>
  <div ref="listRef" :class="listClasses" :style="listStyles">
    <!-- 滚动视口（虚拟滚动时启用固定高度，否则为普通透传容器） -->
    <div
      class="ex-list__viewport"
      :style="props.virtual ? viewportStyle : undefined"
      @scroll.passive="onViewportScroll"
    >
      <div :style="props.virtual ? phantomStyle : undefined">
        <!-- 列表项容器（grid 时网格排列；virtual 时整体平移） -->
        <div
          class="ex-list__items"
          :class="{ 'ex-list__items--grid': !!props.grid }"
          :style="itemsStyle"
        >
          <div
            v-for="{ item, index } in renderRows"
            :key="getItemKey(item, index)"
            :class="getItemClasses(item)"
            :role="isClickable(item) ? 'button' : undefined"
            :tabindex="isClickable(item) ? 0 : undefined"
            :aria-disabled="item.disabled || undefined"
            :style="props.virtual ? { height: `${props.itemHeight}px` } : undefined"
            @click="handleItemClick(item, index, $event)"
            @keydown="handleItemKeydown(item, index, $event)"
          >
            <!-- 整项自定义插槽：存在时完全接管该项渲染 -->
            <slot name="item" :item="item" :index="index">
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
                    <div
                      v-if="$slots.description || item.description"
                      class="ex-list__item-description"
                    >
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
            </slot>
          </div>
        </div>
      </div>
    </div>

    <!-- 空数据（加载中不显示，避免与 loading 遮罩叠加） -->
    <div v-if="!loading && (!data || data.length === 0)" class="ex-list__empty">
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
import { computed, ref, onBeforeUnmount } from 'vue';
import type { CSSProperties } from 'vue';
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
  virtual: false,
  itemHeight: 64,
  height: 400,
  clickable: true,
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
  if (props.grid) classes.push('ex-list--grid');
  if (props.virtual) classes.push('ex-list--virtual');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const listStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 栅格样式：根据 column 生成等宽网格，gutter 控制间距
const gridStyle = computed<CSSProperties>(() => {
  if (!props.grid) return {};
  const { column, gutter } = props.grid;
  const style: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${column || 4}, minmax(0, 1fr))`,
  };
  if (gutter != null) style.gap = `${gutter}px`;
  return style;
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

const isClickable = (item: ListItem) => props.clickable && !item.disabled && !props.loading;

// ============================================================================
// 虚拟滚动（固定行高窗口化；grid 模式下不启用）
// ============================================================================
const scrollTop = ref(0);
const buffer = 4;

const viewportStyle = computed<CSSProperties>(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  overflowY: 'auto',
}));

const virtualRange = computed(() => {
  const total = props.data.length;
  if (!props.virtual) return { start: 0, end: total };
  const viewport = typeof props.height === 'number' ? props.height : 400;
  const start = Math.max(0, Math.floor(scrollTop.value / props.itemHeight) - buffer);
  const count = Math.ceil(viewport / props.itemHeight) + buffer * 2;
  const end = Math.min(total, start + count);
  return { start, end };
});

const renderRows = computed<{ item: ListItem; index: number }[]>(() => {
  const { start, end } = virtualRange.value;
  return props.data.slice(start, end).map((item, i) => ({ item, index: start + i }));
});

const phantomStyle = computed<CSSProperties>(() => ({
  height: `${props.data.length * props.itemHeight}px`,
  position: 'relative',
}));

const itemsStyle = computed<CSSProperties>(() => {
  if (props.virtual) {
    return { transform: `translateY(${virtualRange.value.start * props.itemHeight}px)` };
  }
  if (props.grid) {
    return gridStyle.value;
  }
  return {};
});

let rafId: number | null = null;
const onViewportScroll = (e: Event) => {
  if (!props.virtual) return;
  if (rafId !== null) cancelAnimationFrame(rafId);
  const el = e.target as HTMLElement;
  rafId = requestAnimationFrame(() => {
    scrollTop.value = el.scrollTop;
    rafId = null;
  });
};

onBeforeUnmount(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
});

// 事件处理
const handleItemClick = (item: ListItem, index: number, event: MouseEvent) => {
  if (isClickable(item)) {
    emit('item-click', item, index, event);
  }
};

const handleItemKeydown = (item: ListItem, index: number, event: KeyboardEvent) => {
  if (!isClickable(item)) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emit('item-click', item, index, event as unknown as MouseEvent);
  }
};

// 暴露的方法
const getElement = () => listRef.value || null;

defineExpose<ExListExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExList.scss"></style>
