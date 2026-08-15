import type { App } from 'vue';
import ExTable from './ExTable.vue';

// 子路径入口与根入口保持同一份类型契约。
export type * from './types';

// 为组件添加 install 方法
ExTable.install = (app: App) => {
  app.component(ExTable.name as string, ExTable);
};

export { ExTable };
export default ExTable;
