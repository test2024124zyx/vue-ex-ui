import { describe, expect, it } from 'vitest';
import {
  clampPreviewIndex,
  detectPreviewType,
  normalizePreviewRotation,
  resolvePreviewScaleConfig,
  validatePreviewUrl,
} from '../../../src/components/file-preview/preview-utils';
import type { PreviewFile } from '../../../src/components/file-preview/types';

describe('FilePreview 预览工具', () => {
  describe('类型检测', () => {
    it.each([
      [{ url: '/PHOTO.PNG?size=2#view' }, undefined, 'image'],
      [{ url: '/movie.ogv' }, undefined, 'video'],
      [{ url: '/sound.oga' }, undefined, 'audio'],
      [{ url: '/manual.pdf' }, undefined, 'pdf'],
      [{ url: '/notes.txt' }, undefined, 'text'],
      [{ url: '/source.ts' }, undefined, 'code'],
      [{ url: '/ambiguous.ogg' }, undefined, 'unknown'],
      [{ url: '/without-extension', mimeType: 'text/css; charset=utf-8' }, undefined, 'code'],
      [{ url: '/without-extension', type: 'audio' }, 'image', 'audio'],
      [{ url: '/without-extension' }, 'video', 'video'],
    ] as const)('将 %# 识别为 %s', (file, fallback, expected) => {
      expect(detectPreviewType(file as PreviewFile, fallback)).toBe(expected);
    });
  });

  describe('地址校验', () => {
    it('允许相对地址、HTTP(S) 和 Blob 地址且不改写调用方地址', () => {
      expect(validatePreviewUrl(' ./photo.png ', 'image', 'https://app.example/base/')).toBe(
        './photo.png'
      );
      expect(validatePreviewUrl('https://cdn.example/a.pdf', 'pdf')).toBe(
        'https://cdn.example/a.pdf'
      );
      expect(validatePreviewUrl('blob:https://app.example/id', 'image')).toBe(
        'blob:https://app.example/id'
      );
    });

    it('拒绝可执行协议和与预览类型不匹配的数据地址', () => {
      expect(validatePreviewUrl('javascript:alert(1)', 'image')).toBeNull();
      expect(validatePreviewUrl('file:///secret', 'text')).toBeNull();
      expect(validatePreviewUrl('data:text/html,<script>alert(1)</script>', 'pdf')).toBeNull();
      expect(validatePreviewUrl('data:image/png;base64,AA==', 'image')).toContain('data:image/png');
      expect(validatePreviewUrl('data:text/plain,hello', 'text')).toBe('data:text/plain,hello');
    });
  });

  describe('数值归一化', () => {
    it('把索引限制为有效整数并处理空列表', () => {
      expect(clampPreviewIndex(Number.NaN, 3)).toBe(0);
      expect(clampPreviewIndex(-1, 3)).toBe(0);
      expect(clampPreviewIndex(1.9, 3)).toBe(1);
      expect(clampPreviewIndex(9, 3)).toBe(2);
      expect(clampPreviewIndex(2, 0)).toBe(0);
    });

    it('修复非法缩放边界和步长', () => {
      expect(resolvePreviewScaleConfig(Number.NaN, Number.NaN, Number.NaN)).toEqual({
        min: 0.1,
        max: 5,
        step: 0.1,
      });
      expect(resolvePreviewScaleConfig(3, 1, -2)).toEqual({ min: 3, max: 3, step: 0.1 });
      expect(resolvePreviewScaleConfig(0, 2, 0.25)).toEqual({ min: 0.1, max: 2, step: 0.25 });
    });

    it('把任意旋转角规范到 0 至 360 度', () => {
      expect(normalizePreviewRotation(450)).toBe(90);
      expect(normalizePreviewRotation(-90)).toBe(270);
      expect(normalizePreviewRotation(Number.NaN)).toBe(0);
    });
  });
});
