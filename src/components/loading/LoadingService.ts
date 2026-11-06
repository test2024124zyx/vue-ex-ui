import { createApp, h, inject, shallowReactive } from 'vue';
import type { App, AppContext, DirectiveBinding, InjectionKey, Plugin } from 'vue';
import { createSharedInjectionKey } from '../../utils/shared-runtime';
import { generateId } from '../../utils/id';
import {
  COMPONENT_SERVICE_SCOPE_KEY,
  findElementServiceScope,
  useComponentServiceScope,
} from '../config-provider/service-scope';
import type { ComponentServiceScope } from '../config-provider/service-scope';
import { CONFIG_PROVIDER_INJECTION_KEY } from '../config-provider/types';
import type { ConfigContext } from '../config-provider/types';
import { resolveZIndexLayer } from '../config-provider/z-index';
import ExLoading from './ExLoading.vue';
import { resolveLoadingTarget } from './loading-utils';
import type {
  ExLoadingProps,
  LoadingDirectiveValue,
  LoadingPluginOptions,
  LoadingService,
  LoadingServiceConfig,
  LoadingServiceDefaults,
  LoadingServiceInstance,
} from './types';

interface LoadingRenderState extends ExLoadingProps {
  visible: boolean;
}

interface LoadingRecord {
  app: App<Element>;
  config: LoadingServiceConfig;
  destroyed: boolean;
  instance: LoadingServiceInstance;
  state: LoadingRenderState;
}

/** 当前应用 Loading 服务的注入键。 */
export const LOADING_SERVICE_KEY: InjectionKey<LoadingService> =
  createSharedInjectionKey('loading-service');
const DIRECTIVE_SERVICE_KEY = createSharedInjectionKey<LoadingService>('loading-directive-service');

class LoadingServiceController implements LoadingService {
  private readonly records = new Map<string, LoadingRecord>();
  private readonly defaults: LoadingServiceDefaults;
  private readonly appContext: AppContext | undefined;

  constructor(defaults: LoadingServiceDefaults = {}, appContext?: AppContext) {
    this.defaults = { ...defaults };
    this.appContext = appContext;
  }

  private resolveScopedZIndex(): number | undefined {
    const config = this.appContext?.provides[CONFIG_PROVIDER_INJECTION_KEY as symbol] as
      ConfigContext | undefined;
    return config ? resolveZIndexLayer(config.zIndex.value, 'loading') : undefined;
  }

  private normalizeConfig(config: LoadingServiceConfig): LoadingServiceConfig {
    const merged: LoadingServiceConfig = { ...this.defaults, ...config };
    const hasTarget = merged.target !== undefined;
    const target = hasTarget ? resolveLoadingTarget(merged.target) : null;

    if (hasTarget && !target) {
      throw new TypeError('Loading target 必须是当前文档中的 HTMLElement 或有效选择器');
    }
    if (!target && merged.fullscreen === false) {
      throw new TypeError('LoadingService 的非全屏实例必须提供 target');
    }

    // 只传递组件真实实现的字段，阻断旧版伪配置继续落到 DOM。
    return {
      type: merged.type,
      size: merged.size,
      text: merged.text,
      color: merged.color,
      fullscreen: target ? false : true,
      mask: merged.mask ?? true,
      maskClosable: merged.maskClosable ?? false,
      target: target ?? undefined,
      zIndex: merged.zIndex,
      lockScroll: merged.lockScroll ?? true,
    };
  }

  show(config: LoadingServiceConfig = {}): LoadingServiceInstance {
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
      throw new Error('Loading 服务只能在浏览器环境中创建实例');
    }
    const normalized = this.normalizeConfig(config);
    const id = generateId('loading');
    const state = shallowReactive<LoadingRenderState>({
      ...normalized,
      visible: false,
    });
    const mountElement = document.createElement('div');
    const record = {} as LoadingRecord;

    const destroyRecord = (): void => {
      if (record.destroyed) return;
      record.destroyed = true;
      record.state.visible = false;
      record.app.unmount();
      this.records.delete(id);
    };

    const instance: LoadingServiceInstance = {
      show: () => {
        if (!record.destroyed) record.state.visible = true;
      },
      hide: () => {
        if (!record.destroyed) record.state.visible = false;
      },
      close: destroyRecord,
      destroy: destroyRecord,
      updateConfig: nextConfig => {
        if (record.destroyed) return;
        const candidate = { ...record.config, ...nextConfig };
        const next = this.normalizeConfig(candidate);
        record.config = candidate;
        Object.assign(record.state, next);
      },
    };

    const app = createApp({
      name: 'ExLoadingServiceHost',
      render: () =>
        h(ExLoading, {
          ...state,
          zIndex: state.zIndex ?? this.resolveScopedZIndex(),
          'onUpdate:visible': (visible: boolean) => {
            state.visible = visible;
          },
          // 动态读取公开方法，使单例包装后的销毁生命周期同样得到通知。
          onClose: () => instance.close(),
        }),
    });

    if (this.appContext) {
      app._context.provides = Object.create(this.appContext.provides) as AppContext['provides'];
    }

    Object.assign(record, {
      app,
      config: { ...config },
      destroyed: false,
      instance,
      state,
    });
    this.records.set(id, record);
    app.mount(mountElement);
    instance.show();
    return instance;
  }

  hideAll(): void {
    this.records.forEach(record => record.instance.hide());
  }

  destroyAll(): void {
    Array.from(this.records.values()).forEach(record => record.instance.destroy());
  }

  getInstanceCount(): number {
    return this.records.size;
  }
}

/** 创建拥有独立实例集合的 Loading 服务。 */
export function createLoadingService(
  defaults: LoadingServiceDefaults = {},
  appContext?: AppContext
): LoadingService {
  return new LoadingServiceController(defaults, appContext);
}

export const loadingService = createLoadingService();

let singletonInstance: LoadingServiceInstance | null = null;

const trackSingletonLifecycle = (instance: LoadingServiceInstance): LoadingServiceInstance => {
  const originalDestroy = instance.destroy;
  const destroy = (): void => {
    originalDestroy();
    if (singletonInstance === instance) singletonInstance = null;
  };
  instance.close = destroy;
  instance.destroy = destroy;
  return instance;
};

/** 显示或更新全局单例 Loading。 */
export function showLoading(config: LoadingServiceConfig = {}): LoadingServiceInstance {
  if (singletonInstance) {
    singletonInstance.updateConfig(config);
    singletonInstance.show();
    return singletonInstance;
  }

  singletonInstance = trackSingletonLifecycle(loadingService.show(config));
  return singletonInstance;
}

export function hideLoading(): void {
  singletonInstance?.hide();
}

export function destroyLoading(): void {
  singletonInstance?.destroy();
  singletonInstance = null;
}

/** 获取当前应用注入的服务；未安装插件时回退为默认服务。 */
export function useLoadingService(): LoadingService {
  const scope = useComponentServiceScope();
  if (scope) {
    return scope.getOrCreate(
      LOADING_SERVICE_KEY,
      appContext => createLoadingService({}, appContext),
      service => service.destroyAll()
    );
  }
  return inject(LOADING_SERVICE_KEY, loadingService);
}

const normalizeDirectiveValue = (
  value: LoadingDirectiveValue | undefined
): { loading: boolean; config: LoadingServiceConfig } => {
  if (typeof value === 'boolean') return { loading: value, config: {} };
  return {
    loading: value?.loading === true,
    config: value?.config ?? {},
  };
};

export const install: Plugin<[LoadingPluginOptions?]>['install'] = (app, options = {}) => {
  const service = createLoadingService(options.defaults, app._context);
  const directiveInstances = new WeakMap<HTMLElement, LoadingServiceInstance>();
  const directiveScopes = new WeakMap<HTMLElement, ComponentServiceScope | null>();
  app.config.globalProperties.$loading = service;
  app.provide(LOADING_SERVICE_KEY, service);
  app.onUnmount(() => service.destroyAll());

  if (options.enableDirective === false) return;

  const updateDirective = (
    element: HTMLElement,
    directive: DirectiveBinding<LoadingDirectiveValue>
  ) => {
    const binding = normalizeDirectiveValue(directive.value);
    const owner = directive.instance?.$ as unknown as
      { provides?: AppContext['provides'] } | undefined;
    const scope =
      findElementServiceScope(element) ??
      (owner?.provides?.[COMPONENT_SERVICE_SCOPE_KEY as symbol] as
        ComponentServiceScope | undefined) ??
      null;
    const config: LoadingServiceConfig = {
      ...binding.config,
      target: element,
      fullscreen: false,
    };
    let current = directiveInstances.get(element);
    if (current && directiveScopes.get(element) !== scope) {
      current.destroy();
      current = undefined;
    }

    if (!binding.loading) {
      current?.hide();
      return;
    }

    if (current) {
      current.updateConfig(config);
      current.show();
      return;
    }

    const scopedService = scope
      ? scope.getOrCreate(
          DIRECTIVE_SERVICE_KEY,
          context => createLoadingService(options.defaults, context),
          scoped => scoped.destroyAll()
        )
      : service;
    const instance = scopedService.show(config);
    // 遮罩关闭也会销毁服务实例，弱引用表必须同步移除，才能再次创建。
    const forget = () => {
      if (directiveInstances.get(element) === instance) {
        directiveInstances.delete(element);
        directiveScopes.delete(element);
      }
    };
    const close = instance.close;
    const destroy = instance.destroy;
    instance.close = () => {
      forget();
      close();
    };
    instance.destroy = () => {
      forget();
      destroy();
    };
    directiveInstances.set(element, instance);
    directiveScopes.set(element, scope);
  };

  app.directive<HTMLElement, LoadingDirectiveValue>('loading', {
    mounted: updateDirective,
    updated: updateDirective,
    unmounted: element => {
      directiveInstances.get(element)?.destroy();
      directiveInstances.delete(element);
      directiveScopes.delete(element);
    },
  });
};

const LoadingPlugin: Plugin<[LoadingPluginOptions?]> = { install };

export default LoadingPlugin;
