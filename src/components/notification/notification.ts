/**
 * Notification 通知提醒服务
 * 提供全局通知提醒功能，支持多种通知类型和位置
 */

import { createVNode, render, type VNode } from 'vue';
import ExNotificationComponent from './ExNotification.vue';
import type {
  NotificationOptions,
  NotificationInstance,
  NotificationService,
  NotificationGlobalConfig,
  NotificationQueueItem,
  NotificationPosition,
} from './types';

// ============================================================================
// 全局配置
// ============================================================================

/** 默认全局配置 */
const defaultConfig: NotificationGlobalConfig = {
  duration: 4500,
  offset: 16,
  zIndex: 2000,
  maxCount: 10,
  showIcon: true,
  closable: true,
  position: 'top-right',
};

/** 当前全局配置 */
let globalConfig: NotificationGlobalConfig = { ...defaultConfig };

/**
 * 解析容器 z-index：未自定义时走设计令牌 var(--ex-z-toast)，
 * 与 Modal/Popover 等浮层共享同一套层级体系；
 * 用户显式设置 zIndex 时仍以其数值为准。
 */
const resolveZIndex = (): string =>
  globalConfig.zIndex === defaultConfig.zIndex
    ? `var(--ex-z-toast, ${defaultConfig.zIndex})`
    : String(globalConfig.zIndex);

// ============================================================================
// 通知队列管理
// ============================================================================

/** 按位置分组的通知队列 */
const notificationQueues: Record<NotificationPosition, NotificationQueueItem[]> = {
  'top-right': [],
  'top-left': [],
  'bottom-right': [],
  'bottom-left': [],
};

/** 按位置分组的通知容器 */
const notificationContainers: Record<NotificationPosition, HTMLElement | null> = {
  'top-right': null,
  'top-left': null,
  'bottom-right': null,
  'bottom-left': null,
};

/** 生成唯一 ID */
let seed = 0;
const generateId = (): string => {
  return `ex-notification-${Date.now()}-${++seed}`;
};

/**
 * 获取位置样式
 */
const getPositionStyle = (position: NotificationPosition, offset: number): string => {
  const styles: Record<string, string> = {
    position: 'fixed',
    zIndex: resolveZIndex(),
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    pointerEvents: 'none',
  };

  if (position.includes('top')) {
    styles.top = `${offset}px`;
  } else {
    styles.bottom = `${offset}px`;
    styles.flexDirection = 'column-reverse';
  }

  if (position.includes('right')) {
    styles.right = `${offset}px`;
  } else {
    styles.left = `${offset}px`;
  }

  return Object.entries(styles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
};

/**
 * 获取或创建通知容器
 */
const getContainer = (position: NotificationPosition): HTMLElement => {
  if (!notificationContainers[position]) {
    const container = document.createElement('div');
    container.className = `ex-notification-container ex-notification-container--${position}`;
    container.style.cssText = getPositionStyle(position, globalConfig.offset);
    document.body.appendChild(container);
    notificationContainers[position] = container;
  }
  return notificationContainers[position]!;
};

/**
 * 更新容器样式
 */
const updateContainerStyle = (position: NotificationPosition): void => {
  const container = notificationContainers[position];
  if (container) {
    container.style.cssText = getPositionStyle(position, globalConfig.offset);
  }
};

/**
 * 销毁通知容器
 */
const destroyContainer = (position: NotificationPosition): void => {
  const container = notificationContainers[position];
  const queue = notificationQueues[position];

  if (container && queue.length === 0) {
    document.body.removeChild(container);
    notificationContainers[position] = null;
  }
};

/**
 * 立即从队列中移除通知（不触发动画）
 */
const removeFromQueueImmediate = (id: string, position: NotificationPosition): void => {
  const queue = notificationQueues[position];
  const index = queue.findIndex(item => item.id === id);

  if (index > -1) {
    const item = queue[index]!;
    // 卸载 Vue 组件
    render(null, item.container);
    // 移除 DOM 元素
    if (item.container.parentNode) {
      item.container.parentNode.removeChild(item.container);
    }
    // 从队列中移除
    queue.splice(index, 1);
    // 如果队列为空，销毁容器
    destroyContainer(position);
  }
};

/**
 * 从队列中移除通知（动画完成后调用）
 */
const removeFromQueue = (id: string, position: NotificationPosition): void => {
  removeFromQueueImmediate(id, position);
};

/**
 * 限制通知数量 - 立即移除最旧的通知
 */
const limitNotificationCount = (position: NotificationPosition): void => {
  const queue = notificationQueues[position];
  // 计算需要移除的数量
  const removeCount = queue.length - globalConfig.maxCount + 1;
  if (removeCount > 0) {
    // 获取需要移除的通知（最旧的）
    const itemsToRemove = queue.slice(0, removeCount);
    // 立即移除，不等待动画
    itemsToRemove.forEach(item => {
      removeFromQueueImmediate(item.id, position);
    });
  }
};

// ============================================================================
// 创建通知
// ============================================================================

/**
 * 创建通知实例
 */
const createNotification = (options: NotificationOptions): NotificationInstance => {
  const position = options.position || globalConfig.position;

  // 限制通知数量（立即移除旧通知）
  limitNotificationCount(position);

  // 生成唯一 ID
  const id = options.id || generateId();

  // 合并配置
  const mergedOptions: NotificationOptions = {
    showIcon: globalConfig.showIcon,
    closable: globalConfig.closable,
    duration: globalConfig.duration,
    offset: globalConfig.offset,
    zIndex: globalConfig.zIndex,
    position: globalConfig.position,
    ...options,
    id,
  };

  // 获取容器
  const container = getContainer(position);

  // 创建通知包装元素
  const notificationWrapper = document.createElement('div');
  notificationWrapper.className = 'ex-notification-wrapper';
  container.appendChild(notificationWrapper);

  // 关闭方法
  const close = (): void => {
    const component = vnode.component;
    if (component && component.exposed) {
      (component.exposed as { close: () => void }).close();
    }
  };

  // 销毁回调
  const onDestroy = (): void => {
    removeFromQueue(id, position);
  };

  // 创建 Vue 虚拟节点
  const vnode: VNode = createVNode(ExNotificationComponent, {
    ...mergedOptions,
    onDestroy,
  });

  // 渲染到 DOM
  render(vnode, notificationWrapper);

  // 添加到队列
  const queueItem: NotificationQueueItem = {
    id,
    options: mergedOptions,
    vnode,
    container: notificationWrapper,
    close,
    position,
  };
  notificationQueues[position].push(queueItem);

  // 返回实例
  return {
    id,
    close,
  };
};

// ============================================================================
// 快捷方法
// ============================================================================

/**
 * 显示信息通知
 */
const info = (options: NotificationOptions): NotificationInstance => {
  return createNotification({ ...options, type: 'info' });
};

/**
 * 显示成功通知
 */
const success = (options: NotificationOptions): NotificationInstance => {
  return createNotification({ ...options, type: 'success' });
};

/**
 * 显示警告通知
 */
const warning = (options: NotificationOptions): NotificationInstance => {
  return createNotification({ ...options, type: 'warning' });
};

/**
 * 显示错误通知
 */
const error = (options: NotificationOptions): NotificationInstance => {
  return createNotification({ ...options, type: 'error' });
};

/**
 * 关闭指定通知
 */
const close = (id: string): void => {
  // 在所有位置队列中查找
  for (const position of Object.keys(notificationQueues) as NotificationPosition[]) {
    const item = notificationQueues[position].find(item => item.id === id);
    if (item) {
      item.close();
      return;
    }
  }
};

/**
 * 关闭所有通知
 */
const closeAll = (): void => {
  for (const position of Object.keys(notificationQueues) as NotificationPosition[]) {
    const items = [...notificationQueues[position]];
    // 立即移除，不等待动画
    items.forEach(item => {
      removeFromQueueImmediate(item.id, position);
    });
  }
};

/**
 * 配置全局选项
 */
const config = (options: Partial<NotificationGlobalConfig>): void => {
  globalConfig = { ...globalConfig, ...options };
  // 更新所有容器样式
  for (const position of Object.keys(notificationContainers) as NotificationPosition[]) {
    updateContainerStyle(position);
  }
};

// ============================================================================
// 导出 Notification 服务
// ============================================================================

/**
 * Notification 服务主函数
 */
const notificationFunction = (options: NotificationOptions): NotificationInstance => {
  return createNotification(options);
};

// 挂载方法到主函数
notificationFunction.info = info;
notificationFunction.success = success;
notificationFunction.warning = warning;
notificationFunction.error = error;
notificationFunction.close = close;
notificationFunction.closeAll = closeAll;
notificationFunction.config = config;

/** Notification 服务 */
export const notification: NotificationService = notificationFunction as NotificationService;

export default notification;
