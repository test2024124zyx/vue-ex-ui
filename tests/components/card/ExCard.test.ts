import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExCard from '../../../src/components/card/ExCard.vue';
import type { ExCardExposed, ExCardProps } from '../../../src/components/card/types';

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
    const types: ExCardProps['type'][] = [
      'default',
      'primary',
      'success',
      'warning',
      'danger',
      'info',
    ];

    types.forEach(type => {
      const wrapper = mount(ExCard, {
        props: { type },
        slots: { default: 'Card' },
      });
      expect(wrapper.classes()).toContain(`ex-card--${type}`);
    });
  });

  it('renders different card sizes', () => {
    const sizes: ExCardProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      const wrapper = mount(ExCard, {
        props: { size },
        slots: { default: 'Card' },
      });
      expect(wrapper.classes()).toContain(`ex-card--${size}`);
    });
  });

  it('renders different shadow effects', () => {
    const shadows: ExCardProps['shadow'][] = ['none', 'sm', 'base', 'md', 'lg', 'xl', 'neon'];

    shadows.forEach(shadow => {
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
    expect(wrapper.find('.ex-card__cover-image').attributes('src')).toBe(
      'https://example.com/image.jpg'
    );
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

  it('内部交互控件点击不会同时触发卡片主操作', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ExCard, {
      props: { onClick },
      slots: { actions: '<button class="inner-action">Action</button>' },
    });

    const primaryAction = wrapper.get('.ex-card__primary-action');
    const innerAction = wrapper.get('.inner-action');

    expect(primaryAction.element.tagName).toBe('BUTTON');
    expect(innerAction.element.tagName).toBe('BUTTON');
    expect(primaryAction.element.contains(innerAction.element)).toBe(false);
    await innerAction.trigger('click');

    expect(onClick).not.toHaveBeenCalled();
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

  it('有点击监听器时提供独立的原生主操作按钮', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ExCard, {
      props: { onClick },
      slots: { default: '可交互卡片' },
    });

    const primaryAction = wrapper.get('.ex-card__primary-action');

    expect(wrapper.attributes('role')).toBeUndefined();
    expect(primaryAction.element.tagName).toBe('BUTTON');
    expect(primaryAction.attributes('aria-label')).toBeTruthy();

    await primaryAction.trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]?.[0]).toBeInstanceOf(MouseEvent);
  });

  it('加载时公开忙碌与禁用语义并隔离内部交互', () => {
    const wrapper = mount(ExCard, {
      props: { loading: true, onClick: vi.fn() },
      slots: { default: '<button>内部操作</button>' },
    });

    expect(wrapper.attributes('aria-busy')).toBe('true');
    expect(wrapper.attributes('aria-disabled')).toBe('true');
    expect(wrapper.get('.ex-card__primary-action').attributes()).toHaveProperty('disabled');
    expect(wrapper.find('.ex-card__body').attributes()).toHaveProperty('inert');
    expect(wrapper.find('.ex-card__loading').attributes('role')).toBe('status');
  });

  it('没有点击监听器时不会伪装成可交互控件', () => {
    const wrapper = mount(ExCard, { slots: { default: '静态卡片' } });

    expect(wrapper.attributes('role')).toBeUndefined();
    expect(wrapper.attributes('tabindex')).toBeUndefined();
    expect(wrapper.find('.ex-card__primary-action').exists()).toBe(false);
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

    const vm = wrapper.vm as unknown as ExCardExposed;
    expect(typeof vm.getElement).toBe('function');
  });
});
