import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExGrid from '../../../src/components/grid/ExGrid.vue';
import ExGridItem from '../../../src/components/grid/ExGridItem.vue';

describe('ExGrid and ExGridItem', () => {
  it('renders grid with default props', () => {
    const wrapper = mount(ExGrid);
    expect(wrapper.classes()).toContain('ex-grid');
    expect(wrapper.classes()).toContain('ex-grid--justify-start');
    expect(wrapper.classes()).toContain('ex-grid--align-top');
  });

  it('renders grid with specified justify and align', () => {
    const wrapper = mount(ExGrid, {
      props: {
        justify: 'center',
        align: 'middle',
      },
    });
    expect(wrapper.classes()).toContain('ex-grid--justify-center');
    expect(wrapper.classes()).toContain('ex-grid--align-middle');
  });

  it('renders grid with gutter', () => {
    const wrapper = mount(ExGrid, {
      props: {
        gutter: 20,
      },
    });
    // 间距通过 CSS 变量 + 负 margin 实现（不用 flex gap，避免与百分比列宽叠加溢出）
    expect(wrapper.attributes('style')).toContain('--ex-grid-gutter-x: 20px');
    expect(wrapper.attributes('style')).toContain('--ex-grid-gutter-y: 20px');
  });

  it('renders grid with horizontal and vertical gutter', () => {
    const wrapper = mount(ExGrid, {
      props: {
        gutter: [20, 30],
      },
    });
    // gutter [水平, 垂直] -> x=20, y=30
    expect(wrapper.attributes('style')).toContain('--ex-grid-gutter-x: 20px');
    expect(wrapper.attributes('style')).toContain('--ex-grid-gutter-y: 30px');
  });

  it('renders grid item with default props', () => {
    const wrapper = mount(ExGridItem);
    expect(wrapper.classes()).toContain('ex-grid-item');
    // span=24 is the default, so the class is not added for optimization
    expect(wrapper.classes()).not.toContain('ex-grid-item--span-24');
  });

  it('renders grid item with specified span and offset', () => {
    const wrapper = mount(ExGridItem, {
      props: {
        span: 12,
        offset: 4,
      },
    });
    expect(wrapper.classes()).toContain('ex-grid-item--span-12');
    expect(wrapper.classes()).toContain('ex-grid-item--offset-4');
  });

  it('renders grid item with responsive props', () => {
    const wrapper = mount(ExGridItem, {
      props: {
        xs: { span: 8, offset: 2 },
        sm: 12,
      },
    });
    expect(wrapper.classes()).toContain('ex-grid-item--xs-8');
    expect(wrapper.classes()).toContain('ex-grid-item--xs-offset-2');
    expect(wrapper.classes()).toContain('ex-grid-item--sm-12');
  });

  it('renders grid and grid items together', () => {
    const wrapper = mount({
      template: `
        <ExGrid :gutter="20">
          <ExGridItem :span="8">1</ExGridItem>
          <ExGridItem :span="8">2</ExGridItem>
          <ExGridItem :span="8">3</ExGridItem>
        </ExGrid>
      `,
      components: { ExGrid, ExGridItem },
    });
    expect(wrapper.findAll('.ex-grid-item').length).toBe(3);
    expect(wrapper.find('.ex-grid').attributes('style')).toContain('--ex-grid-gutter-x: 20px');
  });

  it('renders grid with nowrap', () => {
    const wrapper = mount(ExGrid, {
      props: {
        wrap: false,
      },
    });
    expect(wrapper.classes()).toContain('ex-grid--nowrap');
  });

  it('renders grid item with order', () => {
    const wrapper = mount(ExGridItem, {
      props: {
        order: 2,
      },
    });
    expect(wrapper.classes()).toContain('ex-grid-item--order-2');
  });

  it('renders grid item with span 0 (hidden)', () => {
    const wrapper = mount(ExGridItem, {
      props: {
        span: 0,
      },
    });
    expect(wrapper.classes()).toContain('ex-grid-item--span-0');
  });

  it('renders grid item with non-common span value using CSS variables', () => {
    const wrapper = mount(ExGridItem, {
      props: {
        span: 7,
      },
    });
    expect(wrapper.classes()).toContain('ex-grid-item--span-7');
    // 非常用值应该使用内联样式
    expect(wrapper.attributes('style')).toContain('--ex-grid-item-width');
  });

  it('renders grid item with responsive object config', () => {
    const wrapper = mount(ExGridItem, {
      props: {
        md: { span: 12, offset: 6, order: 1 },
      },
    });
    expect(wrapper.classes()).toContain('ex-grid-item--md-12');
    expect(wrapper.classes()).toContain('ex-grid-item--md-offset-6');
    expect(wrapper.classes()).toContain('ex-grid-item--md-order-1');
  });

  it('renders grid with all justify options', () => {
    const justifyOptions = [
      'start',
      'end',
      'center',
      'space-around',
      'space-between',
      'space-evenly',
    ] as const;
    justifyOptions.forEach(justify => {
      const wrapper = mount(ExGrid, {
        props: { justify },
      });
      expect(wrapper.classes()).toContain(`ex-grid--justify-${justify}`);
    });
  });

  it('renders grid with all align options', () => {
    const alignOptions = ['top', 'middle', 'bottom', 'stretch'] as const;
    alignOptions.forEach(align => {
      const wrapper = mount(ExGrid, {
        props: { align },
      });
      expect(wrapper.classes()).toContain(`ex-grid--align-${align}`);
    });
  });

  it('renders grid item with push', () => {
    const wrapper = mount(ExGridItem, {
      props: {
        span: 8,
        push: 4,
      },
    });
    expect(wrapper.classes()).toContain('ex-grid-item--push-4');
  });

  it('renders grid item with pull', () => {
    const wrapper = mount(ExGridItem, {
      props: {
        span: 8,
        pull: 4,
      },
    });
    expect(wrapper.classes()).toContain('ex-grid-item--pull-4');
  });

  it('renders grid item with responsive push and pull', () => {
    const wrapper = mount(ExGridItem, {
      props: {
        md: { span: 12, push: 4, pull: 2 },
      },
    });
    expect(wrapper.classes()).toContain('ex-grid-item--md-12');
    expect(wrapper.classes()).toContain('ex-grid-item--md-push-4');
    expect(wrapper.classes()).toContain('ex-grid-item--md-pull-2');
  });

  it('exposes gutter CSS variables for the negative-margin spacing', () => {
    const wrapper = mount(ExGrid, {
      props: {
        gutter: 20,
      },
    });
    const style = wrapper.attributes('style');
    expect(style).toContain('--ex-grid-gutter-x: 20px');
    expect(style).toContain('--ex-grid-gutter-y: 20px');
  });

  it('exposes gutter CSS variables for array gutter', () => {
    const wrapper = mount(ExGrid, {
      props: {
        gutter: [16, 24],
      },
    });
    const style = wrapper.attributes('style');
    expect(style).toContain('--ex-grid-gutter-x: 16px');
    expect(style).toContain('--ex-grid-gutter-y: 24px');
  });
});
