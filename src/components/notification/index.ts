/**
 * Notification 通知提醒组件
 * 用于全局展示通知提醒信息
 */

import type { App } from 'vue';
import ExNotification from './ExNotification.vue';
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

// 导出组件
export { ExNotification, notification };

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

// 组件安装插件
export const ExNotificationPlugin = {
  install(app: App) {
    // 注册组件
    app.component('ExNotification', ExNotification);
    // 挂载全局方法
    app.config.globalProperties.$notification = notification;
  },
};

export default ExNotificationPlugin;
