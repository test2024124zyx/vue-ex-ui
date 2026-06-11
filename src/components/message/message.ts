/**
 * Message 全局提示服务
 * 提供全局消息提示功能，支持多种消息类型
 */

import { createVNode, render, type VNode } from 'vue';
import ExMessageComponent from './ExMessage.vue';
import type {
  MessageOptions,
  MessageInstance,
  MessageService,
  MessageGlobalConfig,
  MessageQueueItem,
  MessageType,
} from './types';

// ============================================================================
// 全局配置
// ============================================================================

/** 默认全局配置 */
const defaultConfig: MessageGlobalConfig = {
  duration: 3000,
  offset: 20,
  zIndex: 2000,
  maxCount: 10,
  showIcon: true,
  closable: false,
  grouping: false,
};

/** 当前全局配置 */
let globalConfig: MessageGlobalConfig = { ...defaultConfig };

// ============================================================================
// 消息队列管理
// ============================================================================

/** 消息队列 */
const messageQueue: MessageQueueItem[] = [];

/** 消息容器 */
let messageContainer: HTMLElement | null = null;

/** 生成唯一 ID */
let seed = 0;
const generateId = (): string => {
  return `ex-message-${Date.now()}-${++seed}`;
};

/**
 * 获取或创建消息容器
 */
const getContainer = (): HTMLElement => {
  if (!messageContainer) {
    messageContainer = document.createElement('div');
    messageContainer.className = 'ex-message-container';
    messageContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: ${globalConfig.zIndex};
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: ${globalConfig.offset}px;
      gap: 12px;
    `;
    document.body.appendChild(messageContainer);
  }
  return messageContainer;
};

/**
 * 更新消息容器样式
 */
const updateContainerStyle = (): void => {
  if (messageContainer) {
    messageContainer.style.zIndex = String(globalConfig.zIndex);
    messageContainer.style.paddingTop = `${globalConfig.offset}px`;
  }
};

/**
 * 销毁消息容器
 */
const destroyContainer = (): void => {
  if (messageContainer && messageQueue.length === 0) {
    document.body.removeChild(messageContainer);
    messageContainer = null;
  }
};

/**
 * 立即从队列中移除消息（不触发动画）
 */
const removeFromQueueImmediate = (id: string): void => {
  const index = messageQueue.findIndex(item => item.id === id);
  if (index > -1) {
    const item = messageQueue[index]!;
    // 卸载 Vue 组件
    render(null, item.container);
    // 移除 DOM 元素
    if (item.container.parentNode) {
      item.container.parentNode.removeChild(item.container);
    }
    // 从队列中移除
    messageQueue.splice(index, 1);
    // 如果队列为空，销毁容器
    destroyContainer();
  }
};

/**
 * 从队列中移除消息（动画完成后调用）
 */
const removeFromQueue = (id: string): void => {
  removeFromQueueImmediate(id);
};

/**
 * 检查是否存在相同内容的消息（用于消息合并）
 */
const findSameMessage = (options: MessageOptions): MessageQueueItem | undefined => {
  if (!globalConfig.grouping && !options.grouping) {
    return undefined;
  }
  return messageQueue.find(
    item =>
      item.options.type === options.type &&
      item.options.content === options.content
  );
};

/**
 * 限制消息数量 - 立即移除最旧的消息
 */
const limitMessageCount = (): void => {
  // 计算需要移除的数量
  const removeCount = messageQueue.length - globalConfig.maxCount + 1;
  if (removeCount > 0) {
    // 获取需要移除的消息（最旧的）
    const itemsToRemove = messageQueue.slice(0, removeCount);
    // 立即移除，不等待动画
    itemsToRemove.forEach(item => {
      removeFromQueueImmediate(item.id);
    });
  }
};

// ============================================================================
// 创建消息
// ============================================================================

/**
 * 创建消息实例
 */
const createMessage = (options: MessageOptions): MessageInstance => {
  // 检查是否存在相同消息
  const sameMessage = findSameMessage(options);
  if (sameMessage) {
    return {
      id: sameMessage.id,
      close: sameMessage.close,
    };
  }

  // 限制消息数量（立即移除旧消息）
  limitMessageCount();

  // 生成唯一 ID
  const id = options.id || generateId();

  // 合并配置
  const mergedOptions: MessageOptions = {
    showIcon: globalConfig.showIcon,
    closable: globalConfig.closable,
    duration: globalConfig.duration,
    offset: globalConfig.offset,
    zIndex: globalConfig.zIndex,
    ...options,
    id,
  };

  // 获取容器
  const container = getContainer();

  // 创建消息包装元素
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'ex-message-wrapper';
  container.appendChild(messageWrapper);

  // 关闭方法
  const close = (): void => {
    const component = vnode.component;
    if (component && component.exposed) {
      (component.exposed as { close: () => void }).close();
    }
  };

  // 销毁回调
  const onDestroy = (): void => {
    removeFromQueue(id);
  };

  // 创建 Vue 虚拟节点
  const vnode: VNode = createVNode(ExMessageComponent, {
    ...mergedOptions,
    onDestroy,
  });

  // 渲染到 DOM
  render(vnode, messageWrapper);

  // 添加到队列
  const queueItem: MessageQueueItem = {
    id,
    options: mergedOptions,
    vnode,
    container: messageWrapper,
    close,
  };
  messageQueue.push(queueItem);

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
 * 解析消息选项
 */
const parseOptions = (
  content: string | MessageOptions,
  type: MessageType
): MessageOptions => {
  if (typeof content === 'string') {
    return { content, type };
  }
  return { ...content, type };
};

/**
 * 显示信息消息
 */
const info = (content: string | MessageOptions): MessageInstance => {
  return createMessage(parseOptions(content, 'info'));
};

/**
 * 显示成功消息
 */
const success = (content: string | MessageOptions): MessageInstance => {
  return createMessage(parseOptions(content, 'success'));
};

/**
 * 显示警告消息
 */
const warning = (content: string | MessageOptions): MessageInstance => {
  return createMessage(parseOptions(content, 'warning'));
};

/**
 * 显示错误消息
 */
const error = (content: string | MessageOptions): MessageInstance => {
  return createMessage(parseOptions(content, 'error'));
};

/**
 * 显示加载消息
 */
const loading = (content: string | MessageOptions): MessageInstance => {
  const options = parseOptions(content, 'loading');
  // 加载消息默认不自动关闭
  if (options.duration === undefined) {
    options.duration = 0;
  }
  return createMessage(options);
};

/**
 * 关闭指定消息
 */
const close = (id: string): void => {
  const item = messageQueue.find(item => item.id === id);
  if (item) {
    item.close();
  }
};

/**
 * 关闭所有消息
 */
const closeAll = (): void => {
  // 复制数组，避免在遍历时修改
  const items = [...messageQueue];
  items.forEach(item => {
    // 立即移除，不等待动画
    removeFromQueueImmediate(item.id);
  });
};

/**
 * 配置全局选项
 */
const config = (options: Partial<MessageGlobalConfig>): void => {
  globalConfig = { ...globalConfig, ...options };
  updateContainerStyle();
};

// ============================================================================
// 导出 Message 服务
// ============================================================================

/**
 * Message 服务主函数
 */
const messageFunction = (options: MessageOptions | string): MessageInstance => {
  if (typeof options === 'string') {
    return createMessage({ content: options, type: 'info' });
  }
  return createMessage(options);
};

// 挂载方法到主函数
messageFunction.info = info;
messageFunction.success = success;
messageFunction.warning = warning;
messageFunction.error = error;
messageFunction.loading = loading;
messageFunction.close = close;
messageFunction.closeAll = closeAll;
messageFunction.config = config;

/** Message 服务 */
export const message: MessageService = messageFunction as MessageService;

export default message;
