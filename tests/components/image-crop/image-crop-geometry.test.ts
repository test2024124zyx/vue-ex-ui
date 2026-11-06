import { describe, expect, it } from 'vitest';
import {
  calculateRotatedSize,
  createImageLayout,
  createInitialCropArea,
  moveCropArea,
  normalizeCropArea,
  normalizeQuarterTurn,
  previewAreaToSource,
  reprojectCropArea,
  resizeCropArea,
} from '../../../src/components/image-crop/geometry';
import type { CropArea } from '../../../src/components/image-crop/types';

describe('image-crop geometry', () => {
  const bounds: CropArea = { x: 50, y: 25, width: 400, height: 300 };

  it('将旋转角规范为四个真实的直角方向', () => {
    expect(normalizeQuarterTurn(0)).toBe(0);
    expect(normalizeQuarterTurn(90)).toBe(90);
    expect(normalizeQuarterTurn(450)).toBe(90);
    expect(normalizeQuarterTurn(-90)).toBe(270);
    expect(() => normalizeQuarterTurn(45)).toThrow(RangeError);
  });

  it('计算直角旋转后的图片尺寸', () => {
    expect(calculateRotatedSize({ width: 800, height: 600 }, 0)).toEqual({
      width: 800,
      height: 600,
    });
    expect(calculateRotatedSize({ width: 800, height: 600 }, 90)).toEqual({
      width: 600,
      height: 800,
    });
    expect(calculateRotatedSize({ width: 800, height: 600 }, 270)).toEqual({
      width: 600,
      height: 800,
    });
  });

  it('建立包含预览缩放与居中边界的唯一布局', () => {
    const layout = createImageLayout(
      { width: 1000, height: 500 },
      { width: 500, height: 400 },
      0,
      1,
      0.8
    );

    expect(layout.rotatedSize).toEqual({ width: 1000, height: 500 });
    expect(layout.baseScale).toBe(0.4);
    expect(layout.displayScale).toBe(0.4);
    expect(layout.imageBounds).toEqual({ x: 50, y: 100, width: 400, height: 200 });

    const rotated = createImageLayout(
      { width: 1000, height: 500 },
      { width: 500, height: 400 },
      90,
      2,
      0.8
    );
    expect(rotated.rotatedSize).toEqual({ width: 500, height: 1000 });
    expect(rotated.baseScale).toBe(0.32);
    expect(rotated.displayScale).toBe(0.64);
    expect(rotated.imageBounds).toEqual({ x: 90, y: -120, width: 320, height: 640 });
  });

  it('拒绝无效尺寸、缩放和预览留白比例', () => {
    expect(() =>
      createImageLayout({ width: 0, height: 100 }, { width: 500, height: 400 }, 0, 1)
    ).toThrow(RangeError);
    expect(() =>
      createImageLayout({ width: 100, height: 100 }, { width: 500, height: 400 }, 0, 0)
    ).toThrow(RangeError);
    expect(() =>
      createImageLayout({ width: 100, height: 100 }, { width: 500, height: 400 }, 0, 1, 1.1)
    ).toThrow(RangeError);
  });

  it('初始化自由、固定比例和圆形裁剪区域', () => {
    expect(createInitialCropArea(bounds, undefined, {})).toEqual({
      x: 90,
      y: 55,
      width: 320,
      height: 240,
    });
    expect(createInitialCropArea(bounds, undefined, { aspectRatio: 16 / 9 })).toEqual({
      x: 90,
      y: 85,
      width: 320,
      height: 180,
    });
    expect(createInitialCropArea(bounds, undefined, { aspectRatio: 1 })).toEqual({
      x: 130,
      y: 55,
      width: 240,
      height: 240,
    });
  });

  it('初始区域与外部设置区域始终受尺寸和图片边界约束', () => {
    const area = normalizeCropArea({ x: -100, y: 500, width: 999, height: 5 }, bounds, {
      minWidth: 60,
      minHeight: 50,
      maxWidth: 300,
      maxHeight: 200,
    });

    expect(area).toEqual({ x: 50, y: 275, width: 300, height: 50 });

    const fixed = normalizeCropArea({ x: 430, y: 300, width: 300, height: 10 }, bounds, {
      minWidth: 80,
      minHeight: 80,
      maxWidth: 260,
      maxHeight: 120,
      aspectRatio: 2,
    });
    expect(fixed).toEqual({ x: 210, y: 205, width: 240, height: 120 });
  });

  it('无效裁剪区域和约束不会静默污染状态', () => {
    expect(() => normalizeCropArea({ x: 0, y: 0, width: NaN, height: 10 }, bounds, {})).toThrow(
      RangeError
    );
    expect(() =>
      normalizeCropArea({ x: 0, y: 0, width: 10, height: 10 }, bounds, {
        aspectRatio: -1,
      })
    ).toThrow(RangeError);
  });

  it('移动裁剪框时保持尺寸并夹紧到图片边界', () => {
    const area = { x: 100, y: 80, width: 200, height: 120 };

    expect(moveCropArea(area, 500, 500, bounds)).toEqual({
      x: 250,
      y: 205,
      width: 200,
      height: 120,
    });
    expect(moveCropArea(area, -500, -500, bounds)).toEqual({
      x: 50,
      y: 25,
      width: 200,
      height: 120,
    });
  });

  it('自由缩放保持对边锚点并执行最小、最大和边界限制', () => {
    const start = { x: 100, y: 80, width: 200, height: 150 };
    const constraints = { minWidth: 50, minHeight: 40, maxWidth: 280, maxHeight: 220 };

    expect(resizeCropArea(start, 'w', 80, 0, bounds, constraints)).toEqual({
      x: 180,
      y: 80,
      width: 120,
      height: 150,
    });
    expect(resizeCropArea(start, 'w', 500, 0, bounds, constraints)).toEqual({
      x: 250,
      y: 80,
      width: 50,
      height: 150,
    });
    expect(resizeCropArea(start, 'se', 500, 500, bounds, constraints)).toEqual({
      x: 100,
      y: 80,
      width: 280,
      height: 220,
    });
  });

  it('固定比例缩放保持对角锚点、比例与图片边界', () => {
    const start = { x: 100, y: 80, width: 200, height: 100 };
    const resized = resizeCropArea(start, 'nw', -200, -200, bounds, {
      minWidth: 60,
      minHeight: 30,
      maxWidth: 500,
      maxHeight: 500,
      aspectRatio: 2,
    });

    expect(resized.x + resized.width).toBe(300);
    expect(resized.y + resized.height).toBe(180);
    expect(resized.width / resized.height).toBe(2);
    expect(resized.x).toBeGreaterThanOrEqual(bounds.x);
    expect(resized.y).toBeGreaterThanOrEqual(bounds.y);
  });

  it('把预览区域精确映射到旋转后图片像素坐标', () => {
    const layout = {
      rotation: 90 as const,
      baseScale: 0.5,
      displayScale: 0.5,
      rotatedSize: { width: 600, height: 800 },
      imageBounds: { x: 100, y: 50, width: 300, height: 400 },
    };

    expect(previewAreaToSource({ x: 150, y: 100, width: 100, height: 150 }, layout)).toEqual({
      x: 100,
      y: 100,
      width: 200,
      height: 300,
    });
  });

  it('容器变化时重投影裁剪区域并保留同一来源像素范围', () => {
    const oldLayout = {
      rotation: 0 as const,
      baseScale: 0.5,
      displayScale: 0.5,
      rotatedSize: { width: 800, height: 600 },
      imageBounds: { x: 50, y: 50, width: 400, height: 300 },
    };
    const nextLayout = {
      rotation: 0 as const,
      baseScale: 1,
      displayScale: 1,
      rotatedSize: { width: 800, height: 600 },
      imageBounds: { x: 100, y: 20, width: 800, height: 600 },
    };

    expect(
      reprojectCropArea({ x: 100, y: 75, width: 200, height: 100 }, oldLayout, nextLayout, {})
    ).toEqual({ x: 200, y: 70, width: 400, height: 200 });
  });
});
