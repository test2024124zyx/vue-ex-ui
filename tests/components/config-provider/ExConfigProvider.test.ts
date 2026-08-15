import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import type { Component } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExLoading from '../../../src/components/loading/ExLoading.vue';
import ExNotification from '../../../src/components/notification/ExNotification.vue';
import ExPageHeader from '../../../src/components/page-header/ExPageHeader.vue';
import ExModal from '../../../src/components/modal/ExModal.vue';
import {
  useConfig,
  useConfigTheme,
  useGlobalSize,
  useZIndexLayer,
} from '../../../src/components/config-provider/composables';
import { getCurrentLocale, setLocale, useLocale as useComponentLocale } from '../../../src/locale';

describe('ExConfigProvider', () => {
  beforeEach(() => {
    // 配置提供者只作用于自身子树，保留一个可检测的宿主全局状态。
    document.documentElement.setAttribute('data-theme', 'neon-blue');
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

  it('默认包装器不创建占满父容器的布局盒', () => {
    const wrapper = mount(ExConfigProvider);

    expect(wrapper.get('.ex-config-provider').attributes('style')).toContain('display: contents');
    expect(wrapper.get('.ex-config-provider').attributes('style')).not.toContain('width: 100%');
    expect(wrapper.get('.ex-config-provider').attributes('style')).not.toContain('height: 100%');
  });

  it('applies default theme', () => {
    const wrapper = mount(ExConfigProvider);

    expect(wrapper.attributes('data-theme')).toBe('neon-blue');
    expect(wrapper.classes()).toContain('ex-theme-neon-blue');
  });

  it('applies custom theme', async () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        theme: 'light',
      },
    });

    await nextTick();

    expect(wrapper.attributes('data-theme')).toBe('light');
    expect(wrapper.classes()).toContain('ex-theme-light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('neon-blue');
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
    expect(style).toContain('--ex-z-dropdown: 2000');
    expect(style).toContain('--ex-z-sticky: 2020');
    expect(style).toContain('--ex-z-banner: 2030');
    expect(style).toContain('--ex-z-overlay: 2040');
    expect(style).toContain('--ex-z-modal: 2050');
    expect(style).toContain('--ex-z-popover: 2060');
    expect(style).toContain('--ex-z-toast: 2080');
    expect(style).toContain('--ex-z-tooltip: 2090');
    expect(style).toContain('--ex-z-loading: 2100');
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
        theme: 'neon-blue',
        size: 'small',
      },
      slots: {
        default: () => h(ChildComponent),
      },
    });

    expect(capturedConfig).not.toBeNull();
    expect(capturedConfig!.theme.value).toBe('neon-blue');
    expect(capturedConfig!.size.value).toBe('small');
  });

  it('嵌套 Provider 只覆盖显式属性并响应式继承外层配置', async () => {
    let innerConfig: ReturnType<typeof useConfig> | null = null;
    const Probe = {
      setup() {
        innerConfig = useConfig();
        return () => null;
      },
    };
    const wrapper = mount(ExConfigProvider, {
      props: {
        theme: 'light',
        locale: 'zh-CN',
        size: 'large',
        neonEffect: false,
        animation: false,
        zIndex: 2600,
      },
      slots: {
        default: () =>
          h(ExConfigProvider, { locale: 'en-US', size: 'small' }, { default: () => h(Probe) }),
      },
    });

    expect(innerConfig).not.toBeNull();
    expect(innerConfig!.theme.value).toBe('light');
    expect(innerConfig!.locale.value).toBe('en-US');
    expect(innerConfig!.size.value).toBe('small');
    expect(innerConfig!.neonEffect.value).toBe(false);
    expect(innerConfig!.animation.value).toBe(false);
    expect(innerConfig!.zIndex.value).toBe(2600);

    await wrapper.setProps({ theme: 'neon-blue', zIndex: 2700 });
    expect(innerConfig!.theme.value).toBe('neon-blue');
    expect(innerConfig!.zIndex.value).toBe(2700);
  });

  it('嵌套 Provider 保留显式 false 与零层级', () => {
    let innerConfig: ReturnType<typeof useConfig> | null = null;
    const Probe = {
      setup() {
        innerConfig = useConfig();
        return () => null;
      },
    };

    mount(ExConfigProvider, {
      props: { neonEffect: true, animation: true, zIndex: 2600 },
      slots: {
        default: () =>
          h(
            ExConfigProvider,
            { neonEffect: false, animation: false, zIndex: 0 },
            { default: () => h(Probe) }
          ),
      },
    });

    expect(innerConfig).not.toBeNull();
    expect(innerConfig!.neonEffect.value).toBe(false);
    expect(innerConfig!.animation.value).toBe(false);
    expect(innerConfig!.zIndex.value).toBe(0);
  });

  it('层级值统一取整，非法值回退最近 Provider 或根默认值', async () => {
    let nestedConfig: ReturnType<typeof useConfig> | null = null;
    let rootConfig: ReturnType<typeof useConfig> | null = null;
    const NestedProbe = {
      setup() {
        nestedConfig = useConfig();
        return () => null;
      },
    };
    const RootProbe = {
      setup() {
        rootConfig = useConfig();
        return () => null;
      },
    };

    mount(ExConfigProvider, {
      props: { zIndex: 3100 },
      slots: {
        default: () =>
          h(ExConfigProvider, { zIndex: Number.NaN }, { default: () => h(NestedProbe) }),
      },
    });
    const root = mount(ExConfigProvider, {
      props: { zIndex: Number.POSITIVE_INFINITY },
      slots: { default: () => h(RootProbe) },
    });

    expect(nestedConfig).not.toBeNull();
    expect(rootConfig).not.toBeNull();
    expect(nestedConfig!.zIndex.value).toBe(3100);
    expect(rootConfig!.zIndex.value).toBe(1000);
    expect(root.attributes('style')).not.toMatch(/NaN|Infinity/u);

    await root.setProps({ zIndex: 2100.9 });
    expect(rootConfig!.zIndex.value).toBe(2100);
    expect(root.attributes('style')).toContain('--ex-z-loading: 2200');

    await root.setProps({ zIndex: -1 });
    expect(rootConfig!.zIndex.value).toBe(1000);
  });

  it('updates theme reactively', async () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        theme: 'neon-blue',
      },
    });

    expect(wrapper.attributes('data-theme')).toBe('neon-blue');

    await wrapper.setProps({ theme: 'light' });

    expect(wrapper.attributes('data-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('neon-blue');
  });

  it('keeps the provider theme on body-teleported overlays', async () => {
    const wrapper = mount(ExConfigProvider, {
      props: {
        theme: 'light',
      },
      slots: {
        default: () => h(ExModal, { modelValue: true, title: '主题浮层' }),
      },
    });

    await nextTick();

    expect(document.body.querySelector('.ex-modal-root')?.getAttribute('data-theme')).toBe('light');

    await wrapper.setProps({ theme: 'neon-blue' });
    await nextTick();
    expect(document.body.querySelector('.ex-modal-root')?.getAttribute('data-theme')).toBe(
      'neon-blue'
    );

    wrapper.unmount();
  });

  it('does not leak animation or theme configuration to the document root', () => {
    const first = mount(ExConfigProvider, {
      props: { theme: 'light', animation: false },
    });
    const second = mount(ExConfigProvider, {
      props: { theme: 'light', animation: true },
    });

    expect(first.attributes('data-theme')).toBe('light');
    expect(second.attributes('data-theme')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('neon-blue');
    expect(document.documentElement.style.getPropertyValue('--ex-motion-duration-base')).toBe(
      '125ms'
    );

    first.unmount();
    second.unmount();
    expect(document.documentElement.dataset.theme).toBe('neon-blue');
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
      slots: { default: () => h(LocalizedChild) },
    });
    const chinese = mount(ExConfigProvider, {
      props: { locale: 'zh-CN' },
      slots: { default: () => h(LocalizedChild) },
    });

    expect(english.text()).toBe('Pagination');
    expect(chinese.text()).toBe('分页');
    expect(getCurrentLocale()).toBe('en-US');
  });

  it('component locale exposes the nearest reactive locale code for Intl formatters', async () => {
    let capturedLocale: ReturnType<typeof useComponentLocale>['locale'] | null = null;
    const LocalizedChild = {
      setup() {
        const componentLocale = useComponentLocale('fileList');
        capturedLocale = componentLocale.locale;
        return () => h('span', componentLocale.locale.value);
      },
    };
    const wrapper = mount(ExConfigProvider, {
      props: { locale: 'en-US' },
      slots: { default: () => h(LocalizedChild) },
    });

    expect(capturedLocale).not.toBeNull();
    expect(capturedLocale!.value).toBe('en-US');
    expect(wrapper.text()).toBe('en-US');

    await wrapper.setProps({ locale: 'zh-CN' });
    expect(capturedLocale!.value).toBe('zh-CN');
    expect(wrapper.text()).toBe('zh-CN');
  });

  it('真实组件读取最近 ConfigProvider 的本地化无障碍文本', async () => {
    const wrapper = mount(ExConfigProvider, {
      props: { locale: 'zh-CN' },
      slots: {
        default: () => [
          h(ExLoading, { visible: true, closable: true }),
          h(ExNotification, { title: '通知', duration: 0 }),
          h(ExPageHeader, { title: '页面', showBack: true }),
        ],
      },
    });

    await nextTick();

    expect(wrapper.get('.ex-loading').attributes('aria-label')).toBe('加载中...');
    expect(wrapper.get('.ex-notification__close').attributes('aria-label')).toBe('关闭');
    expect(wrapper.get('.ex-page-header__back').attributes('aria-label')).toBe('返回');
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
        theme: 'neon-blue',
      },
      slots: {
        default: () => h(TestComponent),
      },
    });

    expect(theme).not.toBeNull();
    expect(theme!.value).toBe('neon-blue');
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
        default: () => h(TestComponent),
      },
    });

    expect(size).not.toBeNull();
    expect(size!.value).toBe('large');
  });

  it('useZIndexLayer 使用最近 Provider 的规范基值并保持响应式', async () => {
    let tooltipZIndex: ReturnType<typeof useZIndexLayer> | null = null;
    const TestComponent = {
      setup() {
        tooltipZIndex = useZIndexLayer('tooltip');
        return () => null;
      },
    };
    const wrapper = mount(ExConfigProvider, {
      props: { zIndex: 2400.9 },
      slots: { default: () => h(TestComponent) },
    });

    expect(tooltipZIndex).not.toBeNull();
    expect(tooltipZIndex!.value).toBe(2490);

    await wrapper.setProps({ zIndex: 3200 });
    expect(tooltipZIndex!.value).toBe(3290);
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
