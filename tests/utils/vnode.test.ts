import { Comment, Fragment, Text, h } from 'vue';
import { getPlainTextContent, hasRenderableContent } from '../../src/utils/vnode';

describe('VNode 内容判断', () => {
  it('忽略空值、布尔值、注释和纯空白文本', () => {
    expect(hasRenderableContent(null)).toBe(false);
    expect(hasRenderableContent(undefined)).toBe(false);
    expect(hasRenderableContent(false)).toBe(false);
    expect(hasRenderableContent('  \n  ')).toBe(false);
    expect(hasRenderableContent(h(Comment))).toBe(false);
    expect(hasRenderableContent(h(Text, null, '   '))).toBe(false);
  });

  it('保留数字零、非空文本、元素和组件节点', () => {
    const Component = { render: () => null };

    expect(hasRenderableContent(0)).toBe(true);
    expect(hasRenderableContent('内容')).toBe(true);
    expect(hasRenderableContent(h('span'))).toBe(true);
    expect(hasRenderableContent(h(Component))).toBe(true);
  });

  it('递归检查数组和 Fragment 中的真实内容', () => {
    expect(hasRenderableContent([null, h(Comment), h(Text, null, ' ')])).toBe(false);
    expect(hasRenderableContent(h(Fragment, null, [h(Comment), '内容']))).toBe(true);
    expect(hasRenderableContent(h(Fragment, null, [h(Comment), [' ', 0]]))).toBe(true);
  });

  it('递归提取纯文本插槽，同时忽略注释节点', () => {
    const value = h(Fragment, null, [h(Comment), h(Text, null, '用户'), ['中心', 0]]);

    expect(getPlainTextContent(value)).toBe('用户中心0');
  });

  it('遇到元素或组件节点时拒绝伪装成纯文本', () => {
    const Component = { render: () => null };

    expect(getPlainTextContent([h('span', '文字')])).toBeUndefined();
    expect(getPlainTextContent(h(Component))).toBeUndefined();
  });
});
