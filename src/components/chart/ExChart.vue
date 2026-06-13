<template>
  <div
    :class="chartClasses"
    :style="chartStyles"
    :aria-label="ariaLabel || t('chart.chart')"
    role="img"
  >
    <!-- ECharts 容器 - 始终存在 -->
    <div ref="chartRef" class="ex-chart__container" :style="{ width: '100%', height: '100%' }" />

    <!-- 加载状态 - 使用 ExLoading 组件 -->
    <ex-loading
      :visible="loading"
      :text="loadingText || t('chart.loading')"
      type="neon"
      :fullscreen="false"
      :mask="true"
    />

    <!-- 空状态 - 使用 v-show 而不是 v-if -->
    <div v-show="!loading && isEmpty" class="ex-chart__empty">
      <slot name="empty">
        <ex-empty :description="t('chart.noData')" />
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, shallowRef } from 'vue';
// 仅类型导入：echarts 作为可选依赖，运行时通过动态 import() 按需加载，
// 不会作为顶层静态依赖被打进产物。
import type * as echarts from 'echarts';
import type { ExChartProps, ExChartEmits, ExChartExposed } from './types';
import { useI18n } from '../../locale';
import { useComponentSize, useGlobalConfig } from '../config-provider/composables';
import { getChartTheme, applyNeonGlow } from './utils';
import { logger } from '../../utils/logger';
import ExEmpty from '../empty/ExEmpty.vue';
import ExLoading from '../loading/ExLoading.vue';

defineOptions({
  name: 'ExChart',
});

const props = withDefaults(defineProps<ExChartProps>(), {
  type: undefined,
  size: undefined,
  width: '100%',
  height: '400px',
  loading: false,
  loadingText: undefined,
  autoResize: true,
  resizeDelay: 300,
  showToolbox: false,
  showDataZoom: false,
  showLegend: true,
  showTooltip: true,
  showGrid: true,
  animationDuration: 1000,
  renderer: 'canvas',
});

const emit = defineEmits<ExChartEmits>();

const { t } = useI18n();
const componentSize = useComponentSize(computed(() => props.size));
const globalConfig = useGlobalConfig();

// 引用
const chartRef = ref<HTMLDivElement>();
const chartInstance = shallowRef<echarts.ECharts | null>(null);
const resizeObserver = ref<ResizeObserver | null>(null);
const resizeTimer = ref<number | null>(null);

// 计算属性
const chartClasses = computed(() => {
  const classes = [
    'ex-chart',
    `ex-chart--${componentSize.value}`,
    `ex-chart--${globalConfig.theme.value}`,
  ];

  if (props.loading) classes.push('ex-chart--loading');
  if (globalConfig.neonEffect.value) classes.push('ex-chart--neon');
  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const chartStyles = computed(() => {
  const styles: Record<string, string> = {
    width: typeof props.width === 'number' ? `${props.width}px` : props.width,
    height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  };

  if (props.style) {
    if (typeof props.style === 'string') {
      return `${Object.entries(styles)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')}; ${props.style}`;
    }
    Object.assign(styles, props.style);
  }

  return styles;
});

const isEmpty = computed(() => {
  if (!props.option) return true;
  if (
    !props.option.series ||
    (Array.isArray(props.option.series) && props.option.series.length === 0)
  ) {
    return true;
  }
  return false;
});

// 初始化图表
const initChart = async () => {
  if (!chartRef.value) {
    logger.warn('Chart container not found');
    return;
  }

  try {
    // 销毁旧实例
    if (chartInstance.value) {
      chartInstance.value.dispose();
      chartInstance.value = null;
    }

    // 按需动态加载 echarts（可选依赖）
    const echartsLib = await import('echarts');

    // 获取主题配置（使用全局主题）
    const themeConfig = getChartTheme(globalConfig.theme.value);

    // 初始化 ECharts 实例
    chartInstance.value = echartsLib.init(chartRef.value, themeConfig, {
      renderer: props.renderer,
      ...props.initOptions,
    });

    // 设置配置选项
    updateChart();

    // 绑定事件
    bindEvents();

    // 触发初始化完成事件
    emit('init', chartInstance.value);

    logger.info('Chart initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize chart:', error);
    emit('error', error as Error);
  }
};

// 更新图表
const updateChart = () => {
  if (!chartInstance.value || !props.option) return;

  try {
    // 合并配置
    const mergedOption = {
      ...props.option,
      animation: globalConfig.animation.value,
      animationDuration: props.animationDuration,
    };

    // 确保 tooltip 配置正确，避免被容器遮挡
    if (!mergedOption.tooltip) {
      mergedOption.tooltip = {};
    }
    // 设置 tooltip 的 z-index，确保在最上层
    if (typeof mergedOption.tooltip === 'object') {
      mergedOption.tooltip = {
        ...mergedOption.tooltip,
        // 使用全局 z-index 配置，确保 tooltip 在最上层
        appendToBody: true,
        confine: false, // 不限制在图表容器内
      };
    }

    // 应用霓虹发光效果（使用全局配置）
    if (globalConfig.neonEffect.value) {
      applyNeonGlow(mergedOption, globalConfig.theme.value);
    }

    // 设置配置
    chartInstance.value.setOption(mergedOption, {
      notMerge: false,
      lazyUpdate: false,
    });

    logger.info('Chart updated successfully');
  } catch (error) {
    logger.error('Failed to update chart:', error);
    emit('error', error as Error);
  }
};

// 绑定事件
const bindEvents = () => {
  if (!chartInstance.value) return;

  // 绑定点击事件
  chartInstance.value?.on('click', params => {
    emit('click', params as echarts.ECElementEvent);
  });

  // 绑定双击事件
  chartInstance.value?.on('dblclick', params => {
    emit('dblclick', params as echarts.ECElementEvent);
  });

  // 绑定鼠标移入事件
  chartInstance.value?.on('mouseover', params => {
    emit('mouseover', params as echarts.ECElementEvent);
  });

  // 绑定鼠标移出事件
  chartInstance.value?.on('mouseout', params => {
    emit('mouseout', params as echarts.ECElementEvent);
  });

  // 绑定鼠标移动事件
  chartInstance.value?.on('mousemove', params => {
    emit('mousemove', params as echarts.ECElementEvent);
  });

  // 绑定数据缩放事件
  chartInstance.value?.on('datazoom', params => {
    emit('datazoom', params as echarts.ECElementEvent);
  });

  // 绑定图例选择改变事件
  chartInstance.value?.on('legendselectchanged', params => {
    emit('legendselectchanged', params as echarts.ECElementEvent);
  });

  // 渲染完成事件
  chartInstance.value.on('finished', () => {
    emit('finished');
  });
};

// 调整图表大小
const handleResize = () => {
  if (!chartInstance.value || !props.autoResize) return;

  if (resizeTimer.value) {
    clearTimeout(resizeTimer.value);
  }

  resizeTimer.value = window.setTimeout(() => {
    chartInstance.value?.resize();
    logger.info('Chart resized');
  }, props.resizeDelay);
};

// 设置 ResizeObserver
const setupResizeObserver = () => {
  if (!chartRef.value || !props.autoResize) return;

  // 检查 ResizeObserver 是否可用（测试环境可能不支持）
  if (typeof ResizeObserver === 'undefined') {
    logger.warn('ResizeObserver is not available');
    return;
  }

  resizeObserver.value = new ResizeObserver(() => {
    handleResize();
  });

  resizeObserver.value.observe(chartRef.value);
};

// 清理 ResizeObserver
const cleanupResizeObserver = () => {
  if (resizeObserver.value) {
    resizeObserver.value.disconnect();
    resizeObserver.value = null;
  }
};

// 暴露的方法
const getInstance = () => chartInstance.value;

const getElement = () => chartRef.value || null;

const resize = (opts?: { width?: number | 'auto'; height?: number | 'auto' }) => {
  chartInstance.value?.resize(opts);
};

const clear = () => {
  chartInstance.value?.clear();
};

const dispose = () => {
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
};

const setOption = (
  option: echarts.EChartsOption,
  opts?: {
    notMerge?: boolean;
    lazyUpdate?: boolean;
    silent?: boolean;
    replaceMerge?: string | string[];
  }
) => {
  chartInstance.value?.setOption(option, opts);
};

const showLoading = (type?: string, opts?: object) => {
  const defaultOpts = {
    text: props.loadingText || t('chart.loading'),
    color: 'var(--ex-color-primary)',
    textColor: 'var(--ex-color-text-primary)',
    maskColor: 'rgba(var(--ex-color-bg-primary-rgb), 0.8)',
    zlevel: 0,
    ...opts,
  };
  chartInstance.value?.showLoading(type || 'default', defaultOpts);
};

const hideLoading = () => {
  chartInstance.value?.hideLoading();
};

const getDataURL = (opts?: {
  type?: 'png' | 'jpeg' | 'svg';
  pixelRatio?: number;
  backgroundColor?: string;
}) => {
  return chartInstance.value?.getDataURL(opts) || '';
};

const getSvgDataURL = () => {
  return chartInstance.value?.getDataURL({ type: 'svg' }) || '';
};

const convertToPixel = (finder: unknown, value: unknown) => {
  if (!chartInstance.value) return 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return chartInstance.value.convertToPixel(finder as any, value as any) || 0;
};

const convertFromPixel = (finder: unknown, value: unknown) => {
  if (!chartInstance.value) return 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return chartInstance.value.convertFromPixel(finder as any, value as any) || 0;
};

// 监听配置变化
watch(
  () => props.option,
  (newOption, oldOption) => {
    // 避免无限循环：只在配置真正改变时更新
    if (chartInstance.value && newOption !== oldOption) {
      updateChart();
      emit('updated');
    }
  },
  { deep: false }
);

// 监听加载状态
watch(
  () => props.loading,
  newVal => {
    if (chartInstance.value) {
      if (newVal) {
        showLoading();
      } else {
        hideLoading();
      }
    }
  }
);

// 监听全局主题变化
watch(
  () => globalConfig.theme.value,
  () => {
    // 重新初始化图表以应用新主题
    nextTick(() => {
      initChart();
    });
  }
);

// 生命周期
onMounted(async () => {
  await nextTick();
  await initChart();
  setupResizeObserver();
});

onBeforeUnmount(() => {
  cleanupResizeObserver();
  if (resizeTimer.value) {
    clearTimeout(resizeTimer.value);
  }
  dispose();
});

defineExpose<ExChartExposed>({
  getInstance,
  getElement,
  resize,
  clear,
  dispose,
  setOption,
  showLoading,
  hideLoading,
  getDataURL,
  getSvgDataURL,
  convertToPixel,
  convertFromPixel,
});
</script>

<style scoped lang="scss" src="./ExChart.scss"></style>
