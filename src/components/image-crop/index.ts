import type { App } from 'vue';
import ExImageCrop from './ExImageCrop.vue';

ExImageCrop.install = (app: App) => {
  app.component('ExImageCrop', ExImageCrop);
};

export default ExImageCrop;
export * from './types';
