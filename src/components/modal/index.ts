import type { App } from 'vue';
import ExModal from './ExModal.vue';

ExModal.install = (app: App) => {
  app.component('ExModal', ExModal);
};

export default ExModal;
export { ExModal };
export type * from './types';
