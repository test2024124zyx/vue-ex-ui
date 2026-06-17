import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  highlightToHtml,
  isLanguageSupported,
  MAX_HIGHLIGHT_LENGTH,
  normalizeLanguage,
  SUPPORTED_LANGUAGES,
  tokenizeToLines,
} from '../../../src/components/code/highlighter';

describe('Code highlighter（零依赖）', () => {
  it('escapeHtml 应该转义所有危险字符', () => {
    expect(escapeHtml('<script>alert("x" & \'y\')</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot; &amp; &#x27;y&#x27;)&lt;/script&gt;'
    );
  });

  it('highlightToHtml 永远转义文本，杜绝 XSS 注入', () => {
    const html = highlightToHtml('const a = "<img src=x onerror=alert(1)>";', 'javascript');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    // 标记由固定白名单类名包裹，且关键字进入高亮分支。
    expect(html).toContain('class="ex-token-keyword"');
  });

  it('plaintext 应该按纯文本处理，不产出任何 token span', () => {
    const html = highlightToHtml('<span class="danger">文本</span>', 'plaintext');
    expect(html).not.toContain('ex-token-');
    expect(html).toContain('&lt;span');
  });

  it('未知语言应该降级为纯文本，不猜测语言', () => {
    expect(isLanguageSupported('unknown-language')).toBe(false);
    const html = highlightToHtml('<svg onload=alert(1)>', 'unknown-language');
    expect(html).not.toContain('ex-token-');
    expect(html).toContain('&lt;svg');
  });

  it('normalizeLanguage 应该解析别名', () => {
    expect(normalizeLanguage('JS')).toBe('javascript');
    expect(normalizeLanguage('ts')).toBe('typescript');
    expect(normalizeLanguage('c++')).toBe('cpp');
    expect(normalizeLanguage('yml')).toBe('yaml');
  });

  it('所有声明语言都应被支持', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      expect(isLanguageSupported(lang)).toBe(true);
    }
    expect(SUPPORTED_LANGUAGES).toContain('typescript');
    expect(SUPPORTED_LANGUAGES).toContain('rust');
  });

  it('tokenizeToLines 行数应恒等于 split(\\n) 行数', () => {
    const code = 'const a = 1;\nconst b = 2;\n\nfn();';
    const lines = tokenizeToLines(code, 'javascript');
    expect(lines).toHaveLength(code.split('\n').length);
  });

  it('跨行块注释应正确拆分到多行', () => {
    const code = 'a();\n/* line1\nline2 */\nb();';
    const lines = tokenizeToLines(code, 'javascript');
    expect(lines).toHaveLength(4);
    // 第二、三行都应包含 comment token。
    expect(lines[1].some(t => t.type === 'comment')).toBe(true);
    expect(lines[2].some(t => t.type === 'comment')).toBe(true);
  });

  it('字符串中的关键字不应被误高亮', () => {
    const lines = tokenizeToLines('const s = "if else for";', 'javascript');
    const flat = lines.flat();
    const keywordValues = flat.filter(t => t.type === 'keyword').map(t => t.value);
    expect(keywordValues).toContain('const');
    expect(keywordValues).not.toContain('if');
  });

  it('TypeScript 类型与关键字应被高亮', () => {
    const lines = tokenizeToLines('interface User { id: number }', 'typescript');
    const types = lines.flat().map(t => t.type);
    expect(types).toContain('keyword'); // interface
  });

  it('超长输入应跳过高亮，退化为纯文本以保护性能', () => {
    const huge = 'const x = 1;\n'.repeat(MAX_HIGHLIGHT_LENGTH);
    const lines = tokenizeToLines(huge, 'javascript');
    expect(lines.flat().every(t => t.type === 'plain')).toBe(true);
  });
});
