import { describe, expect, it } from 'vitest';
import { calculateSelectDropdownPosition } from '../../../src/components/select/position';
import {
  SELECT_DROPDOWN_GAP,
  SELECT_DROPDOWN_MAX_HEIGHT,
  SELECT_DROPDOWN_OPTIONS_MAX_HEIGHT,
  SELECT_DROPDOWN_VIEWPORT_PADDING,
} from '../../../src/components/select/constants';

describe('Select 下拉定位', () => {
  it('有足够空间时向下展开并保留定位间距', () => {
    const position = calculateSelectDropdownPosition(
      { top: 100, bottom: 140, left: 50, width: 200 },
      120,
      1024,
      768
    );

    expect(position.top).toBe(140 + SELECT_DROPDOWN_GAP);
    expect(position.left).toBe(50);
    expect(position.maxHeight).toBe(SELECT_DROPDOWN_MAX_HEIGHT);
    expect(position.optionsMaxHeight).toBe(SELECT_DROPDOWN_OPTIONS_MAX_HEIGHT);
  });

  it('底部空间不足时向上展开并限制高度', () => {
    const position = calculateSelectDropdownPosition(
      { top: 300, bottom: 340, left: 100, width: 240 },
      320,
      800,
      360
    );

    expect(position.top).toBeGreaterThanOrEqual(SELECT_DROPDOWN_VIEWPORT_PADDING);
    expect(position.maxHeight).toBe(288);
    expect(position.optionsMaxHeight).toBe(268);
    expect(position.top + position.maxHeight).toBeLessThanOrEqual(
      360 - SELECT_DROPDOWN_VIEWPORT_PADDING
    );
  });

  it('触发器靠近右侧时限制浮层左边界和宽度', () => {
    const position = calculateSelectDropdownPosition(
      { top: 20, bottom: 60, left: 780, width: 240 },
      100,
      800,
      600
    );

    expect(position.left).toBe(552);
    expect(position.maxWidth).toBe(784);
    expect(position.width).toBe(240);
  });
});
