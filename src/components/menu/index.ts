import type { App, Plugin } from 'vue';
import ExMenu from './ExMenu.vue';
import ExMenuItem from './ExMenuItem.vue';
import ExSubMenu from './ExSubMenu.vue';

// 导出组件
export { ExMenu, ExMenuItem, ExSubMenu };

// 导出类型
export type * from './types';

// 创建插件
const MenuPlugin: Plugin = {
  install(app: App) {
    app.component('ExMenu', ExMenu);
    app.component('ExMenuItem', ExMenuItem);
    app.component('ExSubMenu', ExSubMenu);
  },
};

// 为每个组件添加 install 方法
ExMenu.install = MenuPlugin.install;
ExMenuItem.install = (app: App) => {
  app.component('ExMenuItem', ExMenuItem);
};
ExSubMenu.install = (app: App) => {
  app.component('ExSubMenu', ExSubMenu);
};

export default MenuPlugin;
