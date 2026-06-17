import type { App } from 'vue';
import ExImage from './ExImage.vue';

export { ExImage };
export type { ExImageProps, ExImageEmits } from './types';

// 插件安装函数
export const ExImagePlugin = {
  install(app: App) {
    app.component('ExImage', ExImage);
  },
};

export default ExImagePlugin;
