import ExLoadingBarComponent from './ExLoadingBar.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import { createLoadingBar, LOADING_BAR_SERVICE_KEY } from './loading-bar';
import type { LoadingBarService } from './types';

export type {
  ExLoadingBarExposed,
  ExLoadingBarProps,
  LoadingBarColor,
  LoadingBarOptions,
  LoadingBarService,
  LoadingBarStatus,
} from './types';

export { createLoadingBar, loadingBar } from './loading-bar';
export { LOADING_BAR_SERVICE_KEY, useLoadingBarService } from './loading-bar';

export const ExLoadingBar: InstallableComponent<typeof ExLoadingBarComponent> =
  withInstall(ExLoadingBarComponent);

const installComponent = ExLoadingBar.install;
ExLoadingBar.install = app => {
  installComponent(app);
  const service = createLoadingBar({}, app._context);
  app.config.globalProperties.$loadingBar = service;
  app.provide(LOADING_BAR_SERVICE_KEY, service);
  app.onUnmount(() => service.destroy());
};

declare module 'vue' {
  interface ComponentCustomProperties {
    /** 当前应用安装的 LoadingBar 服务。 */
    $loadingBar: LoadingBarService;
  }
}

export default ExLoadingBar;
