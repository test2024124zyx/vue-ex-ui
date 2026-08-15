<template>
  <div
    ref="stepsRef"
    :class="stepsClasses"
    :style="stepsStyles"
    role="navigation"
    :aria-label="ariaLabel || 'Steps navigation'"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, onUpdated, provide, ref } from 'vue';
import type { ExStepsProps, ExStepsEmits, ExStepsExposed, StepsContext } from './types';

defineOptions({
  name: 'ExSteps',
});

const props = withDefaults(defineProps<ExStepsProps>(), {
  current: 0,
  direction: 'horizontal',
  size: 'medium',
  status: 'process',
  progressDot: false,
  clickable: false,
});

const emit = defineEmits<ExStepsEmits>();

const stepsRef = ref<HTMLDivElement>();
// 按注册顺序保存各步骤的唯一标识；索引通过 indexOf 实时计算，
// 这样动态增删/重排步骤后 isLast、状态判断等都会自动更新（避免自增计数器永久漂移）。
const stepUids = ref<symbol[]>([]);
const stepElements = new Map<symbol, () => HTMLElement | null>();

// 计算属性
const stepsClasses = computed(() => {
  const classes = ['ex-steps'];

  classes.push(`ex-steps--${props.direction}`);
  classes.push(`ex-steps--${props.size}`);

  if (props.progressDot) {
    classes.push('ex-steps--progress-dot');
  }

  if (props.clickable) {
    classes.push('ex-steps--clickable');
  }

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const stepsStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 注册步骤（按文档顺序追加）
const registerStep = (uid: symbol, getElement: () => HTMLElement | null) => {
  stepElements.set(uid, getElement);
  if (!stepUids.value.includes(uid)) {
    stepUids.value.push(uid);
  }
};

// 注销步骤
const unregisterStep = (uid: symbol) => {
  const index = stepUids.value.indexOf(uid);
  if (index > -1) {
    stepUids.value.splice(index, 1);
  }
  stepElements.delete(uid);
};

const syncStepOrder = (): void => {
  const ordered = [...stepUids.value].sort((leftUid, rightUid) => {
    const left = stepElements.get(leftUid)?.();
    const right = stepElements.get(rightUid)?.();
    if (!left || !right || left === right) return 0;
    const position = left.compareDocumentPosition(right);
    return position & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
  if (ordered.some((uid, index) => uid !== stepUids.value[index])) {
    stepUids.value = ordered;
  }
};

onUpdated(syncStepOrder);

// 获取步骤当前索引（响应式）
const getStepIndex = (uid: symbol) => stepUids.value.indexOf(uid);

// 步骤点击事件
const onStepClick = (index: number, childOverride = false) => {
  if (props.clickable || childOverride) {
    emit('change', index);
  }
};

// 提供给子组件的上下文
const stepsContext: StepsContext = {
  current: computed(() => props.current),
  status: computed(() => props.status),
  direction: computed(() => props.direction),
  size: computed(() => props.size),
  progressDot: computed(() => props.progressDot),
  clickable: computed(() => props.clickable),
  stepCount: computed(() => stepUids.value.length),
  registerStep,
  unregisterStep,
  getStepIndex,
  onStepClick,
};

provide('exSteps', stepsContext);

// 暴露的方法
const getElement = () => stepsRef.value || null;

const goTo = (index: number) => {
  if (index >= 0 && index < stepUids.value.length) {
    emit('change', index);
  }
};

const next = () => {
  if (props.current < stepUids.value.length - 1) {
    emit('change', props.current + 1);
  }
};

const prev = () => {
  if (props.current > 0) {
    emit('change', props.current - 1);
  }
};

defineExpose<ExStepsExposed>({
  getElement,
  goTo,
  next,
  prev,
});
</script>

<style scoped lang="scss" src="./ExSteps.scss"></style>
