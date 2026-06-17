import type { App } from 'vue';
import ExWatermark from './ExWatermark.vue';
export { ExWatermark };
export type { ExWatermarkProps } from './types';

// 插件安装函数
export const ExWatermarkPlugin = {
  install(app: App) {
    app.component('ExWatermark', ExWatermark);
  },
};

export default ExWatermarkPlugin;
