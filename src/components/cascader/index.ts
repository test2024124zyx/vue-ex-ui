import type { App } from 'vue';
import ExCascader from './ExCascader.vue';

ExCascader.install = (app: App) => {
  app.component('ExCascader', ExCascader);
};

export default ExCascader;
export { ExCascader };
export type * from './types';
