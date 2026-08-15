import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExSkeleton from '../../../src/components/skeleton/ExSkeleton.vue';
import type { ExSkeletonExposed, ExSkeletonProps } from '../../../src/components/skeleton/types';

describe('ExSkeleton', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExSkeleton, {
      props: { loading: true },
    });

    expect(wrapper.find('.ex-skeleton').exists()).toBe(true);
    expect(wrapper.find('.ex-skeleton').classes()).toContain('ex-skeleton--animation-pulse');
  });

  it('renders different skeleton variants', () => {
    const variants: ExSkeletonProps['variant'][] = [
      'text',
      'avatar',
      'image',
      'button',
      'card',
      'list',
    ];

    variants.forEach(variant => {
      const wrapper = mount(ExSkeleton, {
        props: { loading: true, variant },
      });
      expect(wrapper.find('.ex-skeleton').exists()).toBe(true);
    });
  });

  it('text 和 image 预设不会额外渲染默认段落', () => {
    const text = mount(ExSkeleton, { props: { variant: 'text' } });
    const image = mount(ExSkeleton, { props: { variant: 'image' } });

    expect(text.findAll('.ex-skeleton__element--text')).toHaveLength(1);
    expect(text.find('.ex-skeleton__paragraph').exists()).toBe(false);
    expect(image.findAll('.ex-skeleton__element--image')).toHaveLength(1);
    expect(image.find('.ex-skeleton__paragraph').exists()).toBe(false);
  });

  it('article、list、table 和 rect 使用各自完整预设结构', () => {
    const article = mount(ExSkeleton, { props: { variant: 'article', rows: 4 } });
    const list = mount(ExSkeleton, { props: { variant: 'list', count: 2 } });
    const table = mount(ExSkeleton, { props: { variant: 'table', rows: 2 } });
    const rect = mount(ExSkeleton, { props: { variant: 'rect' } });

    expect(article.find('.ex-skeleton__title').exists()).toBe(true);
    expect(article.findAll('.ex-skeleton__row')).toHaveLength(4);
    expect(list.findAll('.ex-skeleton__list-item')).toHaveLength(2);
    expect(table.find('.ex-skeleton__table-header').exists()).toBe(true);
    expect(table.findAll('.ex-skeleton__table-row')).toHaveLength(2);
    expect(rect.find('.ex-skeleton__element--rect').exists()).toBe(true);
  });

  it('renders different animations', () => {
    const animations: ExSkeletonProps['animation'][] = ['pulse', 'wave'];

    animations.forEach(animation => {
      const wrapper = mount(ExSkeleton, {
        props: { animation },
      });
      expect(wrapper.find('.ex-skeleton').classes()).toContain(
        `ex-skeleton--animation-${animation}`
      );
    });

    // animation: 'none' 不添加动画类
    const noneWrapper = mount(ExSkeleton, { props: { animation: 'none' } });
    const classes = noneWrapper.find('.ex-skeleton').classes();
    expect(classes.some(c => c.startsWith('ex-skeleton--animation-'))).toBe(false);
  });

  it('renders different sizes', () => {
    const sizes: ExSkeletonProps['size'][] = ['small', 'default', 'large'];

    sizes.forEach(size => {
      const wrapper = mount(ExSkeleton, {
        props: { size },
      });
      expect(wrapper.find('.ex-skeleton').classes()).toContain(`ex-skeleton--${size}`);
    });
  });

  it('renders with custom rows', () => {
    const wrapper = mount(ExSkeleton, {
      props: { loading: true, rows: 5 },
    });

    const items = wrapper.findAll('.ex-skeleton__row');
    expect(items.length).toBe(5);
  });

  it('handles loading state', () => {
    const wrapper = mount(ExSkeleton, {
      props: { loading: true },
      slots: { default: 'Content' },
    });

    expect(wrapper.find('.ex-skeleton').exists()).toBe(true);
  });

  it('shows content when not loading', () => {
    const wrapper = mount(ExSkeleton, {
      props: { loading: false },
      slots: { default: 'Content' },
    });

    expect(wrapper.find('.ex-skeleton').exists()).toBe(false);
    expect(wrapper.text()).toContain('Content');
  });

  it('renders avatar skeleton', () => {
    const wrapper = mount(ExSkeleton, {
      props: { loading: true, variant: 'avatar', avatar: true },
    });

    expect(wrapper.find('.ex-skeleton__avatar').exists()).toBe(true);
  });

  it('renders with title', () => {
    const wrapper = mount(ExSkeleton, {
      props: { loading: true, title: true },
    });

    expect(wrapper.find('.ex-skeleton__title').exists()).toBe(true);
  });

  it('renders with paragraph', () => {
    const wrapper = mount(ExSkeleton, {
      props: { loading: true, rows: 3 },
    });

    expect(wrapper.find('.ex-skeleton__paragraph').exists()).toBe(true);
  });

  it('renders with custom class', () => {
    const wrapper = mount(ExSkeleton, {
      props: { loading: true, class: 'custom-skeleton' },
    });

    expect(wrapper.find('.ex-skeleton').classes()).toContain('custom-skeleton');
  });

  it('renders with custom style', () => {
    const customStyle = { width: '200px' };
    const wrapper = mount(ExSkeleton, {
      props: { loading: true, style: customStyle },
    });

    const styleAttr = wrapper.find('.ex-skeleton').attributes('style');
    expect(styleAttr).toBeDefined();
  });

  it('exposes getElement method', () => {
    const wrapper = mount(ExSkeleton);

    const vm = wrapper.vm as unknown as ExSkeletonExposed;
    expect(typeof vm.getElement).toBe('function');
  });
});
