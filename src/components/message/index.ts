/**
 * Message 全局提示组件
 * 用于全局展示操作反馈信息
 */

import ExMessageComponent from './ExMessage.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import { createMessageService, message, MESSAGE_SERVICE_KEY } from './message';
import type {
  ExMessageProps,
  ExMessageEmits,
  MessageOptions,
  MessageInstance,
  MessageService,
  MessageGlobalConfig,
  MessageInput,
  MessageTypedInput,
  MessageTypedOptions,
  MessageType,
  ExMessageExposed,
  ExMessageSlots,
} from './types';

export const ExMessage: InstallableComponent<typeof ExMessageComponent> =
  withInstall(ExMessageComponent);
export { message };
export { createMessageService, MESSAGE_SERVICE_KEY, useMessageService } from './message';

const installComponent = ExMessage.install;
ExMessage.install = app => {
  installComponent(app);
  const service = createMessageService(app._context);
  app.config.globalProperties.$message = service;
  app.provide(MESSAGE_SERVICE_KEY, service);
  app.onUnmount(() => service.closeAll());
};

// 导出类型
export type {
  ExMessageProps,
  ExMessageEmits,
  MessageOptions,
  MessageInstance,
  MessageService,
  MessageGlobalConfig,
  MessageInput,
  MessageTypedInput,
  MessageTypedOptions,
  MessageType,
  ExMessageExposed,
  ExMessageSlots,
};

export default ExMessage;
