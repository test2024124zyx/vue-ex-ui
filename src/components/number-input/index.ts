import type { App } from 'vue';
import ExNumberInput from './ExNumberInput.vue';

ExNumberInput.install = (app: App) => {
  app.component(ExNumberInput.name as string, ExNumberInput);
};

export default ExNumberInput;
export { ExNumberInput };
export * from './types';
