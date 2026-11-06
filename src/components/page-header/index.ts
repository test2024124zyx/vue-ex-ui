import ExPageHeaderComponent from './ExPageHeader.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 导出组件
export const ExPageHeader: InstallableComponent<typeof ExPageHeaderComponent> =
  withInstall(ExPageHeaderComponent);

// 导出类型
export type { PageHeaderProps, PageHeaderEmits } from './types';

export default ExPageHeader;
