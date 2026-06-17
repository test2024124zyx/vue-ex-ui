/**
 * 代码高亮公共入口（零依赖、同步、XSS 安全）。
 *
 * - `tokenizeToLines` 供组件按行渲染（文本节点输出，天然防注入，无需消毒）。
 * - `highlightToHtml` 供需要 HTML 字符串的场景（已逐 token 转义）。
 */

import { escapeHtml, type Token, tokenize, tokenizeLines } from './engine';
import { getGrammar, isLanguageSupported, normalizeLanguage, SUPPORTED_LANGUAGES } from './grammars';

export type { Token } from './engine';
export { SUPPORTED_LANGUAGES, isLanguageSupported, normalizeLanguage };

/**
 * 当代码超过该长度时跳过分词、退化为纯文本渲染，
 * 防止超大输入在编辑等高频场景下阻塞主线程。
 */
export const MAX_HIGHLIGHT_LENGTH = 50_000;

/** 把代码分词为「逐行」token 结构。超长时退化为纯文本。 */
export function tokenizeToLines(code: string, language?: string): Token[][] {
  const grammar = code.length > MAX_HIGHLIGHT_LENGTH ? null : getGrammar(language);
  return tokenizeLines(code, grammar);
}

/** 把代码高亮为安全的 HTML 字符串（每个 token 包裹 <span class="ex-token-*">，已转义）。 */
export function highlightToHtml(code: string, language?: string): string {
  const grammar = code.length > MAX_HIGHLIGHT_LENGTH ? null : getGrammar(language);
  const tokens = tokenize(code, grammar);
  let html = '';
  for (const token of tokens) {
    const text = escapeHtml(token.value);
    html += token.type === 'plain' ? text : `<span class="ex-token-${token.type}">${text}</span>`;
  }
  return html;
}

export { escapeHtml };
