import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import { useMessageService } from '../../../src/components/message/message';
import { useNotificationService } from '../../../src/components/notification/notification';
import { useLoadingBarService } from '../../../src/components/loading-bar/loading-bar';
import { useLoadingService } from '../../../src/components/loading/LoadingService';

const wrappers: Array<{ unmount(): void }> = [];
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.clearAllTimers();
  vi.useRealTimers();
});

function createServices() {
  let services!: {
    message: ReturnType<typeof useMessageService>;
    notification: ReturnType<typeof useNotificationService>;
    loading: ReturnType<typeof useLoadingService>;
    bar: ReturnType<typeof useLoadingBarService>;
  };
  const callerVisible = ref(true);
  const Caller = defineComponent({
    setup() {
      services = {
        message: useMessageService(),
        notification: useNotificationService(),
        loading: useLoadingService(),
        bar: useLoadingBarService(),
      };
      return () => null;
    },
  });
  const wrapper = mount(ExConfigProvider, {
    props: { zIndex: 1000 },
    slots: { default: () => (callerVisible.value ? h(Caller) : null) },
  });
  wrappers.push(wrapper);
  return { services, wrapper, callerVisible };
}

const notificationFor = (title: string) =>
  Array.from(document.querySelectorAll<HTMLElement>('.ex-notification')).find(
    element => element.querySelector('.ex-notification__title')?.textContent === title
  )!;

describe('编程式服务的动态层级与显式覆盖', () => {
  it('调用组件卸载后服务仍跟随 Provider；显式通知与继承通知正确分组', async () => {
    const { services, wrapper, callerVisible } = createServices();
    services.message.info({ content: '消息', duration: 0 });
    services.notification.info({ title: '继承通知', duration: 0 });
    services.notification.info({ title: '显式通知', duration: 0, zIndex: 1080 });
    services.loading.show();
    services.bar.start();
    await flushPromises();
    const notification = notificationFor('继承通知');
    expect(notification.style.zIndex).toBe('1080');
    callerVisible.value = false;
    await nextTick();
    await wrapper.setProps({ zIndex: 5000 });
    expect(document.querySelector<HTMLElement>('.ex-message-container')!.style.zIndex).toBe('5080');
    expect(
      document
        .querySelector<HTMLElement>('.ex-loading')!
        .style.getPropertyValue('--ex-loading-z-index')
    ).toBe('5100');
    expect(
      document
        .querySelector<HTMLElement>('.ex-loading-bar')!
        .style.getPropertyValue('--ex-loading-bar-z-index')
    ).toBe('5100');
    expect(notificationFor('继承通知')).toBe(notification);
    expect(notification.style.zIndex).toBe('5080');
    expect(notification.closest<HTMLElement>('.ex-notification-container')!.style.zIndex).toBe(
      '5080'
    );
    expect(notificationFor('显式通知').style.zIndex).toBe('1080');
    expect(document.querySelectorAll('.ex-notification-container')).toHaveLength(2);
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    expect(
      document.querySelector(
        '.ex-notification-container, .ex-message-container, .ex-loading-bar-host, .ex-loading'
      )
    ).toBeNull();
  });

  it('显式配置为内建默认层级 2000 仍优先于 Provider，后续 Provider 变化不覆盖它', async () => {
    const { services, wrapper } = createServices();
    services.message.config({ zIndex: 2000 });
    services.notification.config({ zIndex: 2000 });
    services.bar.config({ zIndex: 2000 });
    services.message.info({ content: '消息', duration: 0 });
    services.notification.info({ title: '通知', duration: 0 });
    services.loading.show({ zIndex: 2000 });
    services.bar.start();
    await wrapper.setProps({ zIndex: 5000 });
    expect(document.querySelector<HTMLElement>('.ex-message-container')!.style.zIndex).toBe('2000');
    expect(notificationFor('通知').style.zIndex).toBe('2000');
    expect(
      document
        .querySelector<HTMLElement>('.ex-loading')!
        .style.getPropertyValue('--ex-loading-z-index')
    ).toBe('2000');
    expect(
      document
        .querySelector<HTMLElement>('.ex-loading-bar')!
        .style.getPropertyValue('--ex-loading-bar-z-index')
    ).toBe('2000');
  });

  it('非法配置不能将继承状态意外变成显式配置，清空后重新打开仍继承当前层级', async () => {
    const { services, wrapper } = createServices();
    expect(() => services.message.config({ zIndex: NaN })).toThrow();
    expect(() => services.notification.config({ zIndex: NaN })).toThrow();
    services.message.info({ content: '第一条', duration: 0 });
    services.notification.info({ title: '第一条', duration: 0 });
    services.message.closeAll();
    services.notification.closeAll();
    await wrapper.setProps({ zIndex: 5000 });
    services.message.info({ content: '第二条', duration: 0 });
    services.notification.info({ title: '第二条', duration: 0 });
    await nextTick();
    expect(document.querySelector<HTMLElement>('.ex-message-container')!.style.zIndex).toBe('5080');
    expect(notificationFor('第二条').style.zIndex).toBe('5080');
  });
});
