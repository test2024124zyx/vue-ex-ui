import ExHeatmapComponent from './ExHeatmap.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type { ExHeatmapProps, ExHeatmapEmits, ExHeatmapExposed } from './types';

// 导出组件类型
export type { ExHeatmapProps, ExHeatmapEmits, ExHeatmapExposed };
export type { HeatmapDataItem, HeatmapSize, HeatmapTheme } from './types';

// 导出组件
export const ExHeatmap: InstallableComponent<typeof ExHeatmapComponent> =
  withInstall(ExHeatmapComponent);

export default ExHeatmap;
