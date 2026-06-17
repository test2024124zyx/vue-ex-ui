import type { App } from 'vue';
import ExFileList from './ExFileList.vue';

ExFileList.install = (app: App) => {
  app.component('ExFileList', ExFileList);
};

export default ExFileList;
export * from './types';
