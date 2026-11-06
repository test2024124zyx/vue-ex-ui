import { debounce } from '../../src/utils/debounce';
import { throttle } from '../../src/utils/throttle';

describe('timing utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounce 使用最后一次参数并保留调用上下文', () => {
    const receiver = {
      total: 0,
      add(this: { total: number }, value: number) {
        this.total += value;
        return this.total;
      },
    };
    const deferred = debounce(receiver.add, 50);

    deferred.call(receiver, 1);
    deferred.call(receiver, 3);
    expect(deferred.pending()).toBe(true);
    expect(receiver.total).toBe(0);

    vi.advanceTimersByTime(50);
    expect(receiver.total).toBe(3);
    expect(deferred.pending()).toBe(false);
  });

  it('debounce 支持取消和立即刷新且不会重复执行', () => {
    const callback = vi.fn((value: number) => value * 2);
    const deferred = debounce(callback, 100);

    deferred(2);
    deferred.cancel();
    vi.advanceTimersByTime(100);
    expect(callback).not.toHaveBeenCalled();

    deferred(4);
    expect(deferred.flush()).toBe(8);
    expect(callback).toHaveBeenCalledOnce();
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledOnce();
  });

  it('throttle 首次立即执行并在窗口结束时使用最新参数', () => {
    const callback = vi.fn();
    const limited = throttle(callback, 100);

    limited('first');
    limited('second');
    limited('latest');

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenLastCalledWith('first');

    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('latest');
  });

  it('throttle 取消后不会执行尾调用，flush 只执行一次', () => {
    const callback = vi.fn((value: string) => value.toUpperCase());
    const limited = throttle(callback, 100);

    limited('first');
    limited('pending');
    limited.cancel();
    vi.advanceTimersByTime(100);
    expect(callback).toHaveBeenCalledTimes(1);

    limited('next');
    limited('flush');
    expect(limited.flush()).toBe('FLUSH');
    vi.runAllTimers();
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('非有限或负延迟按零延迟处理', () => {
    const callback = vi.fn();
    const deferred = debounce(callback, Number.NaN);
    const limited = throttle(callback, -1);

    deferred();
    limited();
    vi.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(2);
  });
});
