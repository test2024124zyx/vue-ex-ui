import type { App } from 'vue';
import ExDivider from './ExDivider.vue';

// 导出组件类型
export type { ExDividerProps } from './types';

// 导出组件
export { ExDivider };

// 组件安装插件
export const ExDividerPlugin = {
  install(app: App) {
    app.component('ExDivider', ExDivider);
  },
};

export default ExDividerPlugin;
