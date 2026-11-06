import { describe, expect, it } from 'vitest';
import { computeFloatingPosition } from '../../src/utils/floating';

const reference = {
  top: 100,
  right: 180,
  bottom: 140,
  left: 100,
  width: 80,
  height: 40,
};
const floating = { width: 120, height: 60 };
const viewport = { width: 800, height: 600 };

describe('computeFloatingPosition', () => {
  it('按 bottom-start 计算主轴间距和起始边对齐', () => {
    expect(
      computeFloatingPosition({
        reference,
        floating,
        viewport,
        placement: 'bottom-start',
        offset: 8,
      })
    ).toMatchObject({ x: 100, y: 148, placement: 'bottom-start' });
  });

  it('按 top-end 使用浮层宽度对齐结束边', () => {
    expect(
      computeFloatingPosition({ reference, floating, viewport, placement: 'top-end', offset: 10 })
    ).toMatchObject({ x: 60, y: 30, placement: 'top-end' });
  });

  it('按 right 居中对齐交叉轴', () => {
    expect(
      computeFloatingPosition({ reference, floating, viewport, placement: 'right', offset: 6 })
    ).toMatchObject({ x: 186, y: 90, placement: 'right' });
  });

  it('首选方向空间不足时翻转到相反方向', () => {
    const nearBottom = { ...reference, top: 540, bottom: 580 };
    expect(
      computeFloatingPosition({
        reference: nearBottom,
        floating,
        viewport,
        placement: 'bottom-start',
        offset: 8,
      })
    ).toMatchObject({ y: 472, placement: 'top-start' });
  });

  it('交叉轴溢出时保留视口内边距', () => {
    const nearRight = { ...reference, left: 760, right: 790 };
    expect(
      computeFloatingPosition({
        reference: nearRight,
        floating,
        viewport,
        placement: 'bottom-start',
        padding: 12,
      }).x
    ).toBe(668);
  });

  it('匹配触发器宽度时返回精确宽度并用于 end 对齐', () => {
    expect(
      computeFloatingPosition({
        reference,
        floating,
        viewport,
        placement: 'bottom-end',
        matchReferenceWidth: true,
      })
    ).toMatchObject({ x: 100, width: 80 });
  });

  it('非法 offset 与 padding 回退到安全值且不生成 NaN', () => {
    const result = computeFloatingPosition({
      reference,
      floating,
      viewport,
      placement: 'bottom',
      offset: Number.POSITIVE_INFINITY,
      padding: -10,
    });
    expect(result).toMatchObject({ x: 80, y: 140 });
    expect(Number.isFinite(result.x)).toBe(true);
    expect(Number.isFinite(result.y)).toBe(true);
  });

  it('非法位置和关闭翻转时应该使用安全默认方向与居中对齐', () => {
    expect(
      computeFloatingPosition({
        reference,
        floating,
        viewport,
        placement: 'invalid' as never,
        flip: false,
      })
    ).toMatchObject({ placement: 'bottom', x: 80, y: 140 });
  });

  it('左右方向应该覆盖起始和结束交叉轴对齐', () => {
    expect(
      computeFloatingPosition({
        reference,
        floating,
        viewport,
        placement: 'right-end',
        offset: 4,
      })
    ).toMatchObject({ placement: 'right-end', x: 184, y: 80 });
    expect(
      computeFloatingPosition({
        reference,
        floating,
        viewport,
        placement: 'left-start',
        offset: 4,
        flip: false,
      })
    ).toMatchObject({ placement: 'left-start', x: 8, y: 100 });
  });
});
