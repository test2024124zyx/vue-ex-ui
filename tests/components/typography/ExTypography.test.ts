import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExTypography from '../../../src/components/typography/ExTypography.vue';
import type { ExTypographyProps } from '../../../src/components/typography/types';

describe('ExTypography', () => {
  // 基础渲染测试
  it('renders correctly with default props', () => {
    const wrapper = mount(ExTypography);

    expect(wrapper.element.tagName).toBe('P');
    expect(wrapper.classes()).toContain('ex-typography');
    expect(wrapper.classes()).toContain('ex-typography--body');
    expect(wrapper.classes()).toContain('ex-typography--md');
  });

  // 文本内容测试
  it('renders text content correctly', () => {
    const text = 'Hello World';
    const wrapper = mount(ExTypography, {
      props: { text },
    });

    expect(wrapper.text()).toBe(text);
  });

  // 插槽内容测试
  it('renders slot content correctly', () => {
    const slotContent = 'Slot Content';
    const wrapper = mount(ExTypography, {
      slots: {
        default: slotContent,
      },
    });

    expect(wrapper.text()).toBe(slotContent);
  });

  // 插槽优先级测试
  it('prioritizes slot content over text prop', () => {
    const text = 'Text Prop';
    const slotContent = 'Slot Content';
    const wrapper = mount(ExTypography, {
      props: { text },
      slots: {
        default: slotContent,
      },
    });

    expect(wrapper.text()).toBe(slotContent);
  });

  // HTML 标签测试
  it('renders correct HTML tag', () => {
    const wrapper = mount(ExTypography, {
      props: { tag: 'h1' },
    });

    expect(wrapper.element.tagName).toBe('H1');
  });

  // 变体样式测试
  it.each([
    ['display', 'ex-typography--display'],
    ['heading', 'ex-typography--heading'],
    ['title', 'ex-typography--title'],
    ['body', 'ex-typography--body'],
    ['caption', 'ex-typography--caption'],
    ['overline', 'ex-typography--overline'],
  ])('applies correct variant class for %s', (variant, expectedClass) => {
    const wrapper = mount(ExTypography, {
      props: { variant: variant as ExTypographyProps['variant'] },
    });

    expect(wrapper.classes()).toContain(expectedClass);
  });

  // 尺寸样式测试
  it.each([
    ['xs', 'ex-typography--xs'],
    ['sm', 'ex-typography--sm'],
    ['md', 'ex-typography--md'],
    ['lg', 'ex-typography--lg'],
    ['xl', 'ex-typography--xl'],
    ['2xl', 'ex-typography--2xl'],
    ['3xl', 'ex-typography--3xl'],
    ['4xl', 'ex-typography--4xl'],
  ])('applies correct size class for %s', (size, expectedClass) => {
    const wrapper = mount(ExTypography, {
      props: { size: size as ExTypographyProps['size'] },
    });

    expect(wrapper.classes()).toContain(expectedClass);
  });

  // 修饰符测试
  it('applies modifier classes correctly', () => {
    const wrapper = mount(ExTypography, {
      props: {
        truncate: true,
        gradient: true,
        glow: true,
        center: true,
        bold: true,
        italic: true,
        underline: true,
      },
    });

    expect(wrapper.classes()).toContain('ex-typography--truncate');
    expect(wrapper.classes()).toContain('ex-typography--gradient');
    expect(wrapper.classes()).toContain('ex-typography--glow');
    expect(wrapper.classes()).toContain('ex-typography--center');
    expect(wrapper.classes()).toContain('ex-typography--bold');
    expect(wrapper.classes()).toContain('ex-typography--italic');
    expect(wrapper.classes()).toContain('ex-typography--underline');
  });

  it.each([
    ['body', 'p'],
    ['caption', 'span'],
    ['overline', 'label'],
  ] as const)('渐变是独立文本效果，可应用于 %s 文本和自定义标签', (variant, tag) => {
    const wrapper = mount(ExTypography, {
      props: { variant, tag, gradient: true, color: 'danger' },
      slots: { default: '渐变正文' },
    });

    expect(wrapper.element.tagName).toBe(tag.toUpperCase());
    expect(wrapper.classes()).toContain('ex-typography--gradient');
    expect(wrapper.attributes('style') ?? '').not.toContain('--ex-color-danger');
  });

  it('渐变效果在未注册主题渐变变量时仍有语义色回退', () => {
    const wrapper = mount(ExTypography, {
      props: { gradient: true },
      slots: { default: '渐变文本' },
    });

    expect(wrapper.attributes('style')).toContain(
      '--ex-typography-gradient: linear-gradient(90deg, var(--ex-color-primary) 0%, var(--ex-color-cyber-cyan) 30%, var(--ex-color-secondary) 68%, var(--ex-color-accent) 100%)'
    );
  });

  it('渐变默认静态显示，动态位移需要显式开启', () => {
    const staticWrapper = mount(ExTypography, {
      props: { gradient: true },
      slots: { default: '静态渐变文本' },
    });
    const animatedWrapper = mount(ExTypography, {
      props: { gradient: true, gradientAnimated: true },
      slots: { default: '动态渐变文本' },
    });

    expect(staticWrapper.classes()).toContain('ex-typography--gradient');
    expect(staticWrapper.classes()).not.toContain('ex-typography--gradient-animated');
    expect(animatedWrapper.classes()).toContain('ex-typography--gradient-animated');
  });

  it('支持可控的赛博朋克文字风格', () => {
    const wrapper = mount(ExTypography, {
      props: { cyberpunk: true },
      slots: { default: '赛博朋克标题' },
    });

    expect(wrapper.classes()).toContain('ex-typography--cyberpunk');
  });

  it('支持模板使用的 kebab-case 动态渐变属性', () => {
    const wrapper = mount({
      render: () =>
        h(ExTypography, {
          gradient: true,
          'gradient-animated': true,
        }),
    });

    expect(wrapper.findComponent(ExTypography).classes()).toContain(
      'ex-typography--gradient-animated'
    );
  });

  it('渐变和发光同时启用时提供可见的发光颜色', () => {
    const wrapper = mount(ExTypography, {
      props: { gradient: true, glow: true },
      slots: { default: '渐变发光文本' },
    });

    expect(wrapper.attributes('style')).toContain(
      '--ex-typography-glow-color: var(--ex-color-primary)'
    );
  });

  // 自定义样式测试
  it('applies custom styles correctly', () => {
    const customStyle = {
      fontSize: '20px',
      color: 'red',
    };
    const wrapper = mount(ExTypography, {
      props: { customStyle },
    });

    const style = wrapper.element.style;
    expect(style.fontSize).toBe('20px');
    expect(style.color).toBe('red');
  });

  // 颜色样式测试
  it('applies color styles correctly', () => {
    const wrapper = mount(ExTypography, {
      props: { color: 'primary' },
    });

    const style = wrapper.element.style;
    expect(style.color).toBe('var(--ex-color-primary)');
  });

  it('only maps registered theme colors and preserves raw CSS colors', () => {
    const semanticColorWrapper = mount(ExTypography, {
      props: { color: 'danger' },
    });
    const rawColorWrapper = mount(ExTypography, {
      props: { color: 'red' },
    });
    const cssVariableWrapper = mount(ExTypography, {
      props: { color: 'var(--custom-typography-color)' },
    });

    expect(semanticColorWrapper.element.style.color).toBe('var(--ex-color-danger)');
    expect(rawColorWrapper.element.style.color).toBe('red');
    expect(cssVariableWrapper.element.style.color).toBe('var(--custom-typography-color)');
  });

  // 多行截断测试
  it('applies multi-line truncation styles correctly', () => {
    const wrapper = mount(ExTypography, {
      props: {
        truncate: true,
        maxLines: 3.8,
        text: '多行截断文本',
      },
    });

    const style = wrapper.element.style;
    expect(style.display).toBe('-webkit-box');
    expect(style.WebkitLineClamp).toBe('3');
    expect(style.WebkitBoxOrient).toBe('vertical');
    expect(style.overflow).toBe('hidden');
    expect(wrapper.classes()).toContain('ex-typography--truncate-multiline');
    expect(wrapper.classes()).not.toContain('ex-typography--truncate-single-line');
  });

  it('为 text 属性的截断内容提供原文提示，并尊重插槽和显式 title', () => {
    const textWrapper = mount(ExTypography, {
      props: { text: '完整的截断文本', truncate: true },
    });
    const slotWrapper = mount(ExTypography, {
      props: { text: '不会作为提示的文本', truncate: true },
      slots: { default: '插槽截断文本' },
    });
    const explicitTitleWrapper = mount(ExTypography, {
      props: { text: '原始文本', truncate: true },
      attrs: { title: '自定义提示' },
    });

    expect(textWrapper.attributes('title')).toBe('完整的截断文本');
    expect(slotWrapper.attributes('title')).toBeUndefined();
    expect(explicitTitleWrapper.attributes('title')).toBe('自定义提示');
  });

  // 默认标签映射测试
  it('uses correct default tag for variants when tag is not specified', () => {
    const variantTagMap = [
      ['display', 'H1'],
      ['heading', 'H2'],
      ['title', 'H3'],
      ['body', 'P'],
      ['caption', 'SPAN'],
      ['overline', 'SPAN'],
    ];

    variantTagMap.forEach(([variant, expectedTag]) => {
      const wrapper = mount(ExTypography, {
        props: {
          variant: variant as ExTypographyProps['variant'],
          tag: undefined, // 明确设置为 undefined 以使用默认映射
        },
      });

      expect(wrapper.element.tagName).toBe(expectedTag);
    });
  });

  // 属性继承测试
  it('inherits attributes correctly', () => {
    const wrapper = mount(ExTypography, {
      attrs: {
        id: 'test-id',
        'data-testid': 'typography-test',
      },
    });

    expect(wrapper.attributes('id')).toBe('test-id');
    expect(wrapper.attributes('data-testid')).toBe('typography-test');
  });

  // 响应式测试
  it('updates when props change', async () => {
    const wrapper = mount(ExTypography, {
      props: { variant: 'body' },
    });

    expect(wrapper.classes()).toContain('ex-typography--body');

    await wrapper.setProps({ variant: 'heading' });

    expect(wrapper.classes()).toContain('ex-typography--heading');
    expect(wrapper.classes()).not.toContain('ex-typography--body');
  });

  // 边界情况测试
  it('handles empty text gracefully', () => {
    const wrapper = mount(ExTypography, {
      props: { text: '' },
    });

    expect(wrapper.text()).toBe('');
  });

  it('handles undefined text gracefully', () => {
    const wrapper = mount(ExTypography, {
      props: { text: undefined },
    });

    expect(wrapper.text()).toBe('');
  });

  // 组件名称测试
  it('has correct component name', () => {
    const wrapper = mount(ExTypography);
    expect(wrapper.vm.$options.name).toBe('ExTypography');
  });
});
