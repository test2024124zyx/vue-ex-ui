<template>
  <div
    v-if="shouldRender"
    v-show="isActive"
    ref="paneRef"
    :class="paneClasses"
    :style="paneStyles"
    role="tabpanel"
    :aria-hidden="!isActive"
    :aria-labelledby="`tab-${name}`"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject, onMounted } from 'vue';
import type { ExTabPaneProps, ExTabPaneExposed } from './types';

defineOptions({
  name: 'ExTabPane',
});

const props = withDefaults(defineProps<ExTabPaneProps>(), {
  disabled: false,
  closable: false,
  lazy: false,
});

const paneRef = ref<HTMLDivElement>();

// 从父组件注入
const activeTab = inject<{ value: string | number }>('activeTab', { value: '' });
const registerPane = inject<(pane: Record<string, unknown>) => void>('registerPane', () => {});
// unregisterPane 功能暂未使用
// const unregisterPane = inject<(name: string | number) => void>('unregisterPane', () => {});

// 计算属性
const isActive = computed(() => activeTab.value === props.name);

const shouldRender = computed(() => {
  if (!props.lazy) return true;
  return isActive.value || hasBeenActive.value;
});

const hasBeenActive = ref(false);

// 监听激活状态
const checkActive = () => {
  if (isActive.value && !hasBeenActive.value) {
    hasBeenActive.value = true;
  }
};

const paneClasses = computed(() => {
  const classes = ['ex-tab-pane'];

  if (isActive.value) classes.push('ex-tab-pane--active');

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

const paneStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 生命周期
onMounted(() => {
  registerPane({
    name: props.name,
    label: props.label,
    disabled: props.disabled,
    closable: props.closable,
  });
  checkActive();
});

// 暴露的方法
const getElement = () => paneRef.value || null;

defineExpose<ExTabPaneExposed>({
  getElement,
});
</script>

<style scoped lang="scss">
.ex-tab-pane {
  display: none;

  &--active {
    display: block;
  }
}
</style>
