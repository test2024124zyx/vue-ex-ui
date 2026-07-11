import ExProgressComponent from './ExProgress.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type {
  ExProgressProps,
  ExProgressEmits,
  ExProgressExposed,
  ProgressType,
  ProgressStatus,
  ProgressColor,
} from './types';

// 导出组件类型
export type {
  ExProgressProps,
  ExProgressEmits,
  ExProgressExposed,
  ProgressType,
  ProgressStatus,
  ProgressColor,
};

// 导出组件
export const ExProgress: InstallableComponent<typeof ExProgressComponent> =
  withInstall(ExProgressComponent);

export default ExProgress;
