import { createApp, h, inject, shallowReactive } from 'vue';
import type { App, InjectionKey, Plugin } from 'vue';
import { generateId } from '../../utils/id';
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
export const LOADING_SERVICE_KEY: InjectionKey<LoadingService> = Symbol('ExLoadingService');

class LoadingServiceController implements LoadingService {
  private readonly records = new Map<string, LoadingRecord>();
  private readonly defaults: LoadingServiceDefaults;

  constructor(defaults: LoadingServiceDefaults = {}) {
    this.defaults = { ...defaults };
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
          'onUpdate:visible': (visible: boolean) => {
            state.visible = visible;
          },
          // 动态读取公开方法，使单例包装后的销毁生命周期同样得到通知。
          onClose: () => instance.close(),
        }),
    });

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
export function createLoadingService(defaults: LoadingServiceDefaults = {}): LoadingService {
  return new LoadingServiceController(defaults);
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
  const service = createLoadingService(options.defaults);
  const directiveInstances = new WeakMap<HTMLElement, LoadingServiceInstance>();
  app.config.globalProperties.$loading = service;
  app.provide(LOADING_SERVICE_KEY, service);

  if (options.enableDirective === false) return;

  const updateDirective = (element: HTMLElement, value: LoadingDirectiveValue | undefined) => {
    const binding = normalizeDirectiveValue(value);
    const config: LoadingServiceConfig = {
      ...binding.config,
      target: element,
      fullscreen: false,
    };
    const current = directiveInstances.get(element);

    if (!binding.loading) {
      current?.hide();
      return;
    }

    if (current) {
      current.updateConfig(config);
      current.show();
      return;
    }

    directiveInstances.set(element, service.show(config));
  };

  app.directive<HTMLElement, LoadingDirectiveValue>('loading', {
    mounted: (element, binding) => updateDirective(element, binding.value),
    updated: (element, binding) => updateDirective(element, binding.value),
    unmounted: element => {
      directiveInstances.get(element)?.destroy();
      directiveInstances.delete(element);
    },
  });
};

const LoadingPlugin: Plugin<[LoadingPluginOptions?]> = { install };

export default LoadingPlugin;
