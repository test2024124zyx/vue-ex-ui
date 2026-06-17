import type { App } from 'vue';
import ExDescriptions from './ExDescriptions.vue';
import ExDescriptionsItem from './ExDescriptionsItem.vue';

ExDescriptions.install = (app: App) => {
  app.component('ExDescriptions', ExDescriptions);
  app.component('ExDescriptionsItem', ExDescriptionsItem);
};

export default ExDescriptions;
export { ExDescriptions, ExDescriptionsItem };
export type * from './types';
