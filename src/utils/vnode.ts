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
