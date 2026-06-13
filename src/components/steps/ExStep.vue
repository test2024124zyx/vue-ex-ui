<template>
  <div
    ref="stepRef"
    :class="stepClasses"
    :style="stepStyles"
    :role="isClickable ? 'button' : undefined"
    :tabindex="isClickable && !props.disabled ? 0 : undefined"
    :aria-current="isCurrent ? 'step' : undefined"
    :aria-disabled="props.disabled"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- 步骤头部 -->
    <div class="ex-step__head">
      <!-- 图标容器 -->
      <div class="ex-step__icon" :style="iconStyles">
        <!-- 进度点模式：不显示任何内容，只显示圆点 -->
        <template v-if="stepsContext.progressDot.value">
          <!-- 空的，只显示圆点边框 -->
        </template>
        <!-- 普通模式：显示图标或数字 -->
        <template v-else>
          <!-- 自定义图标插槽 -->
          <slot name="icon">
            <!-- 默认图标：根据状态显示 -->
            <template v-if="statusIcon">
              <ExIcon :icon="statusIcon" class="ex-step__icon-image" aria-hidden="true" />
            </template>
            <!-- 默认显示步骤数字 -->
            <span v-else class="ex-step__icon-number">
              {{ stepNumber }}
            </span>
          </slot>
        </template>
      </div>

      <!-- 连接线 -->
      <div v-if="!isLastStep" class="ex-step__line" :class="lineClasses" :style="lineStyles" />
    </div>

    <!-- 步骤内容 -->
    <div class="ex-step__content">
      <!-- 标题 -->
      <div class="ex-step__title" :style="titleStyles">
        <slot name="title">
          {{ title }}
        </slot>
      </div>

      <!-- 子标题 -->
      <div v-if="subtitle || $slots.subtitle" class="ex-step__subtitle">
        <slot name="subtitle">
          {{ subtitle }}
        </slot>
      </div>

      <!-- 描述 -->
      <div v-if="description || $slots.description" class="ex-step__description">
        <slot name="description">
          {{ description }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, inject, onBeforeUnmount, ref } from 'vue';
import type { ExStepProps, ExStepExposed, StepsContext } from './types';
import ExIcon from '../icon/ExIcon.vue';

defineOptions({
  name: 'ExStep',
});

const props = withDefaults(defineProps<ExStepProps>(), {
  disabled: false,
  clickable: undefined,
});

const stepRef = ref<HTMLDivElement>();

// 从父组件注入上下文
const stepsContext = inject<StepsContext>('exSteps')!;

// 注册步骤
const uid = Date.now() + Math.random();
const stepIndex = stepsContext.registerStep(uid);

// 组件卸载时注销
onBeforeUnmount(() => {
  stepsContext.unregisterStep(uid);
});

// 计算属性
const stepNumber = computed(() => stepIndex + 1);

const isCurrent = computed(() => stepIndex === stepsContext.current.value);

const isLastStep = computed(() => stepIndex === stepsContext.stepCount.value - 1);

const currentStatus = computed(() => {
  // 优先使用步骤自己的状态
  if (props.status) return props.status;

  // 根据当前步骤索引判断状态
  if (stepIndex < stepsContext.current.value) {
    return 'finish';
  } else if (stepIndex === stepsContext.current.value) {
    return stepsContext.status.value;
  } else {
    return 'wait';
  }
});

const isClickable = computed(() => {
  // 优先使用步骤自己的clickable属性
  if (props.clickable !== undefined) return props.clickable;
  // 否则使用父组件的clickable属性
  return stepsContext.clickable.value;
});

const stepClasses = computed(() => {
  const classes = ['ex-step'];

  classes.push(`ex-step--${currentStatus.value}`);

  if (props.disabled) {
    classes.push('ex-step--disabled');
  }

  if (isClickable.value && !props.disabled) {
    classes.push('ex-step--clickable');
  }

  if (isCurrent.value) {
    classes.push('ex-step--current');
  }

  if (isLastStep.value) {
    classes.push('ex-step--last');
  }

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const stepStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

// 连接线样式类
const lineClasses = computed(() => {
  const classes: string[] = [];

  // 如果有自定义颜色，不添加状态类
  if (props.lineColor) {
    return classes;
  }

  // 连接线的颜色取决于当前步骤的状态
  if (currentStatus.value === 'finish') {
    classes.push('ex-step__line--finish');
  } else if (currentStatus.value === 'error') {
    classes.push('ex-step__line--error');
  } else if (currentStatus.value === 'process') {
    classes.push('ex-step__line--process');
  }

  return classes;
});

// 自定义样式
const iconStyles = computed(() => {
  if (!props.iconColor) return undefined;
  return {
    borderColor: props.iconColor,
    backgroundColor: props.iconColor,
    color: '#ffffff',
  };
});

const titleStyles = computed(() => {
  if (!props.titleColor) return undefined;
  return {
    color: props.titleColor,
  };
});

const lineStyles = computed(() => {
  if (!props.lineColor) return undefined;
  return {
    backgroundColor: props.lineColor,
  };
});

// 获取状态图标
const statusIcon = computed(() => {
  // 根据状态返回对应的图标
  switch (currentStatus.value) {
    case 'finish':
      return 'check-line';
    case 'error':
      return 'close-line';
    case 'process':
      // 进行中状态显示加载图标（如果是点模式）或数字
      return stepsContext.progressDot.value ? 'loader-4-line' : '';
    case 'wait':
      // 等待状态默认显示数字
      return '';
    default:
      return '';
  }
});

// 事件处理
const handleClick = () => {
  if (!props.disabled && isClickable.value) {
    stepsContext.onStepClick(stepIndex);
  }
};

// 暴露的方法
const getElement = () => stepRef.value || null;
const getIndex = () => stepIndex;

defineExpose<ExStepExposed>({
  getElement,
  getIndex,
});
</script>

<style scoped lang="scss" src="./ExSteps.scss"></style>
