import type { App } from 'vue';
import ExPageHeader from './ExPageHeader.vue';

// 导出组件
export { ExPageHeader };

// 导出类型
export type { PageHeaderProps, PageHeaderEmits } from './types';

// Vue插件
export const PageHeaderPlugin = {
  install(app: App) {
    app.component('ExPageHeader', ExPageHeader);
  },
};

export default PageHeaderPlugin;
