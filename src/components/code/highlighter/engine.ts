/**
 * 轻量语法高亮引擎（零依赖）。
 *
 * 设计要点：
 * - 每种语言由一组有序的「规则」(GrammarRule) 描述：每条规则是一个正则 + token 类型。
 * - 所有规则在编译期被合并成「单个」全局正则（交替分支），统一推进扫描位置；
 *   重复子表达式仍须保证分支互斥，防止正则引擎回溯；编译结果按 Grammar 引用缓存。
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
  /** 在需要前文时拒绝候选项，或在确认上下文后读取完整文本。 */
  resolve?: (code: string, start: number, value: string) => string | undefined;
}

/** 一种语言的语法：有序规则集合 + 可选正则标志（如 SQL 的大小写不敏感 'i'）。 */
export interface Grammar {
  rules: GrammarRule[];
  /** 追加到合并正则上的标志，仅支持 'i'（大小写不敏感）。 */
  flags?: string;
}

interface CompiledGrammar {
  regex: RegExp;
  alternatives: RegExp[];
}

const compileCache = new WeakMap<Grammar, CompiledGrammar>();

/** 把语法编译为「单个」全局正则；结果按 Grammar 引用缓存，避免重复构建。 */
function compile(grammar: Grammar): CompiledGrammar {
  const cached = compileCache.get(grammar);
  if (cached) return cached;

  // 每条规则包一层捕获组，命中后用组下标反查类型。
  const source = grammar.rules.map(rule => `(${rule.re.source})`).join('|');

  // 始终带 g（驱动 exec 扫描）与 m（让 ^/$ 作用于每一行）。
  let flags = 'gm';
  if (grammar.flags?.includes('i')) flags += 'i';

  const alternatives = grammar.rules.some(rule => rule.resolve)
    ? grammar.rules.map(rule => new RegExp(rule.re.source, flags.replace('g', 'y')))
    : [];
  const compiled: CompiledGrammar = { regex: new RegExp(source, flags), alternatives };
  compileCache.set(grammar, compiled);
  return compiled;
}

function resolveToken(
  code: string,
  match: RegExpExecArray,
  ruleIndex: number,
  rules: GrammarRule[],
  alternatives: RegExp[]
): Token | undefined {
  let value: string | undefined = match[0];
  // 上下文不符时，只在相同位置尝试优先级更低的规则，避免吞掉后续 token。
  for (let index = ruleIndex; index < rules.length; index += 1) {
    const rule = rules[index]!;
    if (index !== ruleIndex) {
      const alternative = alternatives[index]!;
      alternative.lastIndex = match.index;
      value = alternative.exec(code)?.[0];
    }
    if (value === undefined) continue;
    const resolved = rule.resolve ? rule.resolve(code, match.index, value) : value;
    if (resolved !== undefined) return { type: rule.type, value: resolved };
  }
  return undefined;
}

/**
 * 分词：把源码切成 token 序列。
 * grammar 为 null（如 plaintext / 未知语言）时整体作为一个 plain token 返回。
 */
export function tokenize(code: string, grammar: Grammar | null): Token[] {
  if (!grammar?.rules.length || !code) {
    return code ? [{ type: 'plain', value: code }] : [];
  }

  const { regex, alternatives } = compile(grammar);
  const tokens: Token[] = [];
  let lastIndex = 0;
  regex.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = regex.exec(code)) !== null) {
    // 反查命中的规则：第一个非 undefined 的捕获组。
    let groupIndex = -1;
    for (let i = 1; i < match.length; i++) {
      if (match[i] !== undefined) {
        groupIndex = i - 1;
        break;
      }
    }

    const token = resolveToken(code, match, groupIndex, grammar.rules, alternatives);
    // 被拒绝或零宽的候选项也必须推进扫描位置。
    regex.lastIndex = match.index + Math.max(1, token?.value.length ?? 0);
    if (!token || token.type === 'plain') continue;

    if (match.index > lastIndex) {
      tokens.push({ type: 'plain', value: code.slice(lastIndex, match.index) });
    }
    tokens.push(token);
    lastIndex = match.index + token.value.length;
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
