import ExListComponent from './ExList.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type { ExListProps, ExListEmits, ExListExposed } from './types';

// 导出组件类型
export type { ExListProps, ExListEmits, ExListExposed };
export type { ListSize, ListItem } from './types';

// 导出组件
export const ExList: InstallableComponent<typeof ExListComponent> = withInstall(ExListComponent);

export default ExList;
