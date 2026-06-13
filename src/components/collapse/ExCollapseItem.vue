<template>
  <div ref="itemRef" :class="itemClasses" :style="itemStyles">
    <!-- 面板头部 -->
    <div
      class="ex-collapse-item__header"
      :class="{ 'is-disabled': isDisabled }"
      role="button"
      :tabindex="isDisabled ? -1 : 0"
      :aria-expanded="isActive"
      :aria-controls="`ex-collapse-content-${name}`"
      :aria-disabled="isDisabled"
      :aria-label="ariaLabel || title"
      @click="handleClick"
      @keydown.enter="handleClick"
      @keydown.space.prevent="handleClick"
    >
      <!-- 左侧图标 -->
      <div
        v-if="showArrow && expandIconPosition === 'left'"
        class="ex-collapse-item__arrow ex-collapse-item__arrow--left"
        :class="{ 'is-active': isActive }"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- 标题插槽 -->
      <div class="ex-collapse-item__title">
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <!-- 右侧图标 -->
      <div
        v-if="showArrow && expandIconPosition === 'right'"
        class="ex-collapse-item__arrow ex-collapse-item__arrow--right"
        :class="{ 'is-active': isActive }"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>

      <!-- 额外内容插槽 -->
      <div v-if="$slots.extra" class="ex-collapse-item__extra" @click.stop>
        <slot name="extra" />
      </div>
    </div>

    <!-- 面板内容 -->
    <transition
      name="ex-collapse"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
      @after-leave="onAfterLeave"
    >
      <div
        v-show="isActive"
        :id="`ex-collapse-content-${name}`"
        class="ex-collapse-item__wrap"
        role="region"
        :aria-labelledby="`ex-collapse-header-${name}`"
      >
        <div class="ex-collapse-item__content">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, inject, ref } from 'vue';
import type { ExCollapseItemProps, ExCollapseItemExposed, CollapseItemName } from './types';

defineOptions({
  name: 'ExCollapseItem',
});

const props = withDefaults(defineProps<ExCollapseItemProps>(), {
  disabled: false,
  showArrow: true,
});

// Refs
const itemRef = ref<HTMLDivElement>();

// 注入父组件的上下文
const collapseContext = inject<{
  activeNames: { value: CollapseItemName[] };
  accordion: boolean;
  disabled: boolean;
  expandIconPosition: 'left' | 'right';
  isActive: (name: CollapseItemName) => boolean;
  handleItemClick: (name: CollapseItemName) => void;
}>('exCollapse', {
  activeNames: { value: [] },
  accordion: false,
  disabled: false,
  expandIconPosition: 'left',
  isActive: () => false,
  handleItemClick: () => {},
});

// 计算属性
const isActive = computed(() => collapseContext.isActive(props.name));
const isDisabled = computed(() => props.disabled || collapseContext.disabled);
const expandIconPosition = computed(() => collapseContext.expandIconPosition);

const itemClasses = computed(() => {
  const classes = ['ex-collapse-item'];

  if (isActive.value) classes.push('is-active');
  if (isDisabled.value) classes.push('is-disabled');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const itemStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 方法
const handleClick = () => {
  if (isDisabled.value) return;
  collapseContext.handleItemClick(props.name);
};

const toggle = () => {
  if (isDisabled.value) return;
  collapseContext.handleItemClick(props.name);
};

// 动画钩子
const onEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '0';
  element.style.overflow = 'hidden';
  // 强制重排
  void element.offsetHeight;
  element.style.height = `${element.scrollHeight}px`;
};

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '';
  element.style.overflow = '';
};

const onLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = `${element.scrollHeight}px`;
  element.style.overflow = 'hidden';
  // 强制重排
  void element.offsetHeight;
  element.style.height = '0';
};

const onAfterLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '';
  element.style.overflow = '';
};

// 暴露的方法
const getElement = () => itemRef.value || null;

defineExpose<ExCollapseItemExposed>({
  getElement,
  toggle,
});
</script>

<style scoped lang="scss" src="./ExCollapseItem.scss"></style>
