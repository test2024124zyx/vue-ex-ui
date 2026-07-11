/**
 * Message 全局提示组件
 * 用于全局展示操作反馈信息
 */

import ExMessageComponent from './ExMessage.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
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

export const ExMessage: InstallableComponent<typeof ExMessageComponent> =
  withInstall(ExMessageComponent);
export { message };

const installComponent = ExMessage.install;
ExMessage.install = app => {
  installComponent(app);
  app.config.globalProperties.$message = message;
};

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

export default ExMessage;
