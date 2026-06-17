import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExCard from '../../../src/components/card/ExCard.vue';
import type { ExCardProps } from '../../../src/components/card/types';

describe('ExCard', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExCard, {
      slots: {
        default: 'Card content',
      },
    });

    expect(wrapper.find('.ex-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('Card content');
    expect(wrapper.classes()).toContain('ex-card--default');
    expect(wrapper.classes()).toContain('ex-card--medium');
    expect(wrapper.classes()).toContain('ex-card--shadow-base');
  });

  it('renders different card types', () => {
    const types: ExCardProps['type'][] = ['default', 'primary', 'success', 'warning', 'danger', 'info'];

    types.forEach((type) => {
      const wrapper = mount(ExCard, {
        props: { type },
        slots: { default: 'Card' },
      });
      expect(wrapper.classes()).toContain(`ex-card--${type}`);
    });
  });

  it('renders different card sizes', () => {
    const sizes: ExCardProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach((size) => {
      const wrapper = mount(ExCard, {
        props: { size },
        slots: { default: 'Card' },
      });
      expect(wrapper.classes()).toContain(`ex-card--${size}`);
    });
  });

  it('renders different shadow effects', () => {
    const shadows: ExCardProps['shadow'][] = ['none', 'sm', 'base', 'md', 'lg', 'xl', 'neon'];

    shadows.forEach((shadow) => {
      const wrapper = mount(ExCard, {
        props: { shadow },
        slots: { default: 'Card' },
      });
      expect(wrapper.classes()).toContain(`ex-card--shadow-${shadow}`);
    });
  });

  it('renders with cover image', () => {
    const wrapper = mount(ExCard, {
      props: { cover: 'https://example.com/image.jpg' },
      slots: { default: 'Card with cover' },
    });

    expect(wrapper.find('.ex-card__cover').exists()).toBe(true);
    expect(wrapper.find('.ex-card__cover-image').exists()).toBe(true);
    expect(wrapper.find('.ex-card__cover-image').attributes('src')).toBe('https://example.com/image.jpg');
  });

  it('renders with custom cover height', () => {
    const wrapper = mount(ExCard, {
      props: { 
        cover: 'https://example.com/image.jpg',
        coverHeight: 300,
      },
      slots: { default: 'Card' },
    });

    const cover = wrapper.find('.ex-card__cover');
    expect(cover.attributes('style')).toContain('height: 300px');
  });

  it('renders with header slot', () => {
    const wrapper = mount(ExCard, {
      slots: {
        default: 'Card content',
        header: '<h3>Card Header</h3>',
      },
    });

    expect(wrapper.find('.ex-card__header').exists()).toBe(true);
    expect(wrapper.find('.ex-card__header').text()).toContain('Card Header');
  });

  it('renders with footer slot', () => {
    const wrapper = mount(ExCard, {
      slots: {
        default: 'Card content',
        footer: '<div>Card Footer</div>',
      },
    });

    expect(wrapper.find('.ex-card__footer').exists()).toBe(true);
    expect(wrapper.find('.ex-card__footer').text()).toContain('Card Footer');
  });

  it('renders with actions slot', () => {
    const wrapper = mount(ExCard, {
      slots: {
        default: 'Card content',
        actions: '<button>Action</button>',
      },
    });

    expect(wrapper.find('.ex-card__footer').exists()).toBe(true);
    expect(wrapper.find('.ex-card__actions').exists()).toBe(true);
  });

  it('handles hoverable state', () => {
    const wrapper = mount(ExCard, {
      props: { hoverable: true },
      slots: { default: 'Hoverable card' },
    });

    expect(wrapper.classes()).toContain('ex-card--hoverable');
  });

  it('handles loading state', () => {
    const wrapper = mount(ExCard, {
      props: { loading: true },
      slots: { default: 'Loading card' },
    });

    expect(wrapper.classes()).toContain('ex-card--loading');
    expect(wrapper.find('.ex-card__loading').exists()).toBe(true);
    expect(wrapper.find('.ex-card__loading-spinner').exists()).toBe(true);
  });

  it('handles borderless state', () => {
    const wrapper = mount(ExCard, {
      props: { bordered: false },
      slots: { default: 'Borderless card' },
    });

    expect(wrapper.classes()).toContain('ex-card--borderless');
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ExCard, {
      props: { onClick },
      slots: { default: 'Clickable card' },
    });

    await wrapper.trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not emit click when loading', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ExCard, {
      props: {
        loading: true,
        onClick,
      },
      slots: { default: 'Loading card' },
    });

    await wrapper.trigger('click');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders with custom class', () => {
    const wrapper = mount(ExCard, {
      props: { class: 'custom-card' },
      slots: { default: 'Card' },
    });

    expect(wrapper.classes()).toContain('custom-card');
  });

  it('renders with custom style', () => {
    const customStyle = { backgroundColor: 'red' };
    const wrapper = mount(ExCard, {
      props: { style: customStyle },
      slots: { default: 'Card' },
    });

    expect(wrapper.attributes('style')).toContain('background-color: red');
  });

  it('exposes getElement method', () => {
    const wrapper = mount(ExCard, {
      slots: { default: 'Card' },
    });

    const vm = wrapper.vm as any;
    expect(typeof vm.getElement).toBe('function');
  });
});
