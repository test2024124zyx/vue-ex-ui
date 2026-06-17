import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExFlex from '../../../src/components/flex/ExFlex.vue';
import ExFlexItem from '../../../src/components/flex/ExFlexItem.vue';

describe('ExFlex', () => {
  it('renders flex container with default props', () => {
    const wrapper = mount(ExFlex);
    expect(wrapper.classes()).toContain('ex-flex');
    expect(wrapper.element.tagName).toBe('DIV');
  });

  it('applies inline flex', () => {
    const wrapper = mount(ExFlex, {
      props: {
        inline: true,
      },
    });
    expect(wrapper.classes()).toContain('ex-flex--inline');
  });

  it('applies vertical layout', () => {
    const wrapper = mount(ExFlex, {
      props: {
        vertical: true,
      },
    });
    expect(wrapper.classes()).toContain('ex-flex--vertical');
    expect(wrapper.attributes('style')).toContain('flex-direction: column');
  });

  it('sets direction correctly', () => {
    const wrapper = mount(ExFlex, {
      props: {
        direction: 'row-reverse',
      },
    });
    expect(wrapper.attributes('style')).toContain('flex-direction: row-reverse');
  });

  it('sets wrap correctly', () => {
    const wrapper = mount(ExFlex, {
      props: {
        wrap: 'wrap',
      },
    });
    expect(wrapper.attributes('style')).toContain('flex-wrap: wrap');
  });

  it('sets justify correctly', () => {
    const wrapper = mount(ExFlex, {
      props: {
        justify: 'center',
      },
    });
    expect(wrapper.attributes('style')).toContain('justify-content: center');
  });

  it('sets align correctly', () => {
    const wrapper = mount(ExFlex, {
      props: {
        align: 'center',
      },
    });
    expect(wrapper.attributes('style')).toContain('align-items: center');
  });

  it('sets gap correctly with number', () => {
    const wrapper = mount(ExFlex, {
      props: {
        gap: 16,
      },
    });
    expect(wrapper.attributes('style')).toContain('gap: 16px');
  });

  it('sets gap correctly with string', () => {
    const wrapper = mount(ExFlex, {
      props: {
        gap: '2rem',
      },
    });
    expect(wrapper.attributes('style')).toContain('gap: 2rem');
  });

  it('sets rowGap and columnGap separately', () => {
    const wrapper = mount(ExFlex, {
      props: {
        rowGap: 8,
        columnGap: 16,
      },
    });
    expect(wrapper.attributes('style')).toContain('row-gap: 8px');
    expect(wrapper.attributes('style')).toContain('column-gap: 16px');
  });

  it('sets alignContent when wrap is enabled', () => {
    const wrapper = mount(ExFlex, {
      props: {
        wrap: 'wrap',
        alignContent: 'space-between',
      },
    });
    expect(wrapper.attributes('style')).toContain('align-content: space-between');
  });

  it('renders children', () => {
    const wrapper = mount(ExFlex, {
      slots: {
        default: '<div class="child">Child</div>',
      },
    });
    expect(wrapper.find('.child').exists()).toBe(true);
  });

  it('works with ExFlexItem', () => {
    const wrapper = mount({
      template: `
        <ExFlex>
          <ExFlexItem :flex="1">Item 1</ExFlexItem>
          <ExFlexItem :flex="2">Item 2</ExFlexItem>
        </ExFlex>
      `,
      components: { ExFlex, ExFlexItem },
    });

    expect(wrapper.findAll('.ex-flex-item').length).toBe(2);
  });
});

describe('ExFlexItem', () => {
  it('renders flex item with default props', () => {
    const wrapper = mount(ExFlexItem);
    expect(wrapper.classes()).toContain('ex-flex-item');
  });

  it('sets flex shorthand property', () => {
    const wrapper = mount(ExFlexItem, {
      props: {
        flex: 1,
      },
    });
    expect(wrapper.attributes('style')).toContain('flex: 1');
  });

  it('sets flex shorthand with string', () => {
    const wrapper = mount(ExFlexItem, {
      props: {
        flex: '1 1 auto',
      },
    });
    // 当 flex 为字符串时，直接使用该值
    // 注意：'1 1 auto' 是默认值，所以不会生成样式
    // 改用非默认值测试
    const wrapper2 = mount(ExFlexItem, {
      props: {
        flex: '2 1 50%',
      },
    });
    expect(wrapper2.attributes('style')).toContain('flex: 2 1 50%');
  });

  it('sets grow, shrink, and basis separately', () => {
    const wrapper = mount(ExFlexItem, {
      props: {
        grow: 2,
        shrink: 0,
        basis: '200px',
      },
    });
    // 组件会将这些属性合并为 flex 简写属性
    const style = wrapper.attributes('style');
    expect(style).toContain('flex: 2 0 200px');
  });

  it('sets alignSelf', () => {
    const wrapper = mount(ExFlexItem, {
      props: {
        alignSelf: 'center',
      },
    });
    expect(wrapper.attributes('style')).toContain('align-self: center');
  });

  it('sets order', () => {
    const wrapper = mount(ExFlexItem, {
      props: {
        order: 2,
      },
    });
    expect(wrapper.attributes('style')).toContain('order: 2');
  });

  it('renders slot content', () => {
    const wrapper = mount(ExFlexItem, {
      slots: {
        default: 'Flex Item Content',
      },
    });
    expect(wrapper.text()).toBe('Flex Item Content');
  });

  it('converts number basis to px', () => {
    const wrapper = mount(ExFlexItem, {
      props: {
        basis: 300,
      },
    });
    // 组件会将属性合并为 flex 简写属性
    const style = wrapper.attributes('style');
    expect(style).toContain('flex: 0 1 300px');
  });
});
