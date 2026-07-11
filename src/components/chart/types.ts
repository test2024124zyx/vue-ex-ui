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

export interface ChartSeriesOption extends Record<string, unknown> {
  type?: ChartType | string;
  lineStyle?: Record<string, unknown>;
  itemStyle?: Record<string, unknown>;
}

/** ECharts 兼容配置，避免可选依赖的声明污染基础消费者。 */
export interface ChartOption extends Record<string, unknown> {
  series?: ChartSeriesOption | ChartSeriesOption[];
}

export interface ChartInitOptions extends Record<string, unknown> {
  renderer?: 'canvas' | 'svg';
  devicePixelRatio?: number;
  width?: number | string;
  height?: number | string;
  useDirtyRect?: boolean;
  ssr?: boolean;
}

export interface ChartEventParams extends Record<string, unknown> {
  type?: string;
  name?: string;
  dataIndex?: number;
  seriesIndex?: number;
}

export interface ChartInstance {
  setOption(option: ChartOption, opts?: Record<string, unknown>): void;
  resize(opts?: Record<string, unknown>): void;
  clear(): void;
  dispose(): void;
  on(event: string, handler: (params: ChartEventParams) => void): void;
  off(event: string, handler?: (params: ChartEventParams) => void): void;
  showLoading(type?: string, opts?: Record<string, unknown>): void;
  hideLoading(): void;
  getDataURL(opts?: Record<string, unknown>): string;
  convertToPixel(finder: unknown, value: unknown): number | number[];
  convertFromPixel(finder: unknown, value: unknown): number | number[];
}

export interface ChartGradient {
  type: 'linear';
  x: number;
  y: number;
  x2: number;
  y2: number;
  colorStops: Array<{ offset: number; color: string }>;
}

export type ChartComponentOption = Record<string, unknown>;

/**
 * 图表组件属性接口
 */
export interface ExChartProps {
  /** 图表配置选项 */
  option: ChartOption;
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
  /** 动画时长（毫秒） */
  animationDuration?: number;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
  /** 初始化配置 */
  initOptions?: ChartInitOptions;
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
  init: [instance: ChartInstance];
  /** 图表点击事件 */
  click: [params: ChartEventParams];
  /** 图表双击事件 */
  dblclick: [params: ChartEventParams];
  /** 图表鼠标移入事件 */
  mouseover: [params: ChartEventParams];
  /** 图表鼠标移出事件 */
  mouseout: [params: ChartEventParams];
  /** 图表鼠标移动事件 */
  mousemove: [params: ChartEventParams];
  /** 图表数据缩放事件 */
  datazoom: [params: ChartEventParams];
  /** 图表图例选择改变事件 */
  legendselectchanged: [params: ChartEventParams];
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
  getInstance: () => ChartInstance | null;
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
    option: ChartOption,
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
