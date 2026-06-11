/**
 * Message 全局提示组件
 * 用于全局展示操作反馈信息
 */

import type { App } from 'vue';
import ExMessage from './ExMessage.vue';
import { message } from './message';
import type {
  ExMessageProps,
  ExMessageEmits,
  MessageOptions,
  MessageInstance,
  MessageService,
  MessageGlobalConfig,
  MessageType,
  MessagePosition,
} from './types';

// 导出组件
export { ExMessage, message };

// 导出类型
export type {
  ExMessageProps,
  ExMessageEmits,
  MessageOptions,
  MessageInstance,
  MessageService,
  MessageGlobalConfig,
  MessageType,
  MessagePosition,
};

// 组件安装插件
export const ExMessagePlugin = {
  install(app: App) {
    // 注册组件
    app.component('ExMessage', ExMessage);
    // 挂载全局方法
    app.config.globalProperties.$message = message;
  },
};

export default ExMessagePlugin;
