import type { App } from 'vue';
import ExGrid from './ExGrid.vue';
import ExGridItem from './ExGridItem.vue';

export { ExGrid, ExGridItem };
export * from './types';

export const GridPlugin = {
  install(app: App) {
    app.component('ExGrid', ExGrid);
    app.component('ExGridItem', ExGridItem);
  },
};

export default GridPlugin;
