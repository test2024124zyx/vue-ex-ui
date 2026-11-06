import { describe, expect, it } from 'vitest';
import { calcPopperPosition } from '../../src/utils/popper';

describe('calcPopperPosition', () => {
  it('浮层大于视口时夹取结果不应该变为负坐标', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 320 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 240 });
    const trigger = {
      left: 100,
      right: 140,
      top: 80,
      bottom: 120,
      width: 40,
      height: 40,
      x: 100,
      y: 80,
      toJSON: () => ({}),
    } as DOMRect;

    const result = calcPopperPosition(trigger, { width: 500, height: 400 }, 'bottom', 12);

    expect(result.left).toBe(8);
    expect(result.top).toBe(8);
  });

  it('四个方向应该支持 start、end 与居中对齐', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 800 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 600 });
    const trigger = {
      left: 100,
      right: 140,
      top: 100,
      bottom: 140,
      width: 40,
      height: 40,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    } as DOMRect;

    expect(calcPopperPosition(trigger, { width: 20, height: 10 }, 'top-start', 5)).toMatchObject({
      top: 85,
      left: 100,
      placement: 'top-start',
    });
    expect(calcPopperPosition(trigger, { width: 20, height: 10 }, 'top-end', 5)).toMatchObject({
      top: 85,
      left: 120,
      placement: 'top-end',
    });
    expect(calcPopperPosition(trigger, { width: 20, height: 10 }, 'bottom', 5)).toMatchObject({
      top: 145,
      left: 110,
      placement: 'bottom',
    });
    expect(calcPopperPosition(trigger, { width: 20, height: 10 }, 'left-end', 5)).toMatchObject({
      top: 130,
      left: 75,
      placement: 'left-end',
    });
    expect(calcPopperPosition(trigger, { width: 20, height: 10 }, 'right-start', 5)).toMatchObject({
      top: 100,
      left: 145,
      placement: 'right-start',
    });
  });

  it('未测量浮层不应该触发翻转，非法位置应该回退到 top', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 320 });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 240 });
    const trigger = {
      left: 100,
      right: 140,
      top: 10,
      bottom: 50,
      width: 40,
      height: 40,
      x: 100,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect;
    expect(calcPopperPosition(trigger, { width: 0, height: 0 }, 'unknown', 4)).toMatchObject({
      placement: 'top',
      top: 8,
    });
  });
});
