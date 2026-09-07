<template>
  <transition
    name="ex-skeleton-fade"
    mode="out-in"
  >
    <div
      v-if="loading"
      key="skeleton"
      ref="skeletonRef"
      :class="skeletonClasses"
      :style="skeletonStyles"
      role="status"
      :aria-label="t('loading')"
      aria-live="polite"
      aria-busy="true"
    >
      <!-- 自定义内容模式 -->
      <template v-if="variant === 'custom' && $slots.default">
        <slot />
      </template>

      <!-- 预设变体模式（count 控制重复渲染的骨架块数量） -->
      <template v-else>
        <div
          v-for="n in normalizedCount"
          :key="n"
          class="ex-skeleton__repeat"
        >
          <!-- 头像 + 内容布局 -->
          <div
            v-if="avatar || variant === 'avatar'"
            class="ex-skeleton__layout"
          >
            <!-- 头像 -->
            <div
              class="ex-skeleton__avatar"
              :class="[`ex-skeleton__avatar--${avatarShape}`, `ex-skeleton__avatar--${size}`]"
              :style="avatarStyle"
            />

            <!-- 内容区域 -->
            <div
              v-if="variant !== 'avatar'"
              class="ex-skeleton__content"
            >
              <!-- 标题 -->
              <div
                v-if="title"
                class="ex-skeleton__title"
                :style="titleStyle"
              />

              <!-- 段落 -->
              <div
                v-if="computedRows > 0"
                class="ex-skeleton__paragraph"
              >
                <div
                  v-for="(_row, index) in computedRows"
                  :key="index"
                  class="ex-skeleton__row"
                  :style="getRowStyle(index)"
                />
              </div>
            </div>
          </div>

          <!-- 纯内容布局（无头像） -->
          <div
            v-else
            class="ex-skeleton__content"
          >
            <div
              v-if="variant === 'list'"
              class="ex-skeleton__list-item ex-skeleton__layout"
            >
              <div
                class="ex-skeleton__avatar"
                :class="[`ex-skeleton__avatar--${avatarShape}`, `ex-skeleton__avatar--${size}`]"
                :style="avatarStyle"
              />
              <div class="ex-skeleton__content">
                <div
                  class="ex-skeleton__title"
                  :style="titleStyle"
                />
                <div class="ex-skeleton__paragraph">
                  <div
                    v-for="rowIndex in computedRows"
                    :key="rowIndex"
                    class="ex-skeleton__row"
                    :style="getRowStyle(rowIndex - 1)"
                  />
                </div>
              </div>
            </div>

            <div
              v-else-if="variant === 'table'"
              class="ex-skeleton__table"
            >
              <div class="ex-skeleton__table-header ex-skeleton__title" />
              <div
                v-for="rowIndex in computedRows"
                :key="rowIndex"
                class="ex-skeleton__table-row ex-skeleton__row"
              />
            </div>

            <div
              v-else-if="title || variant === 'title' || variant === 'article'"
              class="ex-skeleton__title"
              :style="titleStyle"
            />

            <div
              v-if="
                variant === 'paragraph' ||
                variant === 'article' ||
                (variant === 'text' && hasExplicitRows) ||
                (title && computedRows > 0)
              "
              class="ex-skeleton__paragraph"
            >
              <div
                v-for="(_row, index) in computedRows"
                :key="index"
                class="ex-skeleton__row"
                :style="getRowStyle(index)"
              />
            </div>

            <!-- 单个元素变体 -->
            <div
              v-if="['text', 'image', 'button', 'card', 'rect'].includes(variant)"
              class="ex-skeleton__element"
              :class="`ex-skeleton__element--${variant}`"
              :style="elementStyle"
            />
          </div>
        </div>
      </template>

      <!-- 加载中提示文本（屏幕阅读器） -->
      <span class="ex-skeleton__sr-only">{{ t('loadingContent') }}</span>
    </div>

    <!-- 加载完成后显示实际内容 -->
    <div
      v-else
      key="content"
    >
      <slot name="content">
        <slot />
      </slot>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { useRenderComputed } from '../../composables/useRenderComputed';
import { computed, getCurrentInstance, ref } from 'vue';
import type { ExSkeletonProps, ExSkeletonExposed } from './types';
import { useLocale } from '../../locale';

defineOptions({
  name: 'ExSkeleton',
});

const props = withDefaults(defineProps<ExSkeletonProps>(), {
  loading: true,
  animation: 'pulse',
  shape: 'rounded',
  size: 'default',
  variant: 'text',
  active: true,
  count: 1,
  avatar: false,
  avatarShape: 'circle',
  title: false,
  rows: 3,
});

const { t } = useLocale('skeleton');
const skeletonRef = ref<HTMLDivElement>();
const instance = getCurrentInstance();
const hasExplicitRows = useRenderComputed(() => {
  void props.rows;
  const vnodeProps = instance?.vnode.props;
  return Boolean(vnodeProps && Object.prototype.hasOwnProperty.call(vnodeProps, 'rows'));
});

// 计算属性
const skeletonClasses = computed(() => {
  const classes = [
    'ex-skeleton',
    `ex-skeleton--${props.variant}`,
    `ex-skeleton--${props.size}`,
    `ex-skeleton--${props.shape}`,
  ];

  if (props.active && props.animation !== 'none') {
    classes.push(`ex-skeleton--animation-${props.animation}`);
  }

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const skeletonStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  if (props.height) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }

  if (props.style) {
    if (typeof props.style === 'string') {
      return [styles, props.style];
    }
    Object.assign(styles, props.style);
  }

  return styles;
});

const avatarStyle = computed(() => {
  const styles: Record<string, string> = {};

  if (props.avatarSize) {
    const size = typeof props.avatarSize === 'number' ? `${props.avatarSize}px` : props.avatarSize;
    styles.width = size;
    styles.height = size;
  }

  return styles;
});

const titleStyle = computed(() => {
  const styles: Record<string, string> = {};

  if (props.titleWidth) {
    styles.width =
      typeof props.titleWidth === 'number' ? `${props.titleWidth}px` : props.titleWidth;
  }

  return styles;
});

const elementStyle = computed(() => {
  const styles: Record<string, string> = {};

  if (props.variant === 'rect' && !props.height) {
    styles.minHeight = '120px';
  }

  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  if (props.height) {
    styles.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
  }

  return styles;
});

// 渲染数量必须为有限非负整数，零表示明确不渲染该部分。
const normalizeCount = (value: number, fallback: number): number =>
  Number.isFinite(value) && value >= 0 ? Math.trunc(value) : fallback;
const normalizedCount = computed(() => normalizeCount(props.count, 1));
const computedRows = computed(() => normalizeCount(props.rows, 3));

const getRowStyle = (index: number) => {
  const styles: Record<string, string> = {};

  if (props.rowsWidth) {
    if (Array.isArray(props.rowsWidth)) {
      const width = props.rowsWidth[index];
      if (width !== undefined) {
        styles.width = typeof width === 'number' ? `${width}px` : width;
      }
    } else {
      styles.width = typeof props.rowsWidth === 'number' ? `${props.rowsWidth}px` : props.rowsWidth;
    }
  } else {
    // 默认最后一行宽度为 60%
    if (index === computedRows.value - 1) {
      styles.width = '60%';
    }
  }

  return styles;
};

// 暴露的方法
const getElement = () => skeletonRef.value || null;

defineExpose<ExSkeletonExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExSkeleton.scss"></style>
