import ExPaginationComponent from './ExPagination.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import type { ExPaginationProps, ExPaginationEmits, ExPaginationExposed } from './types';

// 导出组件类型
export type { ExPaginationProps, ExPaginationEmits, ExPaginationExposed };
export type { PaginationSize, PaginationAlign } from './types';

// 导出组件
export const ExPagination: InstallableComponent<typeof ExPaginationComponent> =
  withInstall(ExPaginationComponent);

export default ExPagination;
