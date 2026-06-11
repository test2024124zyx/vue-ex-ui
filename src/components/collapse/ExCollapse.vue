<template>
  <div
    ref="collapseRef"
    :class="collapseClasses"
    :style="collapseStyles"
    role="region"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';
import type { ExCollapseProps, ExCollapseEmits, ExCollapseExposed, CollapseItemName, CollapseActiveName } from './types';

defineOptions({
  name: 'ExCollapse',
});

const props = withDefaults(defineProps<ExCollapseProps>(), {
  modelValue: () => [],
  accordion: false,
  bordered: true,
  disabled: false,
  expandIconPosition: 'left',
});

const emit = defineEmits<ExCollapseEmits>();

// Refs
const collapseRef = ref<HTMLDivElement>();

// 当前激活的面板
const activeNames = ref<CollapseItemName[]>(
  Array.isArray(props.modelValue) ? props.modelValue : props.modelValue ? [props.modelValue] : []
);

// 计算属性
const collapseClasses = computed(() => {
  const classes = ['ex-collapse'];

  if (!props.bordered) classes.push('ex-collapse--borderless');
  if (props.disabled) classes.push('ex-collapse--disabled');
  if (props.expandIconPosition === 'right') classes.push('ex-collapse--icon-right');

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

const collapseStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 方法
const isActive = (name: CollapseItemName): boolean => {
  return activeNames.value.includes(name);
};

const handleItemClick = (name: CollapseItemName) => {
  if (props.disabled) return;

  let newActiveNames: CollapseItemName[];

  if (props.accordion) {
    // 手风琴模式：一次只能展开一个
    newActiveNames = isActive(name) ? [] : [name];
  } else {
    // 普通模式：可以展开多个
    if (isActive(name)) {
      newActiveNames = activeNames.value.filter((item) => item !== name);
    } else {
      newActiveNames = [...activeNames.value, name];
    }
  }

  activeNames.value = newActiveNames;

  const emitValue: CollapseActiveName = props.accordion
    ? newActiveNames[0] || ''
    : newActiveNames;

  emit('update:modelValue', emitValue);
  emit('change', emitValue);
};

const setActiveNames = (names: CollapseActiveName) => {
  activeNames.value = Array.isArray(names) ? names : names ? [names] : [];
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    activeNames.value = Array.isArray(newValue) ? newValue : newValue ? [newValue] : [];
  }
);

// 提供给子组件的上下文
provide('exCollapse', {
  activeNames,
  accordion: props.accordion,
  disabled: props.disabled,
  expandIconPosition: props.expandIconPosition,
  isActive,
  handleItemClick,
});

// 暴露的方法
const getElement = () => collapseRef.value || null;

defineExpose<ExCollapseExposed>({
  getElement,
  setActiveNames,
});
</script>

<style scoped lang="scss" src="./ExCollapse.scss"></style>
