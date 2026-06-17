import type { App } from 'vue';
import ExQRCode from './ExQRCode.vue';

ExQRCode.install = (app: App) => {
  app.component(ExQRCode.name as string, ExQRCode);
};

export default ExQRCode;
export { ExQRCode };
export * from './types';
