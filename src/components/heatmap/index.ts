import type { App } from 'vue';
import ExHeatmap from './ExHeatmap.vue';
import type { ExHeatmapProps, ExHeatmapEmits, ExHeatmapExposed } from './types';

// 导出组件类型
export type { ExHeatmapProps, ExHeatmapEmits, ExHeatmapExposed };
export type { HeatmapDataItem, HeatmapSize, HeatmapTheme } from './types';

// 导出组件
export { ExHeatmap };

// 组件安装插件
export const ExHeatmapPlugin = {
  install(app: App) {
    app.component('ExHeatmap', ExHeatmap);
  },
};

export default ExHeatmapPlugin;
