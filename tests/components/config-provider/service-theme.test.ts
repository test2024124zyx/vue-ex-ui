import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import { useMessageService } from '../../../src/components/message/message';
import { useNotificationService } from '../../../src/components/notification/notification';
import { useLoadingBarService } from '../../../src/components/loading-bar/loading-bar';
import { useLoadingService } from '../../../src/components/loading/LoadingService';
import ExLoading from '../../../src/components/loading/ExLoading.vue';

describe('脱离 Provider DOM 的服务主题覆盖', () => {
  let wrapper: ReturnType<typeof mount> | undefined;
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    wrapper?.unmount();
    vi.clearAllTimers();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('四种编程式服务继承并响应 Provider 品牌变量变化', async () => {
    let openServices: (() => void) | undefined;
    const Harness = defineComponent({
      setup() {
        const message = useMessageService();
        const notification = useNotificationService();
        const loadingBar = useLoadingBarService();
        const loading = useLoadingService();
        openServices = () => {
          message.info({ content: '消息', duration: 0 });
          notification.info({ title: '通知', duration: 0 });
          loadingBar.start();
          loading.show();
        };
        return () => null;
      },
    });
    wrapper = mount(ExConfigProvider, {
      props: { themeOverrides: { '--ex-color-text-primary': '#123456' } },
      slots: { default: () => h(Harness) },
    });
    openServices!();
    await flushPromises();
    const selectors = ['.ex-message', '.ex-notification', '.ex-loading-bar', '.ex-loading'];
    for (const selector of selectors) {
      expect(
        document
          .querySelector<HTMLElement>(selector)
          ?.style.getPropertyValue('--ex-color-text-primary')
      ).toBe('#123456');
    }
    await wrapper.setProps({ themeOverrides: { '--ex-color-text-primary': '#654321' } });
    for (const selector of selectors) {
      expect(
        document
          .querySelector<HTMLElement>(selector)
          ?.style.getPropertyValue('--ex-color-text-primary')
      ).toBe('#654321');
    }
  });

  it('声明式全屏 Loading 的 Teleport 同样保留局部品牌覆盖', async () => {
    wrapper = mount(ExConfigProvider, {
      props: { themeOverrides: { '--ex-color-text-primary': '#123456' } },
      slots: { default: () => h(ExLoading, { fullscreen: true }) },
      attachTo: document.body,
    });
    await flushPromises();
    const loading = document.querySelector<HTMLElement>('.ex-loading')!;
    expect(loading.closest('.ex-config-provider')).toBeNull();
    expect(loading.style.getPropertyValue('--ex-color-text-primary')).toBe('#123456');
  });
});
