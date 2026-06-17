import ExTag from './ExTag.vue';
import ExTagInput from './ExTagInput.vue';
import type { App } from 'vue';

const install = (app: App) => {
  app.component('ExTag', ExTag);
  app.component('ExTagInput', ExTagInput);
};

export { ExTag, ExTagInput };
export default Object.assign(ExTag, { install, ExTagInput });