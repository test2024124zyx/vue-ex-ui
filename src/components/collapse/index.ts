import type { App } from 'vue';
import ExCollapse from './ExCollapse.vue';
import ExCollapseItem from './ExCollapseItem.vue';

ExCollapse.install = (app: App) => {
  app.component(ExCollapse.name as string, ExCollapse);
  app.component(ExCollapseItem.name as string, ExCollapseItem);
};

export default ExCollapse;
export { ExCollapse, ExCollapseItem };
export * from './types';
