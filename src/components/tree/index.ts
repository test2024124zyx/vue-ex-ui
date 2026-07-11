import ExTreeComponent from './ExTree.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type { ExTreeProps, ExTreeEmits, ExTreeExposed, TreeNode } from './types';

// 导出组件类型
export type { ExTreeProps, ExTreeEmits, ExTreeExposed, TreeNode };

// 导出组件
export const ExTree: InstallableComponent<typeof ExTreeComponent> = withInstall(ExTreeComponent);

export default ExTree;
