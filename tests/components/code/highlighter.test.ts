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
import { getGrammar } from '../../../src/components/code/highlighter/grammars';

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

  it('各语言规则不包含 Safari 16.4 之前无法解析的正则后顾断言', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      expect(getGrammar(language)?.rules.every(rule => !/\(\?<([=!])/.test(rule.re.source))).toBe(
        true
      );
    }
  });

  it('区分 JavaScript 正则、除法和成员属性，并保留原始文本与高亮优先级', () => {
    const source = 'return  /[a/b]+/gi; total /= divisor(); target.value; target.call();';
    const tokens = tokenizeToLines(source, 'javascript').flat();
    expect(tokens.map(token => token.value).join('')).toBe(source);
    expect(tokens).toContainEqual({ type: 'regexp', value: '/[a/b]+/gi' });
    expect(tokens).toContainEqual({ type: 'operator', value: '/=' });
    expect(tokens).toContainEqual({ type: 'property', value: 'value' });
    expect(tokens).toContainEqual({ type: 'function', value: 'call' });
    expect(tokens).toContainEqual({ type: 'function', value: 'divisor' });
  });

  it.each([
    ['shell', 'npm --flag -x config--other', ['--flag', '-x']],
    ['markdown', '*斜体* 与 _斜体_，以及 **加粗**', ['*斜体*', '_斜体_']],
  ])('%s 保留依赖前置字符的高亮规则', (language, source, properties) => {
    const tokens = tokenizeToLines(source, language).flat();
    expect(tokens.map(token => token.value).join('')).toBe(source);
    expect(tokens.filter(token => token.type === 'property').map(token => token.value)).toEqual(
      properties
    );
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

  it('单行编辑只替换实际变化行的着色数据', () => {
    const code = Array.from({ length: 700 }, (_, index) => `const value${index} = ${index};`);
    const previous = tokenizeToLines(code.join('\n'), 'typescript');
    code[350] = 'const value350 = 42;';
    const edited = tokenizeToLines(code.join('\n'), 'typescript', previous);
    expect(edited.filter((line, index) => line !== previous[index])).toHaveLength(1);
    expect(edited[350]).not.toBe(previous[350]);
    expect(edited[350]).toContainEqual({ type: 'number', value: '42' });
  });

  it('同一文本的跨行语法状态变化时更新着色', () => {
    const previous = tokenizeToLines('/* 注释\nconst value = 1;\n*/', 'javascript');
    const edited = tokenizeToLines('// 注释\nconst value = 1;\n*/', 'javascript', previous);
    expect(edited[1]).not.toBe(previous[1]);
    expect(edited[1]).toContainEqual({ type: 'keyword', value: 'const' });
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
