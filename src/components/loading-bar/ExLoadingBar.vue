<template>
  <Teleport to="body">
    <Transition name="ex-loading-bar-fade">
      <div
        v-if="visible"
        class="ex-loading-bar"
        :style="loadingBarStyles"
      >
        <!-- 进度条 -->
        <div
          class="ex-loading-bar__bar"
          :class="barClasses"
          :style="barStyles"
        >
          <!-- 霓虹发光效果 -->
          <div class="ex-loading-bar__glow" />

          <!-- 流动动画 -->
          <div class="ex-loading-bar__flow" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ExLoadingBarProps } from './types';

defineOptions({
  name: 'ExLoadingBar',
});

const props = withDefaults(defineProps<ExLoadingBarProps>(), {
  percentage: 0,
  status: 'loading',
  height: 3,
  color: undefined,
  duration: 3000,
});

const visible = ref(true);

// 计算属性
const loadingBarStyles = computed(() => {
  const styles: Record<string, string> = {
    zIndex: 'calc(var(--ex-z-loading) - 1000 + var(--ex-z-index-base, 1000))',
  };
  if (props.zIndex !== undefined) {
    styles['--ex-z-loading'] = String(props.zIndex);
  }
  return styles;
});

const barClasses = computed(() => {
  const classes: string[] = [];

  if (props.status) {
    classes.push(`ex-loading-bar__bar--${props.status}`);
  }

  return classes;
});

const barStyles = computed(() => {
  const styles: Record<string, string> = {
    width: `${props.percentage}%`,
    height: `${props.height}px`,
  };

  if (props.color) {
    if (typeof props.color === 'string') {
      styles.background = props.color;
    } else if (typeof props.color === 'function') {
      styles.background = props.color(props.percentage);
    }
  }

  return styles;
});

// 暴露的方法和属性
defineExpose({
  visible,
});
</script>

<style scoped lang="scss" src="./ExLoadingBar.scss"></style>
