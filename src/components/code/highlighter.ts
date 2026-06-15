/**
 * 语法高亮封装。
 * highlight.js 作为可选依赖，运行时按需加载；未安装时静默降级为转义纯文本。
 *
 * 说明：使用静态字符串 import 便于打包器 Vite 正确解析模块；
 * 库构建时 highlight.js 作为 peerDependency 被外部化，消费方未安装时
 * 动态 import 失败会被 catch 捕获并降级，不影响代码展示。
 */

import { escapeHtml, sanitizeHtml } from '../../utils/sanitize';

// highlight.js 的类型在可选依赖场景下不应强绑到运行入口。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Hljs = any;

let hljs: Hljs | null = null;
let loadPromise: Promise<Hljs | null> | null = null;

const LANGUAGE_ALIASES: Record<string, string> = {
  vue: 'xml',
  shell: 'bash',
};

// 将常用语言别名归一化到 highlight.js/lib/common 已注册的语言名。
const normalizeLanguage = (language?: string): string | undefined => {
  const normalized = language?.trim().toLowerCase();
  if (!normalized) return undefined;

  return LANGUAGE_ALIASES[normalized] ?? normalized;
};

// 纯文本路径只做 HTML 转义，确保代码内容原样展示但不能注入页面。
const highlightPlainText = (code: string): HighlightResult => ({
  html: escapeHtml(code),
  highlighted: false,
});

/** 异步加载 highlight.js（只加载一次，结果缓存）。 */
export const loadHighlighter = (): Promise<Hljs | null> => {
  if (hljs) return Promise.resolve(hljs);
  if (!loadPromise) {
    loadPromise = import('highlight.js/lib/common')
      .then(mod => {
        hljs = (mod as { default?: Hljs })?.default ?? (mod as Hljs) ?? null;
        return hljs;
      })
      .catch(() => null);
  }
  return loadPromise;
};

export interface HighlightResult {
  /** 高亮后的 HTML（降级时为转义纯文本，可安全用于 v-html）。 */
  html: string;
  /** 是否成功高亮。 */
  highlighted: boolean;
}

/**
 * 同步高亮（需先完成 loadHighlighter）。
 * highlight.js 未就绪时返回转义纯文本，用于编辑场景下逐字符无延迟高亮。
 */
export const highlightSync = (code: string, language?: string): HighlightResult => {
  if (!hljs) {
    return highlightPlainText(code);
  }

  const normalizedLanguage = normalizeLanguage(language);
  if (normalizedLanguage === 'plaintext') {
    return highlightPlainText(code);
  }

  try {
    if (normalizedLanguage) {
      if (!hljs.getLanguage?.(normalizedLanguage)) {
        return highlightPlainText(code);
      }

      const { value } = hljs.highlight(code, {
        language: normalizedLanguage,
        ignoreIllegals: true,
      });
      return { html: sanitizeHtml(value), highlighted: true };
    }

    const { value } = hljs.highlightAuto(code);
    return { html: sanitizeHtml(value), highlighted: true };
  } catch {
    return highlightPlainText(code);
  }
};

/** 异步高亮：确保 highlight.js 已加载后再高亮。 */
export const highlightCode = async (code: string, language?: string): Promise<HighlightResult> => {
  await loadHighlighter();
  return highlightSync(code, language);
};
