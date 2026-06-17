import type { App } from 'vue';
import ExTree from './ExTree.vue';
import type { ExTreeProps, ExTreeEmits, ExTreeExposed, TreeNode } from './types';

// 导出组件类型
export type { ExTreeProps, ExTreeEmits, ExTreeExposed, TreeNode };

// 导出组件
export { ExTree };

// 组件安装插件
export const ExTreePlugin = {
  install(app: App) {
    app.component('ExTree', ExTree);
  },
};

export default ExTreePlugin;
