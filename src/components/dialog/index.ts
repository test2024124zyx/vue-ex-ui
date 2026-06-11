import type { App } from 'vue';
import ExDialog from './ExDialog.vue';

ExDialog.install = (app: App) => {
  app.component('ExDialog', ExDialog);
};

export default ExDialog;
export { ExDialog };
export type * from './types';
