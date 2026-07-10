/**
 * 轻量语法高亮引擎（零依赖）。
 *
 * 设计要点：
 * - 每种语言由一组有序的「规则」(GrammarRule) 描述：每条规则是一个正则 + token 类型。
 * - 所有规则在编译期被合并成「单个」全局正则（交替分支），分词时一次线性扫描即可，
 *   不做逐字符回溯，性能可控；编译结果按 Grammar 引用缓存。
 * - 规则正则内部禁止出现「捕获组」（只能用 (?:...)）：引擎依赖「每条规则恰好一个捕获组」
 *   的不变量来反查命中的是哪条规则。
 * - 分词只产出 {type, value} 序列；渲染层通过文本节点（而非 v-html）输出，从根上消除 XSS，
 *   因此本模块不需要任何 HTML 消毒。
 */

/** 单个 token：type 为类型（用于着色），value 为原始文本（含换行时由上层切分）。 */
export interface Token {
  type: string;
  value: string;
}

/** 语法规则：命中 `re` 的文本被标记为 `type`。`re` 内部不得含捕获组。 */
export interface GrammarRule {
  type: string;
  re: RegExp;
}

/** 一种语言的语法：有序规则集合 + 可选正则标志（如 SQL 的大小写不敏感 'i'）。 */
export interface Grammar {
  rules: GrammarRule[];
  /** 追加到合并正则上的标志，仅支持 'i'（大小写不敏感）。 */
  flags?: string;
}

interface CompiledGrammar {
  regex: RegExp;
  types: string[];
}

const compileCache = new WeakMap<Grammar, CompiledGrammar>();

/** 把语法编译为「单个」全局正则；结果按 Grammar 引用缓存，避免重复构建。 */
function compile(grammar: Grammar): CompiledGrammar {
  const cached = compileCache.get(grammar);
  if (cached) return cached;

  const types: string[] = [];
  // 每条规则包一层捕获组，命中后用组下标反查类型。
  const source = grammar.rules
    .map(rule => {
      types.push(rule.type);
      return `(${rule.re.source})`;
    })
    .join('|');

  // 始终带 g（驱动 exec 扫描）与 m（让 ^/$ 作用于每一行）。
  let flags = 'gm';
  if (grammar.flags?.includes('i')) flags += 'i';

  const compiled: CompiledGrammar = { regex: new RegExp(source, flags), types };
  compileCache.set(grammar, compiled);
  return compiled;
}

/**
 * 分词：把源码切成 token 序列。
 * grammar 为 null（如 plaintext / 未知语言）时整体作为一个 plain token 返回。
 */
export function tokenize(code: string, grammar: Grammar | null): Token[] {
  if (!grammar || !code) {
    return code ? [{ type: 'plain', value: code }] : [];
  }

  const { regex, types } = compile(grammar);
  const tokens: Token[] = [];
  let lastIndex = 0;
  regex.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(code)) !== null) {
    // 命中前的未匹配文本作为 plain token。
    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', value: code.slice(lastIndex, match.index) });
    }

    // 反查命中的规则：第一个非 undefined 的捕获组。
    let groupIndex = -1;
    for (let i = 1; i < match.length; i++) {
      if (match[i] !== undefined) {
        groupIndex = i - 1;
        break;
      }
    }

    tokens.push({ type: types[groupIndex] ?? 'plain', value: match[0] });
    lastIndex = regex.lastIndex;

    // 防御零宽匹配导致的死循环。
    if (match.index === regex.lastIndex) regex.lastIndex++;
  }

  // 收尾的未匹配文本。
  if (lastIndex < code.length) {
    tokens.push({ type: 'plain', value: code.slice(lastIndex) });
  }

  return tokens;
}

/**
 * 把 token 序列按换行切成「逐行」结构，供按行渲染（行号、行高亮、换行对齐）。
 * 跨行 token（块注释、模板字符串等）会被正确拆分到多行。
 * 返回的行数恒等于 code.split('\n').length。
 */
export function tokenizeLines(code: string, grammar: Grammar | null): Token[][] {
  const tokens = tokenize(code, grammar);
  const lines: Token[][] = [[]];

  for (const token of tokens) {
    const parts = token.value.split('\n');
    for (let i = 0; i < parts.length; i++) {
      if (i > 0) lines.push([]);
      const part = parts[i];
      const current = lines[lines.length - 1];
      if (part && current) {
        current.push({ type: token.type, value: part });
      }
    }
  }

  return lines;
}

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
};

/** 转义 HTML 文本节点中的特殊字符。 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, ch => ESCAPE_MAP[ch] ?? ch);
}
