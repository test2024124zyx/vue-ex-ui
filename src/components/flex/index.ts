import ExFlexComponent from './ExFlex.vue';
import ExFlexItemComponent from './ExFlexItem.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import './ExFlex.scss';
import './ExFlexItem.scss';

export const ExFlexItem: InstallableComponent<typeof ExFlexItemComponent> =
  withInstall(ExFlexItemComponent);
export const ExFlex: InstallableComponent<typeof ExFlexComponent> = withInstall(ExFlexComponent, {
  ExFlexItem,
});
export * from './types';

export default ExFlex;
