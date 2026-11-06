import { isSafeUrl } from '../../utils/sanitize';
import type { LinkTarget } from './types';

/**
 * 清理链接地址，并拒绝浏览器可执行的危险协议。
 */
export function normalizeLinkHref(href?: string | null): string | undefined {
  if (typeof href !== 'string') return undefined;

  const normalized = href.trim();
  if (!normalized || !isSafeUrl(normalized)) return undefined;

  return normalized;
}

/**
 * 判断链接是否指向绝对网络地址。该规则不依赖浏览器环境，服务端与客户端结果一致。
 */
export function isExternalLinkHref(href?: string | null): boolean {
  const normalized = normalizeLinkHref(href);
  return normalized !== undefined && /^(?:https?:)?\/\//i.test(normalized);
}

/**
 * 规范化 rel 令牌，并确保新窗口链接不能访问来源窗口。
 */
export function buildSecureRel(rel?: string, target?: LinkTarget): string | undefined {
  const tokens = Array.from(
    new Set(
      (rel ?? '')
        .trim()
        .split(/\s+/u)
        .filter(Boolean)
        .map(token => token.toLowerCase())
    )
  );

  if (target?.toLowerCase() === '_blank') {
    const safeTokens = tokens.filter(token => token !== 'opener' && token !== 'noopener');
    safeTokens.push('noopener');
    return safeTokens.join(' ');
  }

  return tokens.length > 0 ? tokens.join(' ') : undefined;
}
