import { describe, expect, it } from 'vitest';
import {
  highlightCode,
  highlightSync,
  loadHighlighter,
} from '../../../src/components/code/highlighter';

describe('Code highlighter', () => {
  it('highlight.js 未加载时应该安全转义纯文本', () => {
    const result = highlightSync('<script>alert("xss")</script>', 'javascript');

    expect(result.highlighted).toBe(false);
    expect(result.html).toContain('&lt;script&gt;');
    expect(result.html).not.toContain('<script>');
  });

  it('plaintext 应该保持纯文本展示，不触发自动语言识别', async () => {
    const result = await highlightCode('<span class="danger">文本</span>', 'plaintext');

    expect(result.highlighted).toBe(false);
    expect(result.html).toContain('&lt;span');
    expect(result.html).not.toContain('<span');
    expect(result.html).not.toContain('hljs-tag');
  });

  it('未知语言应该降级为纯文本，不使用 highlightAuto 猜测', async () => {
    const result = await highlightCode('<svg onload=alert(1)>', 'unknown-language');

    expect(result.highlighted).toBe(false);
    expect(result.html).toContain('&lt;svg');
    expect(result.html).not.toContain('<span');
    expect(result.html).not.toContain('hljs-tag');
  });

  it('已注册语言应该返回经过消毒的高亮 HTML', async () => {
    await loadHighlighter();

    const result = await highlightCode(
      'const value = "<img src=x onerror=alert(1)>";',
      'javascript'
    );

    expect(result.highlighted).toBe(true);
    expect(result.html).toContain('hljs-keyword');
    expect(result.html).not.toContain('<img');
    expect(result.html).toContain('onerror=');
  });
});
