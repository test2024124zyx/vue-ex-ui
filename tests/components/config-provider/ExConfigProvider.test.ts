import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import type { Component } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import {
  useConfig,
  useConfigTheme,
  useGlobalSize,
} from '../../../src/components/config-provider/composables';
import { getCurrentLocale, setLocale, useLocale as useComponentLocale } from '../../../src/locale';

describe('ExConfigProvider', () => {
  beforeEach(() => {
    // 配置提供者只作用于自身子树，保留一个可检测的宿主全局状态。
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.setProperty('--ex-motion-duration-base', '125ms');
    setLocale('en-US');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('--ex-motion-duration-base');
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
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('applies size class', () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        size: 'large',
      },
    });

    expect(wrapper.classes()).toContain('ex-size-large');
  });

  it('uses the stable ex namespace that matches every component stylesheet', () => {
    const wrapper = mount(ExConfigProvider);

    expect(wrapper.attributes('data-namespace')).toBeUndefined();
    expect(wrapper.classes()).toContain('ex-config-provider');
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
        default: ChildComponent as Component,
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
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('does not leak animation or theme configuration to the document root', () => {
    const first = mount(ExConfigProvider, {
      props: { theme: 'light', animation: false },
    });
    const second = mount(ExConfigProvider, {
      props: { theme: 'neon-pink', animation: true },
    });

    expect(first.attributes('data-theme')).toBe('light');
    expect(second.attributes('data-theme')).toBe('neon-pink');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.getPropertyValue('--ex-motion-duration-base')).toBe(
      '125ms'
    );

    first.unmount();
    second.unmount();
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('isolates locale for sibling provider trees without changing the global locale', () => {
    const LocalizedChild = {
      setup() {
        const { t } = useComponentLocale('pagination');
        return () => h('span', t('pagination'));
      },
    };
    const english = mount(ExConfigProvider, {
      props: { locale: 'en-US' },
      slots: { default: LocalizedChild },
    });
    const chinese = mount(ExConfigProvider, {
      props: { locale: 'zh-CN' },
      slots: { default: LocalizedChild },
    });

    expect(english.text()).toBe('Pagination');
    expect(chinese.text()).toBe('分页');
    expect(getCurrentLocale()).toBe('en-US');
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
  it('useConfigTheme returns theme', () => {
    let theme: ReturnType<typeof useConfigTheme> | null = null;

    const TestComponent = {
      name: 'TestComponent',
      setup() {
        theme = useConfigTheme();
        return () => null;
      },
    };

    mount(ExConfigProvider, {
      props: {
        theme: 'dark',
      },
      slots: {
        default: TestComponent as Component,
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
        default: TestComponent as Component,
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

    mount(TestComponent as Component);

    expect(config).not.toBeNull();
    expect(config!.theme.value).toBe('neon-blue');
    expect(config!.size.value).toBe('medium');
  });
});
