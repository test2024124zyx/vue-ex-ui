// Barcode Component
// 条码组件导出

import type { App } from 'vue';
import ExBarcode from './ExBarcode.vue';

// 导出类型
export type * from './types';

// 导出组件
export { ExBarcode };

// 组件安装
ExBarcode.install = (app: App) => {
  app.component('ExBarcode', ExBarcode);
};

export default ExBarcode;
