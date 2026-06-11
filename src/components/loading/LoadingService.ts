import { createApp, h } from 'vue'
import type { App } from 'vue'
import ExLoading from './ExLoading.vue'
import type { 
  LoadingService,
  LoadingServiceInstance,
  LoadingServiceConfig,
  LoadingGlobalConfig,
  LoadingPerformanceMonitor
} from './types'
import {
  generateLoadingId,
  getContainer,
  createLoadingContainer,
  destroyLoadingContainer,
  createLoadingConfig,
  createPerformanceMonitor,
  defaultGlobalConfig,
  deepMerge
} from './utils'

/**
 * Loading 服务实例管理器
 */
class LoadingInstanceManager {
  private instances: Map<string, LoadingServiceInstance> = new Map()
  private config: LoadingGlobalConfig = { ...defaultGlobalConfig }
  private performanceMonitor: LoadingPerformanceMonitor = createPerformanceMonitor()

  /**
   * 创建 Loading 实例
   */
  createInstance(config: LoadingServiceConfig = {}): LoadingServiceInstance {
    const instanceId = generateLoadingId()
    const loadingConfig = createLoadingConfig(config, this.config)
    
    // 获取目标容器
    const targetContainer = config.target 
      ? getContainer(config.target)
      : document.body

    // 创建 Loading 容器
    const loadingContainer = createLoadingContainer(
      targetContainer,
      loadingConfig.fullscreen || false,
      loadingConfig.zIndex
    )

    // 创建 Vue 应用实例
    const loadingApp = createApp({
      render() {
        return h(ExLoading, {
          ...loadingConfig,
          loading: false, // 初始状态为隐藏
          onShow: () => {
            this.performanceMonitor.start(instanceId)
          },
          onHide: () => {
            this.performanceMonitor.end(instanceId)
          }
        })
      }
    })

    // 挂载应用
    const loadingInstance = loadingApp.mount(loadingContainer)

    // 创建服务实例
    const instance = loadingInstance as { show?: () => void; hide?: () => void; destroy?: () => void; updateConfig?: (config: Partial<LoadingServiceConfig>) => void }
    const serviceInstance: LoadingServiceInstance = {
      show: () => {
        if (instance && typeof instance.show === 'function') {
          instance.show()
        }
      },

      hide: () => {
        if (instance && typeof instance.hide === 'function') {
          instance.hide()
        }
      },

      close: () => {
        this.destroyInstance(instanceId)
      },

      destroy: () => {
        this.destroyInstance(instanceId)
      },

      updateConfig: (newConfig: Partial<LoadingServiceConfig>) => {
        const updatedConfig = createLoadingConfig(
          { ...config, ...newConfig },
          this.config
        )
        
        if (instance && typeof instance.updateConfig === 'function') {
          instance.updateConfig(updatedConfig)
        }
      }
    }

    // 存储实例信息
    this.instances.set(instanceId, serviceInstance)

    // 存储内部信息用于清理
    ;(serviceInstance as LoadingServiceInstance & { _internal?: unknown })._internal = {
      id: instanceId,
      app: loadingApp,
      container: loadingContainer,
      instance: loadingInstance,
      targetContainer
    }

    return serviceInstance
  }

  /**
   * 销毁指定实例
   */
  destroyInstance(instanceId: string): void {
    const serviceInstance = this.instances.get(instanceId)
    
    if (serviceInstance) {
      const internal = (serviceInstance as LoadingServiceInstance & { _internal?: { app?: { unmount: () => void }; container?: HTMLElement; targetContainer?: HTMLElement } })._internal
      
      if (internal) {
        // 卸载 Vue 应用
        if (internal.app) {
          internal.app.unmount()
        }
        
        // 销毁容器
        if (internal.container) {
          destroyLoadingContainer(internal.container)
        }
      }
      
      this.instances.delete(instanceId)
    }
  }

  /**
   * 销毁所有实例
   */
  destroyAllInstances(): void {
    this.instances.forEach((_, instanceId) => {
      this.destroyInstance(instanceId)
    })
    this.instances.clear()
  }

  /**
   * 隐藏所有实例
   */
  hideAllInstances(): void {
    this.instances.forEach((instance) => {
      instance.hide?.()
    })
  }

  /**
   * 获取实例数量
   */
  getInstanceCount(): number {
    return this.instances.size
  }

  /**
   * 更新全局配置
   */
  updateGlobalConfig(newConfig: Partial<LoadingGlobalConfig>): void {
    this.config = deepMerge(this.config as Record<string, unknown>, newConfig as Record<string, unknown>) as LoadingGlobalConfig
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return this.performanceMonitor.getStats()
  }

  /**
   * 重置性能统计
   */
  resetPerformanceStats(): void {
    this.performanceMonitor.reset?.()
  }
}

/**
 * 全局 Loading 实例管理器
 */
let globalManager: LoadingInstanceManager | null = null

/**
 * 获取全局管理器
 */
function getGlobalManager(): LoadingInstanceManager {
  if (!globalManager) {
    globalManager = new LoadingInstanceManager()
  }
  return globalManager
}

/**
 * 创建 Loading 服务
 */
export function createLoadingService(
  globalConfig?: Partial<LoadingGlobalConfig>
): LoadingService {
  const manager = getGlobalManager()
  
  if (globalConfig) {
    manager.updateGlobalConfig(globalConfig)
  }

  return {
    show(config?: LoadingServiceConfig): LoadingServiceInstance {
      const instance = manager.createInstance(config)
      instance.show?.()
      return instance
    },

    hideAll(): void {
      manager.hideAllInstances()
    },

    destroyAll(): void {
      manager.destroyAllInstances()
    },

    getInstanceCount(): number {
      return manager.getInstanceCount()
    }
  }
}

/**
 * 默认 Loading 服务实例
 */
export const loadingService = createLoadingService()

/**
 * 单例 Loading 实例
 */
let singletonInstance: LoadingServiceInstance | null = null

/**
 * 显示单例 Loading
 */
export function showLoading(config?: LoadingServiceConfig): LoadingServiceInstance {
  if (singletonInstance) {
    singletonInstance.destroy?.()
  }
  
  singletonInstance = loadingService.show({
    singleton: true,
    ...config
  })
  
  return singletonInstance
}

/**
 * 隐藏单例 Loading
 */
export function hideLoading(): void {
  if (singletonInstance) {
    singletonInstance.hide?.()
  }
}

/**
 * 销毁单例 Loading
 */
export function destroyLoading(): void {
  if (singletonInstance) {
    singletonInstance.destroy?.()
    singletonInstance = null
  }
}

/**
 * Vue 插件安装函数
 */
export function install(
  app: App, 
  options?: { 
    config?: Partial<LoadingGlobalConfig>
    enableDirective?: boolean
  }
) {
  const service = createLoadingService(options?.config)

  // 注册全局属性
  app.config.globalProperties.$loading = service
  app.config.globalProperties.$showLoading = showLoading
  app.config.globalProperties.$hideLoading = hideLoading

  // 提供注入
  app.provide('loadingService', service)
  app.provide('showLoading', showLoading)
  app.provide('hideLoading', hideLoading)

  // 注册指令
  if (options?.enableDirective !== false) {
    app.directive('loading', {
      mounted(el: HTMLElement, binding) {
        updateLoadingDirective(el, binding.value)
      },
      
      updated(el: HTMLElement, binding) {
        updateLoadingDirective(el, binding.value)
      },
      
      unmounted(el: HTMLElement) {
        const instance = (el as HTMLElement & { _loadingInstance?: LoadingServiceInstance })._loadingInstance
        if (instance) {
          instance.destroy?.()
          delete (el as HTMLElement & { _loadingInstance?: LoadingServiceInstance })._loadingInstance
        }
      }
    })
  }
}

/**
 * 更新 Loading 指令
 */
function updateLoadingDirective(el: HTMLElement, value: boolean | { loading?: boolean; config?: Record<string, unknown> }) {
  const isLoading = typeof value === 'boolean' ? value : value?.loading
  const config = typeof value === 'object' ? value.config : {}
  
  let instance = (el as HTMLElement & { _loadingInstance?: LoadingServiceInstance })._loadingInstance
  
  if (isLoading) {
    if (!instance) {
      instance = loadingService.show({
        target: el,
        fullscreen: false,
        ...config
      })
      ;(el as HTMLElement & { _loadingInstance?: LoadingServiceInstance })._loadingInstance = instance
    } else {
      instance.show?.()
    }
  } else {
    if (instance) {
      instance.hide?.()
    }
  }
}

/**
 * 创建独立的 Loading 管理器
 */
export function createLoadingManager(
  config?: Partial<LoadingGlobalConfig>
): LoadingInstanceManager {
  const manager = new LoadingInstanceManager()
  
  if (config) {
    manager.updateGlobalConfig(config)
  }
  
  return manager
}

export default {
  install,
  loadingService,
  createLoadingService,
  createLoadingManager,
  showLoading,
  hideLoading,
  destroyLoading
}