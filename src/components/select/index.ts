import type { App } from 'vue';
import ExSelect from './ExSelect.vue';

// 导出组件类型
export type {
  ExSelectProps,
  ExSelectEmits,
  ExSelectExposed,
  SelectOption,
  SelectOptionGroup,
  SelectOptions,
  SelectSize,
} from './types';

// 导出组件
export { ExSelect };

// 组件安装插件
export const ExSelectPlugin = {
  install(app: App) {
    app.component('ExSelect', ExSelect);
  },
};

export default ExSelectPlugin;
