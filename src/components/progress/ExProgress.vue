<template>
  <div
    ref="progressRef"
    :class="progressClasses"
    :style="progressStyles"
    role="progressbar"
    :aria-valuenow="percentage"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-label="ariaLabel"
  >
    <!-- 线性进度条 -->
    <template v-if="props.type === 'line'">
      <!-- 进度条轨道 -->
      <div class="ex-progress__track">
        <!-- 进度条填充 -->
        <div class="ex-progress__bar" :style="barStyle">
          <!-- 霓虹发光效果 -->
          <div class="ex-progress__glow" />

          <!-- 进度条内文字 -->
          <div v-if="showText && textInside" class="ex-progress__text-inside">
            <slot name="text">
              {{ displayText }}
            </slot>
          </div>

          <!-- 条纹动画 -->
          <div
            v-if="striped"
            class="ex-progress__stripes"
            :class="{ 'ex-progress__stripes--animated': stripedFlow }"
          />
        </div>
      </div>

      <!-- 进度条外文字 -->
      <div v-if="showText && !textInside" class="ex-progress__text-outside">
        <slot name="text">
          {{ displayText }}
        </slot>
      </div>

      <!-- 状态图标 -->
      <div v-if="showIcon && status" class="ex-progress__icon">
        <slot name="icon">
          <ExIcon :icon="statusIcon" class="ex-progress__icon-image" aria-hidden="true" />
        </slot>
      </div>
    </template>

    <!-- 环形进度条 -->
    <template v-else-if="props.type === 'circle'">
      <div class="ex-progress__circle" :style="circleContainerStyle">
        <svg :width="circleWidth" :height="circleWidth" :viewBox="viewBox">
          <!-- 背景圆环 -->
          <circle
            :cx="circleWidth / 2"
            :cy="circleWidth / 2"
            :r="circleRadius"
            :stroke="trackColor"
            :stroke-width="strokeWidth"
            fill="none"
            class="ex-progress__circle-track"
          />

          <!-- 进度圆环 -->
          <circle
            :cx="circleWidth / 2"
            :cy="circleWidth / 2"
            :r="circleRadius"
            :stroke="circleColor"
            :stroke-width="strokeWidth"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="circleOffset"
            :stroke-linecap="strokeLinecap"
            fill="none"
            class="ex-progress__circle-path"
            :style="circlePathStyle"
          />

          <!-- 渐变定义 -->
          <defs v-if="isGradientColor">
            <linearGradient id="ex-progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" :stop-color="gradientColors[0]" />
              <stop offset="100%" :stop-color="gradientColors[1]" />
            </linearGradient>
          </defs>
        </svg>

        <!-- 中心文字 -->
        <div class="ex-progress__circle-text">
          <slot name="text">
            <span v-if="showText" class="ex-progress__circle-percentage">
              {{ displayText }}
            </span>
            <span v-if="status && showIcon" class="ex-progress__circle-icon">
              <ExIcon :icon="statusIcon" aria-hidden="true" />
            </span>
          </slot>
        </div>
      </div>
    </template>

    <!-- 波浪进度条（矩形） -->
    <template v-else-if="props.type === 'wave'">
      <div class="ex-progress__wave-container" :style="waveContainerStyle">
        <svg
          ref="waveSvgRef"
          class="ex-progress__wave-svg"
          :viewBox="`0 0 ${waveWidth} ${waveHeight}`"
          preserveAspectRatio="none"
        >
          <defs>
            <!-- 裁剪路径 -->
            <clipPath :id="`ex-wave-clip-${componentId}`">
              <rect x="0" y="0" :width="waveWidth" :height="waveHeight" :rx="8" />
            </clipPath>

            <!-- 波浪渐变 - 与 demo 一致 -->
            <linearGradient
              :id="`ex-wave-gradient-${componentId}`"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" :stop-color="waveColor" :stop-opacity="0.64" />
              <stop offset="100%" :stop-color="waveColor" :stop-opacity="0.8" />
            </linearGradient>
          </defs>

          <!-- 背景 -->
          <g :clip-path="`url(#ex-wave-clip-${componentId})`">
            <rect x="0" y="0" :width="waveWidth" :height="waveHeight" :fill="trackColor" />

            <!-- 波浪路径 -->
            <path
              ref="wavePath1Ref"
              class="ex-progress__wave-path"
              :fill="`url(#ex-wave-gradient-${componentId})`"
            />
            <path
              ref="wavePath2Ref"
              class="ex-progress__wave-path ex-progress__wave-path--secondary"
              :fill="waveColor"
              :opacity="0.4"
            />
          </g>
        </svg>

        <!-- 波浪文字 -->
        <div class="ex-progress__wave-text">
          <slot name="text">
            <span v-if="showText">{{ displayText }}</span>
          </slot>
        </div>
      </div>
    </template>

    <!-- 波浪进度条（圆形） -->
    <template v-else-if="props.type === 'wave-circle'">
      <div class="ex-progress__wave-circle" :style="circleContainerStyle">
        <svg ref="waveCircleSvgRef" :width="circleWidth" :height="circleWidth" :viewBox="viewBox">
          <defs>
            <!-- 圆形裁剪路径 -->
            <clipPath :id="`ex-wave-circle-clip-${componentId}`">
              <circle :cx="circleWidth / 2" :cy="circleWidth / 2" :r="circleRadius" />
            </clipPath>

            <!-- 波浪渐变 - 与 demo 一致 -->
            <linearGradient
              :id="`ex-wave-circle-gradient-${componentId}`"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" :stop-color="waveColor" :stop-opacity="0.64" />
              <stop offset="100%" :stop-color="waveColor" :stop-opacity="0.8" />
            </linearGradient>
          </defs>

          <!-- 背景圆 -->
          <g :clip-path="`url(#ex-wave-circle-clip-${componentId})`">
            <circle
              :cx="circleWidth / 2"
              :cy="circleWidth / 2"
              :r="circleRadius"
              :fill="trackColor"
            />

            <!-- 波浪路径 -->
            <path
              ref="waveCirclePath1Ref"
              class="ex-progress__wave-circle-path"
              :fill="`url(#ex-wave-circle-gradient-${componentId})`"
            />
            <path
              ref="waveCirclePath2Ref"
              class="ex-progress__wave-circle-path ex-progress__wave-circle-path--secondary"
              :fill="waveColor"
              :opacity="0.4"
            />
          </g>

          <!-- 边框圆环 -->
          <circle
            :cx="circleWidth / 2"
            :cy="circleWidth / 2"
            :r="circleRadius"
            fill="none"
            :stroke="circleColor"
            :stroke-width="2"
            class="ex-progress__wave-circle-border"
          />
        </svg>

        <!-- 中心文字 -->
        <div class="ex-progress__wave-circle-text">
          <slot name="text">
            <span v-if="showText">{{ displayText }}</span>
          </slot>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref, onMounted, onBeforeUnmount, watch } from 'vue';
import type { ExProgressProps, ExProgressEmits, ExProgressExposed } from './types';
import { useLocale } from '../../locale';
import { generateId } from '../../utils/id';
import ExIcon from '../icon/ExIcon.vue';

defineOptions({
  name: 'ExProgress',
});

const props = withDefaults(defineProps<ExProgressProps>(), {
  percentage: 0,
  type: 'line',
  strokeWidth: 8,
  showText: true,
  textInside: false,
  color: undefined,
  status: undefined,
  striped: false,
  stripedFlow: false,
  showIcon: true,
  format: undefined,
  width: 120,
  waveSpeed: 0.02,
  waveAmplitude: 10,
  waveAnimated: true,
});

// 定义事件
defineEmits<ExProgressEmits>();

// 国际化
const { t: _t } = useLocale('progress');
const progressRef = ref<HTMLDivElement>();

// 波浪进度条相关 refs
const waveSvgRef = ref<SVGSVGElement>();
const wavePath1Ref = ref<SVGPathElement>();
const wavePath2Ref = ref<SVGPathElement>();
const waveCircleSvgRef = ref<SVGSVGElement>();
const waveCirclePath1Ref = ref<SVGPathElement>();
const waveCirclePath2Ref = ref<SVGPathElement>();

// 波浪动画状态
const waveOffset = ref(0);
const waveAnimationFrame = ref<number | null>(null);
const componentId = generateId();

// 计算属性
const progressClasses = computed(() => {
  const classes = ['ex-progress', `ex-progress--${props.type}`];

  if (props.status) {
    classes.push(`ex-progress--${props.status}`);
  }

  if (props.textInside) {
    classes.push('ex-progress--text-inside');
  }

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const progressStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const percentage = computed(() => {
  const val = Math.max(0, Math.min(100, props.percentage));
  return val;
});

const barStyle = computed(() => {
  const styles: Record<string, string> = {
    width: `${percentage.value}%`,
  };

  if (props.type === 'line') {
    styles.height = `${props.strokeWidth}px`;
  }

  // 自定义颜色
  if (props.color) {
    if (typeof props.color === 'string') {
      styles.background = props.color;
    } else if (typeof props.color === 'function') {
      styles.background = props.color(percentage.value);
    } else if (Array.isArray(props.color)) {
      // 渐变色
      const colors = [...props.color]
        .sort((a, b) => a.percentage - b.percentage)
        .map(item => `${item.color} ${item.percentage}%`)
        .join(', ');
      styles.background = `linear-gradient(to right, ${colors})`;
    }
  }

  return styles;
});

const displayText = computed(() => {
  if (props.format) {
    return props.format(percentage.value);
  }
  return `${percentage.value}%`;
});

const statusIcon = computed(() => {
  const iconMap: Record<string, string> = {
    success: 'checkbox-circle-line',
    exception: 'close-circle-line',
    warning: 'error-warning-line',
  };

  return iconMap[props.status || ''] || '';
});

// 环形进度条计算属性
const circleWidth = computed(() => props.width || 120);
// 线条端点样式
const strokeLinecap = computed<'butt' | 'round' | 'square' | 'inherit'>(() => 'round');
const circleRadius = computed(() => {
  return (circleWidth.value - props.strokeWidth) / 2;
});

const circumference = computed(() => {
  return 2 * Math.PI * circleRadius.value;
});

const viewBox = computed(() => {
  return `0 0 ${circleWidth.value} ${circleWidth.value}`;
});

const circleOffset = computed(() => {
  const percent = percentage.value / 100;
  return circumference.value * (1 - percent);
});

const circleContainerStyle = computed(() => {
  return {
    width: `${circleWidth.value}px`,
    height: `${circleWidth.value}px`,
    '--ex-wave-speed': `${props.waveSpeed}s`,
  };
});

const trackColor = computed(() => {
  return 'var(--ex-color-bg-tertiary)';
});

const circleColor = computed(() => {
  if (props.color) {
    if (typeof props.color === 'string') {
      return props.color;
    }
  }

  // 根据状态返回颜色
  if (props.status === 'success') return 'var(--ex-color-success)';
  if (props.status === 'exception') return 'var(--ex-color-error)';
  if (props.status === 'warning') return 'var(--ex-color-warning)';

  // 渐变色
  if (isGradientColor.value) {
    return 'url(#ex-progress-gradient)';
  }

  return 'var(--ex-color-primary)';
});

const isGradientColor = computed(() => {
  return !props.color && !props.status;
});

const gradientColors = computed(() => {
  return ['var(--ex-color-primary)', 'var(--ex-color-secondary)'];
});

const circlePathStyle = computed(() => {
  return {
    transition: 'stroke-dashoffset 0.6s ease',
    transform: 'rotate(-90deg)',
    transformOrigin: 'center',
  };
});

// 波浪进度条计算属性
const waveWidth = computed(() => 400);
const waveHeight = computed(() => 100);

const waveContainerStyle = computed(() => {
  return {
    height: '100px',
    borderRadius: 'var(--ex-radius-lg)',
    '--ex-wave-speed': `${props.waveSpeed}s`,
  };
});

const waveColor = computed(() => {
  if (props.color && typeof props.color === 'string') {
    return props.color;
  }

  if (props.status === 'success') return 'var(--ex-color-success)';
  if (props.status === 'exception') return 'var(--ex-color-error)';
  if (props.status === 'warning') return 'var(--ex-color-warning)';

  return 'var(--ex-color-primary)';
});

// 波浪效果相关计算属性已移除（预留功能暂不实现）

// 波浪动画函数 - 与 demo 完全一致的实现
function generateWavePath(
  baseY: number,
  offset: number,
  amplitude: number,
  frequency: number,
  width: number,
  height: number
): string {
  const points = 100; // 与 demo 一致
  let path = `M 0 ${baseY}`;

  for (let i = 0; i <= points; i++) {
    const x = (width / points) * i;
    const y = baseY + Math.sin((i / points) * Math.PI * frequency + offset) * amplitude;
    path += ` L ${x} ${y}`;
  }

  path += ` L ${width} ${height} L 0 ${height} Z`;
  return path;
}

function updateWaveAnimation() {
  if (!props.waveAnimated) return;

  // 矩形波浪进度条
  if (props.type === 'wave' && wavePath1Ref.value && wavePath2Ref.value) {
    const amplitude = props.waveAmplitude;
    const frequency = 2; // 固定频率
    const width = waveWidth.value;
    const height = waveHeight.value;
    const waveY = height * (1 - percentage.value / 100);

    // 第一层波浪 - 与 demo 一致
    const path1 = generateWavePath(waveY, waveOffset.value, amplitude, frequency, width, height);
    // 第二层波浪 - 相位差 Math.PI，振幅 0.8，频率 1.2
    const path2 = generateWavePath(
      waveY,
      waveOffset.value + Math.PI,
      amplitude * 0.8,
      frequency * 1.2,
      width,
      height
    );

    wavePath1Ref.value.setAttribute('d', path1);
    wavePath2Ref.value.setAttribute('d', path2);
  }

  // 圆形波浪进度条
  if (props.type === 'wave-circle' && waveCirclePath1Ref.value && waveCirclePath2Ref.value) {
    const amplitude = props.waveAmplitude;
    const frequency = 2; // 固定频率
    const width = circleWidth.value;
    const height = circleWidth.value;
    const waveY = height * (1 - percentage.value / 100);

    // 第一层波浪 - 与 demo 一致
    const path1 = generateWavePath(
      waveY,
      waveOffset.value,
      amplitude,
      frequency,
      width,
      height * 2
    );
    // 第二层波浪 - 相位差 Math.PI，振幅 0.8，频率 1.2
    const path2 = generateWavePath(
      waveY,
      waveOffset.value + Math.PI,
      amplitude * 0.8,
      frequency * 1.2,
      width,
      height * 2
    );

    waveCirclePath1Ref.value.setAttribute('d', path1);
    waveCirclePath2Ref.value.setAttribute('d', path2);
  }
}

function startWaveAnimation() {
  if (!props.waveAnimated) return;

  const animate = () => {
    // 使用 demo 中的速度参数
    waveOffset.value += props.waveSpeed;
    updateWaveAnimation();
    waveAnimationFrame.value = requestAnimationFrame(animate);
  };

  waveAnimationFrame.value = requestAnimationFrame(animate);
}

function stopWaveAnimation() {
  if (waveAnimationFrame.value !== null) {
    cancelAnimationFrame(waveAnimationFrame.value);
    waveAnimationFrame.value = null;
  }
}

// 生命周期
onMounted(() => {
  if (props.type === 'wave' || props.type === 'wave-circle') {
    startWaveAnimation();
  }
});

onBeforeUnmount(() => {
  stopWaveAnimation();
});

// 监听类型变化
watch(
  () => props.type,
  (newType, oldType) => {
    if (oldType === 'wave' || oldType === 'wave-circle') {
      stopWaveAnimation();
    }
    if (newType === 'wave' || newType === 'wave-circle') {
      startWaveAnimation();
    }
  }
);

// 监听进度变化，更新波浪
watch(
  () => props.percentage,
  () => {
    if (props.type === 'wave' || props.type === 'wave-circle') {
      updateWaveAnimation();
    }
  }
);

// 监听动画开关
watch(
  () => props.waveAnimated,
  newValue => {
    if (newValue) {
      startWaveAnimation();
    } else {
      stopWaveAnimation();
    }
  }
);

// 方法
const getElement = () => progressRef.value || null;

defineExpose<ExProgressExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExProgress.scss"></style>
