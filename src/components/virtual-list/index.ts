import type { App } from 'vue';
import ExVirtualList from './ExVirtualList.vue';

// 导出组件类型
export type {
  ExVirtualListProps,
  ExVirtualListEmits,
  ScrollInfo,
  VisibleRange,
} from './types';

// 导出组件
export { ExVirtualList };

// 导出安装函数
export default {
  install(app: App) {
    app.component('ExVirtualList', ExVirtualList);
  },
};
