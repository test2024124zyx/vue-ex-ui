import { createApp, h, shallowReactive } from 'vue';
import type { App } from 'vue';
import ExLoadingBarComponent from './ExLoadingBar.vue';
import {
  DEFAULT_LOADING_BAR_HEIGHT,
  getNextLoadingBarPercentage,
  INITIAL_LOADING_BAR_PERCENTAGE,
  MAX_TRICKLE_PERCENTAGE,
  mergeLoadingBarOptions,
  normalizeLoadingBarPercentage,
} from './loading-bar-utils';
import type {
  LoadingBarOptions,
  LoadingBarService,
  LoadingBarStatus,
  NormalizedLoadingBarOptions,
} from './types';

const TRICKLE_INTERVAL = 200;
const SUCCESS_HOLD_DURATION = 500;
const TERMINAL_HOLD_DURATION = 1500;
const LEAVE_CLEANUP_DURATION = 200;

interface LoadingBarRenderState extends NormalizedLoadingBarOptions {
  visible: boolean;
  percentage: number;
  status: LoadingBarStatus;
}

class LoadingBarController {
  private app: App<Element> | null = null;
  private host: HTMLDivElement | null = null;
  private options: NormalizedLoadingBarOptions;
  private readonly state: LoadingBarRenderState;
  private trickleTimer: ReturnType<typeof setTimeout> | undefined;
  private terminalTimer: ReturnType<typeof setTimeout> | undefined;
  private cleanupTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(defaults: LoadingBarOptions) {
    this.options = mergeLoadingBarOptions(
      { color: undefined, height: DEFAULT_LOADING_BAR_HEIGHT, zIndex: undefined },
      defaults
    );
    this.state = shallowReactive({
      ...this.options,
      visible: false,
      percentage: 0,
      status: 'loading',
    });
  }

  config(options: LoadingBarOptions): void {
    // 合并函数先完成全部校验，失败时不会产生部分更新。
    const normalized = mergeLoadingBarOptions(this.options, options);
    this.options = normalized;
    Object.assign(this.state, normalized);
  }

  start(): void {
    this.clearTimers();
    if (!this.show('loading', INITIAL_LOADING_BAR_PERCENTAGE)) return;
    this.scheduleTrickle();
  }

  finish(): void {
    this.complete('success', SUCCESS_HOLD_DURATION);
  }

  error(): void {
    this.complete('error', TERMINAL_HOLD_DURATION);
  }

  warning(): void {
    this.complete('warning', TERMINAL_HOLD_DURATION);
  }

  update(value: number): void {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError('LoadingBar percentage 必须是有限数值');
    }

    const percentage = normalizeLoadingBarPercentage(value);
    if (percentage === 100) {
      this.finish();
      return;
    }

    // 手动更新后停止自动推进，避免服务擅自覆盖调用方给出的确定进度。
    this.clearTimers();
    this.show('loading', percentage);
  }

  destroy(): void {
    this.clearTimers();
    this.releaseHost();
    this.resetProgressState();
  }

  private show(status: LoadingBarStatus, percentage: number): boolean {
    this.state.status = status;
    this.state.percentage = percentage;
    this.state.visible = true;

    try {
      if (this.ensureMounted()) return true;
    } catch (error) {
      this.state.visible = false;
      throw error;
    }

    // SSR 或 body 尚不可用时保持无副作用，后续调用仍可正常重试。
    this.state.visible = false;
    return false;
  }

  private complete(status: Exclude<LoadingBarStatus, 'loading'>, holdDuration: number): void {
    this.clearTimers();
    if (!this.show(status, 100)) return;

    this.terminalTimer = setTimeout(() => {
      this.terminalTimer = undefined;
      this.state.visible = false;
      this.cleanupTimer = setTimeout(() => {
        this.cleanupTimer = undefined;
        this.releaseHost();
        this.resetProgressState();
      }, LEAVE_CLEANUP_DURATION);
    }, holdDuration);
  }

  private scheduleTrickle(): void {
    this.trickleTimer = setTimeout(() => {
      this.trickleTimer = undefined;
      if (!this.state.visible || this.state.status !== 'loading') return;

      this.state.percentage = getNextLoadingBarPercentage(this.state.percentage);
      if (this.state.percentage < MAX_TRICKLE_PERCENTAGE) this.scheduleTrickle();
    }, TRICKLE_INTERVAL);
  }

  private ensureMounted(): boolean {
    if (typeof document === 'undefined' || !document.body) return false;

    if (this.app && this.host?.isConnected) return true;
    if (this.app || this.host) this.releaseHost();

    const host = document.createElement('div');
    host.className = 'ex-loading-bar-host';
    host.setAttribute('data-ex-loading-bar-host', '');
    document.body.appendChild(host);

    const app = createApp({
      name: 'ExLoadingBarServiceHost',
      render: () =>
        h(ExLoadingBarComponent, {
          visible: this.state.visible,
          percentage: this.state.percentage,
          status: this.state.status,
          color: this.state.color,
          height: this.state.height,
          zIndex: this.state.zIndex,
        }),
    });

    try {
      app.mount(host);
    } catch (error) {
      host.remove();
      throw error;
    }

    this.app = app;
    this.host = host;
    return true;
  }

  private releaseHost(): void {
    this.app?.unmount();
    this.host?.remove();
    this.app = null;
    this.host = null;
  }

  private resetProgressState(): void {
    this.state.visible = false;
    this.state.percentage = 0;
    this.state.status = 'loading';
    Object.assign(this.state, this.options);
  }

  private clearTimers(): void {
    if (this.trickleTimer !== undefined) clearTimeout(this.trickleTimer);
    if (this.terminalTimer !== undefined) clearTimeout(this.terminalTimer);
    if (this.cleanupTimer !== undefined) clearTimeout(this.cleanupTimer);
    this.trickleTimer = undefined;
    this.terminalTimer = undefined;
    this.cleanupTimer = undefined;
  }
}

/** 创建状态、DOM 与计时器完全隔离的 LoadingBar 服务。 */
export function createLoadingBar(defaults: LoadingBarOptions = {}): LoadingBarService {
  const controller = new LoadingBarController(defaults);

  // 使用闭包保持方法可安全解构调用，同时隐藏控制器内部状态。
  return {
    config: options => controller.config(options),
    start: () => controller.start(),
    finish: () => controller.finish(),
    error: () => controller.error(),
    warning: () => controller.warning(),
    update: percentage => controller.update(percentage),
    destroy: () => controller.destroy(),
  };
}

/** 直接导入时使用的全局单例。 */
export const loadingBar = createLoadingBar();

export default loadingBar;
