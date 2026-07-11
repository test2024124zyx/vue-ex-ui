import ExLoadingBarComponent from './ExLoadingBar.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export type {
  ExLoadingBarExposed,
  ExLoadingBarProps,
  LoadingBarColor,
  LoadingBarOptions,
  LoadingBarService,
  LoadingBarStatus,
} from './types';

export { createLoadingBar, loadingBar } from './loading-bar';

export const ExLoadingBar: InstallableComponent<typeof ExLoadingBarComponent> =
  withInstall(ExLoadingBarComponent);

export default ExLoadingBar;
