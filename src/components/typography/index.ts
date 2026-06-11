import { App } from 'vue';
import ExTypography from './ExTypography.vue';
// 导出组件
export { ExTypography };

// 导出类型
export type { ExTypographyProps } from './types';

// 导出安装函数
export const ExTypographyPlugin = {
  install(app: App) {
    app.component('ExTypography', ExTypography);
  },
};

// 安装函数
export default {
  install(app: App) {
    app.component('ExTypography', ExTypography);
  },
};
