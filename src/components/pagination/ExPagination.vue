<template>
  <div
    v-if="!hideOnSinglePage || totalPages > 1"
    ref="paginationRef"
    :class="paginationClasses"
    :style="paginationStyles"
    role="navigation"
    :aria-label="ariaLabel || t('pagination')"
  >
    <!-- 总数显示 -->
    <div
      v-if="showTotal"
      class="ex-pagination__total"
    >
      {{ totalDisplayText }}
    </div>

    <!-- 分页按钮组 -->
    <div
      ref="itemsRef"
      class="ex-pagination__items"
      :style="itemsStyle"
    >
      <!-- 上一页按钮 -->
      <button
        type="button"
        class="ex-pagination__item ex-pagination__prev"
        :disabled="disabled || currentPage <= 1"
        :aria-label="t('prev')"
        @click="handlePrev"
      >
        <ExIcon
          icon="arrow-left-s-line"
          :size="16"
          aria-hidden="true"
        />
      </button>

      <!-- 简洁模式 -->
      <template v-if="simple">
        <div class="ex-pagination__simple">
          <input
            v-model.number="jumpValue"
            type="number"
            class="ex-pagination__simple-input"
            :min="1"
            :max="totalPages"
            :disabled="disabled || totalPages === 0"
            :aria-label="t('jumpTo')"
            @keyup.enter="handleJump"
          />
          <span class="ex-pagination__simple-separator">/</span>
          <span class="ex-pagination__simple-total">{{ totalPages }}</span>
        </div>
      </template>

      <!-- 标准模式 -->
      <template v-else>
        <!-- 首页 -->
        <button
          v-if="totalPages > 0"
          type="button"
          class="ex-pagination__item"
          :class="{ 'ex-pagination__item--active': currentPage === 1 }"
          :disabled="disabled"
          :aria-label="t('pageNumber', { page: 1 })"
          :aria-current="currentPage === 1 ? 'page' : undefined"
          @click="handlePageChange(1)"
        >
          1
        </button>

        <!-- 向前省略号 -->
        <button
          v-if="layout.previousMore"
          type="button"
          class="ex-pagination__item ex-pagination__item--more"
          :disabled="disabled"
          :aria-label="t('prev5')"
          @click="handlePrevMore"
        >
          <ExIcon
            icon="more-fill"
            :size="16"
            class="ex-pagination__more-icon"
            aria-hidden="true"
          />
          <ExIcon
            icon="arrow-left-double-line"
            :size="16"
            class="ex-pagination__more-icon-hover"
            aria-hidden="true"
          />
        </button>

        <!-- 中间页码 -->
        <button
          v-for="page in layout.pages"
          :key="page"
          type="button"
          class="ex-pagination__item"
          :class="{ 'ex-pagination__item--active': currentPage === page }"
          :disabled="disabled"
          :aria-label="t('pageNumber', { page })"
          :aria-current="currentPage === page ? 'page' : undefined"
          @click="handlePageChange(page)"
        >
          {{ page }}
        </button>

        <!-- 向后省略号 -->
        <button
          v-if="layout.nextMore"
          type="button"
          class="ex-pagination__item ex-pagination__item--more"
          :disabled="disabled"
          :aria-label="t('next5')"
          @click="handleNextMore"
        >
          <ExIcon
            icon="more-fill"
            :size="16"
            class="ex-pagination__more-icon"
            aria-hidden="true"
          />
          <ExIcon
            icon="arrow-right-double-line"
            :size="16"
            class="ex-pagination__more-icon-hover"
            aria-hidden="true"
          />
        </button>

        <!-- 末页 -->
        <button
          v-if="totalPages > 1"
          type="button"
          class="ex-pagination__item"
          :class="{ 'ex-pagination__item--active': currentPage === totalPages }"
          :disabled="disabled"
          :aria-label="t('pageNumber', { page: totalPages })"
          :aria-current="currentPage === totalPages ? 'page' : undefined"
          @click="handlePageChange(totalPages)"
        >
          {{ totalPages }}
        </button>
      </template>

      <!-- 下一页按钮 -->
      <button
        type="button"
        class="ex-pagination__item ex-pagination__next"
        :disabled="disabled || currentPage >= totalPages"
        :aria-label="t('next')"
        @click="handleNext"
      >
        <ExIcon
          icon="arrow-right-s-line"
          :size="16"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- 测量节点不参与布局和无障碍树，保留字体、主题与触摸尺寸的真实宽度。 -->
    <span
      ref="measureRef"
      class="ex-pagination__measure"
      aria-hidden="true"
    >
      <span class="ex-pagination__item">{{ totalPages }}</span>
      <span class="ex-pagination__item">
        <ExIcon
          icon="arrow-left-s-line"
          :size="16"
        />
      </span>
    </span>

    <!-- 每页条数选择器 -->
    <div
      v-if="showSizeChanger && !simple"
      class="ex-pagination__sizes"
    >
      <select
        :value="currentPageSize"
        class="ex-pagination__size-select"
        :disabled="disabled"
        :aria-label="t('pageSize')"
        @change="handleSizeChange"
      >
        <option
          v-for="size in pageSizeOptions"
          :key="size"
          :value="size"
        >
          {{ size }} {{ t('page') }}
        </option>
      </select>
    </div>

    <!-- 快速跳转 -->
    <div
      v-if="showQuickJumper && !simple"
      class="ex-pagination__jumper"
    >
      <span class="ex-pagination__jumper-text">{{ t('jumpTo') }}</span>
      <input
        v-model.number="jumpValue"
        type="number"
        class="ex-pagination__jumper-input"
        :min="1"
        :max="totalPages"
        :disabled="disabled"
        :aria-label="t('jumpTo')"
        @keyup.enter="handleJump"
      />
      <span class="ex-pagination__jumper-text">{{ t('page') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch } from 'vue';
import type { ExPaginationProps, ExPaginationEmits, ExPaginationExposed } from './types';
import { useLocale } from '../../locale';
import { useControllableState } from '../../composables/useControllableState';
import { useResponsivePagination } from './useResponsivePagination';

defineOptions({
  name: 'ExPagination',
});

const props = withDefaults(defineProps<ExPaginationProps>(), {
  current: undefined,
  pageSize: undefined,
  pageSizeOptions: () => [10, 20, 30, 50, 100],
  showSizeChanger: false,
  showQuickJumper: false,
  showTotal: true,
  disabled: false,
  simple: false,
  size: 'medium',
  align: 'left',
  showPages: 7,
  hideOnSinglePage: false,
});

const emit = defineEmits<ExPaginationEmits>();

const { t } = useLocale('pagination');
const paginationRef = ref<HTMLDivElement>();
const itemsRef = ref<HTMLDivElement>();
const measureRef = ref<HTMLSpanElement>();

const normalizePageSize = (value: number) => {
  return Number.isFinite(value) && value > 0 ? Math.max(1, Math.floor(value)) : 10;
};

const normalizedTotal = computed(() => {
  return Number.isFinite(props.total) && props.total > 0 ? Math.floor(props.total) : 0;
});

const sizeState = useControllableState<number>({
  controlledValue: () => props.pageSize,
  defaultValue: 10,
});
const currentPageSize = computed(() => normalizePageSize(sizeState.value.value));

// 计算总页数
const totalPages = computed(() => {
  if (normalizedTotal.value === 0) return 0;
  return Math.ceil(normalizedTotal.value / currentPageSize.value);
});

const normalizePage = (value: number, pageCount = totalPages.value) => {
  if (pageCount === 0) return 0;
  const page = Number.isFinite(value) ? Math.floor(value) : 1;
  return Math.max(1, Math.min(pageCount, page));
};

const pageState = useControllableState<number>({
  controlledValue: () => props.current,
  defaultValue: 1,
});
const currentPage = computed(() => normalizePage(pageState.value.value));
const jumpValue = ref(currentPage.value);

// 计算当前页的数据范围
const dataRange = computed<[number, number]>(() => {
  if (normalizedTotal.value === 0) return [0, 0];
  const start = (currentPage.value - 1) * currentPageSize.value + 1;
  const end = Math.min(currentPage.value * currentPageSize.value, normalizedTotal.value);
  return [start, end];
});

// 总数显示文本
const totalDisplayText = computed(() => {
  if (props.totalText) {
    return props.totalText(props.total, dataRange.value);
  }
  return t('total', { total: props.total });
});

const { itemsStyle, layout } = useResponsivePagination(paginationRef, itemsRef, measureRef, {
  total: totalPages,
  current: currentPage,
  showPages: () => props.showPages,
  simple: () => props.simple,
});

// 样式类
const paginationClasses = computed(() => {
  const classes = [
    'ex-pagination',
    `ex-pagination--${props.size}`,
    `ex-pagination--${props.align}`,
  ];

  if (props.simple) classes.push('ex-pagination--simple');
  if (props.disabled) classes.push('ex-pagination--disabled');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const paginationStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 输入草稿跟随已确认页码；非受控状态在数据范围收缩时收敛。
watch(currentPage, page => {
  jumpValue.value = page;
});
watch(totalPages, () => {
  if (!pageState.isControlled.value) pageState.request(currentPage.value);
});

// 页码改变
const handlePageChange = (page: number) => {
  if (props.disabled) return;
  if (!Number.isFinite(page) || page < 1 || page > totalPages.value || page === currentPage.value) {
    return;
  }

  const normalizedPage = normalizePage(page);
  pageState.request(normalizedPage);
  jumpValue.value = currentPage.value;
  emit('update:current', normalizedPage);
  emit('change', normalizedPage, currentPageSize.value);
};

// 上一页
const handlePrev = () => {
  if (currentPage.value > 1) {
    handlePageChange(currentPage.value - 1);
  }
};

// 下一页
const handleNext = () => {
  if (currentPage.value < totalPages.value) {
    handlePageChange(currentPage.value + 1);
  }
};

// 向前跳转多页
const handlePrevMore = () => {
  const page = Math.max(1, currentPage.value - 5);
  handlePageChange(page);
};

// 向后跳转多页
const handleNextMore = () => {
  const page = Math.min(totalPages.value, currentPage.value + 5);
  handlePageChange(page);
};

// 每页条数改变
const handleSizeChange = (event: Event) => {
  if (props.disabled) return;
  // 容量变化会同步更新总页数，必须先保存旧数据位置。
  const firstItemIndex = Math.max(0, (currentPage.value - 1) * currentPageSize.value);
  const previousPage = currentPage.value;
  const newPageSize = normalizePageSize(Number((event.target as HTMLSelectElement).value));
  sizeState.request(newPageSize);
  emit('update:pageSize', newPageSize);
  // 原生 select 会先改变 DOM，受控请求未获接受时恢复外部已确认容量。
  (event.target as HTMLSelectElement).value = String(currentPageSize.value);

  // 重新计算当前页，保持数据位置
  const nextPageCount = Math.ceil(normalizedTotal.value / newPageSize);
  const newPage =
    nextPageCount === 0 ? 0 : Math.min(Math.floor(firstItemIndex / newPageSize) + 1, nextPageCount);

  if (newPage !== previousPage) {
    pageState.request(newPage);
    jumpValue.value = currentPage.value;
    emit('update:current', newPage);
  }

  emit('change', newPage, newPageSize);
};

// 快速跳转
const handleJump = () => {
  if (props.disabled) return;
  // 输入被清空时 v-model.number 会得到 NaN，需先拦截，否则会越过 handlePageChange 的边界守卫
  const raw = Number(jumpValue.value);
  if (!Number.isFinite(raw) || totalPages.value === 0) {
    jumpValue.value = currentPage.value;
    return;
  }
  const page = Math.max(1, Math.min(totalPages.value, Math.floor(raw)));
  if (page !== currentPage.value) {
    handlePageChange(page);
  } else {
    jumpValue.value = page;
  }
};

// 暴露的方法
const goToPage = (page: number) => {
  handlePageChange(page);
};

const prev = () => {
  handlePrev();
};

const next = () => {
  handleNext();
};

const getElement = () => {
  return paginationRef.value || null;
};

defineExpose<ExPaginationExposed>({
  getElement,
  goToPage,
  prev,
  next,
});
</script>

<style scoped lang="scss" src="./ExPagination.scss"></style>
