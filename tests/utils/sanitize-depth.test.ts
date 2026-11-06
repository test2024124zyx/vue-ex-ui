import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from '../../src/utils/sanitize';

const DEEP_HTML_LEVELS = 4096;
const WIDE_HTML_NODES = 20000;

describe('HTML 消毒在受限压力样本中不依赖调用栈深度', () => {
  it('深层合法内容保持结构和文本，不通过截断掩盖栈溢出', () => {
    const prefix = '<div>'.repeat(DEEP_HTML_LEVELS);
    const suffix = '</div>'.repeat(DEEP_HTML_LEVELS);
    const input = `${prefix}<b>有效内容 &amp; 中文</b>${suffix}`;
    expect(sanitizeHtml(input)).toBe(input);
  });

  it('深层未知包装标签仍被展开，危险子树及属性仍移除', () => {
    const input =
      '<custom>'.repeat(DEEP_HTML_LEVELS) +
      '<script>不应保留</script><span onclick="不应执行">安全内容</span>' +
      '</custom>'.repeat(DEEP_HTML_LEVELS);
    expect(sanitizeHtml(input)).toBe('<span>安全内容</span>');
  });

  it('宽列表不会因展开参数数量过多而抛异常', () => {
    const child = '<span>子项</span>';
    expect(sanitizeHtml(`<custom>${child.repeat(WIDE_HTML_NODES)}</custom>`)).toBe(
      child.repeat(WIDE_HTML_NODES)
    );
  });

  it.each(['xmp', 'noembed', 'noframes', 'plaintext'])(
    '%s 原始文本不能在移除包装后重新变成可执行 HTML',
    tag => {
      const payload = '<img src="data:image/png;base64,AAAA" onerror="window.__sanitizerProbe=1">';
      const result = sanitizeHtml(`<${tag}>${payload}</${tag}>`);
      const parsed = new DOMParser().parseFromString(result, 'text/html');
      expect(parsed.querySelector('img')).toBeNull();
      expect(parsed.body.textContent).toContain(payload);
    }
  );
});
