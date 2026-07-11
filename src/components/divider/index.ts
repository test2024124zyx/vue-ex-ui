import ExDividerComponent from './ExDivider.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExDivider: InstallableComponent<typeof ExDividerComponent> =
  withInstall(ExDividerComponent);

export * from './types';
export default ExDivider;
