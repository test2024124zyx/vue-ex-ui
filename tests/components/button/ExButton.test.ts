import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExButton from '../../../src/components/button/ExButton.vue';
import type { ExButtonExposed, ExButtonProps } from '../../../src/components/button/types';

describe('ExButton', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(ExButton, {
      slots: {
        default: 'Click me',
      },
    });

    expect(wrapper.find('button').exists()).toBe(true);
    expect(wrapper.text()).toContain('Click me');
    expect(wrapper.classes()).toContain('ex-button');
    expect(wrapper.classes()).toContain('ex-button--default');
    expect(wrapper.classes()).toContain('ex-button--medium');
    expect(wrapper.classes()).not.toContain('ex-button--glow');
  });

  it('renders different button types', () => {
    const types: ExButtonProps['type'][] = [
      'default',
      'primary',
      'secondary',
      'success',
      'warning',
      'danger',
      'error',
      'info',
      'text',
      'link',
      'ghost',
    ];

    types.forEach(type => {
      const wrapper = mount(ExButton, {
        props: { type },
        slots: { default: 'Button' },
      });
      expect(wrapper.classes()).toContain(`ex-button--${type}`);
    });
  });

  it('renders different button sizes', () => {
    const sizes: ExButtonProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      const wrapper = mount(ExButton, {
        props: { size },
        slots: { default: 'Button' },
      });
      expect(wrapper.classes()).toContain(`ex-button--${size}`);
    });
  });

  it('handles disabled state correctly', () => {
    const wrapper = mount(ExButton, {
      props: { disabled: true },
      slots: { default: 'Button' },
    });

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
    expect(wrapper.classes()).toContain('ex-button--disabled');
  });

  it('handles loading state correctly', () => {
    const wrapper = mount(ExButton, {
      props: { loading: true },
      slots: { default: 'Button' },
    });

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
    expect(wrapper.classes()).toContain('ex-button--loading');
    expect(button.attributes('aria-busy')).toBe('true');
    expect(wrapper.find('.ex-button__loading-spinner').exists()).toBe(true);
  });

  it('keeps loading content layout and exposes its text as the accessible name', () => {
    const wrapper = mount(ExButton, {
      props: { loading: true },
      slots: {
        default: 'Save',
        prefix: '<span>+</span>',
        suffix: '<span>→</span>',
      },
    });

    expect(wrapper.find('.ex-button__content').exists()).toBe(true);
    expect(wrapper.find('.ex-button__icon--left').exists()).toBe(true);
    expect(wrapper.find('.ex-button__icon--right').exists()).toBe(true);
    expect(wrapper.find('.ex-button__icon--left').attributes('aria-hidden')).toBe('true');
    expect(wrapper.find('.ex-button__icon--right').attributes('aria-hidden')).toBe('true');
    expect(wrapper.attributes('aria-label')).toBe('Save');
  });

  it('renders with icon (slot + Iconify, prefix)', () => {
    const wrapper = mount(ExButton, {
      slots: {
        default: 'Search',
        prefix: '<ex-icon src="https://api.iconify.design/ri/search-line.svg"></ex-icon>',
      },
      global: {
        components: {
          'ex-icon': {
            name: 'ex-icon',
            props: ['src'],
            template: '<i class="ex-icon" :src="src"></i>',
          },
        },
      },
    });

    expect(wrapper.find('.ex-button__icon--left').exists()).toBe(true);
    expect(wrapper.find('.ex-icon').exists()).toBe(true);
  });

  it('renders icon on the right (slot + Iconify, suffix)', () => {
    const wrapper = mount(ExButton, {
      slots: {
        default: 'Next',
        suffix: '<ex-icon src="https://api.iconify.design/ri/arrow-right-line.svg"></ex-icon>',
      },
      global: {
        components: {
          'ex-icon': {
            name: 'ex-icon',
            props: ['src'],
            template: '<i class="ex-icon" :src="src"></i>',
          },
        },
      },
    });

    expect(wrapper.find('.ex-button__icon--right').exists()).toBe(true);
    expect(wrapper.find('.ex-icon').exists()).toBe(true);
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ExButton, {
      props: { onClick },
      slots: { default: 'Click me' },
    });

    await wrapper.find('button').trigger('click');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not emit click when disabled', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ExButton, {
      props: {
        disabled: true,
        onClick,
      },
      slots: { default: 'Click me' },
    });

    await wrapper.find('button').trigger('click');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not emit click when loading', async () => {
    const onClick = vi.fn();
    const wrapper = mount(ExButton, {
      props: {
        loading: true,
        onClick,
      },
      slots: { default: 'Click me' },
    });

    await wrapper.find('button').trigger('click');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders as block button', () => {
    const wrapper = mount(ExButton, {
      props: { block: true },
      slots: { default: 'Block Button' },
    });

    expect(wrapper.classes()).toContain('ex-button--block');
  });

  it('renders with custom class', () => {
    const wrapper = mount(ExButton, {
      props: { class: 'custom-class' },
      slots: { default: 'Button' },
    });

    expect(wrapper.classes()).toContain('custom-class');
  });

  it('renders with custom style', () => {
    const customStyle = { color: 'red', fontSize: '18px' };
    const wrapper = mount(ExButton, {
      props: { style: customStyle },
      slots: { default: 'Button' },
    });

    const button = wrapper.find('button');
    expect(button.element.style.color).toBe('red');
    expect(button.element.style.fontSize).toBe('18px');
  });

  it('handles focus and blur events', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const wrapper = mount(ExButton, {
      props: { onFocus, onBlur },
      slots: { default: 'Button' },
    });

    const button = wrapper.find('button');
    await button.trigger('focus');
    expect(onFocus).toHaveBeenCalledTimes(1);

    await button.trigger('blur');
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('exposes focus and blur methods', () => {
    const wrapper = mount(ExButton, {
      slots: { default: 'Button' },
    });

    const vm = wrapper.vm as unknown as ExButtonExposed;
    const button = wrapper.find('button').element;
    const focusSpy = vi.spyOn(button, 'focus');
    const blurSpy = vi.spyOn(button, 'blur');

    expect(typeof vm.focus).toBe('function');
    expect(typeof vm.blur).toBe('function');
    expect(typeof vm.getElement).toBe('function');

    vm.focus();
    expect(focusSpy).toHaveBeenCalled();
    expect(vm.getElement()).toBe(button);

    vm.blur();
    expect(blurSpy).toHaveBeenCalled();
  });

  it('renders with different shapes', () => {
    const shapes: ExButtonProps['shape'][] = [
      'default',
      'round',
      'circle',
      'slice',
      'slant',
      'bracket',
      'hex',
      'notched',
    ];

    shapes.forEach(shape => {
      const wrapper = mount(ExButton, {
        props: { shape },
        slots: { default: 'Button' },
      });
      expect(wrapper.classes()).toContain(`ex-button--${shape}`);
      expect(wrapper.classes()).toContain(`ex-button--shape-${shape}`);
    });
  });

  it('圆形文字按钮只显示首个完整字素，并用完整文本保留可访问名称', () => {
    const wrapper = mount(ExButton, {
      props: { shape: 'circle' },
      slots: { default: '👨‍👩‍👧‍👦家庭账户' },
    });

    expect(wrapper.text()).toBe('👨‍👩‍👧‍👦');
    expect(wrapper.attributes('aria-label')).toBe('👨‍👩‍👧‍👦家庭账户');
    expect(wrapper.find('.ex-button__content').exists()).toBe(true);
  });

  it('圆形按钮加载时只显示加载图标并保留可访问名称', () => {
    const wrapper = mount(ExButton, {
      props: { shape: 'circle', loading: true, ariaLabel: '正在加载用户' },
      slots: { default: '用户' },
    });

    expect(wrapper.text()).toBe('');
    expect(wrapper.find('.ex-button__content').exists()).toBe(false);
    expect(wrapper.find('.ex-button__loading-spinner').exists()).toBe(true);
    expect(wrapper.attributes('aria-label')).toBe('正在加载用户');
    expect(wrapper.attributes('aria-busy')).toBe('true');
  });

  it('按语义变体决定默认发光，并允许显式覆盖', () => {
    const glowingTypes = ['primary', 'success', 'warning', 'danger', 'error', 'info'] as const;
    const restrainedTypes = ['default', 'secondary', 'ghost', 'text', 'link'] as const;

    glowingTypes.forEach(type => {
      const wrapper = mount(ExButton, {
        props: { type },
        slots: { default: `${type} 操作` },
      });

      expect(wrapper.classes()).toContain('ex-button--glow');
    });

    restrainedTypes.forEach(type => {
      const wrapper = mount(ExButton, {
        props: { type },
        slots: { default: `${type} 操作` },
      });

      expect(wrapper.classes()).not.toContain('ex-button--glow');
    });

    const explicit = mount(ExButton, {
      props: { type: 'secondary', glow: true },
      slots: { default: '强调次要操作' },
    });
    const disabled = mount(ExButton, {
      props: { type: 'primary', glow: false },
      slots: { default: '关闭发光' },
    });

    expect(explicit.classes()).toContain('ex-button--glow');
    expect(disabled.classes()).not.toContain('ex-button--glow');
  });

  it('为发光纯文本按钮提供撕裂层所需的可见文字副本', () => {
    const glowing = mount(ExButton, {
      props: { type: 'primary' },
      slots: { default: 'AVAILABLE NOW' },
    });
    const restrained = mount(ExButton, {
      props: { type: 'default' },
      slots: { default: 'DEFAULT ACTION' },
    });

    expect(glowing.attributes('data-ex-button-glitch-text')).toBe('AVAILABLE NOW');
    expect(restrained.attributes('data-ex-button-glitch-text')).toBeUndefined();
  });

  it('renders as plain button', () => {
    const wrapper = mount(ExButton, {
      props: { plain: true },
      slots: { default: 'Plain Button' },
    });

    expect(wrapper.classes()).toContain('ex-button--plain');
  });

  it('renders with correct native type', () => {
    const wrapper = mount(ExButton, {
      props: { nativeType: 'submit' },
      slots: { default: 'Submit' },
    });

    expect(wrapper.find('button').attributes('type')).toBe('submit');
  });

  it('renders with aria-label', () => {
    const wrapper = mount(ExButton, {
      props: { ariaLabel: 'Close dialog' },
      slots: { default: 'X' },
    });

    expect(wrapper.find('button').attributes('aria-label')).toBe('Close dialog');
  });

  it('accepts the native aria-label attribute for icon-only buttons', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      const wrapper = mount(ExButton, {
        attrs: { 'aria-label': 'Search' },
        slots: { default: '<span class="icon" aria-hidden="true"></span>' },
      });

      expect(wrapper.find('button').attributes('aria-label')).toBe('Search');
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });

  it('warns about an unnamed icon-only button in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      mount(ExButton, {
        slots: { default: '<span class="icon" aria-hidden="true"></span>' },
      });

      expect(warn).toHaveBeenCalledWith(expect.stringContaining('ariaLabel'));
    } finally {
      warn.mockRestore();
    }
  });

  it('trims explicit aria-label', () => {
    const wrapper = mount(ExButton, {
      props: { ariaLabel: '  Close dialog  ' },
      slots: { default: 'Close' },
    });

    expect(wrapper.find('button').attributes('aria-label')).toBe('Close dialog');
  });
});
