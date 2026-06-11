import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExLoading from '../../../src/components/loading/ExLoading.vue';
import type { ExLoadingProps } from '../../../src/components/loading/types';

describe('ExLoading', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExLoading);

    expect(wrapper.find('.ex-loading').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-loading--medium');
  });

  it('renders different loading sizes', () => {
    const sizes: ExLoadingProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach((size) => {
      const wrapper = mount(ExLoading, {
        props: { size },
      });
      expect(wrapper.classes()).toContain(`ex-loading--${size}`);
    });
  });

  it('renders different loading types', () => {
    const types: ExLoadingProps['type'][] = ['spinner', 'dots', 'bars'];

    types.forEach((type) => {
      const wrapper = mount(ExLoading, {
        props: { type },
      });
      expect(wrapper.classes()).toContain(`ex-loading--${type}`);
    });
  });

  it('renders with text', () => {
    const text = 'Loading...';
    const wrapper = mount(ExLoading, {
      props: { text },
    });

    expect(wrapper.find('.ex-loading__text').exists()).toBe(true);
    expect(wrapper.find('.ex-loading__text').text()).toBe(text);
  });

  it('handles fullscreen mode', () => {
    const wrapper = mount(ExLoading, {
      props: { fullscreen: true },
    });

    expect(wrapper.classes()).toContain('ex-loading--fullscreen');
  });

  it('handles loading state', () => {
    const wrapper = mount(ExLoading, {
      props: { loading: true },
      slots: { default: 'Content' },
    });

    expect(wrapper.find('.ex-loading').exists()).toBe(true);
  });

  it('shows content when not loading', () => {
    const wrapper = mount(ExLoading, {
      props: { loading: false },
      slots: { default: 'Content' },
    });

    expect(wrapper.text()).toContain('Content');
  });

  it('renders with custom class', () => {
    const wrapper = mount(ExLoading, {
      props: { class: 'custom-loading' },
    });

    expect(wrapper.classes()).toContain('custom-loading');
  });

  it('renders with custom style', () => {
    const customStyle = { color: 'red' };
    const wrapper = mount(ExLoading, {
      props: { style: customStyle },
    });

    expect(wrapper.attributes('style')).toContain('color: red');
  });

  it('exposes getElement method', () => {
    const wrapper = mount(ExLoading);

    const vm = wrapper.vm as any;
    expect(typeof vm.getElement).toBe('function');
  });
});
