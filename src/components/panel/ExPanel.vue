<template>
  <div
    ref="panelRef"
    :class="panelClasses"
    :style="panelStyles"
    role="region"
    :aria-label="ariaLabel || title"
  >
    <!-- 面板头部 -->
    <div
      v-if="hasHeader"
      class="ex-panel__header"
      :style="headerStyle"
    >
      <!-- 标题区域 -->
      <div class="ex-panel__title">
        <!-- 图标 -->
        <div
          v-if="$slots.icon"
          class="ex-panel__icon"
        >
          <slot name="icon" />
        </div>

        <!-- 标题内容 -->
        <div class="ex-panel__title-content">
          <slot name="title">
            <h3
              v-if="title"
              class="ex-panel__title-text"
            >
              {{ title }}
            </h3>
          </slot>
          <p
            v-if="subtitle || $slots.subtitle"
            class="ex-panel__subtitle"
          >
            <slot name="subtitle">
              {{ subtitle }}
            </slot>
          </p>
        </div>
      </div>

      <!-- 额外内容 -->
      <div
        v-if="$slots.extra"
        class="ex-panel__extra"
      >
        <slot name="extra" />
      </div>
    </div>

    <!-- 面板内容 -->
    <div
      class="ex-panel__body"
      :style="bodyStyle"
    >
      <slot />
    </div>

    <!-- 面板底部 -->
    <div
      v-if="$slots.footer"
      class="ex-panel__footer"
      :style="footerStyle"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref, useSlots } from 'vue';
import type { ExPanelProps, ExPanelExposed } from './types';

defineOptions({
  name: 'ExPanel',
});

const props = withDefaults(defineProps<ExPanelProps>(), {
  bordered: true,
  hoverable: false,
  shadow: 'base',
});

const slots = useSlots();
const panelRef = ref<HTMLDivElement>();

// 计算属性
const hasHeader = computed(() => {
  return !!(
    props.title ||
    props.subtitle ||
    slots.title ||
    slots.subtitle ||
    slots.icon ||
    slots.extra
  );
});

const panelClasses = computed(() => {
  const classes = ['ex-panel'];

  if (props.type) classes.push(`ex-panel--${props.type}`);
  if (props.size) classes.push(`ex-panel--${props.size}`);
  if (props.shadow) classes.push(`ex-panel--shadow-${props.shadow}`);
  if (!props.bordered) classes.push('ex-panel--borderless');
  if (props.hoverable) classes.push('ex-panel--hoverable');
  if (props.loading) classes.push('ex-panel--loading');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const panelStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 暴露的方法
const getElement = () => panelRef.value || null;

defineExpose<ExPanelExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExPanel.scss"></style>
