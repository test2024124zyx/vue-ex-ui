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
});
