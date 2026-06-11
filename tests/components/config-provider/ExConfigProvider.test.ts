import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import { useConfig, useTheme, useGlobalSize } from '../../../src/components/config-provider/composables';

describe('ExConfigProvider', () => {
  beforeEach(() => {
    // 清理 DOM
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders correctly', () => {
    const wrapper = mount(ExConfigProvider, {
      slots: {
        default: '<div class="test-content">Test Content</div>',
      },
    });

    expect(wrapper.find('.ex-config-provider').exists()).toBe(true);
    expect(wrapper.find('.test-content').exists()).toBe(true);
  });

  it('applies default theme', () => {
    const wrapper = mount(ExConfigProvider);

    expect(wrapper.attributes('data-theme')).toBe('neon-blue');
    expect(wrapper.classes()).toContain('ex-theme-neon-blue');
  });

  it('applies custom theme', async () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        theme: 'neon-pink',
      },
    });

    await nextTick();

    expect(wrapper.attributes('data-theme')).toBe('neon-pink');
    expect(wrapper.classes()).toContain('ex-theme-neon-pink');
    expect(document.documentElement.getAttribute('data-theme')).toBe('neon-pink');
  });

  it('applies size class', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        size: 'large',
      },
    });

    expect(wrapper.classes()).toContain('ex-size-large');
  });

  it('applies namespace', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        namespace: 'custom',
      },
    });

    expect(wrapper.attributes('data-namespace')).toBe('custom');
    expect(wrapper.classes()).toContain('custom-config-provider');
  });

  it('disables neon effect', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        neonEffect: false,
      },
    });

    expect(wrapper.classes()).toContain('ex-no-neon');
  });

  it('disables animation', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        animation: false,
      },
    });

    expect(wrapper.classes()).toContain('ex-no-animation');
  });

  it('applies custom z-index', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        zIndex: 2000,
      },
    });

    const style = wrapper.attributes('style');
    expect(style).toContain('--ex-z-index-base: 2000');
  });

  it('provides config context to children', () => {
    let capturedConfig: ReturnType<typeof useConfig> | null = null;

    const ChildComponent = {
      name: 'ChildComponent',
      setup() {
        capturedConfig = useConfig();
        return () => null;
      },
    };

    mount(ExConfigProvider, {
      props: {
        theme: 'dark',
        size: 'small',
      },
      slots: {
        default: ChildComponent as any,
      },
    });

    expect(capturedConfig).not.toBeNull();
    expect(capturedConfig!.theme.value).toBe('dark');
    expect(capturedConfig!.size.value).toBe('small');
  });

  it('updates theme reactively', async () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        theme: 'neon-blue',
      },
    });

    expect(wrapper.attributes('data-theme')).toBe('neon-blue');

    await wrapper.setProps({ theme: 'neon-pink' });

    expect(wrapper.attributes('data-theme')).toBe('neon-pink');
    expect(document.documentElement.getAttribute('data-theme')).toBe('neon-pink');
  });

  it('applies custom class', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        class: 'custom-class',
      },
    });

    expect(wrapper.classes()).toContain('custom-class');
  });

  it('applies custom style', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        style: { color: 'red' },
      },
    });

    expect(wrapper.attributes('style')).toContain('color: red');
  });
});

describe('Config Composables', () => {
  it('useTheme returns theme', () => {
    let theme: ReturnType<typeof useTheme> | null = null;

    const TestComponent = {
      name: 'TestComponent',
      setup() {
        theme = useTheme();
        return () => null;
      },
    };

    mount(ExConfigProvider, {
      props: {
        theme: 'dark',
      },
      slots: {
        default: TestComponent as any,
      },
    });

    expect(theme).not.toBeNull();
    expect(theme!.value).toBe('dark');
  });

  it('useGlobalSize returns size', () => {
    let size: ReturnType<typeof useGlobalSize> | null = null;

    const TestComponent = {
      name: 'TestComponent',
      setup() {
        size = useGlobalSize();
        return () => null;
      },
    };

    mount(ExConfigProvider, {
      props: {
        size: 'large',
      },
      slots: {
        default: TestComponent as any,
      },
    });

    expect(size).not.toBeNull();
    expect(size!.value).toBe('large');
  });

  it('returns default config when no provider', () => {
    let config: ReturnType<typeof useConfig> | null = null;

    const TestComponent = {
      name: 'TestComponent',
      setup() {
        config = useConfig();
        return () => null;
      },
    };

    mount(TestComponent as any);

    expect(config).not.toBeNull();
    expect(config!.theme.value).toBe('neon-blue');
    expect(config!.size.value).toBe('medium');
  });
});
