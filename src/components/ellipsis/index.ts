import type { App } from 'vue';
import ExEllipsis from './ExEllipsis.vue';

export { ExEllipsis };
export type { ExEllipsisProps } from './types';

// 插件安装函数
export const ExEllipsisPlugin = {
  install(app: App) {
    app.component('ExEllipsis', ExEllipsis);
  },
};

export default ExEllipsisPlugin;
