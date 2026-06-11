import type { App } from 'vue';
import ExLoadingBar from './ExLoadingBar.vue';
import { loadingBar } from './loading-bar';
import type {
  ExLoadingBarProps,
  LoadingBarOptions,
  LoadingBarInstance,
  LoadingBarStatus,
} from './types';

// 导出组件类型
export type {
  ExLoadingBarProps,
  LoadingBarOptions,
  LoadingBarInstance,
  LoadingBarStatus,
};

// 导出组件和 API
export { ExLoadingBar, loadingBar };

// 组件安装插件
export const ExLoadingBarPlugin = {
  install(app: App) {
    app.component('ExLoadingBar', ExLoadingBar);
    // 将 loadingBar 方法挂载到全局属性
    app.config.globalProperties.$loadingBar = loadingBar;
  },
};

export default ExLoadingBarPlugin;
