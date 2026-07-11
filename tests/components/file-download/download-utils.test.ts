import { describe, expect, it } from 'vitest';
import {
  calculateDownloadProgress,
  formatDownloadBytes,
  normalizeDownloadUrl,
  parseContentDispositionFilename,
  parseContentLength,
  resolveDownloadFilename,
  sanitizeDownloadFilename,
} from '../../../src/components/file-download/download-utils';
import { ExFileDownloadError } from '../../../src/components/file-download/errors';

describe('FileDownload 下载工具', () => {
  describe('下载地址', () => {
    it('规范化相对地址并保留允许的 HTTP、HTTPS 与 Blob 协议', () => {
      expect(normalizeDownloadUrl(' ./files/a.zip ', 'https://app.example/path/')).toBe(
        'https://app.example/path/files/a.zip'
      );
      expect(normalizeDownloadUrl('http://cdn.example/a.zip')).toBe('http://cdn.example/a.zip');
      expect(normalizeDownloadUrl('blob:https://app.example/id')).toBe(
        'blob:https://app.example/id'
      );
    });

    it.each([
      '',
      '   ',
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      'file:///a',
    ])('拒绝空地址或危险协议：%s', value => {
      expect(() => normalizeDownloadUrl(value, 'https://app.example/')).toThrow(
        ExFileDownloadError
      );
    });
  });

  describe('文件名', () => {
    it('移除路径、控制字符、保留字符与系统保留名称', () => {
      expect(sanitizeDownloadFilename('../../report?.pdf')).toBe('report_.pdf');
      expect(sanitizeDownloadFilename(' bad\u0000name.txt. ')).toBe('bad_name.txt');
      expect(sanitizeDownloadFilename('CON')).toBe('_CON');
      expect(sanitizeDownloadFilename('   ')).toBeUndefined();
    });

    it('解析 RFC 5987 和普通 Content-Disposition 文件名', () => {
      expect(
        parseContentDispositionFilename("attachment; filename*=UTF-8''%E6%8A%A5%E5%91%8A.pdf")
      ).toBe('报告.pdf');
      expect(parseContentDispositionFilename('attachment; filename="report \\"final\\".pdf"')).toBe(
        'report _final_.pdf'
      );
      expect(parseContentDispositionFilename('inline')).toBeUndefined();
    });

    it('按显式值、响应头、URL 路径和默认值的顺序解析下载文件名', () => {
      expect(
        resolveDownloadFilename(
          'manual.pdf',
          'attachment; filename="server.pdf"',
          'https://x/a.pdf'
        )
      ).toBe('manual.pdf');
      expect(
        resolveDownloadFilename(undefined, 'attachment; filename="server.pdf"', 'https://x/a.pdf')
      ).toBe('server.pdf');
      expect(resolveDownloadFilename(undefined, null, 'https://x/%E6%8A%A5%E5%91%8A.pdf?q=1')).toBe(
        '报告.pdf'
      );
      expect(resolveDownloadFilename(undefined, null, 'https://x/')).toBe('download');
    });
  });

  describe('进度与字节', () => {
    it.each([
      ['120', 120],
      ['0', 0],
      [null, null],
      ['', null],
      ['12.5', null],
      ['-1', null],
      ['Infinity', null],
    ] as const)('解析 Content-Length %s 为 %s', (value, expected) => {
      expect(parseContentLength(value)).toBe(expected);
    });

    it('总大小已知时限制百分比范围，未知时保留不确定状态', () => {
      expect(calculateDownloadProgress(25, 100)).toEqual({ loaded: 25, total: 100, percent: 25 });
      expect(calculateDownloadProgress(150, 100)).toEqual({
        loaded: 150,
        total: 100,
        percent: 100,
      });
      expect(calculateDownloadProgress(25, null)).toEqual({
        loaded: 25,
        total: null,
        percent: null,
      });
      expect(calculateDownloadProgress(0, 0, true)).toEqual({ loaded: 0, total: 0, percent: 100 });
    });

    it('格式化非法值、零字节和大容量单位', () => {
      expect(formatDownloadBytes(Number.NaN)).toBe('0 B');
      expect(formatDownloadBytes(-1)).toBe('0 B');
      expect(formatDownloadBytes(0)).toBe('0 B');
      expect(formatDownloadBytes(1536)).toBe('1.5 KB');
      expect(formatDownloadBytes(1024 ** 5)).toBe('1 PB');
    });
  });
});
