import type { App } from 'vue';
import ExDrawer from './ExDrawer.vue';
import type {
  ExDrawerProps,
  ExDrawerEmits,
  ExDrawerExposed,
  DrawerPlacement,
  DrawerSize,
} from './types';

// 导出组件类型
export type {
  ExDrawerProps,
  ExDrawerEmits,
  ExDrawerExposed,
  DrawerPlacement,
  DrawerSize,
};

// 导出组件
export { ExDrawer };

// 组件安装插件
export const ExDrawerPlugin = {
  install(app: App) {
    app.component('ExDrawer', ExDrawer);
  },
};

export default ExDrawerPlugin;
