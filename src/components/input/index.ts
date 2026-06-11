import type { App } from 'vue';
import ExInput from './ExInput.vue';

// 导出组件类型
export type {
  ExInputProps,
  ExInputEmits,
  ExInputSlots,
  ExInputInstance,
  InputType,
  InputSize,
  InputStatus,
  InputVariant,
} from './types';

// 导出组件
export { ExInput };

// 组件安装插件
export const ExInputPlugin = {
  install(app: App) {
    app.component('ExInput', ExInput);
  },
};

export default ExInputPlugin;
