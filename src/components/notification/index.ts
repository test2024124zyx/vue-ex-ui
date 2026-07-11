/**
 * Notification 通知提醒组件
 * 用于全局展示通知提醒信息
 */

import ExNotificationComponent from './ExNotification.vue';
import { withInstall, type InstallableComponent } from '../../utils/install';
import { notification } from './notification';
import type {
  ExNotificationProps,
  ExNotificationEmits,
  NotificationOptions,
  NotificationInstance,
  NotificationService,
  NotificationGlobalConfig,
  NotificationType,
  NotificationPosition,
} from './types';

export const ExNotification: InstallableComponent<typeof ExNotificationComponent> =
  withInstall(ExNotificationComponent);
export { notification };

const installComponent = ExNotification.install;
ExNotification.install = app => {
  installComponent(app);
  app.config.globalProperties.$notification = notification;
};

// 导出类型
export type {
  ExNotificationProps,
  ExNotificationEmits,
  NotificationOptions,
  NotificationInstance,
  NotificationService,
  NotificationGlobalConfig,
  NotificationType,
  NotificationPosition,
};

export default ExNotification;
