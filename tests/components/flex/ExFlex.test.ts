import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExFlex from '../../../src/components/flex/ExFlex.vue';
import ExFlexItem from '../../../src/components/flex/ExFlexItem.vue';

describe('ExFlex', () => {
  it('输出完整默认布局，不生成无意义 gap 变量', () => {
    const wrapper = mount(ExFlex);
    expect(wrapper.classes()).toContain('ex-flex');
    expect(wrapper.attributes('style')).toContain('flex-direction: row');
    expect(wrapper.attributes('style')).toContain('flex-wrap: nowrap');
    expect(wrapper.attributes('style')).toContain('justify-content: flex-start');
    expect(wrapper.attributes('style')).toContain('align-items: flex-start');
    expect(wrapper.attributes('style')).not.toContain('--ex-flex');
    expect(wrapper.attributes('style')).not.toContain('align-content');
  });

  it('inline 与 vertical 均真实生效，vertical 明确覆盖 direction', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const wrapper = mount(ExFlex, {
      props: { inline: true, vertical: true, direction: 'row-reverse' },
    });

    expect(wrapper.classes()).toContain('ex-flex--inline');
    expect(wrapper.classes()).toContain('ex-flex--vertical');
    expect(wrapper.attributes('style')).toContain('flex-direction: column');
    expect(warn).not.toHaveBeenCalled();
  });

  it('设置方向、换行、主轴、交叉轴和多行对齐', () => {
    const wrapper = mount(ExFlex, {
      props: {
        direction: 'column-reverse',
        wrap: 'wrap-reverse',
        justify: 'space-evenly',
        align: 'baseline',
        alignContent: 'space-between',
      },
    });
    const style = wrapper.attributes('style');
    expect(style).toContain('flex-direction: column-reverse');
    expect(style).toContain('flex-wrap: wrap-reverse');
    expect(style).toContain('justify-content: space-evenly');
    expect(style).toContain('align-items: baseline');
    expect(style).toContain('align-content: space-between');
  });

  it('解析 gap 预设和独立行列间距', () => {
    const wrapper = mount(ExFlex, {
      props: { gap: 'md', rowGap: 8, columnGap: '2rem' },
    });
    const style = wrapper.attributes('style');
    expect(style).toContain('gap: 16px');
    expect(style).toContain('row-gap: 8px');
    expect(style).toContain('column-gap: 2rem');
  });

  it('非法间距不会输出 NaN/Infinity，负数收敛到 0', () => {
    const wrapper = mount(ExFlex, {
      props: { gap: Number.NaN, rowGap: Number.POSITIVE_INFINITY, columnGap: -4 },
    });
    const style = wrapper.attributes('style');
    expect(style).not.toContain('NaN');
    expect(style).not.toContain('Infinity');
    expect(style).toContain('column-gap: 0px');
  });

  it('渲染默认插槽及组合子项', () => {
    const wrapper = mount({
      components: { ExFlex, ExFlexItem },
      template:
        '<ExFlex><ExFlexItem flex="1">A</ExFlexItem><ExFlexItem :flex="2">B</ExFlexItem></ExFlex>',
    });
    expect(wrapper.findAll('.ex-flex-item')).toHaveLength(2);
    expect(wrapper.text()).toBe('AB');
  });
});

describe('ExFlexItem', () => {
  it('默认项不输出冗余内联样式', () => {
    const wrapper = mount(ExFlexItem);
    expect(wrapper.classes()).toContain('ex-flex-item');
    expect(wrapper.attributes('style')).toBeUndefined();
  });

  it('显式 flex 支持数字 0 与自定义简写', async () => {
    const wrapper = mount(ExFlexItem, { props: { flex: 0 } });
    expect(wrapper.attributes('style')).toContain('flex: 0');
    await wrapper.setProps({ flex: '2 1 25%' });
    expect(wrapper.attributes('style')).toContain('flex: 2 1 25%');
  });

  it('规范 grow、shrink 和 basis 后生成简写', () => {
    const wrapper = mount(ExFlexItem, {
      props: { grow: -1, shrink: Number.NaN, basis: -20 },
    });
    expect(wrapper.attributes('style')).toContain('flex: 0 1 0px');
    expect(wrapper.attributes('style')).not.toContain('NaN');
  });

  it('非法显式 flex 回退到拆分属性', () => {
    const wrapper = mount(ExFlexItem, {
      props: { flex: Number.NaN, grow: 2, shrink: 0, basis: 100 },
    });
    expect(wrapper.attributes('style')).toContain('flex: 2 0 100px');
  });

  it('规范 order 并应用 align-self', () => {
    const wrapper = mount(ExFlexItem, {
      props: { order: 2.9, alignSelf: 'center' },
    });
    const style = wrapper.attributes('style');
    expect(style).toContain('order: 2');
    expect(style).toContain('align-self: center');
  });

  it('渲染插槽内容', () => {
    const wrapper = mount(ExFlexItem, { slots: { default: 'Flex Item Content' } });
    expect(wrapper.text()).toBe('Flex Item Content');
  });
});
