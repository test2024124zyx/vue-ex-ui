<template>
  <div
    v-if="shouldRender"
    v-show="isActive"
    :id="getPanelId(name)"
    ref="paneRef"
    :class="paneClasses"
    :style="paneStyles"
    role="tabpanel"
    :aria-hidden="!isActive"
    :aria-labelledby="getTabId(name)"
    :tabindex="isActive ? 0 : undefined"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, getCurrentInstance, ref, inject, onMounted, onUnmounted, watch } from 'vue';
import type { ExTabPaneProps, ExTabPaneExposed } from './types';
import { tabsContextKey } from './context';

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
const tabs = inject(tabsContextKey, null);
const getTabId = (name: ExTabPaneProps['name']) =>
  tabs ? tabs.getTabId(name) : `ex-tabs-tab-${name}`;
const getPanelId = (name: ExTabPaneProps['name']) =>
  tabs ? tabs.getPanelId(name) : `ex-tabs-panel-${name}`;
const instance = getCurrentInstance()!;
// 异步包装标签也要等自身水合和挂载结束，才能加入导航。
onMounted(() => {
  tabs?.registerPane(instance, {
    name: props.name,
    label: props.label,
    disabled: props.disabled,
    closable: props.closable,
  });
});

// 计算属性
const isVisible = computed(() => !tabs || tabs.isPaneVisible(instance, props.name));
const isActive = computed(
  () => isVisible.value && (tabs ? tabs.activeTab.value : '') === props.name
);

const hasBeenActive = ref(false);

const shouldRender = computed(() => {
  if (!isVisible.value) return false;
  if (!props.lazy) return true;
  return isActive.value || hasBeenActive.value;
});

// 监听激活状态
const checkActive = () => {
  if (isActive.value && !hasBeenActive.value) {
    hasBeenActive.value = true;
  }
};

watch(isActive, checkActive, { immediate: true });

watch(
  () => [props.name, props.label, props.disabled, props.closable] as const,
  ([name, label, disabled, closable], [previousName]) => {
    tabs?.updatePane(instance, previousName, { name, label, disabled, closable });
  }
);

const paneClasses = computed(() => {
  const classes = ['ex-tab-pane'];

  if (isActive.value) classes.push('ex-tab-pane--active');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const paneStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 卸载时注销，否则被删除的标签仍残留在导航里（导致"删除不了"）
onUnmounted(() => {
  tabs?.unregisterPane(instance.uid);
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
