import type { AppContext, ComponentInternalInstance, InjectionKey } from 'vue';
import { effectScope, getCurrentInstance, inject, onBeforeUnmount, provide, watch } from 'vue';
import { createDocumentRuntime, createSharedInjectionKey } from '../../utils/shared-runtime';
import { CONFIG_PROVIDER_INJECTION_KEY, type ConfigContext } from './types';

/** 服务容器独立于首次调用组件存活，由容器销毁显式停止配置监听。 */
export function watchServiceZIndex(
  appContext: AppContext | undefined,
  update: () => void
): () => void {
  const config = appContext?.provides[CONFIG_PROVIDER_INJECTION_KEY as symbol] as
    ConfigContext | undefined;
  if (!config) return () => undefined;
  const scope = effectScope(true);
  scope.run(() => watch(config.zIndex, update));
  return () => scope.stop();
}

type ServiceKey = symbol;
type ServiceDisposer = (service: unknown) => void;

interface ServiceRecord {
  service: unknown;
  dispose: ServiceDisposer;
}

/** ConfigProvider 子树内编程式服务共享的生命周期与渲染上下文。 */
export interface ComponentServiceScope {
  getAppContext: () => AppContext;
  getOrCreate: <T>(
    key: ServiceKey,
    create: (appContext: AppContext) => T,
    dispose: (service: T) => void
  ) => T;
  disposeAll: () => void;
}

export const COMPONENT_SERVICE_SCOPE_KEY: InjectionKey<ComponentServiceScope> =
  createSharedInjectionKey('component-service-scope');

const getElementScopes = createDocumentRuntime(
  'component-service-element-scopes',
  () => new WeakMap<HTMLElement, ComponentServiceScope>()
);

/** 原生指令可能来自父组件插槽，通过真实容器补全其最近的配置作用域。 */
export function registerServiceScopeElement(
  element: HTMLElement,
  scope: ComponentServiceScope
): () => void {
  const scopes = getElementScopes();
  scopes.set(element, scope);
  return () => {
    if (scopes.get(element) === scope) scopes.delete(element);
  };
}

export function findElementServiceScope(element: HTMLElement): ComponentServiceScope | null {
  const scopes = getElementScopes();
  let current: HTMLElement | null = element;
  while (current) {
    const scope = scopes.get(current);
    if (scope) return scope;
    current = current.parentElement;
  }
  return null;
}

const createInheritedAppContext = (instance: ComponentInternalInstance): AppContext => ({
  ...instance.appContext,
  // 使用组件实例的 provides，保留最近一层 ConfigProvider，而不是只复制 App 根级 provide。
  provides: (instance as unknown as { provides: AppContext['provides'] }).provides,
});

/** 在 ConfigProvider setup 中创建并托管当前子树的编程式服务。 */
export function provideComponentServiceScope(): ComponentServiceScope {
  const instance = getCurrentInstance();
  if (!instance) throw new Error('组件服务作用域只能在 setup 中创建');

  const records = new Map<ServiceKey, ServiceRecord>();
  const scope: ComponentServiceScope = {
    getAppContext: () => createInheritedAppContext(instance),
    getOrCreate: <T>(
      key: ServiceKey,
      create: (appContext: AppContext) => T,
      dispose: (service: T) => void
    ): T => {
      const existing = records.get(key);
      if (existing) return existing.service as T;

      const service = create(scope.getAppContext());
      records.set(key, {
        service,
        dispose: value => dispose(value as T),
      });
      return service;
    },
    disposeAll: () => {
      let firstError: unknown;
      for (const record of records.values()) {
        try {
          record.dispose(record.service);
        } catch (error) {
          firstError ??= error;
        }
      }
      records.clear();
      if (firstError !== undefined) throw firstError;
    },
  };

  provide(COMPONENT_SERVICE_SCOPE_KEY, scope);
  onBeforeUnmount(scope.disposeAll);
  return scope;
}

/** 返回最近的 ConfigProvider 服务作用域。 */
export function useComponentServiceScope(): ComponentServiceScope | null {
  return inject(COMPONENT_SERVICE_SCOPE_KEY, null);
}
