import { createVNode, render, type VNode } from 'vue';
import ExLoadingBarComponent from './ExLoadingBar.vue';
import type { LoadingBarOptions, LoadingBarInstance } from './types';

// LoadingBar 实例
let instance: { vnode: VNode; container: HTMLElement } | null = null;
let percentage = 0;
let status: 'loading' | 'success' | 'error' | 'warning' = 'loading';
let timer: number | undefined;
let hideTimer: number | undefined;

// 默认配置
const defaultOptions: Required<LoadingBarOptions> = {
  color: undefined as unknown as string,
  height: 3,
  duration: 3000,
  zIndex: 9999,
};

let currentOptions = { ...defaultOptions };

// 创建 LoadingBar 实例
const createInstance = () => {
  if (instance) return instance;

  const container = document.createElement('div');
  container.className = 'ex-loading-bar-container';
  document.body.appendChild(container);

  const vnode = createVNode(ExLoadingBarComponent, {
    percentage: 0,
    status: 'loading',
    height: currentOptions.height,
    color: currentOptions.color,
    duration: currentOptions.duration,
    zIndex: currentOptions.zIndex,
  });

  render(vnode, container);

  instance = { vnode, container };
  return instance;
};

// 更新实例
const updateInstance = () => {
  if (!instance) return;

  const props = {
    percentage,
    status,
    height: currentOptions.height,
    color: currentOptions.color,
    duration: currentOptions.duration,
    zIndex: currentOptions.zIndex,
  };

  const vnode = createVNode(ExLoadingBarComponent, props);
  render(vnode, instance.container);
  instance.vnode = vnode;
};

// 显示 LoadingBar
const show = () => {
  createInstance();
  updateInstance();
};

// 隐藏 LoadingBar
const hide = () => {
  if (!instance) return;

  // 延迟销毁
  hideTimer = window.setTimeout(() => {
    if (instance) {
      render(null, instance.container);
      if (document.body.contains(instance.container)) {
        document.body.removeChild(instance.container);
      }
      instance = null;
    }
  }, 300);
};

// 清除定时器
const clearTimers = () => {
  if (timer) {
    clearTimeout(timer);
    timer = undefined;
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = undefined;
  }
};

// LoadingBar API
export const loadingBar: LoadingBarInstance & {
  config: (options: LoadingBarOptions) => void;
} = {
  /**
   * 配置 LoadingBar
   */
  config(options: LoadingBarOptions) {
    currentOptions = { ...currentOptions, ...options };
  },

  /**
   * 开始加载
   */
  start() {
    clearTimers();
    percentage = 0;
    status = 'loading';
    show();

    // 模拟进度增长
    const increment = () => {
      if (percentage < 90) {
        const diff = Math.random() * 10;
        percentage = Math.min(percentage + diff, 90);
        updateInstance();
        timer = window.setTimeout(increment, 200);
      }
    };

    increment();
  },

  /**
   * 完成加载
   */
  finish() {
    clearTimers();
    percentage = 100;
    status = 'success';
    updateInstance();

    timer = window.setTimeout(() => {
      hide();
      percentage = 0;
      status = 'loading';
    }, 500);
  },

  /**
   * 加载失败
   */
  error() {
    clearTimers();
    percentage = 100;
    status = 'error';
    updateInstance();

    timer = window.setTimeout(() => {
      hide();
      percentage = 0;
      status = 'loading';
    }, 1500);
  },

  /**
   * 更新进度
   */
  update(value: number) {
    clearTimers();
    percentage = Math.max(0, Math.min(100, value));
    updateInstance();

    if (percentage === 100) {
      this.finish();
    }
  },
};

export default loadingBar;
