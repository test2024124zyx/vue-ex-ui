import ExGridComponent from './ExGrid.vue';
import ExGridItemComponent from './ExGridItem.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExGridItem: InstallableComponent<typeof ExGridItemComponent> =
  withInstall(ExGridItemComponent);
export const ExGrid: InstallableComponent<typeof ExGridComponent> = withInstall(ExGridComponent, {
  ExGridItem,
});
export * from './grid-utils';
export * from './types';

export default ExGrid;
