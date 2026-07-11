<template>
  <div
    ref="collapseRef"
    :class="collapseClasses"
    :style="collapseStyles"
    role="group"
    :aria-label="ariaLabel"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, provide, ref, watch } from 'vue';
import type {
  ExCollapseProps,
  ExCollapseEmits,
  ExCollapseExposed,
  CollapseItemName,
  CollapseActiveName,
} from './types';
import { collapseContextKey } from './context';

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

// 根元素引用。
const collapseRef = ref<HTMLDivElement>();

const normalizeActiveNames = (
  value: CollapseActiveName,
  accordion = props.accordion
): CollapseItemName[] => {
  const names = value === null ? [] : Array.isArray(value) ? value : [value];
  const uniqueNames = [...new Set(names)];
  return accordion ? uniqueNames.slice(0, 1) : uniqueNames;
};

const activeNames = ref<CollapseItemName[]>(normalizeActiveNames(props.modelValue));
const registeredItems = new Map<CollapseItemName, number>();

// 计算属性
const collapseClasses = computed(() => {
  const classes = ['ex-collapse'];

  if (!props.bordered) classes.push('ex-collapse--borderless');
  if (props.disabled) classes.push('ex-collapse--disabled');
  classes.push(...normalizeCustomClass(props.class));

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
      newActiveNames = activeNames.value.filter(item => item !== name);
    } else {
      newActiveNames = [...activeNames.value, name];
    }
  }

  commitActiveNames(newActiveNames);
};

const commitActiveNames = (names: CollapseActiveName) => {
  const normalizedNames = normalizeActiveNames(names);
  activeNames.value = normalizedNames;
  const emitValue: CollapseActiveName = props.accordion
    ? (normalizedNames[0] ?? null)
    : normalizedNames;
  emit('update:modelValue', emitValue);
  emit('change', emitValue);
};

const setActiveNames = (names: CollapseActiveName) => {
  commitActiveNames(names);
};

// 监听 modelValue 变化
watch([() => props.modelValue, () => props.accordion], ([newValue]) => {
  activeNames.value = normalizeActiveNames(newValue);
});

const registerItem = (name: CollapseItemName, uid: number) => {
  const existingUid = registeredItems.get(name);
  if (existingUid !== undefined && existingUid !== uid) {
    throw new Error(`ExCollapseItem 的 name 必须唯一：${String(name)}`);
  }
  registeredItems.set(name, uid);
};

const unregisterItem = (name: CollapseItemName, uid: number) => {
  if (registeredItems.get(name) === uid) registeredItems.delete(name);
};

// 提供给子组件的上下文（用 computed 传递，保证运行时修改 prop 后子组件能响应）
provide(collapseContextKey, {
  activeNames,
  disabled: computed(() => props.disabled),
  expandIconPosition: computed(() => props.expandIconPosition),
  isActive,
  handleItemClick,
  registerItem,
  unregisterItem,
});

// 暴露的方法
const getElement = () => collapseRef.value || null;

defineExpose<ExCollapseExposed>({
  getElement,
  setActiveNames,
});
</script>

<style scoped lang="scss" src="./ExCollapse.scss"></style>
