import type { App } from 'vue';
import ExIcon from './ExIcon.vue';
import type { ExIconProps } from './types';

// 导出组件类型
export type { ExIconProps };

// 导出组件
export { ExIcon };

// 组件安装插件
export const ExIconPlugin = {
  install(app: App) {
    app.component('ExIcon', ExIcon);
  },
};

export default ExIconPlugin;
