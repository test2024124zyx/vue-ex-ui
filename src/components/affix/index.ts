import type { App } from 'vue';
import ExAffix from './ExAffix.vue';

ExAffix.install = (app: App) => {
  app.component('ExAffix', ExAffix);
};

export default ExAffix;
export * from './types';
