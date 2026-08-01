import type { App } from 'vue';
import ExSwitch from './ExSwitch.vue';
import type { ExSwitchProps, SwitchValue, SwitchSize } from './types';

// 为组件提供 install 方法，用于全局注册
ExSwitch.install = (app: App): void => {
  app.component(ExSwitch.name || 'ExSwitch', ExSwitch);
};

// 插件导出
export const ExSwitchPlugin = {
  install(app: App): void {
    app.component(ExSwitch.name || 'ExSwitch', ExSwitch);
  },
};

export { ExSwitch };
export type { ExSwitchProps, SwitchValue, SwitchSize };
export default ExSwitch;
