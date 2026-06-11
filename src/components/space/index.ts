import type { App } from 'vue';
import ExSpace from './ExSpace.vue';
import './ExSpace.scss';

// 导出组件类型
export type { ExSpaceProps } from './types';

// 导出组件
export { ExSpace };

// 组件安装插件
export const ExSpacePlugin = {
  install(app: App) {
    app.component('ExSpace', ExSpace);
  },
};

export default ExSpacePlugin;
