import type { App } from 'vue';
import ExCode from './ExCode.vue';

ExCode.install = (app: App) => {
  app.component('ExCode', ExCode);
};

export default ExCode;
export { ExCode };
export type * from './types';
