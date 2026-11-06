import ExBreadcrumbComponent from './ExBreadcrumb.vue';
import ExBreadcrumbItemComponent from './ExBreadcrumbItem.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

export const ExBreadcrumbItem: InstallableComponent<typeof ExBreadcrumbItemComponent> =
  withInstall(ExBreadcrumbItemComponent);
export const ExBreadcrumb: InstallableComponent<typeof ExBreadcrumbComponent> = withInstall(
  ExBreadcrumbComponent,
  { ExBreadcrumbItem }
);

// 导出类型
export type {
  BreadcrumbProps,
  BreadcrumbItemProps,
  BreadcrumbItem,
  BreadcrumbEmits,
  BreadcrumbItemEmits,
} from './types';

export default ExBreadcrumb;
