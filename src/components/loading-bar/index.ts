import ExLoadingBarComponent from './ExLoadingBar.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import { loadingBar } from './loading-bar';
import type {
  ExLoadingBarProps,
  LoadingBarOptions,
  LoadingBarInstance,
  LoadingBarStatus,
} from './types';

// 导出组件类型
export type { ExLoadingBarProps, LoadingBarOptions, LoadingBarInstance, LoadingBarStatus };

export const ExLoadingBar: InstallableComponent<typeof ExLoadingBarComponent> =
  withInstall(ExLoadingBarComponent);
export { loadingBar };

const installComponent = ExLoadingBar.install;
ExLoadingBar.install = app => {
  installComponent(app);
  app.config.globalProperties.$loadingBar = loadingBar;
};

export default ExLoadingBar;
