import { mount } from '@vue/test-utils';
import { createApp, defineComponent, nextTick } from 'vue';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import ExLoadingBarComponent from '../../../src/components/loading-bar/ExLoadingBar.vue';
import { ExLoadingBar } from '../../../src/components/loading-bar';
import { setLocale } from '../../../src/locale';

describe('ExLoadingBar', () => {
  beforeEach(() => {
    setLocale('zh-CN');
  });

  afterEach(() => {
    setLocale('en-US');
    document.body.innerHTML = '';
  });

  it('默认渲染具有完整进度语义的加载条', () => {
    const wrapper = mount(ExLoadingBarComponent);
    const loadingBar = wrapper.get('.ex-loading-bar');

    expect(loadingBar.attributes()).toEqual(
      expect.objectContaining({
        role: 'progressbar',
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-valuenow': '0',
      })
    );
    expect(loadingBar.attributes('aria-label')).toBe('加载中...');
    expect(loadingBar.attributes('data-status')).toBe('loading');
    expect(loadingBar.attributes('style')).toContain('--ex-loading-bar-height: 3px');
    expect(loadingBar.attributes('style')).toContain('--ex-loading-bar-progress: 0');
    expect(wrapper.get('.ex-loading-bar__bar').classes()).toContain('ex-loading-bar__bar--loading');
  });

  it.each(['loading', 'success', 'error', 'warning'] as const)('真实渲染 %s 状态', status => {
    const wrapper = mount(ExLoadingBarComponent, {
      props: { status },
    });

    expect(wrapper.get('.ex-loading-bar').attributes('data-status')).toBe(status);
    expect(wrapper.get('.ex-loading-bar__bar').classes()).toContain(
      `ex-loading-bar__bar--${status}`
    );
  });

  it('规范百分比、高度、层级与非法状态', async () => {
    const wrapper = mount(ExLoadingBarComponent, {
      props: {
        percentage: 150,
        height: 40,
        zIndex: 1200.9,
        status: 'unknown' as never,
      },
    });
    let loadingBar = wrapper.get('.ex-loading-bar');

    expect(loadingBar.attributes('aria-valuenow')).toBe('100');
    expect(loadingBar.attributes('style')).toContain('--ex-loading-bar-height: 16px');
    expect(loadingBar.attributes('style')).toContain('--ex-loading-bar-z-index: 1200');
    expect(loadingBar.attributes('data-status')).toBe('loading');

    await wrapper.setProps({
      percentage: Number.NaN,
      height: 0,
      zIndex: -1,
      status: 'error',
    });
    loadingBar = wrapper.get('.ex-loading-bar');
    expect(loadingBar.attributes('aria-valuenow')).toBe('0');
    expect(loadingBar.attributes('style')).toContain('--ex-loading-bar-height: 3px');
    expect(loadingBar.attributes('style')).not.toContain('--ex-loading-bar-z-index');
    expect(loadingBar.attributes('data-status')).toBe('error');
  });

  it('颜色函数接收规范后的百分比，空颜色回退主题状态色', async () => {
    let receivedPercentage = -1;
    const wrapper = mount(ExLoadingBarComponent, {
      props: {
        percentage: 120,
        color: percentage => {
          receivedPercentage = percentage;
          return '  #ff007f  ';
        },
      },
    });

    expect(receivedPercentage).toBe(100);
    expect(wrapper.get('.ex-loading-bar').attributes('style')).toContain(
      '--ex-loading-bar-color: #ff007f'
    );

    await wrapper.setProps({ color: '   ' });
    expect(wrapper.get('.ex-loading-bar').attributes('style')).not.toContain(
      '--ex-loading-bar-color'
    );
  });

  it('visible 是受控显示状态', async () => {
    const wrapper = mount(ExLoadingBarComponent, {
      props: { visible: false },
    });

    expect(wrapper.find('.ex-loading-bar').exists()).toBe(false);
    await wrapper.setProps({ visible: true });
    expect(wrapper.find('.ex-loading-bar').exists()).toBe(true);
  });

  it('透传原生属性但保护进度语义并过滤已删除伪属性', () => {
    const wrapper = mount(ExLoadingBarComponent, {
      props: { percentage: 25 },
      attrs: {
        class: 'route-progress',
        style: { maxWidth: '80vw' },
        'aria-label': '路由加载进度',
        'aria-valuenow': '999',
        role: 'status',
        'data-track-id': 'router',
        duration: 3000,
        animated: true,
        rounded: true,
      },
    });
    const loadingBar = wrapper.get('.ex-loading-bar');

    expect(loadingBar.classes()).toContain('route-progress');
    expect(loadingBar.attributes('style')).toContain('max-width: 80vw');
    expect(loadingBar.attributes('aria-label')).toBe('路由加载进度');
    expect(loadingBar.attributes('aria-valuenow')).toBe('25');
    expect(loadingBar.attributes('role')).toBe('progressbar');
    expect(loadingBar.attributes('data-track-id')).toBe('router');
    expect(loadingBar.attributes('duration')).toBeUndefined();
    expect(loadingBar.attributes('animated')).toBeUndefined();
    expect(loadingBar.attributes('rounded')).toBeUndefined();
  });

  it('暴露当前根元素且隐藏后返回 null', async () => {
    const wrapper = mount(ExLoadingBarComponent);
    const exposed = wrapper.vm as unknown as { getElement: () => HTMLDivElement | null };

    expect(exposed.getElement()).toBe(wrapper.get('.ex-loading-bar').element);
    await wrapper.setProps({ visible: false });
    await nextTick();
    expect(exposed.getElement()).toBeNull();
  });

  it('按需安装只注册组件，不声明无法保持一致的全局伪服务', () => {
    const app = createApp(defineComponent(() => () => null));
    app.use(ExLoadingBar);

    expect(app.component('ExLoadingBar')).toBe(ExLoadingBar);
    expect(app.config.globalProperties.$loadingBar).toBeUndefined();
  });
});
