import { Comment, Fragment, Text, isVNode } from 'vue';
import type { VNode } from 'vue';

/**
 * 判断插槽返回值中是否包含真实可渲染内容。
 * 注释、布尔值、空白文本和只包含这些节点的 Fragment 不应占用组件布局。
 */
export const hasRenderableContent = (value: unknown): boolean => {
  if (value === null || value === undefined || typeof value === 'boolean') return false;

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim().length > 0;
  }

  if (Array.isArray(value)) return value.some(hasRenderableContent);
  if (!isVNode(value)) return true;

  const node = value as VNode;
  if (node.type === Comment) return false;
  if (node.type === Text || node.type === Fragment) {
    return hasRenderableContent(node.children);
  }

  return true;
};

/**
 * 提取只由文本、数字、注释和 Fragment 构成的插槽内容。
 * 一旦遇到真实元素或组件便返回 undefined，避免在截取文字时破坏调用方的自定义节点。
 */
export const getPlainTextContent = (value: unknown): string | undefined => {
  if (value === null || value === undefined || typeof value === 'boolean') return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);

  if (Array.isArray(value)) {
    let result = '';
    for (const child of value) {
      const text = getPlainTextContent(child);
      if (text === undefined) return undefined;
      result += text;
    }
    return result;
  }

  if (!isVNode(value)) return undefined;
  const node = value as VNode;
  if (node.type === Comment) return '';
  if (node.type === Text || node.type === Fragment) return getPlainTextContent(node.children);
  return undefined;
};
