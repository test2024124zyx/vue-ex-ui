import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExImageCropError } from '../../../src/components/image-crop/errors';
import {
  drawCropPreview,
  renderCrop,
  validateCropConfiguration,
} from '../../../src/components/image-crop/utils';
import type { ImageCropLayout } from '../../../src/components/image-crop/geometry';

const createContext = (): CanvasRenderingContext2D =>
  ({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    rect: vi.fn(),
    arc: vi.fn(),
    clip: vi.fn(),
    drawImage: vi.fn(),
    imageSmoothingEnabled: false,
    imageSmoothingQuality: 'low',
    fillStyle: '',
  }) as unknown as CanvasRenderingContext2D;

describe('image-crop utils', () => {
  let context: CanvasRenderingContext2D;
  const image = {
    naturalWidth: 800,
    naturalHeight: 600,
  } as HTMLImageElement;
  const layout: ImageCropLayout = {
    rotation: 0,
    baseScale: 0.5,
    displayScale: 0.5,
    rotatedSize: { width: 800, height: 600 },
    imageBounds: { x: 50, y: 25, width: 400, height: 300 },
  };

  beforeEach(() => {
    context = createContext();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('严格验证会影响裁剪语义的运行时配置', () => {
    expect(() =>
      validateCropConfiguration({
        quality: 0.9,
        outputType: 'image/jpeg',
        zoomStep: 0.1,
        minZoom: 0.5,
        maxZoom: 4,
        minWidth: 40,
        minHeight: 40,
        gridRows: 3,
        gridCols: 3,
      })
    ).not.toThrow();

    const invalidCases = [
      { quality: 2 },
      { outputType: 'image/gif' },
      { zoomStep: 0 },
      { minZoom: 0 },
      { minZoom: 2, maxZoom: 1 },
      { minWidth: -1 },
      { minHeight: 0 },
      { minWidth: 100, maxWidth: 50 },
      { minHeight: 100, maxHeight: 50 },
      { aspectRatio: 0 },
      { gridRows: 0 },
      { gridCols: 1.5 },
    ];

    for (const invalid of invalidCases) {
      expect(() => validateCropConfiguration(invalid)).toThrowError(
        expect.objectContaining({ code: 'INVALID_CONFIGURATION' })
      );
    }
  });

  it('按设备像素比绘制唯一的旋转缩放预览', () => {
    const canvas = document.createElement('canvas');
    const rotatedLayout: ImageCropLayout = {
      rotation: 90,
      baseScale: 0.4,
      displayScale: 0.8,
      rotatedSize: { width: 600, height: 800 },
      imageBounds: { x: 10, y: -120, width: 480, height: 640 },
    };

    drawCropPreview(canvas, image, { width: 500, height: 400 }, rotatedLayout, 2);

    expect(canvas.width).toBe(1000);
    expect(canvas.height).toBe(800);
    expect(canvas.style.width).toBe('500px');
    expect(canvas.style.height).toBe('400px');
    expect(context.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 500, 400);
    expect(context.translate).toHaveBeenNthCalledWith(1, 250, 200);
    expect(context.rotate).toHaveBeenCalledWith(Math.PI / 2);
    expect(context.scale).toHaveBeenCalledWith(0.8, 0.8);
    expect(context.drawImage).toHaveBeenCalledWith(image, -400, -300);
    expect(context.imageSmoothingEnabled).toBe(true);
    expect(context.imageSmoothingQuality).toBe('high');
  });

  it('预览 Canvas 无 2D 上下文时抛出稳定错误', () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValueOnce(null);

    expect(() =>
      drawCropPreview(
        document.createElement('canvas'),
        image,
        { width: 500, height: 400 },
        layout,
        1
      )
    ).toThrowError(expect.objectContaining({ code: 'CANVAS_UNAVAILABLE' }));
  });

  it('矩形裁剪按来源像素输出 JPEG 并应用背景色和质量', async () => {
    let encodedSize = { width: 0, height: 0 };
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
      function (callback, type, quality) {
        encodedSize = { width: this.width, height: this.height };
        expect(type).toBe('image/jpeg');
        expect(quality).toBe(0.85);
        callback(new Blob(['jpeg'], { type: 'image/jpeg' }));
      }
    );

    const result = await renderCrop(image, { width: 800, height: 600 }, layout, {
      area: { x: 100, y: 75, width: 200, height: 100 },
      shape: 'rect',
      outputType: 'image/jpeg',
      quality: 0.85,
      backgroundColor: '#ffffff',
    });

    expect(result.sourceArea).toEqual({ x: 100, y: 100, width: 400, height: 200 });
    expect(result.outputSize).toEqual({ width: 400, height: 200 });
    expect(encodedSize).toEqual({ width: 400, height: 200 });
    expect(context.fillStyle).toBe('#ffffff');
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 400, 200);
    expect(context.rect).toHaveBeenCalledWith(0, 0, 400, 200);
    expect(context.clip).toHaveBeenCalledOnce();
    expect(context.drawImage).toHaveBeenCalledWith(image, 0, 0);
    expect(result.blob.type).toBe('image/jpeg');
  });

  it('圆形 PNG 输出透明圆角且不会传递伪质量参数', async () => {
    const circleLayout: ImageCropLayout = {
      rotation: 90,
      baseScale: 0.5,
      displayScale: 0.5,
      rotatedSize: { width: 600, height: 800 },
      imageBounds: { x: 0, y: 0, width: 300, height: 400 },
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(
      (callback, type, quality) => {
        expect(type).toBe('image/png');
        expect(quality).toBeUndefined();
        callback(new Blob(['png'], { type: 'image/png' }));
      }
    );

    const result = await renderCrop(image, { width: 800, height: 600 }, circleLayout, {
      area: { x: 50, y: 100, width: 100, height: 100 },
      shape: 'circle',
      outputType: 'image/png',
      quality: 0.2,
      backgroundColor: '#ffffff',
    });

    expect(result.outputSize).toEqual({ width: 200, height: 200 });
    expect(context.fillRect).not.toHaveBeenCalled();
    expect(context.arc).toHaveBeenCalledWith(100, 100, 100, 0, Math.PI * 2);
    expect(context.rotate).toHaveBeenCalledWith(Math.PI / 2);
  });

  it('导出过程中不会生成占用双份内存的 DataURL', async () => {
    const toDataUrl = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL');
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback, type) => {
      callback(new Blob(['png'], { type: type ?? 'image/png' }));
    });

    await renderCrop(image, { width: 800, height: 600 }, layout, {
      area: { x: 100, y: 75, width: 200, height: 100 },
      shape: 'rect',
      outputType: 'image/png',
      quality: 0.9,
      backgroundColor: '#ffffff',
    });

    expect(toDataUrl).not.toHaveBeenCalled();
  });

  it('拒绝未落在当前图片上的裁剪区域', async () => {
    await expect(
      renderCrop(image, { width: 800, height: 600 }, layout, {
        area: { x: 500, y: 500, width: 100, height: 100 },
        shape: 'rect',
        outputType: 'image/png',
        quality: 0.9,
        backgroundColor: '#ffffff',
      })
    ).rejects.toMatchObject({ code: 'INVALID_AREA' });
  });

  it('导出上下文和编码失败均转换为组件稳定错误', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValueOnce(null);
    await expect(
      renderCrop(image, { width: 800, height: 600 }, layout, {
        area: { x: 100, y: 75, width: 200, height: 100 },
        shape: 'rect',
        outputType: 'image/png',
        quality: 0.9,
        backgroundColor: '#ffffff',
      })
    ).rejects.toMatchObject({ code: 'CANVAS_UNAVAILABLE' });

    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(callback => callback(null));
    await expect(
      renderCrop(image, { width: 800, height: 600 }, layout, {
        area: { x: 100, y: 75, width: 200, height: 100 },
        shape: 'rect',
        outputType: 'image/png',
        quality: 0.9,
        backgroundColor: '#ffffff',
      })
    ).rejects.toBeInstanceOf(ExImageCropError);
  });

  it('导出开始前取消时不创建 Canvas', async () => {
    const controller = new AbortController();
    controller.abort();
    const createElement = vi.spyOn(document, 'createElement');

    await expect(
      renderCrop(image, { width: 800, height: 600 }, layout, {
        area: { x: 100, y: 75, width: 200, height: 100 },
        shape: 'rect',
        outputType: 'image/png',
        quality: 0.9,
        backgroundColor: '#ffffff',
        signal: controller.signal,
      })
    ).rejects.toMatchObject({ code: 'ABORTED' });
    expect(createElement).not.toHaveBeenCalledWith('canvas');
  });
});
