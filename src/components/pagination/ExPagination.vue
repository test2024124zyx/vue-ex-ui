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
    <div v-if="showTotal" class="ex-pagination__total">
      {{ totalDisplayText }}
    </div>

    <!-- 分页按钮组 -->
    <div class="ex-pagination__items">
      <!-- 上一页按钮 -->
      <button
        class="ex-pagination__item ex-pagination__prev"
        :disabled="disabled || currentPage <= 1"
        :aria-label="t('prev')"
        @click="handlePrev"
      >
        <ExIcon icon="arrow-left-s-line" :size="16" aria-hidden="true" />
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
            :disabled="disabled"
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
          v-if="showPrevMore"
          class="ex-pagination__item ex-pagination__item--more"
          :disabled="disabled"
          :aria-label="t('prev5')"
          @click="handlePrevMore"
        >
          <ExIcon icon="more-fill" :size="16" class="ex-pagination__more-icon" aria-hidden="true" />
          <ExIcon
            icon="arrow-left-double-line"
            :size="16"
            class="ex-pagination__more-icon-hover"
            aria-hidden="true"
          />
        </button>

        <!-- 中间页码 -->
        <button
          v-for="page in pagers"
          :key="page"
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
          v-if="showNextMore"
          class="ex-pagination__item ex-pagination__item--more"
          :disabled="disabled"
          :aria-label="t('next5')"
          @click="handleNextMore"
        >
          <ExIcon icon="more-fill" :size="16" class="ex-pagination__more-icon" aria-hidden="true" />
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
        class="ex-pagination__item ex-pagination__next"
        :disabled="disabled || currentPage >= totalPages"
        :aria-label="t('next')"
        @click="handleNext"
      >
        <ExIcon icon="arrow-right-s-line" :size="16" aria-hidden="true" />
      </button>
    </div>

    <!-- 每页条数选择器 -->
    <div v-if="showSizeChanger && !simple" class="ex-pagination__sizes">
      <select
        v-model.number="currentPageSize"
        class="ex-pagination__size-select"
        :disabled="disabled"
        :aria-label="t('pageSize')"
        @change="handleSizeChange"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">
          {{ size }} {{ t('page') }}
        </option>
      </select>
    </div>

    <!-- 快速跳转 -->
    <div v-if="showQuickJumper && !simple" class="ex-pagination__jumper">
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
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch } from 'vue';
import type { ExPaginationProps, ExPaginationEmits, ExPaginationExposed } from './types';
import { useLocale } from '../../locale';

defineOptions({
  name: 'ExPagination',
});

const props = withDefaults(defineProps<ExPaginationProps>(), {
  current: 1,
  pageSize: 10,
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
const currentPage = ref(props.current);
const currentPageSize = ref(props.pageSize);
const jumpValue = ref(props.current);

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(props.total / currentPageSize.value);
});

// 计算当前页的数据范围
const dataRange = computed<[number, number]>(() => {
  const start = (currentPage.value - 1) * currentPageSize.value + 1;
  const end = Math.min(currentPage.value * currentPageSize.value, props.total);
  return [start, end];
});

// 总数显示文本
const totalDisplayText = computed(() => {
  if (props.totalText) {
    return props.totalText(props.total, dataRange.value);
  }
  return t('total', { total: props.total });
});

// 计算显示的页码
const pagers = computed(() => {
  const pageCount = totalPages.value;
  const currentPageNum = currentPage.value;
  const showPagesCount = props.showPages;

  if (pageCount <= showPagesCount) {
    // 总页数小于等于显示页数，显示所有页码（除了首尾）
    const pages: number[] = [];
    for (let i = 2; i < pageCount; i++) {
      pages.push(i);
    }
    return pages;
  }

  // 计算中间显示的页码
  const halfShow = Math.floor((showPagesCount - 2) / 2);
  let start = currentPageNum - halfShow;
  let end = currentPageNum + halfShow;

  if (start < 2) {
    start = 2;
    end = start + showPagesCount - 3;
  }

  if (end > pageCount - 1) {
    end = pageCount - 1;
    start = end - showPagesCount + 3;
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// 是否显示向前省略号
const showPrevMore = computed(() => {
  const firstPager = pagers.value[0];
  return pagers.value.length > 0 && firstPager !== undefined && firstPager > 2;
});

// 是否显示向后省略号
const showNextMore = computed(() => {
  const lastPager = pagers.value[pagers.value.length - 1];
  return pagers.value.length > 0 && lastPager !== undefined && lastPager < totalPages.value - 1;
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

  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class);
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class);
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  }

  return classes;
});

const paginationStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 监听外部变化
watch(
  () => props.current,
  val => {
    if (val !== currentPage.value) {
      currentPage.value = val;
      jumpValue.value = val;
    }
  }
);

watch(
  () => props.pageSize,
  val => {
    if (val !== currentPageSize.value) {
      currentPageSize.value = val;
    }
  }
);

// 页码改变
const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return;
  }

  currentPage.value = page;
  jumpValue.value = page;
  emit('update:current', page);
  emit('change', page, currentPageSize.value);
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
const handleSizeChange = () => {
  const newPageSize = currentPageSize.value;
  emit('update:pageSize', newPageSize);

  // 重新计算当前页，保持数据位置
  const newPage = Math.min(
    Math.ceil(((currentPage.value - 1) * props.pageSize) / newPageSize) + 1,
    Math.ceil(props.total / newPageSize)
  );

  if (newPage !== currentPage.value) {
    currentPage.value = newPage;
    jumpValue.value = newPage;
    emit('update:current', newPage);
  }

  emit('change', currentPage.value, newPageSize);
};

// 快速跳转
const handleJump = () => {
  const page = Math.max(1, Math.min(totalPages.value, Math.floor(jumpValue.value)));
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
