import { nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createLoadingBar, loadingBar } from '../../../src/components/loading-bar/loading-bar';
import type { LoadingBarService } from '../../../src/components/loading-bar/types';

const localServices: LoadingBarService[] = [];

const createLocalService = (): LoadingBarService => {
  const service = createLoadingBar();
  localServices.push(service);
  return service;
};

const flush = async (): Promise<void> => {
  await nextTick();
};

const getBar = (): HTMLElement => {
  const element = document.querySelector<HTMLElement>('.ex-loading-bar');
  if (!element) throw new Error('测试预期加载条已经渲染');
  return element;
};

describe('LoadingBar 服务', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    loadingBar.destroy();
    localServices.splice(0).forEach(service => service.destroy());
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('start 创建唯一宿主并以确定性算法自动推进', async () => {
    const service = createLocalService();
    service.start();
    await flush();

    expect(document.querySelectorAll('.ex-loading-bar-host')).toHaveLength(1);
    expect(getBar().attributes).toBeDefined();
    expect(getBar().getAttribute('aria-valuenow')).toBe('4');
    expect(getBar().getAttribute('data-status')).toBe('loading');

    vi.advanceTimersByTime(200);
    await flush();
    expect(Number(getBar().getAttribute('aria-valuenow'))).toBeGreaterThan(4);

    service.start();
    await flush();
    expect(document.querySelectorAll('.ex-loading-bar-host')).toHaveLength(1);
    expect(getBar().getAttribute('aria-valuenow')).toBe('4');
  });

  it('自动推进不会越过等待完成的上限', async () => {
    const service = createLocalService();
    service.start();

    vi.advanceTimersByTime(60_000);
    await flush();
    expect(Number(getBar().getAttribute('aria-valuenow'))).toBeLessThanOrEqual(90);
  });

  it('update 无需 start 也会显示，并规范到 0-100', async () => {
    const service = createLocalService();

    service.update(-20);
    await flush();
    expect(getBar().getAttribute('aria-valuenow')).toBe('0');

    service.update(45.5);
    await flush();
    expect(getBar().getAttribute('aria-valuenow')).toBe('45.5');

    service.update(120);
    await flush();
    expect(getBar().getAttribute('aria-valuenow')).toBe('100');
    expect(getBar().getAttribute('data-status')).toBe('success');
  });

  it.each([
    ['finish', 'success', 500],
    ['error', 'error', 1500],
    ['warning', 'warning', 1500],
  ] as const)('%s 在未 start 时也兑现终态并按时清理', async (method, status, delay) => {
    const service = createLocalService();

    service[method]();
    await flush();
    expect(getBar().getAttribute('aria-valuenow')).toBe('100');
    expect(getBar().getAttribute('data-status')).toBe(status);

    vi.advanceTimersByTime(delay - 1);
    await flush();
    expect(document.querySelector('.ex-loading-bar-host')).not.toBeNull();

    vi.advanceTimersByTime(250);
    await flush();
    expect(document.querySelector('.ex-loading-bar-host')).toBeNull();
  });

  it('重新开始会取消旧终态的隐藏与销毁任务', async () => {
    const service = createLocalService();
    service.finish();
    vi.advanceTimersByTime(400);

    service.start();
    vi.advanceTimersByTime(400);
    await flush();

    expect(getBar().getAttribute('data-status')).toBe('loading');
    expect(document.querySelectorAll('.ex-loading-bar-host')).toHaveLength(1);
  });

  it('config 在首次渲染和运行期间都真实更新视觉配置', async () => {
    const service = createLocalService();
    service.config({ color: '  #ff007f  ', height: 5, zIndex: 1200.9 });
    service.start();
    await flush();

    let style = getBar().getAttribute('style') ?? '';
    expect(style).toContain('--ex-loading-bar-color: #ff007f');
    expect(style).toContain('--ex-loading-bar-height: 5px');
    expect(style).toContain('--ex-loading-bar-z-index: 1200');

    service.config({ color: percentage => (percentage < 50 ? '#00f' : '#0f0'), height: 6 });
    service.update(60);
    await flush();
    style = getBar().getAttribute('style') ?? '';
    expect(style).toContain('--ex-loading-bar-color: #0f0');
    expect(style).toContain('--ex-loading-bar-height: 6px');
  });

  it('非法数值与配置显式报错且不会污染此前配置', async () => {
    const service = createLocalService();
    service.config({ height: 5, color: '#29abe2' });

    expect(() => service.update(Number.NaN)).toThrow(TypeError);
    expect(() => service.update(Number.POSITIVE_INFINITY)).toThrow(TypeError);
    expect(() => service.config({ height: 0 })).toThrow(RangeError);
    expect(() => service.config({ height: 17 })).toThrow(RangeError);
    expect(() => service.config({ zIndex: -1 })).toThrow(RangeError);
    expect(() => service.config({ color: '   ' })).toThrow(TypeError);
    expect(() => service.config({ color: 42 as never })).toThrow(TypeError);

    service.start();
    await flush();
    const style = getBar().getAttribute('style') ?? '';
    expect(style).toContain('--ex-loading-bar-height: 5px');
    expect(style).toContain('--ex-loading-bar-color: #29abe2');
  });

  it('颜色函数异常会清理失败宿主，修正配置后可重试', async () => {
    const service = createLocalService();
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    service.config({
      color: () => {
        throw new Error('配色失败');
      },
    });

    expect(() => service.start()).toThrow('配色失败');
    expect(document.querySelector('.ex-loading-bar-host')).toBeNull();

    service.config({ color: '#29abe2' });
    service.start();
    await flush();
    expect(getBar().getAttribute('style')).toContain('--ex-loading-bar-color: #29abe2');
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('旧 duration、animated、rounded 配置不再进入组件 DOM', async () => {
    const service = createLocalService();
    (service.config as (options: Record<string, unknown>) => void)({
      duration: 1,
      animated: false,
      rounded: true,
    });
    service.start();
    await flush();

    expect(getBar().hasAttribute('duration')).toBe(false);
    expect(getBar().hasAttribute('animated')).toBe(false);
    expect(getBar().hasAttribute('rounded')).toBe(false);
  });

  it('destroy 幂等清理宿主和计时器，之后仍可重新使用', async () => {
    const service = createLocalService();
    service.start();
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    service.destroy();
    service.destroy();
    expect(document.querySelector('.ex-loading-bar-host')).toBeNull();
    expect(vi.getTimerCount()).toBe(0);

    service.start();
    await flush();
    expect(getBar().getAttribute('data-status')).toBe('loading');
  });

  it('工厂创建的多个服务相互隔离', async () => {
    const first = createLocalService();
    const second = createLocalService();
    first.start();
    second.error();
    await flush();

    expect(document.querySelectorAll('.ex-loading-bar-host')).toHaveLength(2);
    first.destroy();
    expect(document.querySelectorAll('.ex-loading-bar-host')).toHaveLength(1);
    expect(getBar().getAttribute('data-status')).toBe('error');
  });

  it('无 DOM 的 SSR 环境中安全保持无副作用', () => {
    const service = createLocalService();
    vi.stubGlobal('document', undefined);

    expect(() => service.start()).not.toThrow();
    expect(() => service.update(50)).not.toThrow();
    expect(() => service.finish()).not.toThrow();
    expect(() => service.error()).not.toThrow();
    expect(() => service.warning()).not.toThrow();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('默认导出单例与独立工厂拥有相同的完整契约', () => {
    expect(loadingBar).toEqual(
      expect.objectContaining({
        config: expect.any(Function),
        start: expect.any(Function),
        finish: expect.any(Function),
        error: expect.any(Function),
        warning: expect.any(Function),
        update: expect.any(Function),
        destroy: expect.any(Function),
      })
    );
    expect(createLoadingBar()).not.toBe(loadingBar);
  });

  it('服务方法可安全解构调用', async () => {
    const service = createLocalService();
    const { start, update, finish, destroy } = service;

    start();
    update(60);
    await flush();
    expect(getBar().getAttribute('aria-valuenow')).toBe('60');
    finish();
    destroy();
    expect(document.querySelector('.ex-loading-bar-host')).toBeNull();
  });
});
