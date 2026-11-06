import { describe, expect, it } from 'vitest';
import {
  cloneUploadFileList,
  matchesUploadAccept,
  normalizeUploadLimit,
  normalizeUploadMaxFileSize,
  normalizeUploadPercent,
} from '../../../src/components/file-upload/upload-utils';
import type { UploadFile } from '../../../src/components/file-upload/types';

const makeFile = (name: string, type: string): File => new File(['content'], name, { type });

describe('FileUpload 工具函数', () => {
  describe('accept 匹配', () => {
    it.each([
      ['photo.PNG', 'image/png', '.png', true],
      ['archive.tar.gz', 'application/gzip', '.tar.gz', true],
      ['photo.webp', 'image/webp', 'image/*', true],
      ['report.csv', 'text/csv', 'application/pdf, text/csv', true],
      ['README', '', '', true],
      ['README', '', 'image/*', false],
      ['script.js', 'text/javascript', '.css, image/*', false],
    ] as const)('%s 匹配 %s / %s => %s', (name, type, accept, expected) => {
      expect(matchesUploadAccept(makeFile(name, type), accept)).toBe(expected);
    });
  });

  describe('运行时数值归一化', () => {
    it('只接受非负安全整数作为数量限制', () => {
      expect(normalizeUploadLimit(undefined)).toBeUndefined();
      expect(normalizeUploadLimit(Number.NaN)).toBeUndefined();
      expect(normalizeUploadLimit(-1)).toBe(0);
      expect(normalizeUploadLimit(2.9)).toBe(2);
      expect(normalizeUploadLimit(Number.MAX_VALUE)).toBeUndefined();
    });

    it('只接受正安全整数作为文件字节上限', () => {
      expect(normalizeUploadMaxFileSize(undefined)).toBeUndefined();
      expect(normalizeUploadMaxFileSize(0)).toBeUndefined();
      expect(normalizeUploadMaxFileSize(10.8)).toBe(10);
      expect(normalizeUploadMaxFileSize(Number.POSITIVE_INFINITY)).toBeUndefined();
    });

    it('把上传进度限制到 0 至 100 的整数', () => {
      expect(normalizeUploadPercent(Number.NaN)).toBe(0);
      expect(normalizeUploadPercent(-10)).toBe(0);
      expect(normalizeUploadPercent(32.6)).toBe(33);
      expect(normalizeUploadPercent(120)).toBe(100);
    });
  });

  it('克隆列表和文件项，但保留原始 File 引用', () => {
    const raw = makeFile('a.txt', 'text/plain');
    const source: UploadFile[] = [
      { uid: 'a', name: 'a.txt', size: raw.size, type: raw.type, status: 'ready', raw },
    ];
    const cloned = cloneUploadFileList(source);

    expect(cloned).not.toBe(source);
    expect(cloned[0]).not.toBe(source[0]);
    expect(cloned[0]?.raw).toBe(raw);
  });
});
