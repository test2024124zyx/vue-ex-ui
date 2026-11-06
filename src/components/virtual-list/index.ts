import ExVirtualListComponent from './ExVirtualList.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 导出组件类型
export type { ExVirtualListProps, ExVirtualListEmits, ScrollInfo, VisibleRange } from './types';

// 导出组件
export const ExVirtualList: InstallableComponent<typeof ExVirtualListComponent> =
  withInstall(ExVirtualListComponent);

// 导出安装函数
export default ExVirtualList;
