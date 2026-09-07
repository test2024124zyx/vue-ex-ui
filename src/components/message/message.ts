import { createVNode, inject, render } from 'vue';
import type { AppContext, InjectionKey, VNode } from 'vue';
import { createSharedInjectionKey } from '../../utils/shared-runtime';
import { useComponentServiceScope } from '../config-provider/service-scope';
import { CONFIG_PROVIDER_INJECTION_KEY } from '../config-provider/types';
import type { ConfigContext } from '../config-provider/types';
import { resolveZIndexLayer } from '../config-provider/z-index';
import ExMessageComponent from './ExMessage.vue';
import { resolveMessageConfig, resolveMessageOptions } from './message-utils';
import type { ResolvedMessageOptions } from './message-utils';
import type {
  ExMessageExposed,
  MessageGlobalConfig,
  MessageInput,
  MessageInstance,
  MessageService,
  MessageType,
  MessageTypedInput,
} from './types';

const DEFAULT_CONFIG: MessageGlobalConfig = {
  duration: 3000,
  offset: 20,
  zIndex: 2000,
  maxCount: 5,
  showIcon: true,
  closable: false,
  grouping: false,
};

interface MessageRecord {
  id: string;
  options: ResolvedMessageOptions;
  wrapper: HTMLDivElement;
  vnode: VNode;
  state: 'active' | 'closing' | 'destroyed';
  callbackCalled: boolean;
  close: () => boolean;
}

/** 当前 Vue App 的 Message 服务注入键。 */
export const MESSAGE_SERVICE_KEY: InjectionKey<MessageService> =
  createSharedInjectionKey('message-service');

/** 创建队列、配置、DOM 与回调生命周期完全隔离的 Message 服务。 */
export function createMessageService(appContext?: AppContext): MessageService {
  let globalConfig: MessageGlobalConfig = { ...DEFAULT_CONFIG };
  let messageContainer: HTMLDivElement | null = null;
  let seed = 0;
  const activeQueue: MessageRecord[] = [];
  const records = new Set<MessageRecord>();

  const assertBrowserEnvironment = (): void => {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
      throw new Error('Message 服务只能在浏览器环境中创建消息');
    }
  };

  const resolveScopedZIndex = (): number | null => {
    const config = appContext?.provides[CONFIG_PROVIDER_INJECTION_KEY as symbol] as
      ConfigContext | undefined;
    return config ? resolveZIndexLayer(config.zIndex.value, 'toast') : null;
  };

  const resolveContainerZIndex = (): string => {
    if (globalConfig.zIndex !== DEFAULT_CONFIG.zIndex) return String(globalConfig.zIndex);
    const scopedZIndex = resolveScopedZIndex();
    return scopedZIndex === null
      ? `var(--ex-z-toast, ${DEFAULT_CONFIG.zIndex})`
      : String(scopedZIndex);
  };

  const updateContainerStyle = (): void => {
    if (!messageContainer) return;
    const zIndex = resolveContainerZIndex();
    messageContainer.style.setProperty('--ex-message-offset', `${globalConfig.offset}px`);
    messageContainer.style.setProperty('--ex-message-z-index', zIndex);
    messageContainer.style.zIndex = zIndex;
  };

  const removeActiveRecord = (record: MessageRecord): void => {
    const index = activeQueue.indexOf(record);
    if (index >= 0) activeQueue.splice(index, 1);
  };

  const destroyContainerIfEmpty = (): void => {
    if (!messageContainer || records.size > 0) return;
    messageContainer.remove();
    messageContainer = null;
  };

  const notifyClose = (record: MessageRecord): void => {
    if (record.callbackCalled) return;
    record.callbackCalled = true;
    record.options.onClose?.();
  };

  const finalizeRecord = (record: MessageRecord, invokeClose: boolean): void => {
    if (record.state === 'destroyed') return;
    removeActiveRecord(record);
    record.state = 'destroyed';
    records.delete(record);
    render(null, record.wrapper);
    record.wrapper.remove();
    destroyContainerIfEmpty();
    if (invokeClose) notifyClose(record);
  };

  const forceCloseRecords = (targets: readonly MessageRecord[]): void => {
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

  const handleComponentClose = (record: MessageRecord): void => {
    if (record.state !== 'active') return;
    removeActiveRecord(record);
    record.state = 'closing';
    notifyClose(record);
  };

  const requestClose = (record: MessageRecord): boolean => {
    if (record.state !== 'active') return false;
    const exposed = record.vnode.component?.exposed as ExMessageExposed | undefined;
    if (!exposed || !exposed.close()) finalizeRecord(record, true);
    return true;
  };

  const closeStaleRecords = (): void => {
    if (!messageContainer || messageContainer.isConnected) return;
    messageContainer = null;
    forceCloseRecords([...records]);
  };

  const getContainer = (): HTMLDivElement => {
    assertBrowserEnvironment();
    closeStaleRecords();
    if (messageContainer) return messageContainer;

    const parent = document.body ?? document.documentElement;
    if (!parent) throw new Error('Message 服务找不到可用的文档根节点');
    messageContainer = document.createElement('div');
    messageContainer.className = 'ex-message-container';
    updateContainerStyle();
    parent.appendChild(messageContainer);
    return messageContainer;
  };

  const findGroupedMessage = (options: ResolvedMessageOptions): MessageRecord | undefined => {
    if (!options.grouping) return undefined;
    return activeQueue.find(
      record => record.options.type === options.type && record.options.content === options.content
    );
  };

  const enforceLimitBeforeCreate = (): void => {
    const removeCount = activeQueue.length - globalConfig.maxCount + 1;
    if (removeCount > 0) forceCloseRecords(activeQueue.slice(0, removeCount));
  };

  const createMessage = (
    input: MessageInput | MessageTypedInput,
    forcedType?: MessageType
  ): MessageInstance => {
    const options = resolveMessageOptions(input, globalConfig, forcedType);
    assertBrowserEnvironment();
    closeStaleRecords();

    const grouped = findGroupedMessage(options);
    if (grouped) return { id: grouped.id, close: grouped.close };
    enforceLimitBeforeCreate();

    const id = `ex-message-${Date.now()}-${++seed}`;
    const container = getContainer();
    const wrapper = document.createElement('div');
    wrapper.className = 'ex-message-wrapper';
    container.appendChild(wrapper);

    const vnode = createVNode(ExMessageComponent, {
      type: options.type,
      content: options.content,
      showIcon: options.showIcon,
      closable: options.closable,
      duration: options.duration,
      class: options.class,
      style: options.style,
      dangerouslyUseHTMLString: options.dangerouslyUseHTMLString,
      onClose: () => handleComponentClose(record),
      onDestroy: () => finalizeRecord(record, false),
    });
    if (appContext) vnode.appContext = appContext;

    const record: MessageRecord = {
      id,
      options,
      wrapper,
      vnode,
      state: 'active',
      callbackCalled: false,
      close: () => requestClose(record),
    };

    activeQueue.push(record);
    records.add(record);
    try {
      render(vnode, wrapper);
    } catch (error) {
      finalizeRecord(record, false);
      throw error;
    }

    return { id, close: record.close };
  };

  const createTypedMessage =
    (type: MessageType) =>
    (input: MessageTypedInput): MessageInstance =>
      createMessage(input, type);

  const close = (id: string): boolean => {
    const record = activeQueue.find(item => item.id === id);
    return record ? requestClose(record) : false;
  };

  const closeAll = (): void => {
    forceCloseRecords([...records]);
  };

  const config = (options: Partial<MessageGlobalConfig>): void => {
    globalConfig = resolveMessageConfig(options, globalConfig);
    updateContainerStyle();

    const removeCount = activeQueue.length - globalConfig.maxCount;
    if (removeCount > 0) forceCloseRecords(activeQueue.slice(0, removeCount));
  };

  const messageFunction = (input: MessageInput): MessageInstance => createMessage(input);
  return Object.assign(messageFunction, {
    info: createTypedMessage('info'),
    success: createTypedMessage('success'),
    warning: createTypedMessage('warning'),
    error: createTypedMessage('error'),
    loading: createTypedMessage('loading'),
    close,
    closeAll,
    config,
  });
}

/** 直接导入时使用的进程级服务；Vue 插件和 ConfigProvider 均创建隔离实例。 */
export const message = createMessageService();

/** 获取最近 ConfigProvider 或当前 Vue App 的 Message 服务。 */
export function useMessageService(): MessageService {
  const scope = useComponentServiceScope();
  if (scope) {
    return scope.getOrCreate(MESSAGE_SERVICE_KEY, createMessageService, service =>
      service.closeAll()
    );
  }
  return inject(MESSAGE_SERVICE_KEY, message);
}

export default message;
