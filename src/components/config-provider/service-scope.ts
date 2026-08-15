import type { AppContext, ComponentInternalInstance, InjectionKey } from 'vue';
import { getCurrentInstance, inject, onBeforeUnmount, provide } from 'vue';

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

export const COMPONENT_SERVICE_SCOPE_KEY: InjectionKey<ComponentServiceScope> = Symbol(
  'exui-component-service-scope'
);

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
