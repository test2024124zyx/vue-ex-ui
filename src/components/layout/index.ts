import ExLayoutComponent from './ExLayout.vue';
import ExHeaderComponent from './ExHeader.vue';
import ExSiderComponent from './ExSider.vue';
import ExContentComponent from './ExContent.vue';
import ExFooterComponent from './ExFooter.vue';
import ExContainerComponent from './ExContainer.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';

// 同时提供独立按需组件与 Layout.Header 形式的复合成员。
export type * from './types';

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
    Header: ExHeader,
    Sider: ExSider,
    Content: ExContent,
    Footer: ExFooter,
    Container: ExContainer,
  }
);

export default ExLayout;
