import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExBadge from '../../../src/components/badge/ExBadge.vue';
import type { ExBadgeProps } from '../../../src/components/badge/types';

describe('ExBadge', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExBadge, {
      slots: {
        default: '<div>Content</div>',
      },
    });

    expect(wrapper.find('.ex-badge').exists()).toBe(true);
    expect(wrapper.find('.ex-badge--with-content').exists()).toBe(true);
    expect(wrapper.find('.ex-badge__content').exists()).toBe(true);
    expect(wrapper.text()).toContain('Content');
  });

  it('renders standalone badge without content', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 5 },
    });

    expect(wrapper.find('.ex-badge').exists()).toBe(true);
    expect(wrapper.find('.ex-badge--with-content').exists()).toBe(false);
    expect(wrapper.find('.ex-badge__sup').exists()).toBe(true);
    expect(wrapper.text()).toContain('5');
  });

  it('renders different badge types', () => {
    const types: ExBadgeProps['type'][] = [
      'primary',
      'secondary',
      'success',
      'warning',
      'danger',
      'info',
    ];

    types.forEach(type => {
      const wrapper = mount(ExBadge, {
        props: { type, count: 1 },
      });
      expect(wrapper.find(`.ex-badge__sup--${type}`).exists()).toBe(true);
    });
  });

  it('renders different badge sizes', () => {
    const sizes: ExBadgeProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      const wrapper = mount(ExBadge, {
        props: { size, count: 1 },
      });
      expect(wrapper.find(`.ex-badge__sup--${size}`).exists()).toBe(true);
    });
  });

  it('renders dot badge correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { dot: true },
      slots: { default: '<div>Content</div>' },
    });

    expect(wrapper.find('.ex-badge__sup--dot').exists()).toBe(true);
    expect(wrapper.find('.ex-badge__count-text').exists()).toBe(false);
  });

  it('handles count overflow correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 150, overflowCount: 99 },
    });

    expect(wrapper.text()).toContain('99+');
  });

  it('shows zero when showZero is true', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 0, showZero: true },
    });

    expect(wrapper.find('.ex-badge__sup').exists()).toBe(true);
    expect(wrapper.text()).toContain('0');
  });

  it('hides badge when count is zero and showZero is false', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 0, showZero: false },
    });

    expect(wrapper.find('.ex-badge__sup').exists()).toBe(false);
  });

  it('renders status badge correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { status: 'success', text: 'Success' },
    });

    expect(wrapper.find('.ex-badge--status').exists()).toBe(true);
    expect(wrapper.find('.ex-badge__sup--status-success').exists()).toBe(true);
    expect(wrapper.find('.ex-badge__status-dot').exists()).toBe(true);
    expect(wrapper.find('.ex-badge__status-text').exists()).toBe(true);
    expect(wrapper.text()).toContain('Success');
  });

  it('renders different status types', () => {
    const statuses: ExBadgeProps['status'][] = [
      'success',
      'processing',
      'default',
      'error',
      'warning',
    ];

    statuses.forEach(status => {
      const wrapper = mount(ExBadge, {
        props: { status },
      });
      expect(wrapper.find(`.ex-badge__sup--status-${status}`).exists()).toBe(true);
    });
  });

  it('handles different positions correctly', () => {
    const positions: ExBadgeProps['position'][] = [
      'top-right',
      'top-left',
      'bottom-right',
      'bottom-left',
    ];

    positions.forEach(position => {
      const wrapper = mount(ExBadge, {
        props: { count: 1, position },
        slots: { default: '<div>Content</div>' },
      });
      expect(wrapper.find(`.ex-badge__sup--${position}`).exists()).toBe(true);
    });
  });

  it('applies custom color correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 1, color: '#ff0000' },
    });

    const badge = wrapper.find('.ex-badge__sup');
    const element = badge.element as HTMLElement;
    expect(element.style.background).toContain('rgb(255, 0, 0)');
    expect(element.style.borderColor).toBe('rgb(255, 0, 0)');
  });

  it('applies offset correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 1, offset: [10, -5] },
      slots: { default: '<div>Content</div>' },
    });

    const badge = wrapper.find('.ex-badge__sup');
    const element = badge.element as HTMLElement;
    expect(element.style.getPropertyValue('--ex-badge-offset-x')).toBe('10px');
    expect(element.style.getPropertyValue('--ex-badge-offset-y')).toBe('-5px');
    expect(element.style.transform).toBe('');
  });

  it('handles string count correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 'NEW' },
    });

    expect(wrapper.text()).toContain('NEW');
  });

  it('sets title attribute correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 5, title: 'Custom title' },
    });

    expect(wrapper.find('.ex-badge__sup').attributes('title')).toBe('Custom title');
  });

  it('uses count as title when no custom title provided', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 5 },
    });

    expect(wrapper.find('.ex-badge__sup').attributes('title')).toBe('5');
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ExBadge, {
      props: { count: 1, clickable: true },
      attrs: { onClick },
    });

    await wrapper.find('.ex-badge__sup').trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(wrapper.find('button.ex-badge__sup').attributes('type')).toBe('button');
  });

  it('provides an accessible label for dot badges', () => {
    const wrapper = mount(ExBadge, { props: { dot: true } });

    expect(wrapper.find('.ex-badge__sup').attributes('aria-label')).toBe('Notification indicator');
  });

  it('applies custom class correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 1, class: 'custom-class' },
    });

    expect(wrapper.classes()).toContain('custom-class');
  });

  it('applies custom style correctly', () => {
    const customStyle = { margin: '10px' };
    const wrapper = mount(ExBadge, {
      props: { count: 1, style: customStyle },
    });

    const element = wrapper.element as HTMLElement;
    expect(element.style.margin).toBe('10px');
  });

  it('applies custom badge style correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 1, badgeStyle: { fontSize: '14px' } },
    });

    const badge = wrapper.find('.ex-badge__sup');
    const element = badge.element as HTMLElement;
    expect(element.style.fontSize).toBe('14px');
  });

  it('exposes getElement method', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 1 },
    });

    const vm = wrapper.vm as any;
    expect(typeof vm.getElement).toBe('function');
    expect(vm.getElement()).toBe(wrapper.element);
  });

  it('renders with array class correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 1, class: ['class1', 'class2'] },
    });

    expect(wrapper.classes()).toContain('class1');
    expect(wrapper.classes()).toContain('class2');
  });

  it('renders with object class correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 1, class: { active: true, disabled: false } },
    });

    expect(wrapper.classes()).toContain('active');
    expect(wrapper.classes()).not.toContain('disabled');
  });

  it('handles string style correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 1, style: 'color: red; font-size: 16px;' },
    });

    const element = wrapper.element as HTMLElement;
    expect(element.getAttribute('style')).toContain('color: red');
    expect(element.getAttribute('style')).toContain('font-size: 16px');
  });

  it('handles string badgeStyle correctly', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 1, badgeStyle: 'font-weight: bold;' },
    });

    const badge = wrapper.find('.ex-badge__sup');
    const element = badge.element as HTMLElement;
    expect(element.getAttribute('style')).toContain('font-weight: bold');
  });

  it('does not render badge when count is undefined and not dot', () => {
    const wrapper = mount(ExBadge, {
      slots: { default: '<div>Content</div>' },
    });

    expect(wrapper.find('.ex-badge__sup').exists()).toBe(false);
  });

  it('renders status badge without text', () => {
    const wrapper = mount(ExBadge, {
      props: { status: 'processing' },
    });

    expect(wrapper.find('.ex-badge__status-dot').exists()).toBe(true);
    expect(wrapper.find('.ex-badge__status-text').exists()).toBe(false);
    expect(wrapper.find('.ex-badge__sup').attributes('aria-label')).toBe('Status indicator');
  });

  it('keeps a valid count badge when status is combined with content', () => {
    const wrapper = mount(ExBadge, {
      props: { status: 'success', count: 5 },
      slots: { default: '<button>Content</button>' },
    });

    const badge = wrapper.find('.ex-badge__sup');
    expect(badge.classes()).toContain('ex-badge__sup--primary');
    expect(badge.classes()).toContain('ex-badge__sup--count');
    expect(badge.classes()).not.toContain('ex-badge__sup--status-success');
    expect(wrapper.text()).toContain('5');
  });

  it('does not treat an empty default slot as content', () => {
    const wrapper = mount(ExBadge, {
      props: { count: 5 },
      slots: { default: () => [] },
    });

    expect(wrapper.classes()).not.toContain('ex-badge--with-content');
    expect(wrapper.find('.ex-badge__sup').classes()).not.toContain('ex-badge__sup--top-right');
  });
});
