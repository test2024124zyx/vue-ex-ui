import type { App } from 'vue';
import ExChart from './ExChart.vue';
import type { ExChartProps, ExChartEmits, ExChartExposed } from './types';

// 导出组件类型
export type { ExChartProps, ExChartEmits, ExChartExposed };
export type { ChartType, ChartTheme, ChartSize, ChartLoadingStatus, ChartPresetConfig } from './types';

// 导出工具函数
export {
  getChartTheme,
  applyNeonGlow,
  createGradientColor,
  formatNumber,
  createDefaultToolbox,
  createDefaultDataZoom,
  createDefaultLegend,
  createDefaultTooltip,
  createDefaultGrid,
} from './utils';

// 导出组件
export { ExChart };

// 组件安装插件
export const ExChartPlugin = {
  install(app: App) {
    app.component('ExChart', ExChart);
  },
};

export default ExChartPlugin;
