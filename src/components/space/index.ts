import ExSpaceComponent from './ExSpace.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import './ExSpace.scss';

// 导出组件类型
export type { ExSpaceProps } from './types';

// 导出组件
export const ExSpace: InstallableComponent<typeof ExSpaceComponent> = withInstall(ExSpaceComponent);

export default ExSpace;
