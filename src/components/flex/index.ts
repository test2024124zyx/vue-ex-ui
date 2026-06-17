import type { App } from 'vue';
import ExFlex from './ExFlex.vue';
import ExFlexItem from './ExFlexItem.vue';
import './ExFlex.scss';
import './ExFlexItem.scss';

export { ExFlex, ExFlexItem };
export * from './types';

export const FlexPlugin = {
  install(app: App) {
    app.component('ExFlex', ExFlex);
    app.component('ExFlexItem', ExFlexItem);
  },
};

export default FlexPlugin;
