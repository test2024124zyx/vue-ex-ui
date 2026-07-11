import { mount } from '@vue/test-utils';
import { createApp, defineComponent, nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import LoadingPlugin, {
  createLoadingService,
  destroyLoading,
  hideLoading,
  loadingService,
  showLoading,
  useLoadingService,
} from '../../../src/components/loading/LoadingService';
import type { LoadingService } from '../../../src/components/loading/types';

const localServices: LoadingService[] = [];

const flush = async (): Promise<void> => {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 0));
  await nextTick();
};

const waitFor = async (predicate: () => boolean, timeout = 1500): Promise<void> => {
  const startedAt = Date.now();
  while (!predicate() && Date.now() - startedAt < timeout) {
    await new Promise(resolve => setTimeout(resolve, 10));
    await nextTick();
  }
};

const createLocalService = (): LoadingService => {
  const service = createLoadingService();
  localServices.push(service);
  return service;
};

describe('LoadingService', () => {
  afterEach(() => {
    loadingService.destroyAll();
    localServices.splice(0).forEach(service => service.destroyAll());
    destroyLoading();
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('show 创建真实全屏实例，所有声明方法均可调用', async () => {
    const instance = loadingService.show({ text: '加载账户' });
    await flush();

    expect(instance).toEqual(
      expect.objectContaining({
        show: expect.any(Function),
        hide: expect.any(Function),
        close: expect.any(Function),
        destroy: expect.any(Function),
        updateConfig: expect.any(Function),
      })
    );
    expect(document.body.querySelector('.ex-loading--fullscreen')).not.toBeNull();
    expect(document.body.textContent).toContain('加载账户');
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('hide 隐藏但保留实例，show 可再次显示', async () => {
    const service = createLocalService();
    const instance = service.show();
    await flush();

    instance.hide();
    await waitFor(() => document.querySelector('.ex-loading') === null);
    expect(service.getInstanceCount()).toBe(1);
    expect(document.body.style.overflow).toBe('');

    instance.show();
    await flush();
    expect(document.querySelector('.ex-loading')).not.toBeNull();
    expect(document.body.style.overflow).toBe('hidden');
  });

  it.each<'close' | 'destroy'>(['close', 'destroy'])('%s 幂等卸载并移除实例', async method => {
    const service = createLocalService();
    const instance = service.show();
    await flush();

    instance[method]();
    instance[method]();

    expect(service.getInstanceCount()).toBe(0);
    expect(document.querySelector('.ex-loading')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });

  it('目标容器实例渲染在容器内，关闭后恢复容器定位', async () => {
    const host = document.createElement('section');
    document.body.append(host);
    const service = createLocalService();
    const instance = service.show({ target: host, text: '局部加载' });
    await flush();

    expect(host.querySelector('.ex-loading')).not.toBeNull();
    expect(host.style.position).toBe('relative');
    expect(document.body.style.overflow).toBe('');

    instance.close();
    expect(host.querySelector('.ex-loading')).toBeNull();
    expect(host.style.position).toBe('');
  });

  it('updateConfig 可更新视觉配置并迁移目标，非法更新保持原实例不变', async () => {
    const firstHost = document.createElement('section');
    const secondHost = document.createElement('section');
    firstHost.id = 'loading-first';
    secondHost.id = 'loading-second';
    document.body.append(firstHost, secondHost);
    const service = createLocalService();
    const instance = service.show({ target: firstHost, text: '第一阶段' });
    await flush();

    instance.updateConfig({ target: '#loading-second', type: 'dots', text: '第二阶段' });
    await flush();
    expect(firstHost.querySelector('.ex-loading')).toBeNull();
    expect(firstHost.style.position).toBe('');
    expect(secondHost.querySelector('.ex-loading__dots')).not.toBeNull();
    expect(secondHost.textContent).toContain('第二阶段');

    expect(() => instance.updateConfig({ target: '#missing-loading-target' })).toThrow(/target/i);
    expect(secondHost.querySelector('.ex-loading')).not.toBeNull();
    expect(secondHost.textContent).toContain('第二阶段');
  });

  it('没有 target 的非全屏服务配置会显式报错且不污染实例集合', () => {
    const service = createLocalService();

    expect(() => service.show({ fullscreen: false })).toThrow(/target/i);
    expect(() => service.show({ target: '#missing-loading-target' })).toThrow(/target/i);
    expect(service.getInstanceCount()).toBe(0);
  });

  it('createLoadingService 创建相互隔离的实例集合和默认配置', async () => {
    const first = createLoadingService({ type: 'dots' });
    const second = createLoadingService({ type: 'bars' });
    localServices.push(first, second);

    first.show({ text: 'A' });
    await flush();
    expect(first.getInstanceCount()).toBe(1);
    expect(second.getInstanceCount()).toBe(0);
    expect(document.querySelector('.ex-loading__dots')).not.toBeNull();

    second.show({ text: 'B' });
    await flush();
    expect(second.getInstanceCount()).toBe(1);
    expect(document.querySelectorAll('.ex-loading')).toHaveLength(2);
    expect(document.querySelector('.ex-loading__bars')).not.toBeNull();
  });

  it('hideAll 与 destroyAll 对所有实例执行一致生命周期', async () => {
    const service = createLocalService();
    service.show({ text: 'A' });
    service.show({ text: 'B' });
    await flush();
    expect(service.getInstanceCount()).toBe(2);

    service.hideAll();
    await waitFor(() => document.querySelectorAll('.ex-loading').length === 0);
    expect(service.getInstanceCount()).toBe(2);

    service.destroyAll();
    expect(service.getInstanceCount()).toBe(0);
    expect(document.querySelector('.ex-loading')).toBeNull();
  });

  it('多个全屏服务实例关闭一部分时不会提前解除滚动锁', async () => {
    const service = createLocalService();
    const first = service.show();
    const second = service.show();
    await flush();
    expect(document.body.style.overflow).toBe('hidden');

    first.close();
    expect(document.body.style.overflow).toBe('hidden');
    second.close();
    expect(document.body.style.overflow).toBe('');
  });

  it('showLoading 真正复用单例并同步最新配置', async () => {
    const first = showLoading({ text: '第一步', type: 'spinner' });
    await flush();
    const second = showLoading({ text: '第二步', type: 'bars' });
    await flush();

    expect(second).toBe(first);
    expect(document.querySelectorAll('.ex-loading')).toHaveLength(1);
    expect(document.body.textContent).toContain('第二步');
    expect(document.querySelector('.ex-loading__bars')).not.toBeNull();

    hideLoading();
    await waitFor(() => document.querySelector('.ex-loading') === null);
    expect(document.body.style.overflow).toBe('');
  });

  it('单例被调用方关闭后，下次 showLoading 创建新实例', async () => {
    const first = showLoading();
    first.close();
    const second = showLoading();
    await flush();

    expect(second).not.toBe(first);
    expect(document.querySelectorAll('.ex-loading')).toHaveLength(1);
  });

  it('单例通过可关闭遮罩销毁后不会留下失效引用', async () => {
    const first = showLoading({ maskClosable: true });
    await flush();
    document
      .querySelector<HTMLElement>('.ex-loading__mask')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flush();

    const second = showLoading({ text: '重新显示' });
    await flush();
    expect(second).not.toBe(first);
    expect(document.querySelectorAll('.ex-loading')).toHaveLength(1);
    expect(document.body.textContent).toContain('重新显示');
  });

  it('销毁后的实例不会被 show 或 updateConfig 复活', async () => {
    const service = createLocalService();
    const instance = service.show();
    instance.close();

    instance.updateConfig({ text: '不应出现' });
    instance.show();
    await flush();

    expect(service.getInstanceCount()).toBe(0);
    expect(document.body.textContent).not.toContain('不应出现');
    expect(document.querySelector('.ex-loading')).toBeNull();
  });

  it('插件只暴露可兑现的 $loading 服务', () => {
    const app = createApp(defineComponent(() => () => null));
    app.use(LoadingPlugin, { enableDirective: false, defaults: { type: 'neon' } });

    expect(app.config.globalProperties.$loading).toEqual(
      expect.objectContaining({
        show: expect.any(Function),
        hideAll: expect.any(Function),
        destroyAll: expect.any(Function),
      })
    );
    expect(app.config.globalProperties.$showLoading).toBeUndefined();
    expect(app.config.globalProperties.$hideLoading).toBeUndefined();
  });

  it('useLoadingService 优先返回当前应用服务，未安装时回退默认服务', () => {
    let injectedService: LoadingService | undefined;
    const Harness = defineComponent({
      setup() {
        injectedService = useLoadingService();
        return () => null;
      },
    });

    const localWrapper = mount(Harness, {
      global: { plugins: [[LoadingPlugin, { enableDirective: false }]] },
    });
    expect(injectedService).toBeDefined();
    expect(injectedService).not.toBe(loadingService);
    localWrapper.unmount();

    const fallbackWrapper = mount(Harness);
    expect(injectedService).toBe(loadingService);
    fallbackWrapper.unmount();
  });

  it('v-loading 支持显隐与配置更新，卸载时清理目标数据', async () => {
    const wrapper = mount(
      {
        data: () => ({ busy: true, loadingType: 'dots' }),
        template: `
          <section
            class="directive-host"
            v-loading="{ loading: busy, config: { type: loadingType, text: '指令加载' } }"
          ></section>
        `,
      },
      {
        attachTo: document.body,
        global: { plugins: [[LoadingPlugin, { enableDirective: true }]] },
      }
    );
    const host = wrapper.get<HTMLElement>('.directive-host').element;
    await flush();
    expect(host.querySelector('.ex-loading__dots')).not.toBeNull();
    expect(host.style.position).toBe('relative');

    await wrapper.setData({ loadingType: 'bars' });
    await flush();
    expect(host.querySelector('.ex-loading__bars')).not.toBeNull();

    await wrapper.setData({ busy: false });
    await waitFor(() => host.querySelector('.ex-loading') === null);
    expect(host.style.position).toBe('');

    await wrapper.setData({ busy: true });
    await flush();
    expect(host.querySelector('.ex-loading')).not.toBeNull();
    wrapper.unmount();
    expect(document.querySelector('.ex-loading')).toBeNull();
  });
});
