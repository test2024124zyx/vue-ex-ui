import type { App } from 'vue';
import ExTimePicker from './ExTimePicker.vue';

ExTimePicker.install = (app: App) => {
  app.component('ExTimePicker', ExTimePicker);
};

export default ExTimePicker;
export { ExTimePicker };
export type * from './types';
