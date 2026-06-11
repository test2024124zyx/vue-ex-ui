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
import { computed, provide, ref } from 'vue';
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
const steps = ref<Map<number, number>>(new Map());
let stepCounter = 0;

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

const stepsStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 注册步骤
const registerStep = (uid: number): number => {
  const index = stepCounter++;
  steps.value.set(uid, index);
  return index;
};

// 注销步骤
const unregisterStep = (uid: number) => {
  steps.value.delete(uid);
};

// 步骤点击事件
const onStepClick = (index: number) => {
  if (props.clickable) {
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
  stepCount: computed(() => steps.value.size),
  registerStep,
  unregisterStep,
  onStepClick,
};

provide('exSteps', stepsContext);

// 暴露的方法
const getElement = () => stepsRef.value || null;

const goTo = (index: number) => {
  if (index >= 0 && index < steps.value.size) {
    emit('change', index);
  }
};

const next = () => {
  if (props.current < steps.value.size - 1) {
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
