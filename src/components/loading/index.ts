import ExLoadingComponent from './ExLoading.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export type {
  ExLoadingEmits,
  ExLoadingExposed,
  ExLoadingProps,
  ExLoadingSlots,
  LoadingDirectiveBinding,
  LoadingDirectiveValue,
  LoadingPluginOptions,
  LoadingService,
  LoadingServiceConfig,
  LoadingServiceDefaults,
  LoadingServiceInstance,
  LoadingSize,
  LoadingTarget,
  LoadingType,
} from './types';

export {
  createLoadingService,
  destroyLoading,
  hideLoading,
  loadingService,
  LOADING_SERVICE_KEY,
  showLoading,
  useLoadingService,
} from './LoadingService';

export const ExLoading: InstallableComponent<typeof ExLoadingComponent> =
  withInstall(ExLoadingComponent);

export default ExLoading;
