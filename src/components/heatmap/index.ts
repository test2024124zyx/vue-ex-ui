import ExHeatmapComponent from './ExHeatmap.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
export type {
  ExHeatmapProps,
  ExHeatmapEmits,
  ExHeatmapExposed,
  HeatmapDataItem,
  HeatmapSize,
  HeatmapTheme,
} from './types';

export const ExHeatmap: InstallableComponent<typeof ExHeatmapComponent> =
  withInstall(ExHeatmapComponent);

export default ExHeatmap;
