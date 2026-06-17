import type { App } from 'vue';
import ExImageCompress from './ExImageCompress.vue';

ExImageCompress.install = (app: App) => {
  app.component('ExImageCompress', ExImageCompress);
};

export default ExImageCompress;
export * from './types';
export * from './utils';
