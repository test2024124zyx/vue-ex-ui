// ExUI Config Provider
// 全局配置提供者

import ExConfigProviderComponent from './ExConfigProvider.vue';
import { withInstall } from '../../utils/install';
import type { InstallableComponent } from '../../utils/install';

// 导出类型
export type * from './types';

// 导出组合式 API
export * from './composables';

// 导出组件
export const ExConfigProvider: InstallableComponent<typeof ExConfigProviderComponent> =
  withInstall(ExConfigProviderComponent);

export default ExConfigProvider;
