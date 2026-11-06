import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getPositionStyle,
  getScrollInfo,
  resolveTarget,
  scrollToPosition,
} from '../../../src/components/back-top/utils';

afterEach(() => vi.restoreAllMocks());

describe('返回顶部滚动事务', () => {
  it('自定义平滑滚动完成后落在目标位置，并移除中止监听', async () => {
    let frame: FrameRequestCallback | undefined;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      frame = callback;
      return 1;
    });
    vi.spyOn(performance, 'now').mockReturnValue(100);
    const target = document.createElement('div');
    target.scrollTop = 200;
    const controller = new AbortController();
    const remove = vi.spyOn(controller.signal, 'removeEventListener');
    const result = scrollToPosition(target, 30, 'smooth', 100, controller.signal);
    frame!(150);
    expect(target.scrollTop).toBeGreaterThan(30);
    expect(target.scrollTop).toBeLessThan(200);
    frame!(200);
    expect(await result).toBe(true);
    expect(target.scrollTop).toBe(30);
    expect(remove).toHaveBeenCalledWith('abort', expect.any(Function));
  });

  it('提前取消不启动帧，即时滚动允许目标容器没有可滚动高度', async () => {
    const target = document.createElement('div');
    const controller = new AbortController();
    controller.abort();
    expect(await scrollToPosition(target, 10, 'smooth', 100, controller.signal)).toBe(false);
    expect(await scrollToPosition(target, 10, 'auto', 0)).toBe(true);
    expect(getScrollInfo(target).scrollPercent).toBe(0);
    expect(
      resolveTarget(() => {
        throw new Error('尚未挂载');
      })
    ).toBe(window);
    expect(resolveTarget(target)).toBe(target);
    expect(getPositionStyle('top-right', { top: 8, right: '2rem' })).toMatchObject({
      top: '8px',
      right: '2rem',
    });
  });
});
