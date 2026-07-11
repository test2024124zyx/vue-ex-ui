// Layout Components
// 布局组件导出

import ExLayoutComponent from './ExLayout.vue';
import ExHeaderComponent from './ExHeader.vue';
import ExSiderComponent from './ExSider.vue';
import ExContentComponent from './ExContent.vue';
import ExFooterComponent from './ExFooter.vue';
import ExContainerComponent from './ExContainer.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 导出类型
export type * from './types';

// 导出组件
export const ExHeader: InstallableComponent<typeof ExHeaderComponent> =
  withInstall(ExHeaderComponent);
export const ExSider: InstallableComponent<typeof ExSiderComponent> = withInstall(ExSiderComponent);
export const ExContent: InstallableComponent<typeof ExContentComponent> =
  withInstall(ExContentComponent);
export const ExFooter: InstallableComponent<typeof ExFooterComponent> =
  withInstall(ExFooterComponent);
export const ExContainer: InstallableComponent<typeof ExContainerComponent> =
  withInstall(ExContainerComponent);
export const ExLayout: InstallableComponent<typeof ExLayoutComponent> = withInstall(
  ExLayoutComponent,
  {
    ExHeader,
    ExSider,
    ExContent,
    ExFooter,
    ExContainer,
  }
);

export default ExLayout;
