/**
 * 各语言语法定义（零依赖）。
 *
 * 约定：规则正则内部一律使用非捕获组 (?:...)，不得出现捕获组 ( ... )，
 * 以保证 engine 通过「每条规则一个外层捕获组」反查类型的不变量成立。
 *
 * 规则顺序即优先级：同一位置上靠前的规则先命中。通用顺序为
 * 注释 → 字符串 → 数字 → 字面量 → 关键字 → 类型/内建 → 函数 → 操作符 → 标点。
 */

import type { Grammar, GrammarRule } from './engine';

/** 把关键字数组编译为 `\b(?:a|b|c)\b` 形式的正则。 */
function words(list: string[]): RegExp {
  const escaped = list.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(?:${escaped.join('|')})\\b`);
}

// 通用数字：十六进制 / 二进制 / 八进制 / 十进制（含小数、科学计数、BigInt 后缀）。
const NUMBER =
  /\b0[xX][0-9a-fA-F][0-9a-fA-F_]*\b|\b0[bB][01][01_]*\b|\b0[oO][0-7][0-7_]*\b|\b\d[\d_]*(?:\.\d[\d_]*)?(?:[eE][+-]?\d+)?n?\b|\.\d[\d_]*(?:[eE][+-]?\d+)?\b/;

const LINE_COMMENT_SLASH: GrammarRule = { type: 'comment', re: /\/\/[^\n]*/ };
const BLOCK_COMMENT: GrammarRule = { type: 'comment', re: /\/\*[\s\S]*?(?:\*\/|(?![\s\S]))/ };
const HASH_COMMENT: GrammarRule = { type: 'comment', re: /#[^\n]*/ };
const DQ_STRING: GrammarRule = { type: 'string', re: /"(?:\\.|[^"\\\n])*"/ };
const SQ_STRING: GrammarRule = { type: 'string', re: /'(?:\\.|[^'\\\n])*'/ };

// ---------------------------------------------------------------------------
// JavaScript / TypeScript
// ---------------------------------------------------------------------------

const JS_KEYWORDS = [
  'abstract', 'as', 'async', 'await', 'break', 'case', 'catch', 'class', 'const',
  'continue', 'debugger', 'declare', 'default', 'delete', 'do', 'else', 'enum',
  'export', 'extends', 'finally', 'for', 'from', 'function', 'get', 'if',
  'implements', 'import', 'in', 'instanceof', 'interface', 'let', 'namespace',
  'new', 'of', 'package', 'private', 'protected', 'public', 'readonly', 'return',
  'satisfies', 'set', 'static', 'super', 'switch', 'this', 'throw', 'try',
  'typeof', 'var', 'void', 'while', 'with', 'yield', 'keyof', 'infer', 'is',
  'override', 'type',
];

const JS_BUILTINS = [
  'Array', 'ArrayBuffer', 'Boolean', 'BigInt', 'Date', 'Error', 'Function',
  'JSON', 'Map', 'Math', 'Number', 'Object', 'Promise', 'Proxy', 'Reflect',
  'RegExp', 'Set', 'String', 'Symbol', 'WeakMap', 'WeakSet', 'console',
  'document', 'window', 'globalThis', 'Infinity', 'NaN',
];

function javascript(): Grammar {
  return {
    rules: [
      LINE_COMMENT_SLASH,
      BLOCK_COMMENT,
      // 模板字符串（不深入高亮内部插值，但整体着色）。
      { type: 'string', re: /`(?:\\.|\$\{(?:[^{}]|\{[^}]*\})*\}|[^`\\])*`/ },
      DQ_STRING,
      SQ_STRING,
      // 正则字面量：用变长后顾断言限定其只在「值位置」出现，避免误判除法。
      {
        type: 'regexp',
        re: /(?<=(?:[=(,:[!&|?{};]|=>|\breturn|\btypeof)\s*)\/(?![*/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^/\\\n])+\/[gimsuy]*/,
      },
      { type: 'number', re: NUMBER },
      { type: 'boolean', re: /\b(?:true|false|null|undefined|NaN|Infinity)\b/ },
      { type: 'keyword', re: words(JS_KEYWORDS) },
      { type: 'class', re: words(JS_BUILTINS) },
      // 形如 PascalCase 的标识符按类型/构造器着色。
      { type: 'class', re: /\b[A-Z][A-Za-z0-9_]*\b/ },
      // 装饰器。
      { type: 'meta', re: /@[A-Za-z_$][\w$]*/ },
      // 调用位置的标识符（含方法名）着色为函数。
      { type: 'function', re: /[A-Za-z_$][\w$]*(?=\s*[<(])/ },
      // 成员访问属性。
      { type: 'property', re: /(?<=\.)[A-Za-z_$][\w$]*/ },
      { type: 'operator', re: /=>|\.\.\.|\?\.|\?\?|[+\-*/%=<>!&|^~?]+/ },
      { type: 'punctuation', re: /[{}()[\];,.:]/ },
    ],
  };
}

// ---------------------------------------------------------------------------
// JSON
// ---------------------------------------------------------------------------

function json(): Grammar {
  return {
    rules: [
      { type: 'property', re: /"(?:\\.|[^"\\\n])*"(?=\s*:)/ },
      DQ_STRING,
      { type: 'number', re: NUMBER },
      { type: 'boolean', re: /\b(?:true|false|null)\b/ },
      { type: 'punctuation', re: /[{}[\],:]/ },
    ],
  };
}

// ---------------------------------------------------------------------------
// CSS / SCSS
// ---------------------------------------------------------------------------

function css(): Grammar {
  return {
    rules: [
      BLOCK_COMMENT,
      LINE_COMMENT_SLASH, // SCSS 行注释
      { type: 'string', re: /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/ },
      { type: 'important', re: /!important\b/ },
      // at 规则 / SCSS 指令。
      { type: 'meta', re: /@[\w-]+/ },
      // SCSS 变量 / CSS 自定义属性。
      { type: 'variable', re: /\$[\w-]+|--[\w-]+/ },
      // 十六进制颜色 / 带单位数值。
      {
        type: 'number',
        re: /#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|r?em|%|vh|vw|vmin|vmax|fr|deg|s|ms|pt|pc|ch|ex|cm|mm|in|dpi|dppx)?\b/,
      },
      { type: 'function', re: /[\w-]+(?=\s*\()/ },
      // 属性名（冒号前）。
      { type: 'property', re: /[a-zA-Z-]+(?=\s*:)/ },
      { type: 'operator', re: /[>+~]/ },
      { type: 'punctuation', re: /[{}()[\];:,]/ },
    ],
  };
}

// ---------------------------------------------------------------------------
// HTML / XML / Vue（标记语言）
// ---------------------------------------------------------------------------

function markup(): Grammar {
  return {
    rules: [
      { type: 'comment', re: /<!--[\s\S]*?(?:-->|(?![\s\S]))/ },
      { type: 'meta', re: /<!DOCTYPE[^>]*>/ },
      { type: 'meta', re: /<\?[\s\S]*?(?:\?>|(?![\s\S]))/ },
      { type: 'meta', re: /<!\[CDATA\[[\s\S]*?(?:\]\]>|(?![\s\S]))/ },
      // 标签起始：<tag 或 </tag。
      { type: 'tag', re: /<\/?[A-Za-z][\w:-]*/ },
      // 标签结束：> 或 />。
      { type: 'tag', re: /\/?>/ },
      // 属性名（等号前）—— 兼容 Vue 的 @click / :prop / v-if。
      { type: 'attr', re: /\b[\w@:.#-]+(?=\s*=)/ },
      { type: 'string', re: /"[^"]*"|'[^']*'/ },
      // 实体。
      { type: 'meta', re: /&#?[a-zA-Z0-9]+;/ },
      { type: 'operator', re: /=/ },
    ],
  };
}

// ---------------------------------------------------------------------------
// Bash / Shell
// ---------------------------------------------------------------------------

const SHELL_KEYWORDS = [
  'if', 'then', 'else', 'elif', 'fi', 'for', 'while', 'until', 'do', 'done',
  'case', 'esac', 'in', 'function', 'select', 'return', 'break', 'continue',
  'exit', 'export', 'local', 'readonly', 'declare', 'source', 'alias', 'set',
  'unset', 'trap', 'eval', 'exec',
];

const SHELL_COMMANDS = [
  'echo', 'cd', 'ls', 'pwd', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'touch', 'cat',
  'less', 'more', 'head', 'tail', 'grep', 'sed', 'awk', 'find', 'xargs', 'sort',
  'uniq', 'wc', 'cut', 'tr', 'tee', 'curl', 'wget', 'ssh', 'scp', 'rsync', 'tar',
  'gzip', 'zip', 'unzip', 'chmod', 'chown', 'sudo', 'kill', 'ps', 'top', 'git',
  'npm', 'pnpm', 'yarn', 'node', 'npx', 'docker', 'kubectl', 'make',
];

function shell(): Grammar {
  return {
    rules: [
      HASH_COMMENT,
      { type: 'string', re: /"(?:\\.|[^"\\])*"|'[^']*'/ },
      // 变量：$VAR / ${...} / $1 等。
      { type: 'variable', re: /\$\{[^}]*\}|\$[\w@*#?!$-]+/ },
      { type: 'keyword', re: words(SHELL_KEYWORDS) },
      { type: 'function', re: words(SHELL_COMMANDS) },
      // 长短选项。
      { type: 'property', re: /(?<=\s)--?[\w-]+/ },
      { type: 'number', re: /\b\d+\b/ },
      { type: 'operator', re: /&&|\|\||[|&;<>]/ },
    ],
  };
}

// ---------------------------------------------------------------------------
// Python
// ---------------------------------------------------------------------------

const PY_KEYWORDS = [
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def',
  'del', 'elif', 'else', 'except', 'finally', 'for', 'from', 'global', 'if',
  'import', 'in', 'is', 'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise',
  'return', 'try', 'while', 'with', 'yield', 'match', 'case',
];

const PY_BUILTINS = [
  'abs', 'all', 'any', 'bool', 'dict', 'enumerate', 'filter', 'float', 'frozenset',
  'getattr', 'hasattr', 'input', 'int', 'isinstance', 'issubclass', 'len', 'list',
  'map', 'max', 'min', 'next', 'object', 'open', 'print', 'range', 'repr',
  'reversed', 'round', 'set', 'setattr', 'sorted', 'str', 'sum', 'super', 'tuple',
  'type', 'zip', 'self', 'cls',
];

function python(): Grammar {
  return {
    rules: [
      HASH_COMMENT,
      // 三引号 / 普通字符串（含 r/b/f 前缀）。
      {
        type: 'string',
        re: /(?:[rbfRBF]{0,2})(?:"""[\s\S]*?(?:"""|(?![\s\S]))|'''[\s\S]*?(?:'''|(?![\s\S]))|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')/,
      },
      // 装饰器。
      { type: 'meta', re: /@[\w.]+/ },
      { type: 'number', re: NUMBER },
      { type: 'boolean', re: /\b(?:True|False|None)\b/ },
      { type: 'keyword', re: words(PY_KEYWORDS) },
      { type: 'class', re: words(PY_BUILTINS) },
      { type: 'class', re: /\b[A-Z][A-Za-z0-9_]*\b/ },
      { type: 'function', re: /\b[A-Za-z_]\w*(?=\s*\()/ },
      { type: 'operator', re: /[+\-*/%=<>!&|^~@]+/ },
      { type: 'punctuation', re: /[{}()[\];,.:]/ },
    ],
  };
}

// ---------------------------------------------------------------------------
// SQL（大小写不敏感）
// ---------------------------------------------------------------------------

const SQL_KEYWORDS = [
  'select', 'from', 'where', 'insert', 'into', 'values', 'update', 'set',
  'delete', 'create', 'alter', 'drop', 'table', 'view', 'index', 'join', 'inner',
  'left', 'right', 'outer', 'full', 'on', 'as', 'and', 'or', 'not', 'null', 'is',
  'in', 'like', 'between', 'group', 'by', 'order', 'having', 'limit', 'offset',
  'distinct', 'union', 'all', 'primary', 'key', 'foreign', 'references', 'default',
  'unique', 'check', 'constraint', 'add', 'column', 'asc', 'desc', 'case', 'when',
  'then', 'else', 'end', 'exists', 'with', 'returning', 'database', 'use', 'grant',
  'count', 'sum', 'avg', 'min', 'max', 'int', 'varchar', 'text', 'boolean', 'date',
  'timestamp', 'serial', 'auto_increment',
];

function sql(): Grammar {
  return {
    flags: 'i',
    rules: [
      { type: 'comment', re: /--[^\n]*/ },
      BLOCK_COMMENT,
      { type: 'string', re: /'(?:''|[^'])*'/ },
      { type: 'string', re: /"(?:""|[^"])*"|`[^`]*`/ },
      { type: 'keyword', re: words(SQL_KEYWORDS) },
      { type: 'number', re: NUMBER },
      { type: 'function', re: /\b[A-Za-z_]\w*(?=\s*\()/ },
      { type: 'operator', re: /[+\-*/%=<>!]+/ },
      { type: 'punctuation', re: /[(),;.]/ },
    ],
  };
}

// ---------------------------------------------------------------------------
// YAML
// ---------------------------------------------------------------------------

function yaml(): Grammar {
  return {
    rules: [
      HASH_COMMENT,
      // 键（行首，允许列表短横线缩进）。
      { type: 'property', re: /^[ \t]*(?:-[ \t]+)?[\w.-]+(?=\s*:)/ },
      { type: 'string', re: /"(?:\\.|[^"\\\n])*"|'(?:''|[^'])*'/ },
      // 锚点 / 别名 / 标签。
      { type: 'meta', re: /[&*][\w-]+|!!?[\w/]+/ },
      { type: 'boolean', re: /\b(?:true|false|null|yes|no|on|off|~|Null|True|False)\b/ },
      { type: 'number', re: NUMBER },
      { type: 'punctuation', re: /[:\-{}[\],]/ },
    ],
  };
}

// ---------------------------------------------------------------------------
// Markdown（尽力而为）
// ---------------------------------------------------------------------------

function markdown(): Grammar {
  return {
    rules: [
      { type: 'comment', re: /<!--[\s\S]*?(?:-->|(?![\s\S]))/ },
      // 围栏代码块。
      { type: 'string', re: /```[\s\S]*?(?:```|(?![\s\S]))/ },
      { type: 'string', re: /`[^`\n]+`/ },
      // 标题。
      { type: 'keyword', re: /^#{1,6}[ \t].*/ },
      // 引用块。
      { type: 'comment', re: /^>.*/ },
      // 加粗 / 斜体。
      { type: 'class', re: /\*\*[^*\n]+\*\*|__[^_\n]+__/ },
      { type: 'property', re: /(?<!\*)\*(?!\*)[^*\n]+\*(?!\*)|(?<!_)_(?!_)[^_\n]+_(?!_)/ },
      // 链接 / 图片。
      { type: 'function', re: /!?\[[^\]\n]*\]\([^)\n]*\)/ },
      // 列表标记 / 分隔线。
      { type: 'operator', re: /^[ \t]*(?:[-*+]|\d+\.)(?=\s)|^(?:---+|\*\*\*+|___+)$/ },
    ],
  };
}

// ---------------------------------------------------------------------------
// C 系语言（Java / C++ / C# / Go / Rust）
// ---------------------------------------------------------------------------

interface CLikeOptions {
  keywords: string[];
  builtins?: string[];
  /** 预处理 / 属性宏（如 C/C++ 的 #include、Rust 的 #[derive]）。 */
  preprocessor?: RegExp;
  /** 额外的字符串规则（如 Rust 原始字符串）。 */
  extraStrings?: GrammarRule[];
}

function cLike(opts: CLikeOptions): Grammar {
  const rules: GrammarRule[] = [LINE_COMMENT_SLASH, BLOCK_COMMENT];
  if (opts.preprocessor) rules.push({ type: 'meta', re: opts.preprocessor });
  if (opts.extraStrings) rules.push(...opts.extraStrings);
  rules.push(
    DQ_STRING,
    { type: 'string', re: /'(?:\\.|[^'\\\n])'/ }, // 字符字面量
    { type: 'number', re: NUMBER },
    { type: 'boolean', re: /\b(?:true|false|null|nullptr|None|nil)\b/ },
    { type: 'keyword', re: words(opts.keywords) }
  );
  if (opts.builtins?.length) rules.push({ type: 'class', re: words(opts.builtins) });
  rules.push(
    { type: 'class', re: /\b[A-Z][A-Za-z0-9_]*\b/ },
    { type: 'function', re: /\b[A-Za-z_]\w*(?=\s*[<(])/ },
    { type: 'operator', re: /->|=>|::|&&|\|\||[+\-*/%=<>!&|^~?]+/ },
    { type: 'punctuation', re: /[{}()[\];,.:]/ }
  );
  return { rules };
}

const java = (): Grammar =>
  cLike({
    keywords: [
      'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
      'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
      'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
      'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
      'package', 'private', 'protected', 'public', 'return', 'short', 'static',
      'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
      'transient', 'try', 'var', 'void', 'volatile', 'while', 'record', 'yield',
      'sealed', 'permits',
    ],
    builtins: ['String', 'System', 'Integer', 'List', 'Map', 'Object', 'Override'],
    preprocessor: /@[A-Za-z_]\w*/,
  });

const cpp = (): Grammar =>
  cLike({
    keywords: [
      'alignas', 'alignof', 'auto', 'bool', 'break', 'case', 'catch', 'char',
      'class', 'const', 'constexpr', 'continue', 'decltype', 'default', 'delete',
      'do', 'double', 'else', 'enum', 'explicit', 'export', 'extern', 'float',
      'for', 'friend', 'goto', 'if', 'inline', 'int', 'long', 'mutable',
      'namespace', 'new', 'noexcept', 'operator', 'override', 'private',
      'protected', 'public', 'register', 'return', 'short', 'signed', 'sizeof',
      'static', 'struct', 'switch', 'template', 'this', 'throw', 'try',
      'typedef', 'typename', 'union', 'unsigned', 'using', 'virtual', 'void',
      'volatile', 'while', 'wchar_t', 'final',
    ],
    builtins: ['std', 'string', 'vector', 'map', 'cout', 'cin', 'endl', 'size_t'],
    preprocessor: /^[ \t]*#[ \t]*\w+/,
  });

const csharp = (): Grammar =>
  cLike({
    keywords: [
      'abstract', 'as', 'base', 'bool', 'break', 'byte', 'case', 'catch', 'char',
      'checked', 'class', 'const', 'continue', 'decimal', 'default', 'delegate',
      'do', 'double', 'else', 'enum', 'event', 'explicit', 'extern', 'finally',
      'fixed', 'float', 'for', 'foreach', 'goto', 'if', 'implicit', 'in', 'int',
      'interface', 'internal', 'is', 'lock', 'long', 'namespace', 'new', 'object',
      'operator', 'out', 'override', 'params', 'private', 'protected', 'public',
      'readonly', 'ref', 'return', 'sbyte', 'sealed', 'short', 'sizeof', 'static',
      'string', 'struct', 'switch', 'this', 'throw', 'try', 'typeof', 'uint',
      'ulong', 'unchecked', 'unsafe', 'ushort', 'using', 'var', 'virtual', 'void',
      'volatile', 'while', 'async', 'await', 'record', 'get', 'set', 'value',
    ],
    builtins: ['Console', 'String', 'List', 'Task', 'Dictionary', 'Exception'],
    preprocessor: /^[ \t]*#[ \t]*\w+|\[[A-Za-z_]\w*\]/,
  });

const go = (): Grammar =>
  cLike({
    keywords: [
      'break', 'case', 'chan', 'const', 'continue', 'default', 'defer', 'else',
      'fallthrough', 'for', 'func', 'go', 'goto', 'if', 'import', 'interface',
      'map', 'package', 'range', 'return', 'select', 'struct', 'switch', 'type',
      'var', 'bool', 'byte', 'rune', 'string', 'int', 'int8', 'int16', 'int32',
      'int64', 'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'float32',
      'float64', 'complex64', 'complex128', 'error', 'any',
    ],
    builtins: ['append', 'cap', 'close', 'copy', 'delete', 'len', 'make', 'new', 'panic', 'recover', 'print', 'println'],
    extraStrings: [{ type: 'string', re: /`[^`]*`/ }],
  });

const rust = (): Grammar =>
  cLike({
    keywords: [
      'as', 'async', 'await', 'break', 'const', 'continue', 'crate', 'dyn',
      'else', 'enum', 'extern', 'fn', 'for', 'if', 'impl', 'in', 'let', 'loop',
      'match', 'mod', 'move', 'mut', 'pub', 'ref', 'return', 'self', 'Self',
      'static', 'struct', 'super', 'trait', 'type', 'unsafe', 'use', 'where',
      'while', 'bool', 'char', 'str', 'u8', 'u16', 'u32', 'u64', 'u128', 'usize',
      'i8', 'i16', 'i32', 'i64', 'i128', 'isize', 'f32', 'f64', 'String', 'Vec',
      'Option', 'Result', 'Box',
    ],
    builtins: ['println', 'print', 'format', 'vec', 'panic', 'assert', 'Some', 'None', 'Ok', 'Err'],
    preprocessor: /#!?\[[^\]]*\]/,
    extraStrings: [{ type: 'string', re: /r#*"[\s\S]*?"#*/ }],
  });

// ---------------------------------------------------------------------------
// 注册表
// ---------------------------------------------------------------------------

const BUILDERS: Record<string, () => Grammar> = {
  javascript,
  typescript: javascript,
  json,
  css,
  scss: css,
  html: markup,
  xml: markup,
  vue: markup,
  bash: shell,
  shell,
  python,
  sql,
  yaml,
  markdown,
  java,
  cpp,
  csharp,
  go,
  rust,
};

const ALIASES: Record<string, string> = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  rb: 'shell',
  sh: 'shell',
  zsh: 'shell',
  yml: 'yaml',
  md: 'markdown',
  htm: 'html',
  'c++': 'cpp',
  'c#': 'csharp',
  cs: 'csharp',
  golang: 'go',
  rs: 'rust',
};

// 缓存已构建的 Grammar，保证 engine 的 WeakMap 编译缓存命中。
const grammarCache = new Map<string, Grammar>();

/** 受支持的语言标识（不含别名）。 */
export const SUPPORTED_LANGUAGES: string[] = Object.keys(BUILDERS);

/** 归一化语言标识（小写、去空白、解析别名）。 */
export function normalizeLanguage(language?: string): string {
  const key = language?.trim().toLowerCase() ?? '';
  return ALIASES[key] ?? key;
}

/** 取得某语言的 Grammar；plaintext / 未知语言返回 null（按纯文本处理）。 */
export function getGrammar(language?: string): Grammar | null {
  const key = normalizeLanguage(language);
  if (!key || key === 'plaintext' || key === 'text' || key === 'plain') return null;

  const cached = grammarCache.get(key);
  if (cached) return cached;

  const builder = BUILDERS[key];
  if (!builder) return null;

  const grammar = builder();
  grammarCache.set(key, grammar);
  return grammar;
}

/** 语言是否被支持（用于决定是否展示语言标签等）。 */
export function isLanguageSupported(language?: string): boolean {
  return getGrammar(language) !== null;
}
