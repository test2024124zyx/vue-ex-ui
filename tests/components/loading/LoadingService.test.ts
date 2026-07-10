import { describe, it, expect, afterEach } from 'vitest';
import { nextTick } from 'vue';
import {
  loadingService,
  showLoading,
  hideLoading,
  destroyLoading,
} from '../../../src/components/loading/LoadingService';

// 回归测试：此前 LoadingService 调用 ExLoading 上不存在的 show/hide/updateConfig，
// 导致 hide()/hideAll()/v-loading=false 全部为空操作，浮层无法关闭。

// 等待渲染稳定（显示态：插入即可见，几个 tick 足够）
const flush = async () => {
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 0));
  await nextTick();
};

// 轮询等待元素消失，避免依赖固定时长（过渡 leave 时长在高负载下不稳定）
const waitForGone = async (selector: string, timeout = 2000) => {
  const start = Date.now();
  while (document.querySelector(selector) && Date.now() - start < timeout) {
    await new Promise(resolve => setTimeout(resolve, 20));
    await nextTick();
  }
};

describe('LoadingService', () => {
  afterEach(() => {
    loadingService.destroyAll?.();
    destroyLoading();
    document.body.innerHTML = '';
  });

  it('show 应创建并显示全屏 loading，实例方法齐全', async () => {
    const instance = loadingService.show({ text: '加载中' });
    await flush();

    expect(typeof instance.show).toBe('function');
    expect(typeof instance.hide).toBe('function');
    expect(typeof instance.close).toBe('function');
    expect(typeof instance.updateConfig).toBe('function');
    expect(document.querySelector('.ex-loading')).toBeTruthy();
  });

  it('close 应移除 loading 浮层', async () => {
    const instance = loadingService.show();
    await flush();
    expect(document.querySelector('.ex-loading')).toBeTruthy();

    instance.close();
    await waitForGone('.ex-loading');
    expect(document.querySelector('.ex-loading')).toBeFalsy();
  });

  it('hide 应隐藏 loading（不再是空操作）', async () => {
    const instance = loadingService.show();
    await flush();
    expect(document.querySelector('.ex-loading')).toBeTruthy();

    instance.hide?.();
    await waitForGone('.ex-loading');
    expect(document.querySelector('.ex-loading')).toBeFalsy();
  });

  it('target 容器内 loading 应渲染并可关闭', async () => {
    const host = document.createElement('div');
    document.body.appendChild(host);

    const instance = loadingService.show({ target: host });
    await flush();
    expect(document.querySelector('.ex-loading')).toBeTruthy();

    instance.close();
    await waitForGone('.ex-loading');
    expect(document.querySelector('.ex-loading')).toBeFalsy();
  });

  it('showLoading / hideLoading 单例应可显示与隐藏', async () => {
    showLoading({ text: '处理中' });
    await flush();
    expect(document.querySelector('.ex-loading')).toBeTruthy();

    hideLoading();
    await waitForGone('.ex-loading');
    expect(document.querySelector('.ex-loading')).toBeFalsy();
  });

  it('getInstanceCount 应随创建/销毁变化', async () => {
    const start = loadingService.getInstanceCount?.() ?? 0;
    const a = loadingService.show({ target: document.body });
    const b = loadingService.show({ target: document.body });
    expect(loadingService.getInstanceCount?.()).toBe(start + 2);
    a.close();
    b.close();
    expect(loadingService.getInstanceCount?.()).toBe(start);
  });
});
