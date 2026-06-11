import type { App } from 'vue';
import ExPagination from './ExPagination.vue';
import type { ExPaginationProps, ExPaginationEmits, ExPaginationExposed } from './types';

// 导出组件类型
export type { ExPaginationProps, ExPaginationEmits, ExPaginationExposed };
export type { PaginationSize, PaginationAlign } from './types';

// 导出组件
export { ExPagination };

// 组件安装插件
export const ExPaginationPlugin = {
  install(app: App) {
    app.component('ExPagination', ExPagination);
  },
};

export default ExPaginationPlugin;
