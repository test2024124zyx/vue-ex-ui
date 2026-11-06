import ExCollapseComponent from './ExCollapse.vue';
import ExCollapseItemComponent from './ExCollapseItem.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExCollapseItem: InstallableComponent<typeof ExCollapseItemComponent> =
  withInstall(ExCollapseItemComponent);
export const ExCollapse: InstallableComponent<typeof ExCollapseComponent> = withInstall(
  ExCollapseComponent,
  { ExCollapseItem }
);

export default ExCollapse;
export type * from './types';
