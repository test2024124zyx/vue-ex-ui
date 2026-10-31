import type { ChartComponentOption, ChartGradient, ChartOption, ChartSeriesOption } from './types';
import type { Theme } from '../../types/theme';
import { t as translate } from '../../locale';

const DARK_CHART_PALETTE = [
  '#00f0ff',
  '#29abe2',
  '#a86bff',
  '#ff3bd1',
  '#00d4e6',
  '#54d1ff',
  '#ff54dd',
  '#87e8ff',
];

const LIGHT_CHART_PALETTE = [
  '#1668dc',
  '#08979c',
  '#722ed1',
  '#e024b4',
  '#0958d9',
  '#13c2c2',
  '#a61d7a',
  '#389e0d',
];

const CHART_FONT_FAMILY = 'Rajdhani, Inter, sans-serif';
const CHART_TITLE_FONT_FAMILY = 'Audiowide, Orbitron, sans-serif';

interface ChartThemePalette {
  series: string[];
  text: string;
  title: string;
  mutedText: string;
  surface: string;
  border: string;
}

export interface ChartPalette {
  text: string;
  mutedText: string;
  accent: string;
  surface: string;
  border: string;
  accentFill?: string;
  accentArea?: string;
}

const getThemePalette = (theme: Theme): ChartThemePalette => {
  if (theme === 'light') {
    return {
      series: LIGHT_CHART_PALETTE,
      text: '#1a2332',
      title: '#101828',
      mutedText: '#5a6b7d',
      surface: '#ffffff',
      border: '#c4cdd8',
    };
  }

  return {
    series: DARK_CHART_PALETTE,
    text: '#e6f0ff',
    title: '#ffffff',
    mutedText: '#b3c7d9',
    surface: '#0f1720',
    border: '#374151',
  };
};

/**
 * 获取与全局双主题契约一致的图表主题配置。
 */
export function getChartTheme(theme: Theme, overrides: Partial<ChartThemePalette> = {}): object {
  const palette = { ...getThemePalette(theme), ...overrides };
  // ECharts 的坐标轴不会继承全局 textStyle，必须显式提供各坐标类型的语义色。
  const axisTheme = () => ({
    axisLine: { lineStyle: { color: palette.border } },
    axisTick: { lineStyle: { color: palette.border } },
    axisLabel: { color: palette.mutedText },
    nameTextStyle: { color: palette.mutedText },
    splitLine: { lineStyle: { color: palette.border } },
  });

  return {
    color: palette.series,
    backgroundColor: 'transparent',
    categoryAxis: axisTheme(),
    valueAxis: axisTheme(),
    logAxis: axisTheme(),
    timeAxis: axisTheme(),
    legend: { textStyle: { color: palette.text } },
    textStyle: {
      color: palette.text,
      fontFamily: CHART_FONT_FAMILY,
    },
    title: {
      textStyle: {
        color: palette.title,
        fontFamily: CHART_TITLE_FONT_FAMILY,
      },
      subtextStyle: {
        color: palette.mutedText,
      },
    },
    line: {
      itemStyle: {
        borderWidth: 2,
      },
      lineStyle: {
        width: 3,
      },
      symbolSize: 8,
      symbol: 'circle',
      smooth: true,
    },
    bar: {
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
      },
    },
    pie: {
      itemStyle: {
        borderRadius: 4,
        borderColor: palette.surface,
        borderWidth: 2,
      },
    },
    radar: {
      itemStyle: {
        borderWidth: 2,
      },
      lineStyle: {
        width: 2,
      },
      symbolSize: 6,
      symbol: 'circle',
      smooth: false,
    },
    candlestick: {
      itemStyle: {
        color: '#10b981',
        color0: '#ef4444',
        borderColor: '#10b981',
        borderColor0: '#ef4444',
      },
    },
  };
}

/**
 * 将赛博发光效果应用到图表系列，不修改调用方传入的原始配置。
 */
export function applyNeonGlow(option: ChartOption, theme: Theme): ChartOption {
  if (!option.series) return { ...option };

  const glowColor = theme === 'light' ? 'rgba(22, 104, 220, 0.25)' : 'rgba(0, 240, 255, 0.3)';

  const enhanceSeries = (series: ChartSeriesOption): ChartSeriesOption => {
    const enhanced = { ...series };

    if (series.type === 'line') {
      enhanced.lineStyle = {
        ...series.lineStyle,
        shadowBlur: 10,
        shadowColor: glowColor,
      };
      enhanced.itemStyle = {
        ...series.itemStyle,
        shadowBlur: 10,
        shadowColor: glowColor,
      };
    }

    if (series.type === 'bar' || series.type === 'pie' || series.type === 'scatter') {
      enhanced.itemStyle = {
        ...series.itemStyle,
        shadowBlur: series.type === 'pie' ? 15 : 10,
        shadowColor: glowColor,
      };
    }

    if (series.type === 'radar') {
      enhanced.lineStyle = {
        ...series.lineStyle,
        shadowBlur: 10,
        shadowColor: glowColor,
      };
      enhanced.itemStyle = {
        ...series.itemStyle,
        shadowBlur: 10,
        shadowColor: glowColor,
      };
    }

    return enhanced;
  };

  return {
    ...option,
    series: Array.isArray(option.series)
      ? option.series.map(enhanceSeries)
      : enhanceSeries(option.series),
  };
}

/**
 * 获取图表附属控件使用的语义调色板。
 */
export const getChartPalette = (theme: Theme): ChartPalette => {
  if (theme === 'light') {
    return {
      text: '#1a2332',
      mutedText: '#5a6b7d',
      accent: '#1668dc',
      surface: '#ffffff',
      border: '#c4cdd8',
    };
  }

  return {
    text: '#e6f0ff',
    mutedText: '#b3c7d9',
    accent: '#00f0ff',
    surface: '#0f1720',
    border: '#374151',
  };
};

/**
 * 生成渐变色配置。
 */
export function createGradientColor(
  color1: string,
  color2: string,
  direction: 'horizontal' | 'vertical' = 'vertical'
): ChartGradient {
  return {
    type: 'linear',
    x: 0,
    y: 0,
    x2: direction === 'horizontal' ? 1 : 0,
    y2: direction === 'vertical' ? 1 : 0,
    colorStops: [
      { offset: 0, color: color1 },
      { offset: 1, color: color2 },
    ],
  };
}

/**
 * 使用统一单位格式化数值。
 */
export function formatNumber(value: number, decimals = 2): string {
  const safeDecimals = Number.isFinite(decimals)
    ? Math.min(100, Math.max(0, Math.trunc(decimals)))
    : 2;
  const magnitude = Math.abs(value);
  if (magnitude >= 1e9) {
    return `${(value / 1e9).toFixed(safeDecimals)}B`;
  }
  if (magnitude >= 1e6) {
    return `${(value / 1e6).toFixed(safeDecimals)}M`;
  }
  if (magnitude >= 1e3) {
    return `${(value / 1e3).toFixed(safeDecimals)}K`;
  }
  return value.toFixed(safeDecimals);
}

/**
 * 生成默认工具栏配置。
 */
export function createDefaultToolbox(
  theme: Theme = 'neon-blue',
  t: (key: string) => string = translate,
  overrides: Partial<ChartPalette> = {}
): ChartComponentOption {
  const palette = { ...getChartPalette(theme), ...overrides };

  return {
    feature: {
      saveAsImage: {
        title: t('chart.saveAsImage'),
        pixelRatio: 2,
      },
      dataView: {
        title: t('chart.dataView'),
        readOnly: false,
      },
      restore: {
        title: t('chart.restore'),
      },
      dataZoom: {
        title: {
          zoom: t('chart.dataZoom'),
          back: t('chart.dataZoomRestore'),
        },
      },
      magicType: {
        title: {
          line: t('chart.line'),
          bar: t('chart.bar'),
          stack: t('chart.stack'),
          tiled: t('chart.tiled'),
        },
        type: ['line', 'bar', 'stack'],
      },
    },
    iconStyle: {
      borderColor: palette.text,
    },
    emphasis: {
      iconStyle: {
        borderColor: palette.accent,
      },
    },
  };
}

/**
 * 生成默认数据缩放配置。
 */
export function createDefaultDataZoom(
  theme: Theme = 'neon-blue',
  overrides: Partial<ChartPalette> = {}
): ChartComponentOption[] {
  const palette = { ...getChartPalette(theme), ...overrides };

  return [
    {
      type: 'slider',
      show: true,
      xAxisIndex: [0],
      start: 0,
      end: 100,
      textStyle: {
        color: palette.text,
      },
      borderColor: palette.border,
      fillerColor: palette.accentFill ?? `${palette.accent}33`,
      handleStyle: {
        color: palette.accent,
        borderColor: palette.accent,
      },
      moveHandleStyle: {
        color: palette.accent,
      },
      selectedDataBackground: {
        lineStyle: {
          color: palette.accent,
        },
        areaStyle: {
          color: palette.accentArea ?? `${palette.accent}4d`,
        },
      },
    },
    {
      type: 'inside',
      xAxisIndex: [0],
      start: 0,
      end: 100,
    },
  ];
}

/**
 * 生成默认图例配置。
 */
export function createDefaultLegend(
  theme: Theme = 'neon-blue',
  overrides: Partial<ChartPalette> = {}
): ChartComponentOption {
  const palette = { ...getChartPalette(theme), ...overrides };

  return {
    textStyle: {
      color: palette.text,
      fontFamily: CHART_FONT_FAMILY,
    },
    pageTextStyle: {
      color: palette.mutedText,
    },
    pageIconColor: palette.accent,
    pageIconInactiveColor: palette.border,
  };
}

/**
 * 生成默认提示框配置。
 */
export function createDefaultTooltip(
  theme: Theme = 'neon-blue',
  overrides: Partial<ChartPalette> = {}
): ChartComponentOption {
  const palette = { ...getChartPalette(theme), ...overrides };

  return {
    trigger: 'axis',
    backgroundColor: palette.surface,
    borderColor: palette.accent,
    borderWidth: 1,
    textStyle: {
      color: palette.text,
      fontFamily: CHART_FONT_FAMILY,
    },
    appendToBody: true,
    confine: false,
    axisPointer: {
      type: 'cross',
      lineStyle: {
        color: palette.accent,
        type: 'dashed',
      },
      crossStyle: {
        color: palette.accent,
      },
      label: {
        backgroundColor: palette.surface,
        borderColor: palette.accent,
        borderWidth: 1,
        color: palette.text,
      },
    },
  };
}

/**
 * 生成默认网格配置。
 */
export function createDefaultGrid(): ChartComponentOption {
  return {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true,
  };
}
