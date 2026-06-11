import type { App } from 'vue';
import ExProgress from './ExProgress.vue';
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
export { ExProgress };

// 组件安装插件
export const ExProgressPlugin = {
  install(app: App) {
    app.component('ExProgress', ExProgress);
  },
};

export default ExProgressPlugin;
