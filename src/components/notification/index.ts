/**
 * Notification 通知提醒组件
 * 用于全局展示通知提醒信息
 */

import ExNotificationComponent from './ExNotification.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import { createNotificationService, notification, NOTIFICATION_SERVICE_KEY } from './notification';
import type {
  ExNotificationProps,
  ExNotificationEmits,
  ExNotificationExposed,
  ExNotificationSlots,
  NotificationOptions,
  NotificationInstance,
  NotificationService,
  NotificationGlobalConfig,
  NotificationType,
  NotificationPosition,
  NotificationTypedOptions,
} from './types';

export const ExNotification: InstallableComponent<typeof ExNotificationComponent> =
  withInstall(ExNotificationComponent);
export { notification };
export {
  createNotificationService,
  NOTIFICATION_SERVICE_KEY,
  useNotificationService,
} from './notification';

const installComponent = ExNotification.install;
ExNotification.install = app => {
  installComponent(app);
  const service = createNotificationService(app._context);
  app.config.globalProperties.$notification = service;
  app.provide(NOTIFICATION_SERVICE_KEY, service);
  app.onUnmount(() => service.closeAll());
};

// 导出类型
export type {
  ExNotificationProps,
  ExNotificationEmits,
  ExNotificationExposed,
  ExNotificationSlots,
  NotificationOptions,
  NotificationInstance,
  NotificationService,
  NotificationGlobalConfig,
  NotificationType,
  NotificationPosition,
  NotificationTypedOptions,
};

export default ExNotification;
