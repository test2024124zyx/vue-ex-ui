import type { App } from 'vue';
import ExAnchor from './ExAnchor.vue';
import ExAnchorLink from './ExAnchorLink.vue';

ExAnchor.install = (app: App) => {
  app.component('ExAnchor', ExAnchor);
  app.component('ExAnchorLink', ExAnchorLink);
};

export default ExAnchor;
export { ExAnchor, ExAnchorLink };
export * from './types';
