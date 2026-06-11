import type { App } from 'vue';
import ExSlider from './ExSlider.vue';

ExSlider.install = (app: App) => {
  app.component(ExSlider.name as string, ExSlider);
};

export default ExSlider;
export { ExSlider };
export * from './types';
