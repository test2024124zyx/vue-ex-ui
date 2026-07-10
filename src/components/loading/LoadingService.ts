import { createApp, h, reactive } from 'vue';
import type { App } from 'vue';
import ExLoading from './ExLoading.vue';
import type {
  LoadingService,
  LoadingServiceInstance,
  LoadingServiceConfig,
  LoadingGlobalConfig,
  LoadingPerformanceMonitor,
} from './types';
import {
  generateLoadingId,
  createLoadingConfig,
  createPerformanceMonitor,
  defaultGlobalConfig,
  deepMerge,
  lockScroll,
} from './utils';

/**
 * Loading 服务实例管理器
 */
class LoadingInstanceManager {
  private instances: Map<string, LoadingServiceInstance> = new Map();
  private config: LoadingGlobalConfig = { ...defaultGlobalConfig };
  private performanceMonitor: LoadingPerformanceMonitor = createPerformanceMonitor();

  /**
   * 创建 Loading 实例
   */
  createInstance(config: LoadingServiceConfig = {}): LoadingServiceInstance {
    const instanceId = generateLoadingId();
    const loadingConfig = createLoadingConfig(config, this.config);

    // 无 target 时默认全屏；指定 target 时定位到目标容器内
    // 注意：以原始 config 判断，loadingConfig 经过 createLoadingConfig 已把 fullscreen 默认为 false
    const hasTarget = !!config.target;
    const fullscreen = hasTarget ? false : config.fullscreen !== false;

    // 挂载点脱离文档流，ExLoading 通过自身的 Teleport 就位（target / body）
    const mountEl = document.createElement('div');

    // 响应式配置：show/hide/updateConfig 直接驱动 ExLoading 的 visible 与其它属性
    const state = reactive<Record<string, unknown>>({
      ...loadingConfig,
      fullscreen,
      target: config.target,
      visible: false,
    });
    // 避免把 service 专属字段当作未知属性透传到 DOM
    delete state.singleton;

    // 全屏遮罩时锁定页面滚动（带滚动条补偿），隐藏/销毁时解锁
    let releaseScroll: (() => void) | null = null;
    const lock = (): void => {
      if (fullscreen && loadingConfig.lockScroll !== false && !releaseScroll) {
        releaseScroll = lockScroll();
      }
    };
    const unlock = (): void => {
      releaseScroll?.();
      releaseScroll = null;
    };

    // 创建 Vue 应用实例
    const loadingApp = createApp({
      render: () =>
        h(ExLoading, {
          ...state,
          'onUpdate:visible': (v: boolean) => {
            (state as { visible: boolean }).visible = v;
            if (!v) unlock();
          },
        }),
    });

    loadingApp.mount(mountEl);

    // 性能监控：显示/隐藏计时
    const monitor = this.performanceMonitor;

    const serviceInstance: LoadingServiceInstance = {
      show: () => {
        if (!(state as { visible: boolean }).visible) monitor.start(instanceId);
        (state as { visible: boolean }).visible = true;
        lock();
      },

      hide: () => {
        if ((state as { visible: boolean }).visible) monitor.end(instanceId);
        (state as { visible: boolean }).visible = false;
        unlock();
      },

      close: () => {
        this.destroyInstance(instanceId);
      },

      destroy: () => {
        this.destroyInstance(instanceId);
      },

      updateConfig: (newConfig: Partial<LoadingServiceConfig>) => {
        const merged = createLoadingConfig({ ...config, ...newConfig }, this.config);
        // fullscreen / target 在创建后固定，避免 updateConfig 误改定位方式
        Object.assign(state, merged, { fullscreen, target: config.target });
        delete state.singleton;
      },
    };

    // 存储实例信息
    this.instances.set(instanceId, serviceInstance);

    // 存储内部信息用于清理
    (serviceInstance as LoadingServiceInstance & { _internal?: unknown })._internal = {
      id: instanceId,
      app: loadingApp,
      mountEl,
      unlock,
    };

    return serviceInstance;
  }

  /**
   * 销毁指定实例
   */
  destroyInstance(instanceId: string): void {
    const serviceInstance = this.instances.get(instanceId);

    if (serviceInstance) {
      const internal = (
        serviceInstance as LoadingServiceInstance & {
          _internal?: { app?: { unmount: () => void }; unlock?: () => void };
        }
      )._internal;

      if (internal) {
        // 解锁滚动并卸载 Vue 应用（挂载点脱离文档，无需手动移除）
        internal.unlock?.();
        if (internal.app) {
          internal.app.unmount();
        }
      }

      this.instances.delete(instanceId);
    }
  }

  /**
   * 销毁所有实例
   */
  destroyAllInstances(): void {
    this.instances.forEach((_, instanceId) => {
      this.destroyInstance(instanceId);
    });
    this.instances.clear();
  }

  /**
   * 隐藏所有实例
   */
  hideAllInstances(): void {
    this.instances.forEach(instance => {
      instance.hide?.();
    });
  }

  /**
   * 获取实例数量
   */
  getInstanceCount(): number {
    return this.instances.size;
  }

  /**
   * 更新全局配置
   */
  updateGlobalConfig(newConfig: Partial<LoadingGlobalConfig>): void {
    this.config = deepMerge(
      this.config as Record<string, unknown>,
      newConfig as Record<string, unknown>
    ) as LoadingGlobalConfig;
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return this.performanceMonitor.getStats();
  }

  /**
   * 重置性能统计
   */
  resetPerformanceStats(): void {
    this.performanceMonitor.reset?.();
  }
}

/**
 * 全局 Loading 实例管理器
 */
let globalManager: LoadingInstanceManager | null = null;

/**
 * 获取全局管理器
 */
function getGlobalManager(): LoadingInstanceManager {
  if (!globalManager) {
    globalManager = new LoadingInstanceManager();
  }
  return globalManager;
}

/**
 * 创建 Loading 服务
 */
export function createLoadingService(globalConfig?: Partial<LoadingGlobalConfig>): LoadingService {
  const manager = getGlobalManager();

  if (globalConfig) {
    manager.updateGlobalConfig(globalConfig);
  }

  return {
    show(config?: LoadingServiceConfig): LoadingServiceInstance {
      const instance = manager.createInstance(config);
      instance.show?.();
      return instance;
    },

    hideAll(): void {
      manager.hideAllInstances();
    },

    destroyAll(): void {
      manager.destroyAllInstances();
    },

    getInstanceCount(): number {
      return manager.getInstanceCount();
    },
  };
}

/**
 * 默认 Loading 服务实例
 */
export const loadingService = createLoadingService();

/**
 * 单例 Loading 实例
 */
let singletonInstance: LoadingServiceInstance | null = null;

/**
 * 显示单例 Loading
 */
export function showLoading(config?: LoadingServiceConfig): LoadingServiceInstance {
  if (singletonInstance) {
    singletonInstance.destroy?.();
  }

  singletonInstance = loadingService.show({
    singleton: true,
    ...config,
  });

  return singletonInstance;
}

/**
 * 隐藏单例 Loading
 */
export function hideLoading(): void {
  if (singletonInstance) {
    singletonInstance.hide?.();
  }
}

/**
 * 销毁单例 Loading
 */
export function destroyLoading(): void {
  if (singletonInstance) {
    singletonInstance.destroy?.();
    singletonInstance = null;
  }
}

/**
 * Vue 插件安装函数
 */
export function install(
  app: App,
  options?: {
    config?: Partial<LoadingGlobalConfig>;
    enableDirective?: boolean;
  }
) {
  const service = createLoadingService(options?.config);

  // 注册全局属性
  app.config.globalProperties.$loading = service;
  app.config.globalProperties.$showLoading = showLoading;
  app.config.globalProperties.$hideLoading = hideLoading;

  // 提供注入
  app.provide('loadingService', service);
  app.provide('showLoading', showLoading);
  app.provide('hideLoading', hideLoading);

  // 注册指令
  if (options?.enableDirective !== false) {
    app.directive('loading', {
      mounted(el: HTMLElement, binding) {
        updateLoadingDirective(el, binding.value);
      },

      updated(el: HTMLElement, binding) {
        updateLoadingDirective(el, binding.value);
      },

      unmounted(el: HTMLElement) {
        const instance = (el as HTMLElement & { _loadingInstance?: LoadingServiceInstance })
          ._loadingInstance;
        if (instance) {
          instance.destroy?.();
          delete (el as HTMLElement & { _loadingInstance?: LoadingServiceInstance })
            ._loadingInstance;
        }
      },
    });
  }
}

/**
 * 更新 Loading 指令
 */
function updateLoadingDirective(
  el: HTMLElement,
  value: boolean | { loading?: boolean; config?: Record<string, unknown> }
) {
  const isLoading = typeof value === 'boolean' ? value : value?.loading;
  const config = typeof value === 'object' ? value.config : {};

  let instance = (el as HTMLElement & { _loadingInstance?: LoadingServiceInstance })
    ._loadingInstance;

  if (isLoading) {
    if (!instance) {
      instance = loadingService.show({
        target: el,
        fullscreen: false,
        ...config,
      });
      (el as HTMLElement & { _loadingInstance?: LoadingServiceInstance })._loadingInstance =
        instance;
    } else {
      instance.show?.();
    }
  } else {
    if (instance) {
      instance.hide?.();
    }
  }
}

/**
 * 创建独立的 Loading 管理器
 */
export function createLoadingManager(
  config?: Partial<LoadingGlobalConfig>
): LoadingInstanceManager {
  const manager = new LoadingInstanceManager();

  if (config) {
    manager.updateGlobalConfig(config);
  }

  return manager;
}

export default {
  install,
  loadingService,
  createLoadingService,
  createLoadingManager,
  showLoading,
  hideLoading,
  destroyLoading,
};
