/**
 * HTML 内容消毒工具
 * 用于防止 XSS 攻击
 */

import sanitizeMarkup from 'sanitize-html';

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

/**
 * 消毒 HTML 内容，移除危险标签和属性
 * @param html - 要消毒的 HTML 字符串
 * @returns 消毒后的安全 HTML 字符串
 */
export function sanitizeHtml(html: string): string {
  // 使用同一解析器处理 SSR 与浏览器，避免服务端转义、客户端保留标签造成 hydration 差异。
  return sanitizeMarkup(html, {
    allowedTags: Array.from(ALLOWED_TAGS),
    allowedAttributes: Object.fromEntries(
      Object.entries(ALLOWED_ATTRS).map(([tag, attrs]) => [tag, Array.from(attrs)])
    ),
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['http', 'https', 'data'] },
    allowProtocolRelative: true,
    transformTags: {
      '*': (tagName, attributes) => {
        const safeAttributes = { ...attributes };
        const source = safeAttributes.src;
        if (source && !isSafeUrl(source, tagName === 'img')) delete safeAttributes.src;
        const href = safeAttributes.href;
        if (href && !isSafeUrl(href)) delete safeAttributes.href;

        if (tagName === 'a' && safeAttributes.target === '_blank') {
          safeAttributes.rel = 'noopener noreferrer';
        }
        return { tagName, attribs: safeAttributes };
      },
    },
  });
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
