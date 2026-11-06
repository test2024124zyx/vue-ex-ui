import ExMenuComponent from './ExMenu.vue';
import ExMenuItemComponent from './ExMenuItem.vue';
import ExSubMenuComponent from './ExSubMenu.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExMenuItem: InstallableComponent<typeof ExMenuItemComponent> =
  withInstall(ExMenuItemComponent);
export const ExSubMenu: InstallableComponent<typeof ExSubMenuComponent> =
  withInstall(ExSubMenuComponent);
export const ExMenu: InstallableComponent<typeof ExMenuComponent> = withInstall(ExMenuComponent, {
  ExMenuItem,
  ExSubMenu,
});

// 导出类型
export type * from './types';

export default ExMenu;
