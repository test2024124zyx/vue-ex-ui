import ExChartComponent from './ExChart.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type { ExChartProps, ExChartEmits, ExChartExposed } from './types';

// 导出组件类型
export type { ExChartProps, ExChartEmits, ExChartExposed };
export type {
  ChartType,
  ChartTheme,
  ChartSize,
  ChartLoadingStatus,
  ChartPresetConfig,
} from './types';

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

export const ExChart: InstallableComponent<typeof ExChartComponent> = withInstall(ExChartComponent);

export default ExChart;
