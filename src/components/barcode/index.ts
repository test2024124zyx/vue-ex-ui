// Barcode Component
// 条码组件导出

import ExBarcodeComponent from './ExBarcode.vue';
import { withInstall } from '../../utils/install';
import type { InstallableComponent } from '../../utils/install';

// 导出类型
export type * from './types';

export const ExBarcode: InstallableComponent<typeof ExBarcodeComponent> =
  withInstall(ExBarcodeComponent);

export default ExBarcode;
