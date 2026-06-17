import { debounce, throttle } from '../../utils';
import { generateId } from '../../utils/id';

// 重新导出工具函数，保持向后兼容
export { debounce, throttle };

import type {
  LoadingType,
  LoadingSize,
  LoadingPosition,
  LoadingTheme,
  LoadingAnimationConfig,
  LoadingGlobalConfig,
  LoadingStats,
  LoadingPerformanceMonitor,
  ExLoadingProps,
} from './types';

/**
 * 默认动画配置
 */
export const defaultAnimationConfigs: Record<LoadingType, LoadingAnimationConfig> = {
  spinner: {
    duration: 1000,
    easing: 'linear',
    iterationCount: 'infinite',
  },
  dots: {
    duration: 1400,
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
  bars: {
    duration: 1200,
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
  pulse: {
    duration: 2000,
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
  wave: {
    duration: 1500,
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
  neon: {
    duration: 1800,
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
  bounce: {
    duration: 1400,
    easing: 'cubic-bezier(0.445, 0.05, 0.55, 0.95)',
    iterationCount: 'infinite',
  },
  fade: {
    duration: 1600,
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
  flip: {
    duration: 1200,
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
  orbit: {
    duration: 2000,
    easing: 'linear',
    iterationCount: 'infinite',
  },
  ring: {
    duration: 1500,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    iterationCount: 'infinite',
  },
  ripple: {
    duration: 2000,
    easing: 'cubic-bezier(0, 0.2, 0.8, 1)',
    iterationCount: 'infinite',
  },
  square: {
    duration: 1800,
    easing: 'ease-in-out',
    iterationCount: 'infinite',
  },
  custom: {
    duration: 1000,
    easing: 'ease',
    iterationCount: 'infinite',
  },
};

/**
 * 尺寸映射
 */
export const sizeMap: Record<Exclude<LoadingSize, number>, number> = {
  small: 16,
  medium: 24,
  large: 32,
};

/**
 * 获取尺寸值
 */
export function getLoadingSize(size: LoadingSize): number {
  return typeof size === 'number' ? size : sizeMap[size];
}

/**
 * 获取 Loading 类名
 */
export function getLoadingClasses(
  type: LoadingType,
  size: LoadingSize,
  position: LoadingPosition,
  theme: LoadingTheme,
  fullscreen: boolean,
  mask: boolean,
  className?: string
): string[] {
  const classes = [
    'ex-loading',
    `ex-loading--${type}`,
    `ex-loading--${typeof size === 'number' ? 'custom' : size}`,
    `ex-loading--${position}`,
    `ex-loading--${theme}`,
  ];

  if (fullscreen) {
    classes.push('ex-loading--fullscreen');
  }

  if (mask) {
    classes.push('ex-loading--with-mask');
  }

  if (className) {
    classes.push(className);
  }

  return classes;
}

/**
 * 获取动画配置
 */
export function getAnimationConfig(
  type: LoadingType,
  customConfig?: LoadingAnimationConfig
): LoadingAnimationConfig {
  const defaultConfig = defaultAnimationConfigs[type];
  return { ...defaultConfig, ...customConfig };
}

/**
 * 生成唯一 ID
 */
export function generateLoadingId(): string {
  return generateId('loading');
}

/**
 * 获取容器元素
 */
export function getContainer(container?: HTMLElement | string): HTMLElement {
  if (!container) {
    return document.body;
  }

  if (typeof container === 'string') {
    const element = document.querySelector(container) as HTMLElement;
    if (!element) {
      console.warn(`Loading container "${container}" not found, using document.body`);
      return document.body;
    }
    return element;
  }

  return container;
}

/**
 * 创建 Loading 容器
 */
export function createLoadingContainer(
  container: HTMLElement,
  fullscreen: boolean,
  zIndex?: number
): HTMLElement {
  const loadingContainer = document.createElement('div');
  loadingContainer.className = fullscreen
    ? 'ex-loading-container ex-loading-container--fullscreen'
    : 'ex-loading-container';

  if (zIndex !== undefined) {
    loadingContainer.style.zIndex = String(zIndex);
  }

  if (fullscreen) {
    document.body.appendChild(loadingContainer);
  } else {
    // 设置相对定位的容器
    const containerPosition = getComputedStyle(container).position;
    if (containerPosition === 'static') {
      container.style.position = 'relative';
    }
    container.appendChild(loadingContainer);
  }

  return loadingContainer;
}

/**
 * 销毁 Loading 容器
 */
export function destroyLoadingContainer(container: HTMLElement): void {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

/**
 * 锁定滚动
 */
export function lockScroll(): () => void {
  const originalOverflow = document.body.style.overflow;
  const originalPaddingRight = document.body.style.paddingRight;

  // 获取滚动条宽度
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

  document.body.style.overflow = 'hidden';
  if (scrollBarWidth > 0) {
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  }

  // 返回解锁函数
  return () => {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
  };
}

/**
 * 格式化时间
 */
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}:${String(minutes % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  } else if (minutes > 0) {
    return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * 计算百分比
 */
export function calculatePercentage(current: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (current / total) * 100));
}

// debounce 和 throttle 已从 '../../utils' 导入

/**
 * 检查是否支持动画
 */
export function supportsAnimation(): boolean {
  return (
    typeof window !== 'undefined' &&
    'requestAnimationFrame' in window &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * 获取主题颜色
 */
export function getThemeColor(theme: LoadingTheme, customColor?: string): string {
  if (customColor) return customColor;

  switch (theme) {
    case 'light':
      return '#666666';
    case 'dark':
      return '#ffffff';
    case 'auto':
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? '#ffffff' : '#666666';
    default:
      return '#666666';
  }
}

/**
 * 深度合并对象
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * 创建性能监控器
 */
export function createPerformanceMonitor(): LoadingPerformanceMonitor {
  const instances = new Map<string, number>();
  const stats: LoadingStats = {
    activeInstances: 0,
    totalInstances: 0,
    averageDisplayTime: 0,
    maxDisplayTime: 0,
    minDisplayTime: Infinity,
    totalShown: 0,
    totalHidden: 0,
    averageDuration: 0,
  };
  const displayTimes: number[] = [];

  return {
    start(id: string) {
      instances.set(id, Date.now());
      stats.activeInstances++;
      stats.totalInstances++;
    },

    end(id: string) {
      const startTime = instances.get(id);
      if (startTime) {
        const displayTime = Date.now() - startTime;
        displayTimes.push(displayTime);

        stats.activeInstances--;
        stats.maxDisplayTime = Math.max(stats.maxDisplayTime, displayTime);
        stats.minDisplayTime = Math.min(stats.minDisplayTime, displayTime);
        stats.averageDisplayTime = displayTimes.reduce((a, b) => a + b, 0) / displayTimes.length;

        instances.delete(id);
      }
    },

    stop() {
      // 停止所有监控实例
      instances.clear();
      stats.activeInstances = 0;
    },

    getStats() {
      return { ...stats };
    },

    reset() {
      instances.clear();
      displayTimes.length = 0;
      stats.activeInstances = 0;
      stats.totalInstances = 0;
      stats.averageDisplayTime = 0;
      stats.maxDisplayTime = 0;
      stats.minDisplayTime = Infinity;
    },
  };
}

/**
 * 默认全局配置
 */
export const defaultGlobalConfig: LoadingGlobalConfig = {
  defaultType: 'spinner',
  defaultSize: 'medium',
  defaultColor: '#1890ff',
  defaultTheme: 'auto',
  defaultAnimation: defaultAnimationConfigs.spinner,
  presets: [
    {
      name: 'small-spinner',
      config: { type: 'spinner', size: 'small' },
    },
    {
      name: 'large-pulse',
      config: { type: 'pulse', size: 'large' },
    },
    {
      name: 'fullscreen-loading',
      config: { type: 'spinner', fullscreen: true, mask: true },
    },
  ],
  enableGlobalStyles: true,
  cssVariables: {
    '--ex-loading-color': '#1890ff',
    '--ex-loading-bg': 'rgba(255, 255, 255, 0.9)',
    '--ex-loading-mask': 'rgba(0, 0, 0, 0.45)',
  },
};

/**
 * 验证配置
 */
export function validateLoadingConfig(config: Partial<ExLoadingProps>): boolean {
  // 验证尺寸
  if (config.size !== undefined) {
    if (typeof config.size === 'number' && config.size <= 0) {
      console.warn('Loading size must be greater than 0');
      return false;
    }
  }

  // 验证百分比
  if (config.percentage !== undefined) {
    if (config.percentage < 0 || config.percentage > 100) {
      console.warn('Loading percentage must be between 0 and 100');
      return false;
    }
  }

  // 验证持续时间
  if (config.minDuration !== undefined && config.minDuration < 0) {
    console.warn('Loading minDuration must be greater than or equal to 0');
    return false;
  }

  if (config.maxDuration !== undefined && config.maxDuration < 0) {
    console.warn('Loading maxDuration must be greater than or equal to 0');
    return false;
  }

  if (
    config.minDuration !== undefined &&
    config.maxDuration !== undefined &&
    config.minDuration > config.maxDuration
  ) {
    console.warn('Loading minDuration must be less than or equal to maxDuration');
    return false;
  }

  return true;
}

/**
 * 创建 Loading 配置
 */
export function createLoadingConfig(
  options: Partial<ExLoadingProps>,
  globalConfig: LoadingGlobalConfig = defaultGlobalConfig
): ExLoadingProps {
  const config: ExLoadingProps = {
    loading: true,
    type: options.type || globalConfig.defaultType || 'spinner',
    size: options.size || globalConfig.defaultSize || 'medium',
    color: options.color || globalConfig.defaultColor || '#1890ff',
    theme: options.theme || globalConfig.defaultTheme || 'auto',
    position: options.position || 'center',
    fullscreen: options.fullscreen || false,
    mask: options.mask !== undefined ? options.mask : true,
    maskClosable: options.maskClosable || false,
    zIndex: options.zIndex || 1000,
    animation: deepMerge(
      (globalConfig.defaultAnimation || defaultAnimationConfigs.spinner) as Record<string, unknown>,
      (options.animation || {}) as Record<string, unknown>
    ) as LoadingAnimationConfig,
    minDuration: options.minDuration || 0,
    maxDuration: options.maxDuration || 0,
    disableAnimation: options.disableAnimation || false,
    showPercentage: options.showPercentage || false,
    percentage: options.percentage || 0,
    showTime: options.showTime || false,
    cancelable: options.cancelable || false,
    showDetails: options.showDetails || false,
    autoHide: options.autoHide || false,
    autoHideDelay: options.autoHideDelay || 3000,
    lockScroll: options.lockScroll !== undefined ? options.lockScroll : true,
    closable: options.closable || false,
    draggable: options.draggable || false,
    ...options,
  };

  // 验证配置
  if (!validateLoadingConfig(config)) {
    console.warn('Invalid loading configuration, using defaults');
  }

  return config;
}
