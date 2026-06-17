// ExUI Config Provider
// 全局配置提供者

import type { App } from 'vue';
import ExConfigProvider from './ExConfigProvider.vue';

// 导出类型
export type * from './types';

// 导出组合式 API
export * from './composables';

// 导出组件
export { ExConfigProvider };

// 安装函数
ExConfigProvider.install = (app: App) => {
  app.component(ExConfigProvider.name as string, ExConfigProvider);
};

export default ExConfigProvider;
