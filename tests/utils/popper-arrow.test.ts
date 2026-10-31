import { describe, expect, it } from 'vitest';
import { calcPopperArrowStyle } from '../../src/utils/popper';

describe('浮层箭头根据实际位置定位', () => {
  const trigger = { left: 12, top: 100, width: 80, height: 40 } as DOMRect;

  it.each(['top', 'bottom', 'top-start', 'bottom-end'])('横向 %s 夹取后指向触发中心', placement => {
    expect(
      calcPopperArrowStyle(trigger, { width: 290, height: 100 }, { left: 8, top: 150, placement })
    ).toEqual({
      left: '44px',
      right: 'auto',
      transform: 'translateX(-50%) rotate(45deg)',
    });
  });

  it.each(['left', 'right-start', 'left-end'])('纵向 %s 夹取后指向触发中心', placement => {
    expect(
      calcPopperArrowStyle(trigger, { width: 100, height: 200 }, { left: 110, top: 80, placement })
    ).toEqual({
      top: '40px',
      bottom: 'auto',
      transform: 'translateY(-50%) rotate(45deg)',
    });
  });

  it('触发元素离开视口或浮层极小时，箭头不会越过浮层边缘', () => {
    expect(
      calcPopperArrowStyle(
        trigger,
        { width: 100, height: 100 },
        { left: 100, top: 0, placement: 'bottom' }
      ).left
    ).toBe('16px');
    expect(
      calcPopperArrowStyle(
        trigger,
        { width: 20, height: 10 },
        { left: 0, top: 0, placement: 'bottom' }
      ).left
    ).toBe('10px');
    expect(
      calcPopperArrowStyle(
        trigger,
        { width: 100, height: 100 },
        { left: 0, top: 0, placement: 'right' }
      ).top
    ).toBe('84px');
  });
});
