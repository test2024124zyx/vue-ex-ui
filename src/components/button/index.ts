import type { App } from 'vue';
import ExButton from './ExButton.vue';
import type { ExButtonProps, ExButtonEmits, ExButtonExposed } from './types';

// 导出组件类型
export type { ExButtonProps, ExButtonEmits, ExButtonExposed };
export type { ButtonType, ButtonSize, ButtonShape, NativeButtonType } from './types';

// 导出组件
export { ExButton };

// 组件安装插件
export const ExButtonPlugin = {
  install(app: App) {
    app.component('ExButton', ExButton);
  },
};

export default ExButtonPlugin;
