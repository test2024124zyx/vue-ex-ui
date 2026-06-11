import type { App } from 'vue';
import ExPopconfirm from './ExPopconfirm.vue';

ExPopconfirm.install = (app: App) => {
  app.component('ExPopconfirm', ExPopconfirm);
};

export default ExPopconfirm;
export { ExPopconfirm };
export type * from './types';
