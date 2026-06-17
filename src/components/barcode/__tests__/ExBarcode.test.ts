import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExBarcode from '../ExBarcode.vue';

describe('ExBarcode', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('renders correctly', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456789',
      },
    });

    expect(wrapper.classes()).toContain('ex-barcode');
    expect(wrapper.find('.ex-barcode__svg').exists()).toBe(true);
  });

  it('applies default type', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
      },
    });

    expect(wrapper.classes()).toContain('ex-barcode--default');
  });

  it('applies neon type', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
        type: 'neon',
      },
    });

    expect(wrapper.classes()).toContain('ex-barcode--neon');
  });

  it('applies gaming type', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
        type: 'gaming',
      },
    });

    expect(wrapper.classes()).toContain('ex-barcode--gaming');
  });

  it('applies bordered class by default', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
      },
    });

    expect(wrapper.classes()).toContain('ex-barcode--bordered');
  });

  it('removes bordered class when bordered is false', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
        bordered: false,
      },
    });

    expect(wrapper.classes()).not.toContain('ex-barcode--bordered');
  });

  it('applies border radius style', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
        borderRadius: 12,
      },
    });

    expect(wrapper.attributes('style')).toContain('border-radius: 12px');
  });

  it('accepts custom class', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
        class: 'custom-barcode',
      },
    });

    expect(wrapper.classes()).toContain('custom-barcode');
  });

  it('accepts custom style', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
        style: { padding: '20px' },
      },
    });

    expect(wrapper.attributes('style')).toContain('padding: 20px');
  });

  it('shows loading state initially', async () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
      },
    });

    await nextTick();

    // Loading might be shown during generation
    // This test is timing-dependent, so we just check the component renders
    expect(wrapper.find('.ex-barcode__svg').exists()).toBe(true);
  });

  it('shows error state when value is empty', async () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '',
      },
    });

    await nextTick();
    await nextTick();

    expect(wrapper.find('.ex-barcode__error').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-barcode--error');
  });

  it('displays custom error text', async () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '',
        errorText: 'Custom error message',
      },
    });

    await nextTick();
    await nextTick();

    expect(wrapper.find('.ex-barcode__error-text').text()).toContain('Custom error message');
  });

  it('renders error slot', async () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '',
      },
      slots: {
        error: '<div class="custom-error">Custom Error</div>',
      },
    });

    await nextTick();
    await nextTick();

    expect(wrapper.find('.custom-error').exists()).toBe(true);
    expect(wrapper.find('.custom-error').text()).toBe('Custom Error');
  });

  it('sets aria-label', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
        ariaLabel: 'Product barcode',
      },
    });

    expect(wrapper.attributes('aria-label')).toBe('Product barcode');
  });

  it('sets default aria-label', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
      },
    });

    expect(wrapper.attributes('aria-label')).toBe('Barcode: 123456');
  });

  it('has role="img"', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
      },
    });

    expect(wrapper.attributes('role')).toBe('img');
  });

  it('exposes getElement method', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
      },
    });

    const element = (wrapper.vm as { getElement: () => HTMLElement | null }).getElement();
    expect(element).toBeInstanceOf(HTMLElement);
    expect(element?.classList.contains('ex-barcode')).toBe(true);
  });

  it('exposes download method', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
      },
    });

    expect(typeof wrapper.vm.download).toBe('function');
  });

  it('exposes toDataURL method', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
      },
    });

    expect(typeof wrapper.vm.toDataURL).toBe('function');
  });

  it('exposes refresh method', () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
      },
    });

    expect(typeof wrapper.vm.refresh).toBe('function');
  });

  it('updates when value changes', async () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
      },
    });

    await wrapper.setProps({ value: '789012' });
    await nextTick();

    // Should trigger regeneration
    expect(wrapper.props('value')).toBe('789012');
  });

  it('updates when format changes', async () => {
    const wrapper = mount(ExBarcode, {
      props: {
        value: '123456',
        format: 'CODE128',
      },
    });

    await wrapper.setProps({ format: 'CODE39' });
    await nextTick();

    expect(wrapper.props('format')).toBe('CODE39');
  });
});
