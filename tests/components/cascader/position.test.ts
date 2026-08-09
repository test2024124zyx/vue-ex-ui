import { describe, expect, it } from 'vitest';
import { CASCADER_VIEWPORT_PADDING } from '../../../src/components/cascader/constants';
import { calculateCascaderDropdownPosition } from '../../../src/components/cascader/position';

describe('calculateCascaderDropdownPosition', () => {
  it('应将面板限制在视口水平边界内', () => {
    const position = calculateCascaderDropdownPosition(
      { top: 80, bottom: 120, left: 780, width: 240 },
      200,
      800,
      600
    );

    expect(position.left + position.minWidth).toBeLessThanOrEqual(800 - CASCADER_VIEWPORT_PADDING);
    expect(position.maxWidth).toBe(800 - CASCADER_VIEWPORT_PADDING * 2);
  });

  it('下方空间不足且上方空间更大时应向上展开', () => {
    const position = calculateCascaderDropdownPosition(
      { top: 520, bottom: 560, left: 80, width: 240 },
      240,
      800,
      600
    );

    expect(position.top).toBeLessThan(520);
    expect(position.maxHeight).toBeLessThanOrEqual(300);
  });
});
