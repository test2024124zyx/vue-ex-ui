import ExTreeComponent from './ExTree.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 导出组件类型
export type * from './types';

// 导出组件
export const ExTree: InstallableComponent<typeof ExTreeComponent> = withInstall(ExTreeComponent);

export default ExTree;
