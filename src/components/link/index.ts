import type { App } from 'vue';
import ExLink from './ExLink.vue';

// 导出组件类型
export type {
  ExLinkProps,
  ExLinkEmits,
  ExLinkExposed,
  LinkType,
  LinkSize,
  LinkTarget,
} from './types';

// 导出组件
export { ExLink };

// 导出插件
export const ExLinkPlugin = {
  install(app: App) {
    app.component('ExLink', ExLink);
  },
};

// 导出安装函数（向后兼容）
export default ExLinkPlugin;
