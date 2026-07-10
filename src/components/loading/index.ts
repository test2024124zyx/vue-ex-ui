import type { App } from 'vue';
import ExLoading from './ExLoading.vue';

ExLoading.install = (app: App) => {
  app.component(ExLoading.name as string, ExLoading);
};

export default ExLoading;
export { ExLoading };
export {
  loadingService,
  createLoadingService,
  createLoadingManager,
  showLoading,
  hideLoading,
  destroyLoading,
} from './LoadingService';
export * from './types';
