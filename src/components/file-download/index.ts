import type { App } from 'vue';
import ExFileDownload from './ExFileDownload.vue';

ExFileDownload.install = (app: App) => {
  app.component('ExFileDownload', ExFileDownload);
};

export default ExFileDownload;
export * from './types';
