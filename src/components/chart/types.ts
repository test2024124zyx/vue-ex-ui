import type * as echarts from 'echarts';

/**
 * 图表类型
 */
export type ChartType =
  | 'line'
  | 'bar'
  | 'pie'
  | 'scatter'
  | 'radar'
  | 'gauge'
  | 'funnel'
  | 'candlestick'
  | 'heatmap'
  | 'tree'
  | 'treemap'
  | 'sunburst'
  | 'graph'
  | 'sankey'
  | 'boxplot'
  | 'parallel'
  | 'custom';

/**
 * 图表主题（已废弃，使用全局主题）
 * @deprecated 使用 ConfigProvider 的全局主题配置
 */
export type ChartTheme =
  | 'neon-blue'
  | 'neon-pink'
  | 'dark'
  | 'matrix'
  | 'high-contrast'
  | 'light'
  | 'custom';

/**
 * 图表尺寸
 */
export type ChartSize = 'small' | 'medium' | 'large';

/**
 * 图表加载状态
 */
export type ChartLoadingStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * 图表组件属性接口
 */
export interface ExChartProps {
  /** 图表配置选项 */
  option: echarts.EChartsOption;
  /** 图表类型（用于预设配置） */
  type?: ChartType;
  /** 图表尺寸 */
  size?: ChartSize;
  /** 图表宽度 */
  width?: string | number;
  /** 图表高度 */
  height?: string | number;
  /** 是否显示加载动画 */
  loading?: boolean;
  /** 加载文本 */
  loadingText?: string;
  /** 是否自动调整大小 */
  autoResize?: boolean;
  /** 调整大小防抖延迟（毫秒） */
  resizeDelay?: number;
  /** 是否显示工具栏 */
  showToolbox?: boolean;
  /** 是否显示数据缩放 */
  showDataZoom?: boolean;
  /** 是否显示图例 */
  showLegend?: boolean;
  /** 是否显示提示框 */
  showTooltip?: boolean;
  /** 是否显示网格 */
  showGrid?: boolean;
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 初始化配置 */
  initOptions?: echarts.EChartsInitOpts;
  /** 图表渲染器 */
  renderer?: 'canvas' | 'svg';
  /** 无障碍标签 */
  ariaLabel?: string;
}

/**
 * 图表组件事件接口
 */
export interface ExChartEmits {
  /** 图表初始化完成 */
  init: [instance: echarts.ECharts];
  /** 图表点击事件 */
  click: [params: echarts.ECElementEvent];
  /** 图表双击事件 */
  dblclick: [params: echarts.ECElementEvent];
  /** 图表鼠标移入事件 */
  mouseover: [params: echarts.ECElementEvent];
  /** 图表鼠标移出事件 */
  mouseout: [params: echarts.ECElementEvent];
  /** 图表鼠标移动事件 */
  mousemove: [params: echarts.ECElementEvent];
  /** 图表数据缩放事件 */
  datazoom: [params: echarts.ECElementEvent];
  /** 图表图例选择改变事件 */
  legendselectchanged: [params: echarts.ECElementEvent];
  /** 图表渲染完成事件 */
  finished: [];
  /** 图表更新完成事件 */
  updated: [];
  /** 图表错误事件 */
  error: [error: Error];
}

/**
 * 图表组件暴露的方法接口
 */
export interface ExChartExposed {
  /** 获取 ECharts 实例 */
  getInstance: () => echarts.ECharts | null;
  /** 获取图表 DOM 元素 */
  getElement: () => HTMLDivElement | null;
  /** 手动调整图表大小 */
  resize: (opts?: { width?: number | 'auto'; height?: number | 'auto' }) => void;
  /** 清空图表 */
  clear: () => void;
  /** 销毁图表实例 */
  dispose: () => void;
  /** 设置图表配置 */
  setOption: (
    option: echarts.EChartsOption,
    opts?: {
      notMerge?: boolean;
      lazyUpdate?: boolean;
      silent?: boolean;
      replaceMerge?: string | string[];
    }
  ) => void;
  /** 显示加载动画 */
  showLoading: (type?: string, opts?: object) => void;
  /** 隐藏加载动画 */
  hideLoading: () => void;
  /** 获取图表数据 URL */
  getDataURL: (opts?: {
    type?: 'png' | 'jpeg' | 'svg';
    pixelRatio?: number;
    backgroundColor?: string;
  }) => string;
  /** 获取图表 SVG 字符串 */
  getSvgDataURL: () => string;
  /** 转换坐标到像素 */
  convertToPixel: (finder: unknown, value: unknown) => number | number[];
  /** 转换像素到坐标 */
  convertFromPixel: (finder: unknown, value: unknown) => number | number[];
}

/**
 * 图表预设配置
 */
export interface ChartPresetConfig {
  /** 图表类型 */
  type: ChartType;
  /** 默认配置 */
  defaultOption: Partial<echarts.EChartsOption>;
}
