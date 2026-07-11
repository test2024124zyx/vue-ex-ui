<template>
  <div ref="itemRef" :class="itemClasses" :style="itemStyles">
    <div class="ex-collapse-item__header-row" :class="{ 'is-disabled': isDisabled }">
      <!-- 切换区使用原生按钮，避免手工模拟键盘和禁用语义。 -->
      <button
        :id="headerId"
        type="button"
        class="ex-collapse-item__header"
        :disabled="isDisabled"
        :tabindex="isDisabled ? -1 : 0"
        :aria-expanded="isActive"
        :aria-controls="contentId"
        :aria-label="ariaLabel"
        @click="handleClick"
      >
        <span
          v-if="showArrow && expandIconPosition === 'left'"
          class="ex-collapse-item__arrow ex-collapse-item__arrow--left"
          :class="{ 'is-active': isActive }"
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            focusable="false"
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
        </span>

        <span class="ex-collapse-item__title">
          <slot name="title">
            {{ title }}
          </slot>
        </span>

        <span
          v-if="showArrow && expandIconPosition === 'right'"
          class="ex-collapse-item__arrow ex-collapse-item__arrow--right"
          :class="{ 'is-active': isActive }"
          aria-hidden="true"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            focusable="false"
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
        </span>
      </button>

      <!-- 额外操作与切换按钮并列，允许安全放置链接或按钮。 -->
      <div v-if="$slots.extra" class="ex-collapse-item__extra">
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
        :id="contentId"
        class="ex-collapse-item__wrap"
        role="region"
        :aria-labelledby="headerId"
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
import { computed, getCurrentInstance, inject, onBeforeUnmount, ref, useId, watch } from 'vue';
import type { ExCollapseItemProps, ExCollapseItemExposed } from './types';
import { collapseContextKey } from './context';

defineOptions({
  name: 'ExCollapseItem',
});

const props = withDefaults(defineProps<ExCollapseItemProps>(), {
  disabled: false,
  showArrow: true,
});

// 元素引用与 ARIA 关联标识。
const itemRef = ref<HTMLDivElement>();
const itemId = `ex-collapse-${useId()}`;
const headerId = `${itemId}-header`;
const contentId = `${itemId}-content`;

const collapseContext = inject(collapseContextKey, null);
if (!collapseContext) {
  throw new Error('ExCollapseItem 必须作为 ExCollapse 的子组件使用');
}
const instance = getCurrentInstance();
if (!instance) {
  throw new Error('ExCollapseItem 初始化失败');
}

collapseContext.registerItem(props.name, instance.uid);
watch(
  () => props.name,
  (name, previousName) => {
    collapseContext.registerItem(name, instance.uid);
    collapseContext.unregisterItem(previousName, instance.uid);
  }
);
onBeforeUnmount(() => collapseContext.unregisterItem(props.name, instance.uid));

// 运行时状态由父容器统一管理。
const isActive = computed(() => collapseContext.isActive(props.name));
const isDisabled = computed(() => props.disabled || collapseContext.disabled.value);
const expandIconPosition = computed(() => collapseContext.expandIconPosition.value);

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

const handleClick = () => {
  if (isDisabled.value) return;
  collapseContext.handleItemClick(props.name);
};

const toggle = handleClick;

// 动画钩子
const onEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '0';
  element.style.overflow = 'hidden';
  // 读取布局前强制刷新起始高度，确保浏览器创建过渡帧。
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
  // 读取布局前强制刷新起始高度，确保浏览器创建过渡帧。
  void element.offsetHeight;
  element.style.height = '0';
};

const onAfterLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '';
  element.style.overflow = '';
};

const getElement = () => itemRef.value ?? null;

defineExpose<ExCollapseItemExposed>({
  getElement,
  toggle,
});
</script>

<style scoped lang="scss" src="./ExCollapseItem.scss"></style>
