import { afterEach, describe, it, expect, vi } from 'vitest';
import {
  sanitizeHtml,
  escapeHtml,
  containsDangerousHtml,
  isSafeUrl,
} from '../../src/utils/sanitize';

describe('sanitize', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('escapeHtml', () => {
    it('应该转义 HTML 特殊字符', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
      );
    });

    it('应该转义 & 符号', () => {
      expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('应该转义引号', () => {
      expect(escapeHtml('"hello" \'world\'')).toBe('&quot;hello&quot; &#x27;world&#x27;');
    });

    it('应该保留普通文本不变', () => {
      expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
    });
  });

  describe('isSafeUrl', () => {
    it.each([
      '/guide/start',
      './asset.png',
      '../asset.png',
      '#section',
      'https://example.com/path',
      'http://example.com/path',
      'mailto:team@example.com',
      'tel:+8613800000000',
    ])('允许相对地址与明确列出的链接协议：%s', url => {
      expect(isSafeUrl(url)).toBe(true);
    });

    it.each([
      'file:///etc/passwd',
      'ftp://example.com/file',
      'custom-protocol:value',
      'java\tscript:alert(1)',
      'https://example.com/\nevil',
      '\u0000javascript:alert(1)',
    ])('拒绝未知协议与控制字符绕过：%s', url => {
      expect(isSafeUrl(url)).toBe(false);
    });

    it('只允许经过 MIME 与 base64 校验的栅格 data 图片', () => {
      expect(isSafeUrl('data:image/png;base64,iVBORw0KGgo=', true)).toBe(true);
      expect(isSafeUrl('data:image/svg+xml;base64,PHN2Zz4=', true)).toBe(false);
      expect(isSafeUrl('data:text/html;base64,PHNjcmlwdD4=', true)).toBe(false);
      expect(isSafeUrl('data:image/png,not-base64', true)).toBe(false);
      expect(isSafeUrl('data:image/png;base64,%%%%', true)).toBe(false);
    });
  });

  describe('containsDangerousHtml', () => {
    it('应该检测 script 标签', () => {
      expect(containsDangerousHtml('<script>alert(1)</script>')).toBe(true);
    });

    it('应该检测 iframe 标签', () => {
      expect(containsDangerousHtml('<iframe src="evil.com"></iframe>')).toBe(true);
    });

    it('应该检测事件处理器', () => {
      expect(containsDangerousHtml('<img onerror="alert(1)">')).toBe(true);
      expect(containsDangerousHtml('<div onclick="alert(1)">')).toBe(true);
    });

    it('应该检测 javascript: 协议', () => {
      expect(containsDangerousHtml('<a href="javascript:alert(1)">click</a>')).toBe(true);
    });

    it('应该检测 expression()', () => {
      expect(containsDangerousHtml('<div style="width: expression(alert(1))">')).toBe(true);
    });

    it.each([
      '<span style="color: red">普通内联样式</span>',
      '<span style="background: u\\72l(https://evil.example/pixel)">CSS 转义 URL</span>',
      '<span style="@\\69mport &quot;https://evil.example/style.css&quot;">CSS 转义导入</span>',
      '<span style="width: ex\\70ression(alert(1))">CSS 转义表达式</span>',
    ])('把所有未经白名单验证的 style 视为危险内容：%s', input => {
      expect(containsDangerousHtml(input)).toBe(true);
    });

    it('应该对安全内容返回 false', () => {
      expect(containsDangerousHtml('<p>Hello <strong>World</strong></p>')).toBe(false);
      expect(containsDangerousHtml('<a href="https://example.com">Link</a>')).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('服务端与浏览器对同一 HTML 产生完全一致的结果', () => {
      const input =
        '<p class="notice">完成 <strong>构建</strong><a href="javascript:bad()">详情</a></p>';
      const browserResult = sanitizeHtml(input);

      vi.stubGlobal('document', undefined);
      const serverResult = sanitizeHtml(input);

      expect(serverResult).toBe(browserResult);
    });

    it('应该保留安全的 HTML 标签', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      const result = sanitizeHtml(input);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
      expect(result).toContain('Hello');
      expect(result).toContain('World');
    });

    it('应该移除 script 标签但保留文本', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script');
      expect(result).not.toContain('</script>');
    });

    it('应该移除事件处理器属性', () => {
      const input = '<div onclick="alert(1)" onmouseover="alert(2)">content</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('onmouseover');
      expect(result).toContain('content');
    });

    it('应该移除 javascript: 协议的链接', () => {
      const input = '<a href="javascript:alert(1)">click</a>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('javascript:');
    });

    it('应该保留安全的链接', () => {
      const input = '<a href="https://example.com" target="_blank">Link</a>';
      const result = sanitizeHtml(input);
      expect(result).toContain('href="https://example.com"');
      // 应该添加 rel="noopener noreferrer"
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it.each([
      'file:///etc/passwd',
      'ftp://example.com/file',
      'unknown:value',
      'java\tscript:bad()',
    ])('移除非白名单或包含控制字符的链接：%s', href => {
      expect(sanitizeHtml(`<a href="${href}">Link</a>`)).toBe('<a>Link</a>');
    });

    it('保留邮件、电话链接与经过校验的内联栅格图片', () => {
      expect(sanitizeHtml('<a href="mailto:team@example.com">Mail</a>')).toContain(
        'href="mailto:team@example.com"'
      );
      expect(sanitizeHtml('<a href="tel:+8613800000000">Call</a>')).toContain(
        'href="tel:+8613800000000"'
      );
      expect(sanitizeHtml('<img src="data:image/png;base64,iVBORw0KGgo=">')).toContain(
        'src="data:image/png;base64,iVBORw0KGgo="'
      );
    });

    it('应该保留允许的属性', () => {
      const input = '<div class="test" id="myDiv" title="tooltip">content</div>';
      const result = sanitizeHtml(input);
      expect(result).toContain('class="test"');
      expect(result).toContain('id="myDiv"');
      expect(result).toContain('title="tooltip"');
    });

    it('应该移除不允许的属性', () => {
      const input = '<div data-custom="value" aria-label="test">content</div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('data-custom');
      expect(result).not.toContain('aria-label');
    });

    it.each([
      '<span style="color: red">普通内联样式</span>',
      '<span style="background: u\\72l(https://evil.example/pixel)">CSS 转义 URL</span>',
      '<span style="@\\69mport &quot;https://evil.example/style.css&quot;">CSS 转义导入</span>',
      '<span style="width: ex\\70ression(alert(1))">CSS 转义表达式</span>',
      '<span style="background-image: url(https://evil.example/pixel)">外部资源</span>',
    ])('不保留未经属性和值白名单验证的 style：%s', input => {
      const result = sanitizeHtml(input);

      expect(result).not.toContain('style=');
      expect(result).toContain('<span>');
    });

    it('应该处理嵌套的危险内容', () => {
      const input = '<div><script>alert(1)</script><p>Safe content</p></div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<script');
      expect(result).toContain('<p>Safe content</p>');
    });

    it('应该移除 iframe 标签', () => {
      const input = '<iframe src="https://evil.com"></iframe>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<iframe');
    });

    it('应该保留图片标签的安全属性', () => {
      const input = '<img src="https://example.com/img.png" alt="test" width="100">';
      const result = sanitizeHtml(input);
      expect(result).toContain('src="https://example.com/img.png"');
      expect(result).toContain('alt="test"');
      expect(result).toContain('width="100"');
    });

    it('应该移除 data: 协议的图片', () => {
      const input = '<img src="data:text/html,<script>alert(1)</script>">';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('data:');
    });

    it('应该在解析器不依赖 Node 内置模块时丢弃危险原始节点', () => {
      const input =
        '<svg><script>alert(1)</script><img src="https://example.com/image.png"></svg>' +
        '<textarea>secret</textarea><p>safe &amp; sound</p>';

      expect(sanitizeHtml(input)).toBe(
        '<img src="https://example.com/image.png" /><p>safe &amp; sound</p>'
      );
    });
  });
});
