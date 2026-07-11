import ExIconComponent from './ExIcon.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type { ExIconProps } from './types';

// 导出组件类型
export type { ExIconProps };

// 导出组件
export const ExIcon: InstallableComponent<typeof ExIconComponent> = withInstall(ExIconComponent);

export default ExIcon;
