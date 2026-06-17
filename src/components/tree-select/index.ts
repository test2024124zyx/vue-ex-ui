import type { App } from 'vue';
import ExTreeSelect from './ExTreeSelect.vue';

ExTreeSelect.install = (app: App) => {
  app.component('ExTreeSelect', ExTreeSelect);
};

export default ExTreeSelect;
export { ExTreeSelect };
export type * from './types';
