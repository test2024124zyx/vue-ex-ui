import type { App } from 'vue';
import ExFilePreview from './ExFilePreview.vue';

ExFilePreview.install = (app: App) => {
  app.component('ExFilePreview', ExFilePreview);
};

export default ExFilePreview;
export * from './types';
