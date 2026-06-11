import type { App } from 'vue';
import ExFileUpload from './ExFileUpload.vue';

ExFileUpload.install = (app: App) => {
  app.component('ExFileUpload', ExFileUpload);
};

export default ExFileUpload;
export * from './types';
