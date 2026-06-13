import type * as echarts from 'echarts';

/**
 * 获取图表主题配置
 */
export function getChartTheme(theme: string): object {
  const themes: Record<string, object> = {
    'neon-blue': {
      color: [
        '#00f0ff',
        '#29ABE2',
        '#a86bff',
        '#ff3bd1',
        '#00d4e6',
        '#54d1ff',
        '#ff54dd',
        '#87e8ff',
      ],
      backgroundColor: 'transparent',
      textStyle: {
        color: '#e6f0ff',
        fontFamily: 'Rajdhani, Inter, sans-serif',
      },
      title: {
        textStyle: {
          color: '#ffffff',
          fontFamily: 'Audiowide, Orbitron, sans-serif',
        },
        subtextStyle: {
          color: '#b3c7d9',
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
          borderColor: '#0f1720',
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
    },
    'neon-pink': {
      color: [
        '#ff007f',
        '#ff3bd1',
        '#a86bff',
        '#00f0ff',
        '#ff54dd',
        '#e6006b',
        '#29ABE2',
        '#ff87e6',
      ],
      backgroundColor: 'transparent',
      textStyle: {
        color: '#e6f0ff',
        fontFamily: 'Rajdhani, Inter, sans-serif',
      },
      title: {
        textStyle: {
          color: '#ffffff',
          fontFamily: 'Audiowide, Orbitron, sans-serif',
        },
        subtextStyle: {
          color: '#b3c7d9',
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
          borderColor: '#0f1720',
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
    },
    dark: {
      color: [
        '#5470c6',
        '#91cc75',
        '#fac858',
        '#ee6666',
        '#73c0de',
        '#3ba272',
        '#fc8452',
        '#9a60b4',
      ],
      backgroundColor: 'transparent',
      textStyle: {
        color: '#e6f0ff',
        fontFamily: 'Rajdhani, Inter, sans-serif',
      },
      title: {
        textStyle: {
          color: '#ffffff',
        },
        subtextStyle: {
          color: '#b3c7d9',
        },
      },
    },
    light: {
      color: [
        '#5470c6',
        '#91cc75',
        '#fac858',
        '#ee6666',
        '#73c0de',
        '#3ba272',
        '#fc8452',
        '#9a60b4',
      ],
      backgroundColor: 'transparent',
      textStyle: {
        color: '#333333',
        fontFamily: 'Rajdhani, Inter, sans-serif',
      },
      title: {
        textStyle: {
          color: '#333333',
        },
        subtextStyle: {
          color: '#666666',
        },
      },
    },
    matrix: {
      color: [
        '#00f0ff',
        '#ff3bd1',
        '#00ff00',
        '#ffff00',
        '#ff0000',
        '#00ffff',
        '#ff00ff',
        '#ffffff',
      ],
      backgroundColor: 'transparent',
      textStyle: {
        color: '#ffffff',
        fontFamily: 'Rajdhani, Inter, sans-serif',
      },
      title: {
        textStyle: {
          color: '#ffffff',
          fontWeight: 'bold',
        },
        subtextStyle: {
          color: '#ffffff',
        },
      },
    },
    custom: {},
  };

  const key = theme === 'high-contrast' ? 'matrix' : theme;
  return (themes[key] || themes['neon-blue']) as object;
}

/**
 * 应用霓虹发光效果到图表配置
 */
export function applyNeonGlow(option: echarts.EChartsOption, theme: string): void {
  if (!option.series) return;

  const glowColor = theme === 'neon-pink' ? 'rgba(255, 0, 127, 0.3)' : 'rgba(0, 240, 255, 0.3)';

  const series = Array.isArray(option.series) ? option.series : [option.series];

  series.forEach(s => {
    if (!s) return;

    // 折线图发光效果
    if (s.type === 'line') {
      s.lineStyle = {
        ...s.lineStyle,
        shadowBlur: 10,
        shadowColor: glowColor,
      };
      s.itemStyle = {
        ...s.itemStyle,
        shadowBlur: 10,
        shadowColor: glowColor,
      };
    }

    // 柱状图发光效果
    if (s.type === 'bar') {
      s.itemStyle = {
        ...s.itemStyle,
        shadowBlur: 10,
        shadowColor: glowColor,
      };
    }

    // 饼图发光效果
    if (s.type === 'pie') {
      s.itemStyle = {
        ...s.itemStyle,
        shadowBlur: 15,
        shadowColor: glowColor,
      };
    }

    // 散点图发光效果
    if (s.type === 'scatter') {
      s.itemStyle = {
        ...s.itemStyle,
        shadowBlur: 10,
        shadowColor: glowColor,
      };
    }

    // 雷达图发光效果
    if (s.type === 'radar') {
      s.lineStyle = {
        ...s.lineStyle,
        shadowBlur: 10,
        shadowColor: glowColor,
      };
      s.itemStyle = {
        ...s.itemStyle,
        shadowBlur: 10,
        shadowColor: glowColor,
      };
    }
  });
}

/**
 * 生成渐变色配置
 */
export function createGradientColor(
  color1: string,
  color2: string,
  direction: 'horizontal' | 'vertical' = 'vertical'
): echarts.LinearGradientObject {
  return {
    type: 'linear',
    x: 0,
    y: direction === 'vertical' ? 0 : 0,
    x2: direction === 'horizontal' ? 1 : 0,
    y2: direction === 'vertical' ? 1 : 0,
    colorStops: [
      { offset: 0, color: color1 },
      { offset: 1, color: color2 },
    ],
  };
}

/**
 * 格式化数值
 */
export function formatNumber(value: number, decimals = 2): string {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  }
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

/**
 * 生成默认的工具栏配置
 */
export function createDefaultToolbox(): echarts.ToolboxComponentOption {
  return {
    feature: {
      saveAsImage: {
        title: '保存为图片',
        pixelRatio: 2,
      },
      dataView: {
        title: '数据视图',
        readOnly: false,
      },
      restore: {
        title: '还原',
      },
      dataZoom: {
        title: {
          zoom: '区域缩放',
          back: '区域缩放还原',
        },
      },
      magicType: {
        title: {
          line: '切换为折线图',
          bar: '切换为柱状图',
          stack: '切换为堆叠',
          tiled: '切换为平铺',
        },
        type: ['line', 'bar', 'stack'],
      },
    },
    iconStyle: {
      borderColor: '#e6f0ff',
    },
    emphasis: {
      iconStyle: {
        borderColor: '#00f0ff',
      },
    },
  };
}

/**
 * 生成默认的数据缩放配置
 */
export function createDefaultDataZoom(): echarts.DataZoomComponentOption[] {
  return [
    {
      type: 'slider',
      show: true,
      xAxisIndex: [0],
      start: 0,
      end: 100,
      textStyle: {
        color: '#e6f0ff',
      },
      borderColor: '#374151',
      fillerColor: 'rgba(0, 240, 255, 0.2)',
      handleStyle: {
        color: '#00f0ff',
        borderColor: '#00f0ff',
      },
      moveHandleStyle: {
        color: '#00f0ff',
      },
      selectedDataBackground: {
        lineStyle: {
          color: '#00f0ff',
        },
        areaStyle: {
          color: 'rgba(0, 240, 255, 0.3)',
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
 * 生成默认的图例配置
 */
export function createDefaultLegend(): echarts.LegendComponentOption {
  return {
    textStyle: {
      color: '#e6f0ff',
      fontFamily: 'Rajdhani, Inter, sans-serif',
    },
    pageTextStyle: {
      color: '#e6f0ff',
    },
    pageIconColor: '#00f0ff',
    pageIconInactiveColor: '#374151',
  };
}

/**
 * 生成默认的提示框配置
 */
export function createDefaultTooltip(): echarts.TooltipComponentOption {
  return {
    trigger: 'axis',
    backgroundColor: 'rgba(15, 23, 32, 0.95)',
    borderColor: '#00f0ff',
    borderWidth: 1,
    textStyle: {
      color: '#e6f0ff',
      fontFamily: 'Rajdhani, Inter, sans-serif',
    },
    // 确保 tooltip 不被容器遮挡
    appendToBody: true,
    confine: false,
    axisPointer: {
      type: 'cross',
      lineStyle: {
        color: '#00f0ff',
        type: 'dashed',
      },
      crossStyle: {
        color: '#00f0ff',
      },
      label: {
        backgroundColor: '#0f1720',
        borderColor: '#00f0ff',
        borderWidth: 1,
        color: '#e6f0ff',
      },
    },
  };
}

/**
 * 生成默认的网格配置
 */
export function createDefaultGrid(): echarts.GridComponentOption {
  return {
    left: '3%',
    right: '4%',
    bottom: '3%',
    top: '10%',
    containLabel: true,
  };
}
