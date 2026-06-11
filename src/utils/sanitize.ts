/**
 * HTML 内容消毒工具
 * 用于防止 XSS 攻击
 */

/**
 * 允许的 HTML 标签白名单
 */
const ALLOWED_TAGS = new Set([
  'a', 'b', 'i', 'u', 's', 'em', 'strong', 'small', 'mark', 'del', 'ins', 'sub', 'sup',
  'br', 'hr', 'p', 'div', 'span',
  'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img',
]);

/**
 * 允许的 HTML 属性白名单
 */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  '*': new Set(['class', 'style', 'id', 'title']),
  'a': new Set(['href', 'target', 'rel']),
  'img': new Set(['src', 'alt', 'width', 'height']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan']),
};

/**
 * 危险的 URL 协议
 */
const DANGEROUS_PROTOCOLS = ['javascript:', 'vbscript:', 'data:'];

/**
 * 检查 URL 是否安全
 * @param url - 要检查的 URL
 * @returns 是否安全
 */
function isSafeUrl(url: string): boolean {
  const trimmedUrl = url.trim().toLowerCase();
  return !DANGEROUS_PROTOCOLS.some(protocol => trimmedUrl.startsWith(protocol));
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
  // 如果不在浏览器环境，直接转义所有 HTML
  if (typeof document === 'undefined') {
    return escapeHtml(html);
  }

  // 创建临时 DOM 解析 HTML
  const template = document.createElement('template');
  template.innerHTML = html;

  // 递归处理所有节点
  const sanitizeNode = (node: Node): void => {
    // 处理元素节点
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      // 检查标签是否在白名单中
      if (!ALLOWED_TAGS.has(tagName)) {
        // 移除危险标签，但保留其文本内容
        const textContent = element.textContent || '';
        const textNode = document.createTextNode(textContent);
        element.parentNode?.replaceChild(textNode, element);
        return;
      }

      // 处理属性
      const attrs = Array.from(element.attributes);
      const globalAllowed = ALLOWED_ATTRS['*'] || new Set();
      const tagAllowed = ALLOWED_ATTRS[tagName] || new Set();

      for (const attr of attrs) {
        const attrName = attr.name.toLowerCase();

        // 检查属性是否在白名单中
        if (!globalAllowed.has(attrName) && !tagAllowed.has(attrName)) {
          element.removeAttribute(attr.name);
          continue;
        }

        // 检查事件处理器属性
        if (attrName.startsWith('on')) {
          element.removeAttribute(attr.name);
          continue;
        }

        // 检查 href 和 src 属性的 URL 安全性
        if ((attrName === 'href' || attrName === 'src') && !isSafeUrl(attr.value)) {
          element.removeAttribute(attr.name);
          continue;
        }

        // 检查 style 属性中的危险内容
        if (attrName === 'style') {
          const styleValue = attr.value.toLowerCase();
          if (styleValue.includes('javascript:') || styleValue.includes('expression(')) {
            element.removeAttribute(attr.name);
          }
        }
      }

      // 为外部链接添加安全属性
      if (tagName === 'a' && element.getAttribute('target') === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer');
      }
    }

    // 递归处理子节点
    const children = Array.from(node.childNodes);
    for (const child of children) {
      sanitizeNode(child);
    }
  };

  sanitizeNode(template.content);

  return template.innerHTML;
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
    /javascript:/i,
    /vbscript:/i,
    /data:/i,
    /expression\s*\(/i,
  ];

  return dangerousPatterns.some(pattern => pattern.test(html));
}
