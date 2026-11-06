/**
 * HTML 内容消毒工具
 * 用于防止 XSS 攻击
 */

import render from 'dom-serializer';
import { ElementType, parseDocument } from 'htmlparser2';

/**
 * 允许的 HTML 标签白名单
 */
const ALLOWED_TAGS = new Set([
  'a',
  'b',
  'i',
  'u',
  's',
  'em',
  'strong',
  'small',
  'mark',
  'del',
  'ins',
  'sub',
  'sup',
  'br',
  'hr',
  'p',
  'div',
  'span',
  'ul',
  'ol',
  'li',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'blockquote',
  'pre',
  'code',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'img',
]);

/**
 * 允许的 HTML 属性白名单
 */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'title']),
  a: new Set(['href', 'target', 'rel']),
  img: new Set(['src', 'alt', 'width', 'height']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
};

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const SAFE_IMAGE_PROTOCOLS = new Set(['http:', 'https:']);
const ASCII_CONTROL_CODE_MAX = 0x1f;
const ASCII_DELETE_CODE = 0x7f;
const RASTER_DATA_IMAGE_PATTERN =
  /^data:image\/(?:png|jpeg|gif|webp|avif|bmp|x-icon|vnd\.microsoft\.icon);base64,([a-z0-9+/]+={0,2})$/iu;

/** 这些节点的文本本身也可能被浏览器当成可执行或替换内容，必须连同子树一起丢弃。 */
const DROP_CONTENT_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'textarea']);

type ParsedNode = ReturnType<typeof parseDocument>['children'][number];
type ParsedElement = Extract<
  ParsedNode,
  { name: string; attribs: Record<string, string>; children: ParsedNode[] }
>;

const isValidRasterDataImage = (url: string): boolean => {
  const match = RASTER_DATA_IMAGE_PATTERN.exec(url);
  const payload = match?.[1];
  return payload !== undefined && payload.length % 4 === 0;
};

const containsAsciiControlCharacter = (value: string): boolean =>
  Array.from(value).some(character => {
    const codePoint = character.codePointAt(0);
    return (
      codePoint !== undefined &&
      (codePoint <= ASCII_CONTROL_CODE_MAX || codePoint === ASCII_DELETE_CODE)
    );
  });

/**
 * 检查 URL 是否安全
 * @param url - 要检查的 URL
 * @param allowDataImage - 是否允许 data:image/*（用于 img src 的内联图片）
 * @returns 是否安全
 */
export function isSafeUrl(url: string, allowDataImage = false): boolean {
  const normalizedUrl = url.trim();
  if (!normalizedUrl || containsAsciiControlCharacter(normalizedUrl)) return false;
  if (allowDataImage && normalizedUrl.toLowerCase().startsWith('data:')) {
    return isValidRasterDataImage(normalizedUrl);
  }

  const scheme = normalizedUrl.match(/^[a-z][a-z0-9+.-]*:/iu)?.[0]?.toLowerCase();
  if (scheme) {
    return (allowDataImage ? SAFE_IMAGE_PROTOCOLS : SAFE_LINK_PROTOCOLS).has(scheme);
  }

  // RFC 3986 的相对路径首段不能含冒号；拒绝畸形 scheme，避免浏览器宽松解析。
  const firstPathSegment = normalizedUrl.split(/[/?#]/u, 1)[0];
  return !firstPathSegment?.includes(':');
}

/**
 * 转义 HTML 特殊字符
 * @param str - 要转义的字符串
 * @returns 转义后的字符串
 */
export function escapeHtml(str: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return str.replace(/[&<>"'/]/g, char => escapeMap[char] || char);
}

const isElementNode = (node: ParsedNode): node is ParsedElement =>
  node.type === ElementType.Tag ||
  node.type === ElementType.Script ||
  node.type === ElementType.Style;

/** 根据组件白名单复制属性，并在复制时完成 URL 校验。 */
const sanitizeAttributes = (
  tagName: string,
  attributes: Record<string, string>
): Record<string, string> => {
  const allowedAttributes = ALLOWED_ATTRS[tagName] ?? new Set<string>();
  const globalAllowedAttributes = ALLOWED_ATTRS['*'] ?? new Set<string>();
  const safeAttributes: Record<string, string> = {};

  for (const [attributeName, attributeValue] of Object.entries(attributes)) {
    const normalizedName = attributeName.toLowerCase();
    if (!globalAllowedAttributes.has(normalizedName) && !allowedAttributes.has(normalizedName)) {
      continue;
    }

    if (normalizedName === 'href' && !isSafeUrl(attributeValue)) continue;
    if (normalizedName === 'src' && !isSafeUrl(attributeValue, tagName === 'img')) continue;

    safeAttributes[normalizedName] = attributeValue;
  }

  if (tagName === 'a' && safeAttributes.target === '_blank') {
    safeAttributes.rel = 'noopener noreferrer';
  }

  return safeAttributes;
};

interface SerializationFrame {
  nodes: ParsedNode[];
  index: number;
  closingTag?: string;
}

const SERIALIZATION_OPTIONS = { encodeEntities: 'utf8', selfClosingTags: true } as const;

/** 显式深度优先遍历，同时过滤和序列化，避免过滤器与依赖序列化器的递归栈限制。 */
const serializeSanitizedNodes = (nodes: ParsedNode[]): string => {
  const stack: SerializationFrame[] = [{ nodes, index: 0 }];
  const output: string[] = [];

  while (stack.length > 0) {
    const frame = stack[stack.length - 1]!;
    const node = frame.nodes[frame.index++];
    if (!node) {
      if (frame.closingTag) output.push(frame.closingTag);
      stack.pop();
      continue;
    }
    if (node.type === ElementType.Text) {
      // 浅克隆断开原始父节点；xmp/plaintext 等被移除后，文本必须重新按 HTML 文本转义。
      output.push(render(node.cloneNode(false), SERIALIZATION_OPTIONS));
      continue;
    }
    if (!isElementNode(node)) continue;

    const tagName = node.name.toLowerCase();
    if (DROP_CONTENT_TAGS.has(tagName)) continue;
    if (!ALLOWED_TAGS.has(tagName)) {
      stack.push({ nodes: node.children, index: 0 });
      continue;
    }

    // 只让依赖序列化单个空壳，继续复用其属性转义和 HTML 空元素规则。
    const shell = node.cloneNode(false);
    shell.name = tagName;
    shell.attribs = sanitizeAttributes(tagName, node.attribs);
    const markup = render(shell, SERIALIZATION_OPTIONS);
    const closingTag = `</${tagName}>`;
    if (markup.endsWith(closingTag)) {
      output.push(markup.slice(0, -closingTag.length));
      stack.push({ nodes: node.children, index: 0, closingTag });
    } else {
      output.push(markup);
    }
  }

  return output.join('');
};

/**
 * 消毒 HTML 内容，移除危险标签和属性
 * @param html - 要消毒的 HTML 字符串
 * @returns 消毒后的安全 HTML 字符串
 */
export function sanitizeHtml(html: string): string {
  // htmlparser2 与 dom-serializer 均可在浏览器和 SSR 使用，避免 Node-only 的 PostCSS 依赖。
  const document = parseDocument(html, { decodeEntities: true, lowerCaseTags: true });
  return serializeSanitizedNodes(document.children);
}

/**
 * 检查 HTML 字符串是否包含潜在危险内容
 * @param html - 要检查的 HTML 字符串
 * @returns 是否包含危险内容
 */
export function containsDangerousHtml(html: string): boolean {
  const dangerousPatterns = [
    /<script\b/i,
    /<iframe\b/i,
    /<object\b/i,
    /<embed\b/i,
    /<form\b/i,
    /\bon\w+\s*=/i,
    /\bstyle\s*=/i,
    /javascript:/i,
    /vbscript:/i,
    /data:/i,
    /expression\s*\(/i,
  ];

  return dangerousPatterns.some(pattern => pattern.test(html));
}
