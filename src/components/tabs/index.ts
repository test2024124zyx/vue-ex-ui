import ExTabPaneComponent from './ExTabPane.vue';
import ExTabsComponent from './ExTabs.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export type {
  ExTabPaneExposed,
  ExTabPaneProps,
  ExTabsEmits,
  ExTabsExposed,
  ExTabsProps,
  TabsPosition,
  TabsSize,
  TabsType,
} from './types';

export const ExTabPane: InstallableComponent<typeof ExTabPaneComponent> =
  withInstall(ExTabPaneComponent);
export const ExTabs: InstallableComponent<typeof ExTabsComponent> = withInstall(ExTabsComponent, {
  ExTabPane,
});

export default ExTabs;
