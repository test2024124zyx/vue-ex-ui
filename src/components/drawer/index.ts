import ExDrawerComponent from './ExDrawer.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExDrawer: InstallableComponent<typeof ExDrawerComponent> =
  withInstall(ExDrawerComponent);

export * from './types';
export default ExDrawer;
