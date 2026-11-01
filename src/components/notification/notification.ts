import { cloneVNode, createVNode, inject, isVNode, render } from 'vue';
import type { AppContext, InjectionKey, VNode } from 'vue';
import { createSharedInjectionKey } from '../../utils/shared-runtime';
import { useComponentServiceScope, watchServiceZIndex } from '../config-provider/service-scope';
import { CONFIG_PROVIDER_INJECTION_KEY } from '../config-provider/types';
import type { ConfigContext } from '../config-provider/types';
import { resolveZIndexLayer } from '../config-provider/z-index';
import ExNotificationComponent from './ExNotification.vue';
import { resolveNotificationConfig, resolveNotificationOptions } from './notification-utils';
import type { ResolvedNotificationOptions } from './notification-utils';
import type {
  ExNotificationExposed,
  NotificationGlobalConfig,
  NotificationInstance,
  NotificationOptions,
  NotificationPosition,
  NotificationService,
  NotificationType,
  NotificationTypedOptions,
} from './types';

const DEFAULT_CONFIG: NotificationGlobalConfig = {
  duration: 4500,
  offset: 16,
  zIndex: 2000,
  maxCount: 10,
  showIcon: true,
  closable: true,
  position: 'top-right',
};

interface NotificationRecord {
  id: string;
  options: ResolvedNotificationOptions;
  position: NotificationPosition;
  groupKey: string;
  inheritsZIndex: boolean;
  wrapper: HTMLDivElement;
  vnode: VNode;
  state: 'active' | 'closing' | 'destroyed';
  callbackCalled: boolean;
  close: () => boolean;
}

/** 当前 Vue App 的 Notification 服务注入键。 */
export const NOTIFICATION_SERVICE_KEY: InjectionKey<NotificationService> =
  createSharedInjectionKey('notification-service');

const createContainerStyle = (
  options: ResolvedNotificationOptions
): Partial<CSSStyleDeclaration> => {
  const style: Partial<CSSStyleDeclaration> = {
    position: 'fixed',
    zIndex: String(options.zIndex),
    display: 'flex',
    flexDirection: options.position.includes('bottom') ? 'column-reverse' : 'column',
    gap: '12px',
    pointerEvents: 'none',
  };
  if (options.position.includes('top')) style.top = `${options.offset}px`;
  else style.bottom = `${options.offset}px`;
  if (options.position.includes('right')) style.right = `${options.offset}px`;
  else style.left = `${options.offset}px`;
  return style;
};

/** 创建队列、容器、配置和回调生命周期完全隔离的 Notification 服务。 */
export function createNotificationService(appContext?: AppContext): NotificationService {
  let globalConfig: NotificationGlobalConfig = { ...DEFAULT_CONFIG };
  let hasExplicitZIndex = false;
  let stopZIndexWatch: (() => void) | undefined;
  let seed = 0;
  const records = new Map<string, NotificationRecord>();
  const containers = new Map<string, HTMLDivElement>();
  const activeQueues = new Map<NotificationPosition, NotificationRecord[]>();

  const assertBrowserEnvironment = (): void => {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
      throw new Error('Notification 服务只能在浏览器环境中创建通知');
    }
  };

  const resolveScopedConfig = (): NotificationGlobalConfig => {
    if (hasExplicitZIndex) return globalConfig;
    const config = appContext?.provides[CONFIG_PROVIDER_INJECTION_KEY as symbol] as
      ConfigContext | undefined;
    return config
      ? { ...globalConfig, zIndex: resolveZIndexLayer(config.zIndex.value, 'toast') }
      : globalConfig;
  };

  const getQueue = (position: NotificationPosition): NotificationRecord[] => {
    const existing = activeQueues.get(position);
    if (existing) return existing;
    const queue: NotificationRecord[] = [];
    activeQueues.set(position, queue);
    return queue;
  };

  const createGroupKey = (options: ResolvedNotificationOptions): string =>
    `${options.position}:${options.offset}:${options.zIndex}`;

  const closeStaleGroupRecords = (groupKey: string): void => {
    const existing = containers.get(groupKey);
    if (!existing || existing.isConnected) return;
    containers.delete(groupKey);
    forceCloseRecords([...records.values()].filter(record => record.groupKey === groupKey));
  };

  const getContainer = (groupKey: string, options: ResolvedNotificationOptions): HTMLDivElement => {
    closeStaleGroupRecords(groupKey);
    const existing = containers.get(groupKey);
    if (existing) return existing;

    assertBrowserEnvironment();
    const parent = document.body ?? document.documentElement;
    if (!parent) throw new Error('Notification 服务找不到可用的文档根节点');
    const container = document.createElement('div');
    container.className = `ex-notification-container ex-notification-container--${options.position}`;
    container.dataset.notificationGroup = groupKey;
    Object.assign(container.style, createContainerStyle(options));
    parent.appendChild(container);
    containers.set(groupKey, container);
    stopZIndexWatch ??= watchServiceZIndex(appContext, syncScopedZIndices);
    return container;
  };

  const removeActiveRecord = (record: NotificationRecord): void => {
    const queue = getQueue(record.position);
    const index = queue.indexOf(record);
    if (index >= 0) queue.splice(index, 1);
  };

  const destroyContainerIfEmpty = (groupKey: string): void => {
    const stillUsed = [...records.values()].some(
      record => record.groupKey === groupKey && record.state !== 'destroyed'
    );
    if (stillUsed) return;
    containers.get(groupKey)?.remove();
    containers.delete(groupKey);
    if (records.size === 0) {
      stopZIndexWatch?.();
      stopZIndexWatch = undefined;
    }
  };

  const syncScopedZIndices = (): void => {
    const context = appContext?.provides[CONFIG_PROVIDER_INJECTION_KEY as symbol] as
      ConfigContext | undefined;
    if (!context) return;
    const zIndex = resolveZIndexLayer(context.zIndex.value, 'toast');
    const focused = document.activeElement;
    const restoreFocus =
      focused instanceof HTMLElement &&
      [...records.values()].some(record => record.wrapper.contains(focused));
    const previousGroups = new Set<string>();
    for (const record of records.values()) {
      if (!record.inheritsZIndex || record.options.zIndex === zIndex) continue;
      previousGroups.add(record.groupKey);
      record.options.zIndex = zIndex;
      record.groupKey = createGroupKey(record.options);
      getContainer(record.groupKey, record.options).appendChild(record.wrapper);
      // 更新现有实例，保留通知计时、焦点和关闭回调，不重新挂载。
      record.vnode = cloneVNode(record.vnode, { zIndex });
      render(record.vnode, record.wrapper);
    }
    // 合并到已有组时仍按原始创建顺序排列，显式层级的记录留在原组。
    const positions = new Map<string, number>();
    for (const record of records.values()) {
      const container = containers.get(record.groupKey);
      const index = positions.get(record.groupKey) ?? 0;
      if (container && container.children[index] !== record.wrapper)
        container.insertBefore(record.wrapper, container.children[index] ?? null);
      positions.set(record.groupKey, index + 1);
    }
    previousGroups.forEach(destroyContainerIfEmpty);
    // DOM 迁移会丢失原生焦点；仅恢复被迁移的控件，不覆盖业务主动转移的焦点。
    if (restoreFocus && focused.isConnected && document.activeElement === document.body)
      focused.focus({ preventScroll: true });
  };

  const notifyClose = (record: NotificationRecord): void => {
    if (record.callbackCalled) return;
    record.callbackCalled = true;
    record.options.onClose?.();
  };

  const finalizeRecord = (record: NotificationRecord, invokeClose: boolean): void => {
    if (record.state === 'destroyed') return;
    removeActiveRecord(record);
    record.state = 'destroyed';
    records.delete(record.id);
    render(null, record.wrapper);
    record.wrapper.remove();
    destroyContainerIfEmpty(record.groupKey);
    if (invokeClose) notifyClose(record);
  };

  const forceCloseRecords = (targets: readonly NotificationRecord[]): void => {
    let firstError: unknown;
    for (const record of targets) {
      try {
        finalizeRecord(record, true);
      } catch (error) {
        firstError ??= error;
      }
    }
    if (firstError !== undefined) throw firstError;
  };

  const handleComponentClose = (record: NotificationRecord): void => {
    if (record.state !== 'active') return;
    removeActiveRecord(record);
    record.state = 'closing';
    notifyClose(record);
  };

  const requestClose = (record: NotificationRecord): boolean => {
    if (record.state !== 'active') return false;
    const exposed = record.vnode.component?.exposed as ExNotificationExposed | undefined;
    if (!exposed || !exposed.close()) finalizeRecord(record, true);
    return true;
  };

  const generateId = (): string => {
    let id: string;
    do {
      id = `ex-notification-${Date.now()}-${++seed}`;
    } while (records.has(id));
    return id;
  };

  const enforceLimitBeforeCreate = (position: NotificationPosition): void => {
    const queue = getQueue(position);
    const removeCount = queue.length - globalConfig.maxCount + 1;
    if (removeCount > 0) forceCloseRecords(queue.slice(0, removeCount));
  };

  const createNotification = (
    input: NotificationOptions | NotificationTypedOptions,
    forcedType?: NotificationType
  ): NotificationInstance => {
    assertBrowserEnvironment();
    const options = resolveNotificationOptions(
      input as NotificationOptions,
      resolveScopedConfig(),
      forcedType
    );
    const id = options.id ?? generateId();
    if (records.has(id)) throw new TypeError(`Notification id "${id}" 重复`);
    const groupKey = createGroupKey(options);
    // 外部删除容器时先释放该组旧记录，避免幽灵记录继续占用 maxCount。
    closeStaleGroupRecords(groupKey);
    enforceLimitBeforeCreate(options.position);
    const container = getContainer(groupKey, options);
    const wrapper = document.createElement('div');
    wrapper.className = 'ex-notification-wrapper';
    container.appendChild(wrapper);

    const contentIsVNode = isVNode(options.content);
    const vnode = createVNode(
      ExNotificationComponent,
      {
        id,
        type: options.type,
        title: options.title,
        content: contentIsVNode ? '' : options.content,
        showIcon: options.showIcon,
        closable: options.closable,
        duration: options.duration,
        customClass: options.customClass,
        customStyle: options.customStyle,
        zIndex: options.zIndex,
        offset: options.offset,
        position: options.position,
        dangerouslyUseHTMLString: options.dangerouslyUseHTMLString,
        onClick: options.onClick,
        onClose: () => handleComponentClose(record),
        onDestroy: () => finalizeRecord(record, false),
      },
      contentIsVNode ? { default: () => [options.content as VNode] } : undefined
    );
    if (appContext) vnode.appContext = appContext;

    const record: NotificationRecord = {
      id,
      options: { ...options, id },
      position: options.position,
      groupKey,
      inheritsZIndex: input.zIndex === undefined && !hasExplicitZIndex,
      wrapper,
      vnode,
      state: 'active',
      callbackCalled: false,
      close: () => requestClose(record),
    };
    records.set(id, record);
    getQueue(options.position).push(record);

    try {
      render(vnode, wrapper);
    } catch (error) {
      finalizeRecord(record, false);
      throw error;
    }
    return { id, close: record.close };
  };

  const createTypedNotification =
    (type: NotificationType) =>
    (options: NotificationTypedOptions): NotificationInstance =>
      createNotification(options, type);

  const close = (id: string): boolean => {
    const record = records.get(id);
    return record ? requestClose(record) : false;
  };

  const closeAll = (): void => {
    forceCloseRecords([...records.values()]);
  };

  const config = (options: Partial<NotificationGlobalConfig>): void => {
    globalConfig = resolveNotificationConfig(options, globalConfig);
    if (Object.prototype.hasOwnProperty.call(options, 'zIndex')) hasExplicitZIndex = true;
    for (const queue of activeQueues.values()) {
      const removeCount = queue.length - globalConfig.maxCount;
      if (removeCount > 0) forceCloseRecords(queue.slice(0, removeCount));
    }
  };

  const notificationFunction = (options: NotificationOptions): NotificationInstance =>
    createNotification(options);
  return Object.assign(notificationFunction, {
    info: createTypedNotification('info'),
    success: createTypedNotification('success'),
    warning: createTypedNotification('warning'),
    error: createTypedNotification('error'),
    close,
    closeAll,
    config,
  });
}

/** 直接导入时使用的进程级服务；Vue 插件和 ConfigProvider 均创建隔离实例。 */
export const notification = createNotificationService();

/** 获取最近 ConfigProvider 或当前 Vue App 的 Notification 服务。 */
export function useNotificationService(): NotificationService {
  const scope = useComponentServiceScope();
  if (scope) {
    return scope.getOrCreate(NOTIFICATION_SERVICE_KEY, createNotificationService, service =>
      service.closeAll()
    );
  }
  return inject(NOTIFICATION_SERVICE_KEY, notification);
}

export default notification;
