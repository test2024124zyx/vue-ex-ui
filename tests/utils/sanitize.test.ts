import { describe, it, expect } from 'vitest';
import { sanitizeHtml, escapeHtml, containsDangerousHtml } from '../../src/utils/sanitize';

describe('sanitize', () => {
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

    it('应该对安全内容返回 false', () => {
      expect(containsDangerousHtml('<p>Hello <strong>World</strong></p>')).toBe(false);
      expect(containsDangerousHtml('<a href="https://example.com">Link</a>')).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
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
  });
});
