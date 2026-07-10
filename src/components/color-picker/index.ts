import type { App } from 'vue';
import ExColorPicker from './ExColorPicker.vue';

ExColorPicker.install = (app: App) => {
  app.component('ExColorPicker', ExColorPicker);
};

export default ExColorPicker;
export { ExColorPicker };
export type * from './types';
