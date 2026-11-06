import { flushPromises, mount } from '@vue/test-utils';
import { createApp, defineComponent, h, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import { ExNotification } from '../../../src/components/notification';
import {
  createNotificationService,
  notification,
  useNotificationService,
} from '../../../src/components/notification/notification';
import type {
  NotificationGlobalConfig,
  NotificationService,
} from '../../../src/components/notification/types';

const defaultConfig: NotificationGlobalConfig = {
  duration: 4500,
  offset: 16,
  zIndex: 2000,
  maxCount: 10,
  showIcon: true,
  closable: true,
  position: 'top-right',
};

const flush = async (): Promise<void> => {
  await nextTick();
  await flushPromises();
};

describe('Notification 服务', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    notification.closeAll();
    notification.config(defaultConfig);
  });

  afterEach(() => {
    notification.closeAll();
    notification.config(defaultConfig);
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('真实渲染 VNode 内容而不是字符串化对象', async () => {
    notification.info({
      title: 'VNode 通知',
      content: h('strong', { class: 'notification-vnode' }, '结构化内容'),
      duration: 0,
    });
    await flush();

    expect(document.querySelector('.notification-vnode')?.textContent).toBe('结构化内容');
    expect(document.body.textContent).not.toContain('[object Object]');
  });

  it('点击、关闭和销毁路径中的业务回调各只执行一次', async () => {
    const onClick = vi.fn();
    const onClose = vi.fn();
    const instance = notification.info({
      title: '生命周期',
      duration: 0,
      onClick,
      onClose,
    });
    await flush();

    document.querySelector<HTMLElement>('.ex-notification')?.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(instance.close()).toBe(true);
    expect(instance.close()).toBe(false);
    expect(onClose).toHaveBeenCalledTimes(1);

    notification.closeAll();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('实例 offset、position 和 zIndex 真实决定各自容器', async () => {
    notification.info({ title: '近端', duration: 0, offset: 12, zIndex: 2100 });
    notification.info({ title: '远端', duration: 0, offset: 48, zIndex: 2200 });
    await flush();

    const containers = Array.from(
      document.querySelectorAll<HTMLElement>('.ex-notification-container--top-right')
    );
    expect(containers).toHaveLength(2);
    expect(containers.map(container => container.style.top).sort()).toEqual(['12px', '48px']);
    expect(containers.map(container => container.style.zIndex).sort()).toEqual(['2100', '2200']);
  });

  it('拒绝重复自定义 ID，并保证按 ID 关闭的是准确记录', async () => {
    const first = notification.info({ id: 'stable-id', title: '唯一记录', duration: 0 });
    expect(() => notification.info({ id: 'stable-id', title: '重复记录', duration: 0 })).toThrow(
      /重复/
    );
    await flush();

    expect(notification.close(first.id)).toBe(true);
    expect(notification.close(first.id)).toBe(false);
  });

  it('maxCount 淘汰与 closeAll 都清理资源并调用一次 onClose', async () => {
    const firstClose = vi.fn();
    const secondClose = vi.fn();
    notification.config({ maxCount: 1 });
    notification.info({ title: '第一条', duration: 0, onClose: firstClose });
    notification.info({ title: '第二条', duration: 0, onClose: secondClose });
    await flush();

    expect(firstClose).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll('.ex-notification')).toHaveLength(1);
    notification.closeAll();
    expect(secondClose).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.ex-notification-container')).toBeNull();
  });

  it('外部移除分组容器后创建新通知会清理旧记录并只回调一次', async () => {
    const service = createNotificationService();
    const firstClose = vi.fn();
    const secondClose = vi.fn();
    const first = service.info({ title: '旧通知', duration: 0, onClose: firstClose });
    await flush();

    document.querySelector('.ex-notification-container')?.remove();
    service.info({ title: '新通知', duration: 0, onClose: secondClose });
    await flush();

    expect(firstClose).toHaveBeenCalledOnce();
    expect(first.close()).toBe(false);
    expect(document.querySelectorAll('.ex-notification')).toHaveLength(1);
    expect(document.body.textContent).toContain('新通知');

    service.closeAll();
    expect(firstClose).toHaveBeenCalledOnce();
    expect(secondClose).toHaveBeenCalledOnce();
  });

  it('对公开配置和运行时选项执行原子校验', () => {
    notification.config({ offset: 24, maxCount: 3 });

    expect(() => notification.config({ maxCount: 0 })).toThrow(RangeError);
    expect(() => notification.config({ offset: Number.NaN })).toThrow(TypeError);
    expect(() => notification.config({ position: 'center' as never })).toThrow(TypeError);
    expect(() => notification.info({ title: '错误', duration: -1 })).toThrow(RangeError);
    expect(() => notification.info({ title: '错误', offset: -1 })).toThrow(RangeError);
    expect(() => notification.info({ title: '错误', onClose: 'close' as never })).toThrow(
      TypeError
    );
    expect(() =>
      notification.info({
        title: '错误',
        content: h('span'),
        dangerouslyUseHTMLString: true,
      })
    ).toThrow(TypeError);
  });

  it('无 DOM 环境抛出明确错误且不创建伪实例', () => {
    vi.stubGlobal('document', undefined);
    try {
      expect(() => notification.info({ title: 'SSR' })).toThrow(/浏览器环境/);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('组件插件为每个 Vue App 注册独立服务', () => {
    const firstApp = createApp(defineComponent(() => () => h('div')));
    const secondApp = createApp(defineComponent(() => () => h('div')));
    const firstUnmount = vi.spyOn(firstApp, 'onUnmount');
    const secondUnmount = vi.spyOn(secondApp, 'onUnmount');
    firstApp.use(ExNotification);
    secondApp.use(ExNotification);

    expect(firstApp.config.globalProperties.$notification).not.toBe(notification);
    expect(secondApp.config.globalProperties.$notification).not.toBe(notification);
    expect(secondApp.config.globalProperties.$notification).not.toBe(
      firstApp.config.globalProperties.$notification
    );
    expect(firstUnmount).toHaveBeenCalledOnce();
    expect(secondUnmount).toHaveBeenCalledOnce();
  });

  it('ConfigProvider 作用域服务继承配置并随 Provider 销毁', async () => {
    let scopedService: NotificationService | undefined;
    const Harness = defineComponent({
      setup() {
        scopedService = useNotificationService();
        return () => null;
      },
    });
    const wrapper = mount(ExConfigProvider, {
      props: { theme: 'light', locale: 'zh-CN', zIndex: 3000 },
      slots: { default: () => h(Harness) },
    });

    expect(scopedService).toBeDefined();
    expect(scopedService).not.toBe(notification);
    scopedService!.info({ title: '作用域通知', duration: 0 });
    await flush();

    expect(document.querySelector<HTMLElement>('.ex-notification')?.dataset.theme).toBe('light');
    expect(document.querySelector('.ex-notification__close')?.getAttribute('aria-label')).toBe(
      '关闭'
    );
    expect(document.querySelector<HTMLElement>('.ex-notification-container')?.style.zIndex).toBe(
      '3080'
    );

    wrapper.unmount();
    expect(document.querySelector('.ex-notification-container')).toBeNull();
  });

  it('工厂服务拥有互不影响的队列与配置', async () => {
    const first = createNotificationService();
    const second = createNotificationService();
    first.config({ maxCount: 1 });
    first.info({ title: '第一应用', duration: 0 });
    second.info({ title: '第二应用-A', duration: 0 });
    second.info({ title: '第二应用-B', duration: 0 });
    await flush();

    expect(document.querySelectorAll('.ex-notification')).toHaveLength(3);
    first.closeAll();
    expect(document.querySelectorAll('.ex-notification')).toHaveLength(2);
    second.closeAll();
  });
});
