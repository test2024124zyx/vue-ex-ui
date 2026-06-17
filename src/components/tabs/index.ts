import type { App } from 'vue';
import ExTabs from './ExTabs.vue';
import ExTabPane from './ExTabPane.vue';

// 导出组件类型
export type { ExTabsProps, ExTabsEmits, ExTabsExposed } from './types';
export type { ExTabPaneProps, ExTabPaneExposed } from './types';
export type { TabsPosition, TabsType, TabsSize } from './types';

// 为组件添加 install 方法
ExTabs.install = (app: App) => {
  app.component(ExTabs.name as string, ExTabs);
  app.component(ExTabPane.name as string, ExTabPane);
};

export { ExTabs, ExTabPane };
export default ExTabs;
