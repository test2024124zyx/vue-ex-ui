import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExDivider from '../../../src/components/divider/ExDivider.vue';
import type { ExDividerProps } from '../../../src/components/divider/types';

describe('ExDivider', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExDivider);

    expect(wrapper.find('.ex-divider').exists()).toBe(true);
    expect(wrapper.find('.ex-divider--horizontal').exists()).toBe(true);
  });

  it('renders with text content', () => {
    const wrapper = mount(ExDivider, {
      slots: {
        default: 'Divider Text',
      },
    });

    // 有标题时根据 orientation 添加位置类（默认 center），文字渲染在 __content 中
    expect(wrapper.find('.ex-divider--center').exists()).toBe(true);
    expect(wrapper.find('.ex-divider__content').exists()).toBe(true);
    expect(wrapper.text()).toBe('Divider Text');
  });

  it('renders as vertical divider', () => {
    const wrapper = mount(ExDivider, {
      props: {
        type: 'vertical',
      },
    });

    expect(wrapper.find('.ex-divider--vertical').exists()).toBe(true);
    expect(wrapper.find('.ex-divider--horizontal').exists()).toBe(false);
  });

  it('renders with different orientations', () => {
    const orientations: ExDividerProps['orientation'][] = ['left', 'center', 'right'];

    orientations.forEach(orientation => {
      const wrapper = mount(ExDivider, {
        props: {
          orientation,
        },
        slots: {
          default: 'Text',
        },
      });

      expect(wrapper.find(`.ex-divider--${orientation}`).exists()).toBe(true);
    });
  });

  it('renders with dashed style', () => {
    const wrapper = mount(ExDivider, {
      props: {
        dashed: true,
      },
    });

    expect(wrapper.find('.ex-divider--dashed').exists()).toBe(true);
  });

  it('renders with different sizes', () => {
    const sizes = ['small', 'default', 'large'] as const;

    sizes.forEach(size => {
      const wrapper = mount(ExDivider, {
        props: {
          size,
        },
      });

      expect(wrapper.find(`.ex-divider--size-${size}`).exists()).toBe(true);
    });
  });

  it('renders with custom numeric size', () => {
    const wrapper = mount(ExDivider, {
      props: {
        size: 5,
      },
    });

    // 数字尺寸通过 CSS 变量下发
    const dividerElement = wrapper.find('.ex-divider');
    expect(dividerElement.attributes('style')).toContain('--ex-divider-size: 5px');
  });

  it('renders with custom margin', () => {
    const wrapper = mount(ExDivider, {
      props: {
        margin: '16px',
      },
    });

    const dividerElement = wrapper.find('.ex-divider');
    expect(dividerElement.attributes('style')).toContain('margin: 16px 0');
  });

  it('renders with numeric margin', () => {
    const wrapper = mount(ExDivider, {
      props: {
        margin: 20,
      },
    });

    const dividerElement = wrapper.find('.ex-divider');
    expect(dividerElement.attributes('style')).toContain('margin: 20px 0');
  });

  it('renders with orientation margin', () => {
    const wrapper = mount(ExDivider, {
      props: {
        orientation: 'left',
        orientationMargin: '10%',
      },
      slots: {
        default: 'Text',
      },
    });

    // orientationMargin 通过 CSS 变量下发到根元素
    expect(wrapper.find('.ex-divider').attributes('style')).toContain(
      '--ex-divider-orientation-margin: 10%'
    );
  });

  it('renders with numeric orientation margin', () => {
    const wrapper = mount(ExDivider, {
      props: {
        orientation: 'right',
        orientationMargin: 50,
      },
      slots: {
        default: 'Text',
      },
    });

    expect(wrapper.find('.ex-divider').attributes('style')).toContain(
      '--ex-divider-orientation-margin: 50px'
    );
  });

  it('renders with plain text style', () => {
    const wrapper = mount(ExDivider, {
      props: {
        plain: true,
      },
      slots: {
        default: 'Plain Text',
      },
    });

    expect(wrapper.find('.ex-divider--plain').exists()).toBe(true);
  });

  it('applies custom class and style', () => {
    const wrapper = mount(ExDivider, {
      props: {
        class: 'custom-divider',
        style: { borderColor: 'red' },
      },
    });

    expect(wrapper.classes()).toContain('custom-divider');
    expect(wrapper.attributes('style')).toContain('border-color: red');
  });

  it('vertical divider ignores text content', () => {
    const wrapper = mount(ExDivider, {
      props: {
        type: 'vertical',
      },
      slots: {
        default: 'Vertical Text',
      },
    });

    // 垂直分割线不支持标题文本
    expect(wrapper.find('.ex-divider--vertical').exists()).toBe(true);
    expect(wrapper.find('.ex-divider__content').exists()).toBe(false);
  });

  it('combines multiple props correctly', () => {
    const wrapper = mount(ExDivider, {
      props: {
        type: 'horizontal',
        orientation: 'left',
        dashed: true,
        size: 'large',
        plain: true,
        margin: '32px',
      },
      slots: {
        default: 'Combined Props',
      },
    });

    expect(wrapper.find('.ex-divider--horizontal').exists()).toBe(true);
    expect(wrapper.find('.ex-divider--left').exists()).toBe(true);
    expect(wrapper.find('.ex-divider--dashed').exists()).toBe(true);
    expect(wrapper.find('.ex-divider--size-large').exists()).toBe(true);
    expect(wrapper.find('.ex-divider--plain').exists()).toBe(true);
    expect(wrapper.find('.ex-divider__content').exists()).toBe(true);
    expect(wrapper.attributes('style')).toContain('margin: 32px 0');
  });

  it('handles empty slot content', () => {
    const wrapper = mount(ExDivider);

    expect(wrapper.find('.ex-divider__content').exists()).toBe(false);
  });

  it('renders with complex slot content', () => {
    const wrapper = mount(ExDivider, {
      slots: {
        default: '<span class="custom-text">Custom <strong>Content</strong></span>',
      },
    });

    expect(wrapper.find('.custom-text').exists()).toBe(true);
    expect(wrapper.find('strong').exists()).toBe(true);
    expect(wrapper.text()).toContain('Custom Content');
  });

  it('applies orientation margin variable for left orientation', () => {
    const leftWrapper = mount(ExDivider, {
      props: {
        orientation: 'left',
        orientationMargin: '20px',
      },
      slots: {
        default: 'Left Text',
      },
    });

    expect(leftWrapper.find('.ex-divider').attributes('style')).toContain(
      '--ex-divider-orientation-margin: 20px'
    );
    expect(leftWrapper.find('.ex-divider--left').exists()).toBe(true);
  });

  it('handles different size and type combinations', () => {
    const wrapper = mount(ExDivider, {
      props: {
        type: 'vertical',
        size: 'small',
        dashed: true,
      },
    });

    expect(wrapper.find('.ex-divider--vertical').exists()).toBe(true);
    expect(wrapper.find('.ex-divider--size-small').exists()).toBe(true);
    expect(wrapper.find('.ex-divider--dashed').exists()).toBe(true);
  });
});
