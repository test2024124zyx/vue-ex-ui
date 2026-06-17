/**
 * 热力图数据项
 */
export interface HeatmapDataItem {
  /** 日期（YYYY-MM-DD 格式） */
  date: string;
  /** 数值 */
  value: number;
  /** 自定义数据 */
  [key: string]: unknown;
}

/**
 * 热力图尺寸
 */
export type HeatmapSize = 'small' | 'medium' | 'large';

/**
 * 热力图主题
 */
export type HeatmapTheme = 'default' | 'blue' | 'green' | 'purple' | 'red' | 'neon';

/**
 * 热力图组件属性接口
 */
export interface ExHeatmapProps {
  /** 热力图数据 */
  data: HeatmapDataItem[];
  /** 开始日期（YYYY-MM-DD 格式） */
  startDate?: string;
  /** 结束日期（YYYY-MM-DD 格式） */
  endDate?: string;
  /** 单元格尺寸 */
  size?: HeatmapSize;
  /** 主题 */
  theme?: HeatmapTheme;
  /** 是否显示月份标签 */
  showMonthLabels?: boolean;
  /** 是否显示星期标签 */
  showWeekLabels?: boolean;
  /** 是否显示工具提示 */
  showTooltip?: boolean;
  /** 单元格间距 */
  gap?: number;
  /** 单元格圆角 */
  radius?: number;
  /** 最大值（用于计算颜色深度） */
  maxValue?: number;
  /** 空数据文本 */
  emptyText?: string;
  /** 自定义CSS类名 */
  class?: string | string[] | Record<string, boolean>;
  /** 自定义样式 */
  style?: string | Record<string, string | number>;
}

/**
 * 热力图组件事件接口
 */
export interface ExHeatmapEmits {
  /** 单元格点击事件 */
  'cell-click': [data: HeatmapDataItem, event: MouseEvent];
  /** 单元格悬停事件 */
  'cell-hover': [data: HeatmapDataItem | null];
}

/**
 * 热力图组件暴露的方法接口
 */
export interface ExHeatmapExposed {
  /** 获取热力图DOM元素 */
  getElement: () => HTMLDivElement | null;
  /** 刷新热力图 */
  refresh: () => void;
}
