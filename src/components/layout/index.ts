// Layout Components
// 布局组件导出

import type { App } from 'vue';
import ExLayout from './ExLayout.vue';
import ExHeader from './ExHeader.vue';
import ExSider from './ExSider.vue';
import ExContent from './ExContent.vue';
import ExFooter from './ExFooter.vue';
import ExContainer from './ExContainer.vue';

// 导出类型
export type * from './types';

// 导出组件
export { ExLayout, ExHeader, ExSider, ExContent, ExFooter, ExContainer };

// 布局插件
export const LayoutPlugin = {
  install(app: App) {
    app.component('ExLayout', ExLayout);
    app.component('ExHeader', ExHeader);
    app.component('ExSider', ExSider);
    app.component('ExContent', ExContent);
    app.component('ExFooter', ExFooter);
    app.component('ExContainer', ExContainer);
  },
};

export default LayoutPlugin;
