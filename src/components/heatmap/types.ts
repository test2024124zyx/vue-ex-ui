import type { StyleValue } from 'vue';

/** 热力图数据项。 */
export interface HeatmapDataItem {
  /** 本地日历日期，必须使用 YYYY-MM-DD 格式。 */
  date: string;
  /** 非负有限数值；异常值在渲染前规范为 0。 */
  value: number;
  /** 随事件原样返回的业务扩展字段。 */
  [key: string]: unknown;
}

export type HeatmapSize = 'small' | 'medium' | 'large';
export type HeatmapTheme = 'default' | 'blue' | 'green' | 'purple' | 'red' | 'neon';

/** 热力图组件属性。 */
export interface ExHeatmapProps {
  /** 日期数据；非法日期会被忽略，重复日期以后出现的项为准。 */
  data: readonly HeatmapDataItem[];
  /** 开始日期，必须使用 YYYY-MM-DD，范围最长 366 天。 */
  startDate?: string;
  /** 结束日期，必须使用 YYYY-MM-DD。 */
  endDate?: string;
  /** 单元格尺寸预设。 */
  size?: HeatmapSize;
  /** 色阶主题。 */
  theme?: HeatmapTheme;
  /** 是否显示月份标签。 */
  showMonthLabels?: boolean;
  /** 是否显示星期标签。 */
  showWeekLabels?: boolean;
  /** 是否显示悬停或聚焦提示。 */
  showTooltip?: boolean;
  /** 单元格间距，单位为像素，限制为 0～64。 */
  gap?: number;
  /** 单元格圆角，单位为像素，最大为单元格尺寸的一半。 */
  radius?: number;
  /** 正数色阶上限；无效值会回退到可见数据最大值。 */
  maxValue?: number;
  /** 空数据文本。 */
  emptyText?: string;
  /** 根元素的无障碍名称。 */
  ariaLabel?: string;
  /** 根元素附加类名。 */
  class?: string | string[] | Record<string, boolean>;
  /** 根元素附加样式。 */
  style?: StyleValue;
}

/** 热力图组件事件。 */
export interface ExHeatmapEmits {
  /** 日期按钮被鼠标、触控或键盘原生激活。 */
  'cell-click': [data: HeatmapDataItem, event: MouseEvent];
  /** 指针进入或离开日期按钮；键盘聚焦不会伪装成悬停。 */
  'cell-hover': [data: HeatmapDataItem | null];
}

/** 热力图真实暴露的方法。 */
export interface ExHeatmapExposed {
  /** 获取根 DOM 元素。 */
  getElement: () => HTMLDivElement | null;
}
