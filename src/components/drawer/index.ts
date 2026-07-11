import ExDrawerComponent from './ExDrawer.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type {
  ExDrawerProps,
  ExDrawerEmits,
  ExDrawerExposed,
  DrawerPlacement,
  DrawerSize,
} from './types';

// 导出组件类型
export type { ExDrawerProps, ExDrawerEmits, ExDrawerExposed, DrawerPlacement, DrawerSize };

// 导出组件
export const ExDrawer: InstallableComponent<typeof ExDrawerComponent> =
  withInstall(ExDrawerComponent);

export default ExDrawer;
