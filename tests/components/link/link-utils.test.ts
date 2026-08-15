import { describe, expect, it } from 'vitest';
import {
  buildSecureRel,
  isExternalLinkHref,
  normalizeLinkHref,
} from '../../../src/components/link/link-utils';

describe('Link 工具函数', () => {
  describe('normalizeLinkHref', () => {
    it.each([
      'https://example.com/path',
      'http://example.com',
      '//cdn.example.com/file.js',
      '/account/profile',
      '../relative',
      '#section',
      'mailto:team@example.com',
      'tel:+8613800000000',
    ])('保留安全导航地址 %s', href => {
      expect(normalizeLinkHref(`  ${href}  `)).toBe(href);
    });

    it.each([
      'javascript:alert(1)',
      'JAVASCRIPT:alert(1)',
      'java\tscript:alert(1)',
      'java\n script:alert(1)',
      '\u0000javascript:alert(1)',
      'vbscript:msgbox(1)',
      'data:text/html,<script>alert(1)</script>',
      'my-app://open/page',
    ])('拒绝可执行协议及其混淆形式 %s', href => {
      expect(normalizeLinkHref(href)).toBeUndefined();
    });

    it('拒绝缺失值与空白地址', () => {
      expect(normalizeLinkHref()).toBeUndefined();
      expect(normalizeLinkHref(null)).toBeUndefined();
      expect(normalizeLinkHref('')).toBeUndefined();
      expect(normalizeLinkHref(' \n\t ')).toBeUndefined();
    });
  });

  describe('isExternalLinkHref', () => {
    it.each(['https://example.com', 'HTTP://EXAMPLE.COM', '//cdn.example.com/file'])(
      '将绝对网络地址 %s 识别为外链',
      href => {
        expect(isExternalLinkHref(href)).toBe(true);
      }
    );

    it.each(['/local', '../relative', '#hash', 'mailto:a@example.com', 'javascript:alert(1)'])(
      '不会将 %s 误识别为外链',
      href => {
        expect(isExternalLinkHref(href)).toBe(false);
      }
    );
  });

  describe('buildSecureRel', () => {
    it('目标不是 _blank 时只规范化空白、大小写和重复令牌', () => {
      expect(buildSecureRel('  NOFOLLOW   license nofollow ', '_self')).toBe('nofollow license');
    });

    it('目标为 _blank 时移除 opener 并补充 noopener', () => {
      expect(buildSecureRel('opener noreferrer', '_blank')).toBe('noreferrer noopener');
      expect(buildSecureRel('opener', '_BLANK')).toBe('noopener');
      expect(buildSecureRel(undefined, '_blank')).toBe('noopener');
    });

    it('没有有效令牌且不是 _blank 时省略 rel', () => {
      expect(buildSecureRel(undefined, '_self')).toBeUndefined();
      expect(buildSecureRel('   ', undefined)).toBeUndefined();
    });
  });
});
