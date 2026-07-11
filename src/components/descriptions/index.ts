import ExDescriptionsComponent from './ExDescriptions.vue';
import ExDescriptionsItemComponent from './ExDescriptionsItem.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExDescriptionsItem: InstallableComponent<typeof ExDescriptionsItemComponent> =
  withInstall(ExDescriptionsItemComponent);
export const ExDescriptions: InstallableComponent<typeof ExDescriptionsComponent> = withInstall(
  ExDescriptionsComponent,
  { ExDescriptionsItem }
);

export default ExDescriptions;
export type * from './types';
