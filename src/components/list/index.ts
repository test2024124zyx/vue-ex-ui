import type { App } from 'vue';
import ExList from './ExList.vue';
import type { ExListProps, ExListEmits, ExListExposed } from './types';

// 导出组件类型
export type { ExListProps, ExListEmits, ExListExposed };
export type { ListSize, ListItem } from './types';

// 导出组件
export { ExList };

// 组件安装插件
export const ExListPlugin = {
  install(app: App) {
    app.component('ExList', ExList);
  },
};

export default ExListPlugin;
