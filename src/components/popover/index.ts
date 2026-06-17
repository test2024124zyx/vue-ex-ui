import type { App } from 'vue';
import ExPopover from './ExPopover.vue';

ExPopover.install = (app: App) => {
  app.component('ExPopover', ExPopover);
};

export default ExPopover;
export { ExPopover };
export type * from './types';
