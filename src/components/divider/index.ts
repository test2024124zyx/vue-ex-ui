import ExDividerComponent from './ExDivider.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 导出组件类型
export type { ExDividerProps } from './types';

// 导出组件
export const ExDivider: InstallableComponent<typeof ExDividerComponent> =
  withInstall(ExDividerComponent);

export default ExDivider;
