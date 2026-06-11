import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExSkeleton from '../../../src/components/skeleton/ExSkeleton.vue';
import type { ExSkeletonProps } from '../../../src/components/skeleton/types';

describe('ExSkeleton', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExSkeleton, {
      props: { loading: true },
    });

    expect(wrapper.find('.ex-skeleton').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-skeleton--pulse');
  });

  it('renders different skeleton variants', () => {
    const variants: ExSkeletonProps['variant'][] = ['text', 'avatar', 'image', 'button', 'card', 'list'];

    variants.forEach((variant) => {
      const wrapper = mount(ExSkeleton, {
        props: { loading: true, variant },
      });
      expect(wrapper.find('.ex-skeleton').exists()).toBe(true);
    });
  });

  it('renders different animations', () => {
    const animations: ExSkeletonProps['animation'][] = ['pulse', 'wave', 'none'];

    animations.forEach((animation) => {
      const wrapper = mount(ExSkeleton, {
        props: { animation },
      });
      expect(wrapper.classes()).toContain(`ex-skeleton--${animation}`);
    });
  });

  it('renders different sizes', () => {
    const sizes: ExSkeletonProps['size'][] = ['small', 'default', 'large'];

    sizes.forEach((size) => {
      const wrapper = mount(ExSkeleton, {
        props: { size },
      });
      expect(wrapper.classes()).toContain(`ex-skeleton--${size}`);
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

    expect(wrapper.classes()).toContain('custom-skeleton');
  });

  it('renders with custom style', () => {
    const customStyle = { width: '200px' };
    const wrapper = mount(ExSkeleton, {
      props: { loading: true, style: customStyle },
    });

    const styleAttr = wrapper.attributes('style');
    expect(styleAttr).toBeDefined();
  });

  it('exposes getElement method', () => {
    const wrapper = mount(ExSkeleton);

    const vm = wrapper.vm as any;
    expect(typeof vm.getElement).toBe('function');
  });
});
