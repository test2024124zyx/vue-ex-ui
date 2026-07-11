import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExGrid from '../../../src/components/grid/ExGrid.vue';
import ExGridItem from '../../../src/components/grid/ExGridItem.vue';

const cssVariable = (element: Element, name: string): string =>
  (element as HTMLElement).style.getPropertyValue(name);

describe('ExGrid', () => {
  it('默认容器显式重置 gutter，防止嵌套继承', () => {
    const wrapper = mount(ExGrid);
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining(['ex-grid', 'ex-grid--justify-start', 'ex-grid--align-top'])
    );
    expect(cssVariable(wrapper.element, '--ex-grid-gutter-x')).toBe('0px');
    expect(cssVariable(wrapper.element, '--ex-grid-gutter-y')).toBe('0px');
  });

  it('规范单值、双向和预设 gutter', async () => {
    const wrapper = mount(ExGrid, { props: { gutter: 20 } });
    expect(cssVariable(wrapper.element, '--ex-grid-gutter-x')).toBe('20px');
    expect(cssVariable(wrapper.element, '--ex-grid-gutter-y')).toBe('20px');

    await wrapper.setProps({ gutter: [16, 24] });
    expect(cssVariable(wrapper.element, '--ex-grid-gutter-x')).toBe('16px');
    expect(cssVariable(wrapper.element, '--ex-grid-gutter-y')).toBe('24px');

    await wrapper.setProps({ gutter: 'lg' });
    expect(cssVariable(wrapper.element, '--ex-grid-gutter-x')).toBe('24px');
  });

  it('非法或负 gutter 收敛到 0', () => {
    const wrapper = mount(ExGrid, {
      props: { gutter: [-10, Number.NaN] },
    });
    expect(cssVariable(wrapper.element, '--ex-grid-gutter-x')).toBe('0px');
    expect(cssVariable(wrapper.element, '--ex-grid-gutter-y')).toBe('0px');
  });

  it('对齐与 nowrap 类均映射到真实 CSS 类', () => {
    const wrapper = mount(ExGrid, {
      props: { justify: 'space-evenly', align: 'stretch', wrap: false },
    });
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'ex-grid--justify-space-evenly',
        'ex-grid--align-stretch',
        'ex-grid--nowrap',
      ])
    );
  });

  it('渲染栅格项插槽', () => {
    const wrapper = mount({
      components: { ExGrid, ExGridItem },
      template:
        '<ExGrid :gutter="16"><ExGridItem :span="8">A</ExGridItem><ExGridItem :span="16">B</ExGridItem></ExGrid>',
    });
    expect(wrapper.findAll('.ex-grid-item')).toHaveLength(2);
    expect(wrapper.text()).toBe('AB');
  });
});

describe('ExGridItem', () => {
  it('默认项为满行，并显式写入所有断点变量', () => {
    const wrapper = mount(ExGridItem);
    expect(wrapper.classes()).toEqual(['ex-grid-item']);
    for (const breakpoint of ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']) {
      expect(cssVariable(wrapper.element, `--ex-grid-${breakpoint}-flex`)).toBe('0 0 100%');
      expect(cssVariable(wrapper.element, `--ex-grid-${breakpoint}-offset`)).toBe('0%');
    }
  });

  it('基础 span、offset、push、pull、order 全部通过有效变量生效', () => {
    const wrapper = mount(ExGridItem, {
      props: { span: 7, offset: 3, push: 5, pull: 1, order: 9 },
    });
    expect(cssVariable(wrapper.element, '--ex-grid-xs-flex')).toBe('0 0 29.16666667%');
    expect(cssVariable(wrapper.element, '--ex-grid-xs-offset')).toBe('12.5%');
    expect(cssVariable(wrapper.element, '--ex-grid-xs-push')).toBe('20.83333333%');
    expect(cssVariable(wrapper.element, '--ex-grid-xs-pull')).toBe('4.16666667%');
    expect(cssVariable(wrapper.element, '--ex-grid-xs-order')).toBe('9');
    expect(wrapper.classes()).not.toContain('ex-grid-item--span-7');
  });

  it('任意响应式值都生成真实变量，不再依赖不存在的动态类', () => {
    const wrapper = mount(ExGridItem, {
      props: {
        sm: 5,
        md: { span: 7, offset: 3, push: 5, pull: 2, order: -8 },
      },
    });
    expect(cssVariable(wrapper.element, '--ex-grid-sm-flex')).toBe('0 0 20.83333333%');
    expect(cssVariable(wrapper.element, '--ex-grid-md-flex')).toBe('0 0 29.16666667%');
    expect(cssVariable(wrapper.element, '--ex-grid-md-offset')).toBe('12.5%');
    expect(cssVariable(wrapper.element, '--ex-grid-md-push')).toBe('20.83333333%');
    expect(cssVariable(wrapper.element, '--ex-grid-md-pull')).toBe('8.33333333%');
    expect(cssVariable(wrapper.element, '--ex-grid-md-order')).toBe('-8');
    expect(cssVariable(wrapper.element, '--ex-grid-lg-flex')).toBe('0 0 29.16666667%');
  });

  it('响应式对象只覆盖声明字段，其余字段沿较小断点继承', () => {
    const wrapper = mount(ExGridItem, {
      props: { span: 12, offset: 2, sm: { span: 8 }, md: { order: 4 } },
    });
    expect(cssVariable(wrapper.element, '--ex-grid-sm-flex')).toBe('0 0 33.33333333%');
    expect(cssVariable(wrapper.element, '--ex-grid-sm-offset')).toBe('8.33333333%');
    expect(cssVariable(wrapper.element, '--ex-grid-md-flex')).toBe('0 0 33.33333333%');
    expect(cssVariable(wrapper.element, '--ex-grid-md-order')).toBe('4');
  });

  it('span 0 与 auto 在后续断点可以互相覆盖', () => {
    const wrapper = mount(ExGridItem, {
      props: { span: 0, sm: 'auto', md: 12 },
    });
    expect(cssVariable(wrapper.element, '--ex-grid-xs-display')).toBe('none');
    expect(cssVariable(wrapper.element, '--ex-grid-sm-display')).toBe('block');
    expect(cssVariable(wrapper.element, '--ex-grid-sm-flex')).toBe('1 0 0%');
    expect(cssVariable(wrapper.element, '--ex-grid-md-flex')).toBe('0 0 50%');
  });

  it('越界和非有限值不会产生无效 CSS', () => {
    const wrapper = mount(ExGridItem, {
      props: {
        span: 99,
        offset: -2,
        push: Number.NaN,
        pull: Number.POSITIVE_INFINITY,
        order: Number.NaN,
      },
    });
    const style = wrapper.attributes('style');
    expect(cssVariable(wrapper.element, '--ex-grid-xs-flex')).toBe('0 0 100%');
    expect(cssVariable(wrapper.element, '--ex-grid-xs-offset')).toBe('0%');
    expect(cssVariable(wrapper.element, '--ex-grid-xs-order')).toBe('0');
    expect(style).not.toContain('NaN');
    expect(style).not.toContain('Infinity');
  });

  it('嵌套默认项拥有自己的完整变量，不依赖父项', () => {
    const wrapper = mount({
      components: { ExGrid, ExGridItem },
      template:
        '<ExGrid><ExGridItem :span="7"><ExGrid><ExGridItem class="inner">inner</ExGridItem></ExGrid></ExGridItem></ExGrid>',
    });
    const inner = wrapper.find('.inner').element;
    expect(cssVariable(inner, '--ex-grid-xs-flex')).toBe('0 0 100%');
    expect(cssVariable(inner, '--ex-grid-md-flex')).toBe('0 0 100%');
  });
});
