import type { App } from 'vue';
import ExPanel from './ExPanel.vue';

ExPanel.install = (app: App) => {
  app.component(ExPanel.name as string, ExPanel);
};

export default ExPanel;
export { ExPanel };
export * from './types';
