import type { App } from 'vue';
import ExAlert from './ExAlert.vue';
import type {
  ExAlertProps,
  ExAlertEmits,
  ExAlertSlots,
  ExAlertInstance,
  AlertType,
  AlertSize,
  AlertVariant,
} from './types';

// 导出组件
export { ExAlert };

// 导出类型
export type {
  ExAlertProps,
  ExAlertEmits,
  ExAlertSlots,
  ExAlertInstance,
  AlertType,
  AlertSize,
  AlertVariant,
};

// 组件安装插件
export const ExAlertPlugin = {
  install(app: App) {
    app.component('ExAlert', ExAlert);
  },
};

export default ExAlertPlugin;
