import type { App } from 'vue';
import ExTable from './ExTable.vue';

// 导出组件类型
export type { ExTableProps, ExTableEmits, ExTableExposed } from './types';
export type { TableColumn, TableDataItem, TableSortInfo, TableColumnAlign, TableSize } from './types';

// 为组件添加 install 方法
ExTable.install = (app: App) => {
  app.component(ExTable.name as string, ExTable);
};

export { ExTable };
export default ExTable;
