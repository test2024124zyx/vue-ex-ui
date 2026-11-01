<template>
  <div
    :class="chartClasses"
    :style="chartStyles"
    :aria-label="ariaLabel || t('chart.chart')"
    :aria-busy="loading || undefined"
    :role="navigationItems.length ? 'group' : 'img'"
  >
    <!-- ECharts 容器 - 始终存在 -->
    <div
      ref="chartRef"
      class="ex-chart__container"
      :style="{ width: '100%', height: '100%' }"
    ></div>

    <!-- 加载状态 - 使用 ExLoading 组件 -->
    <ex-loading
      :visible="loading"
      :text="loadingText || t('chart.loading')"
      type="neon"
      :fullscreen="false"
      :mask="true"
    />

    <!-- 空状态 - 使用 v-show 而不是 v-if -->
    <div
      v-show="!loading && isEmpty"
      class="ex-chart__empty"
    >
      <slot name="empty">
        <ex-empty :description="t('chart.noData')" />
      </slot>
    </div>
    <ExChartDataNavigation
      v-if="chartInstance && parentOverlayActive && !loading && navigationItems.length"
      :items="navigationItems"
      @highlight="highlightNavigationItem"
      @activate="activateNavigationItem"
    />
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, shallowRef } from 'vue';
import type {
  ChartEventParams,
  ChartInstance,
  ChartOption,
  ExChartProps,
  ExChartEmits,
  ExChartExposed,
} from './types';
import { useI18n } from '../../locale';
import {
  useComponentSize,
  useGlobalConfig,
  useThemeOverrides,
} from '../config-provider/composables';
import {
  mergeChartComponent,
  resolveChartColor,
  resolveChartTheme,
  resolveChartPalette,
} from './chart-runtime';
import { getChartNavigationItems, type ChartNavigationItem } from './chart-accessibility';
import ExChartDataNavigation from './ExChartDataNavigation.vue';
import { useOverlayParentActive } from '../../composables/useOverlay';
import {
  applyNeonGlow,
  createDefaultDataZoom,
  createDefaultLegend,
  createDefaultToolbox,
  createDefaultTooltip,
} from './utils';
import ExEmpty from '../empty/ExEmpty.vue';
import ExLoading from '../loading/ExLoading.vue';

defineOptions({
  name: 'ExChart',
});

const props = withDefaults(defineProps<ExChartProps>(), {
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
  animationDuration: 1000,
  renderer: 'canvas',
});

const emit = defineEmits<ExChartEmits>();

const { t, locale } = useI18n();
const componentSize = useComponentSize(computed(() => props.size));
const globalConfig = useGlobalConfig();
const themeOverrides = useThemeOverrides();
const parentOverlayActive = useOverlayParentActive();
const controlPalette = () =>
  resolveChartPalette(
    globalConfig.theme.value,
    chartRef.value,
    themeOverrides.value,
    echartsModule?.color?.modifyAlpha
  );

// 引用
const chartRef = ref<HTMLDivElement>();
const chartInstance = shallowRef<ChartInstance | null>(null);
const resizeObserver = ref<ResizeObserver | null>(null);
const resizeTimer = ref<number | null>(null);
const prefersReducedMotion = ref(false);
const navigationItems = shallowRef<ChartNavigationItem[]>([]);
const renderedOption = shallowRef<ChartOption>(props.option ?? {});
let highlightedItem: ChartNavigationItem | null = null;
// 异步初始化竞态控制：序号 + 卸载标记
let initSeq = 0;
let isUnmounted = false;
let reducedMotionQuery: MediaQueryList | null = null;
let echartsModule: typeof import('echarts') | null = null;

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
  const option = renderedOption.value;
  if (!option.series || (Array.isArray(option.series) && option.series.length === 0)) {
    return true;
  }
  return false;
});

// 初始化图表
const initChart = async () => {
  if (!chartRef.value) {
    return;
  }

  const token = ++initSeq;

  try {
    // 销毁旧实例
    if (chartInstance.value) {
      chartInstance.value.dispose();
      chartInstance.value = null;
    }

    // 按需动态加载 echarts（可选依赖）
    const echartsLib = await import('echarts');

    // await 之后校验：组件已卸载、容器丢失、或有更新的初始化调用，则放弃，避免泄漏
    if (isUnmounted || token !== initSeq || !chartRef.value) {
      return;
    }

    // 获取主题配置（使用全局主题）
    echartsModule = echartsLib;
    const themeConfig = resolveChartTheme(
      globalConfig.theme.value,
      chartRef.value,
      themeOverrides.value
    );

    // 初始化 ECharts 实例
    chartInstance.value = echartsLib.init(chartRef.value, themeConfig, {
      renderer: props.renderer,
      ...props.initOptions,
    }) as unknown as ChartInstance;

    // 设置配置选项
    updateChart();

    // 绑定事件
    bindEvents();

    // 触发初始化完成事件
    emit('init', chartInstance.value);
  } catch (error) {
    emit('error', error as Error);
  }
};

const asComponentOption = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const cloneSeries = (series: ChartOption['series']): ChartOption['series'] => {
  if (Array.isArray(series)) {
    return series.map(item => ({
      ...item,
      ...(item.lineStyle ? { lineStyle: { ...item.lineStyle } } : {}),
      ...(item.itemStyle ? { itemStyle: { ...item.itemStyle } } : {}),
    }));
  }
  if (!series) return series;
  return {
    ...series,
    ...(series.lineStyle ? { lineStyle: { ...series.lineStyle } } : {}),
    ...(series.itemStyle ? { itemStyle: { ...series.itemStyle } } : {}),
  };
};

const syncNavigationItems = (fallback = props.option) => {
  const option = chartInstance.value?.getOption?.() ?? fallback;
  // 空状态与键盘导航共用当前实例快照，兼容声明式及公开 setOption 更新。
  renderedOption.value = option ?? {};
  const items = getChartNavigationItems(option);
  // finished 可能由高亮动作触发，相同数据不重复通知导航器，避免动作反馈循环。
  const previous = navigationItems.value;
  if (
    items.length === previous.length &&
    items.every((item, index) => {
      const old = previous[index]!;
      return (
        item.seriesIndex === old.seriesIndex &&
        item.dataIndex === old.dataIndex &&
        item.label === old.label &&
        JSON.stringify(item.value) === JSON.stringify(old.value)
      );
    })
  )
    return;
  navigationItems.value = items;
};

const highlightNavigationItem = (item: ChartNavigationItem | null) => {
  const instance = chartInstance.value;
  if (!instance) return;
  if (highlightedItem)
    instance.dispatchAction?.({
      type: 'downplay',
      seriesIndex: highlightedItem.seriesIndex,
      dataIndex: highlightedItem.dataIndex,
    });
  highlightedItem = item;
  if (!item) {
    instance.dispatchAction?.({ type: 'hideTip' });
    return;
  }
  instance.dispatchAction?.({
    type: 'highlight',
    seriesIndex: item.seriesIndex,
    dataIndex: item.dataIndex,
  });
  instance.dispatchAction?.({
    type: 'showTip',
    seriesIndex: item.seriesIndex,
    dataIndex: item.dataIndex,
  });
};

const activateNavigationItem = (item: ChartNavigationItem) => {
  highlightNavigationItem(item);
  emit('click', { ...item, componentType: 'series' });
};

watch(parentOverlayActive, active => {
  if (!active) highlightNavigationItem(null);
});

// 更新图表
const updateChart = () => {
  if (!chartInstance.value || !props.option) return;

  try {
    // 合并配置
    const palette = controlPalette();
    let mergedOption: ChartOption = {
      ...props.option,
      series: cloneSeries(props.option.series),
      animation: globalConfig.animation.value && !prefersReducedMotion.value,
      animationDuration: prefersReducedMotion.value
        ? 0
        : Number.isFinite(props.animationDuration) && props.animationDuration >= 0
          ? props.animationDuration
          : 1000,
    };

    mergedOption.toolbox = mergeChartComponent(
      props.option.toolbox,
      props.showToolbox ? createDefaultToolbox(globalConfig.theme.value, t, palette) : {},
      props.showToolbox
    );
    mergedOption.legend = mergeChartComponent(
      props.option.legend,
      props.showLegend ? createDefaultLegend(globalConfig.theme.value, palette) : {},
      props.showLegend
    );
    mergedOption.tooltip = mergeChartComponent(
      props.option.tooltip,
      {
        ...(props.showTooltip ? createDefaultTooltip(globalConfig.theme.value, palette) : {}),
        appendToBody: true,
        confine: false,
      },
      props.showTooltip
    );
    mergedOption.dataZoom = props.showDataZoom
      ? Array.isArray(props.option.dataZoom) && props.option.dataZoom.length > 0
        ? props.option.dataZoom.map(item => ({ ...asComponentOption(item) }))
        : props.option.dataZoom &&
            typeof props.option.dataZoom === 'object' &&
            !Array.isArray(props.option.dataZoom)
          ? { ...asComponentOption(props.option.dataZoom) }
          : createDefaultDataZoom(globalConfig.theme.value, palette)
      : [];

    // 应用霓虹发光效果（使用全局配置）
    if (globalConfig.neonEffect.value) {
      mergedOption = applyNeonGlow(mergedOption, globalConfig.theme.value);
    }

    // 设置配置：notMerge 保证声明式 option 为完整状态，series 减少时不残留旧系列
    chartInstance.value.setOption(mergedOption, {
      notMerge: true,
      lazyUpdate: true,
    });
    syncNavigationItems(mergedOption);
  } catch (error) {
    emit('error', error as Error);
  }
};

// 绑定事件
const bindEvents = () => {
  if (!chartInstance.value) return;

  // 绑定点击事件
  chartInstance.value?.on('click', params => {
    emit('click', params as ChartEventParams);
  });

  // 绑定双击事件
  chartInstance.value?.on('dblclick', params => {
    emit('dblclick', params as ChartEventParams);
  });

  // 绑定鼠标移入事件
  chartInstance.value?.on('mouseover', params => {
    emit('mouseover', params as ChartEventParams);
  });

  // 绑定鼠标移出事件
  chartInstance.value?.on('mouseout', params => {
    emit('mouseout', params as ChartEventParams);
  });

  // 绑定鼠标移动事件
  chartInstance.value?.on('mousemove', params => {
    emit('mousemove', params as ChartEventParams);
  });

  // 绑定数据缩放事件
  chartInstance.value?.on('datazoom', params => {
    syncNavigationItems();
    emit('datazoom', params as ChartEventParams);
  });

  // 绑定图例选择改变事件
  chartInstance.value?.on('legendselectchanged', params => {
    syncNavigationItems();
    emit('legendselectchanged', params as ChartEventParams);
  });

  // 渲染完成事件
  chartInstance.value.on('finished', () => {
    syncNavigationItems();
    emit('finished');
  });
};

// 调整图表大小
const handleResize = () => {
  if (!chartInstance.value || !props.autoResize) return;

  if (resizeTimer.value !== null) {
    clearTimeout(resizeTimer.value);
  }

  const delay =
    Number.isFinite(props.resizeDelay) && props.resizeDelay >= 0 ? props.resizeDelay : 300;
  resizeTimer.value = window.setTimeout(() => {
    chartInstance.value?.resize();
    resizeTimer.value = null;
  }, delay);
};

// 设置 ResizeObserver
const setupResizeObserver = () => {
  if (!chartRef.value || !props.autoResize) return;
  cleanupResizeObserver();

  // 检查 ResizeObserver 是否可用（测试环境可能不支持）
  if (typeof ResizeObserver === 'undefined') {
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
  highlightNavigationItem(null);
  chartInstance.value?.clear();
  navigationItems.value = [];
  renderedOption.value = {};
};

const dispose = () => {
  initSeq += 1;
  if (chartInstance.value) {
    chartInstance.value.dispose();
    chartInstance.value = null;
  }
  navigationItems.value = [];
  renderedOption.value = {};
  highlightedItem = null;
};

const setOption = (
  option: ChartOption,
  opts?: {
    notMerge?: boolean;
    lazyUpdate?: boolean;
    silent?: boolean;
    replaceMerge?: string | string[];
  }
) => {
  if (!chartInstance.value) return;
  chartInstance.value.setOption(option, opts);
  syncNavigationItems(option);
};

const showLoading = (type?: string, opts?: object) => {
  const light = globalConfig.theme.value === 'light';
  const defaultOpts = {
    text: props.loadingText || t('chart.loading'),
    color: resolveChartColor(
      chartRef.value,
      '--ex-color-primary',
      light ? '#1668dc' : '#00f0ff',
      themeOverrides.value
    ),
    textColor: resolveChartColor(
      chartRef.value,
      '--ex-color-text-primary',
      light ? '#1a2332' : '#e6f0ff',
      themeOverrides.value
    ),
    maskColor: resolveChartColor(
      chartRef.value,
      '--ex-color-bg-surface',
      light ? '#ffffff' : '#0f1720',
      themeOverrides.value
    ),
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
  if (opts?.type === 'svg') return getSvgDataURL(opts);
  return chartInstance.value?.getDataURL(opts) || '';
};

const getSvgDataURL = (options?: { backgroundColor?: string }) => {
  const instance = chartInstance.value;
  if (!instance || !echartsModule || isUnmounted) return '';
  let temporary: ReturnType<typeof echartsModule.init> | null = null;
  try {
    // 独立 SVG 实例复制当前图例/缩放等交互状态，主 Canvas 实例不切换或重建。
    temporary = echartsModule.init(
      null,
      resolveChartTheme(globalConfig.theme.value, chartRef.value, themeOverrides.value),
      {
        ...props.initOptions,
        renderer: 'svg',
        ssr: true,
        width: instance.getWidth(),
        height: instance.getHeight(),
      }
    );
    temporary.setOption(
      {
        ...instance.getOption(),
        ...(options?.backgroundColor ? { backgroundColor: options.backgroundColor } : {}),
        animation: false,
      },
      { notMerge: true, lazyUpdate: false }
    );
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(temporary.renderToSVGString())}`;
  } catch (error) {
    emit('error', error instanceof Error ? error : new Error(String(error)));
    return '';
  } finally {
    temporary?.dispose();
  }
};

const convertToPixel = (finder: unknown, value: unknown) => {
  if (!chartInstance.value) return 0;
  return chartInstance.value.convertToPixel(finder, value) || 0;
};

const convertFromPixel = (finder: unknown, value: unknown) => {
  if (!chartInstance.value) return 0;
  return chartInstance.value.convertFromPixel(finder, value) || 0;
};

// 监听配置变化
watch(
  [
    () => props.option,
    () => props.showToolbox,
    () => props.showDataZoom,
    () => props.showLegend,
    () => props.showTooltip,
    () => props.animationDuration,
    () => globalConfig.animation.value,
    () => globalConfig.neonEffect.value,
    () => prefersReducedMotion.value,
  ],
  () => {
    if (chartInstance.value) {
      updateChart();
      emit('updated');
    }
  },
  { deep: true }
);

// 加载状态由模板中的 ExLoading 遮罩统一呈现，避免与 echarts 原生 loading 双重叠加；
// showLoading/hideLoading 仍作为公开方法保留，供需要时手动调用。

watch(locale, () => {
  if (!chartInstance.value) return;
  // 仅更新语言相关配置，保留用户当前图例选择与缩放状态。
  chartInstance.value.setOption({
    toolbox: mergeChartComponent(
      props.option.toolbox,
      props.showToolbox ? createDefaultToolbox(globalConfig.theme.value, t, controlPalette()) : {},
      props.showToolbox
    ),
  });
});

// 监听全局主题变化
watch(
  [() => globalConfig.theme.value, themeOverrides],
  () => {
    // 重新初始化图表以应用新主题
    nextTick(() => {
      initChart();
    });
  },
  { deep: true }
);

watch(
  () => props.autoResize,
  enabled => {
    if (enabled) {
      setupResizeObserver();
    } else {
      cleanupResizeObserver();
      if (resizeTimer.value !== null) {
        window.clearTimeout(resizeTimer.value);
        resizeTimer.value = null;
      }
    }
  }
);

watch(
  [() => props.renderer, () => props.initOptions],
  () => {
    nextTick(initChart);
  },
  { deep: true }
);

const handleReducedMotionChange = (event: MediaQueryListEvent) => {
  prefersReducedMotion.value = event.matches;
};

// 生命周期
onMounted(async () => {
  if (typeof window.matchMedia === 'function') {
    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion.value = reducedMotionQuery.matches;
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
  }
  await nextTick();
  await initChart();
  setupResizeObserver();
});

onBeforeUnmount(() => {
  isUnmounted = true;
  reducedMotionQuery?.removeEventListener('change', handleReducedMotionChange);
  reducedMotionQuery = null;
  cleanupResizeObserver();
  if (resizeTimer.value !== null) {
    clearTimeout(resizeTimer.value);
    resizeTimer.value = null;
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
