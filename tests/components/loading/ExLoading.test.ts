import { mount, type VueWrapper } from '@vue/test-utils';
import { renderToString } from '@vue/server-renderer';
import { afterEach, describe, expect, it } from 'vitest';
import { createSSRApp, h, nextTick } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExLoading from '../../../src/components/loading/ExLoading.vue';
import type {
  ExLoadingExposed,
  LoadingSize,
  LoadingType,
} from '../../../src/components/loading/types';

describe('ExLoading', () => {
  const wrappers: VueWrapper[] = [];

  const mountLoading = (options: Parameters<typeof mount<typeof ExLoading>>[1] = {}) => {
    const wrapper = mount(ExLoading, options);
    wrappers.push(wrapper);
    return wrapper;
  };

  afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount());
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('默认渲染非打断式状态提示并提供本地化名称', () => {
    const wrapper = mountLoading();
    const loading = wrapper.get('.ex-loading');

    expect(loading.classes()).toEqual(
      expect.arrayContaining(['ex-loading', 'ex-loading--spinner', 'ex-loading--medium'])
    );
    expect(loading.attributes('role')).toBe('status');
    expect(loading.attributes('aria-live')).toBe('polite');
    expect(loading.attributes('aria-busy')).toBe('true');
    expect(loading.attributes('aria-label')).not.toBe('');
    expect(wrapper.get('.ex-loading__mask').attributes('aria-hidden')).toBe('true');
    expect(wrapper.get('.ex-loading__spinner').attributes('aria-hidden')).toBe('true');
  });

  it('visible=false 时不保留不可见浮层', () => {
    const wrapper = mountLoading({ props: { visible: false } });

    expect(wrapper.find('.ex-loading').exists()).toBe(false);
  });

  it('服务端首屏保持原位结构，避免客户端挂载前改变 Teleport 分支', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(ExLoading, { fullscreen: true, text: '服务端加载' }),
      })
    );

    expect(html).toContain('ex-loading--fullscreen');
    expect(html).toContain('服务端加载');
    expect(document.body.style.overflow).toBe('');
  });

  it.each<LoadingType>(['spinner', 'dots', 'pulse', 'bars', 'neon'])(
    '渲染真实实现的 %s 动画',
    type => {
      const wrapper = mountLoading({ props: { type } });

      expect(wrapper.get('.ex-loading').classes()).toContain(`ex-loading--${type}`);
      expect(
        wrapper.find(`.ex-loading__${type === 'spinner' ? 'spinner-circle' : type}`).exists()
      ).toBe(true);
    }
  );

  it.each<LoadingSize>(['small', 'medium', 'large'])('渲染 %s 尺寸', size => {
    expect(mountLoading({ props: { size } }).get('.ex-loading').classes()).toContain(
      `ex-loading--${size}`
    );
  });

  it('运行时非法类型与尺寸安全回退到默认值', () => {
    const wrapper = mountLoading({
      props: {
        type: 'wave' as LoadingType,
        size: 'huge' as LoadingSize,
      },
    });

    expect(wrapper.get('.ex-loading').classes()).toEqual(
      expect.arrayContaining(['ex-loading--spinner', 'ex-loading--medium'])
    );
    expect(wrapper.find('.ex-loading__spinner-circle').exists()).toBe(true);
  });

  it('文本、默认插槽与自定义动画插槽均按真实内容渲染', () => {
    const text = mountLoading({ props: { text: '正在同步' } });
    const slots = mountLoading({
      props: { text: '不会显示' },
      slots: {
        default: '<strong class="custom-text">自定义文案</strong>',
        spinner: '<svg class="custom-spinner" />',
      },
    });

    expect(text.get('.ex-loading__text').text()).toBe('正在同步');
    expect(text.get('.ex-loading').attributes('aria-label')).toBe('正在同步');
    expect(slots.find('.custom-text').exists()).toBe(true);
    expect(slots.find('.custom-spinner').exists()).toBe(true);
    expect(slots.find('.ex-loading__spinner-circle').exists()).toBe(false);
  });

  it('原生 class、style、aria 与 data 属性透传到真实浮层', () => {
    const wrapper = mountLoading({
      attrs: {
        class: ['custom-loading', { active: true }],
        style: { borderWidth: '2px' },
        'aria-label': '读取账户数据',
        'data-track-id': 'account-loading',
      },
    });
    const loading = wrapper.get('.ex-loading');

    expect(loading.classes()).toEqual(expect.arrayContaining(['custom-loading', 'active']));
    expect(loading.attributes('style')).toContain('border-width: 2px');
    expect(loading.attributes('aria-label')).toBe('读取账户数据');
    expect(loading.attributes('data-track-id')).toBe('account-loading');
  });

  it('已删除的旧配置不会作为无意义属性泄漏到 DOM', () => {
    const wrapper = mountLoading({
      attrs: {
        loading: true,
        theme: 'dark',
        position: 'top',
        animation: { duration: 500 },
        minDuration: 100,
        'max-duration': 1000,
        showPercentage: true,
        'show-percentage': true,
        percentage: 50,
        autoHide: true,
        'auto-hide-delay': 300,
        draggable: true,
        ariaLabel: '旧标签',
      },
    });
    const attributes = wrapper.get('.ex-loading').attributes();

    expect(attributes).not.toHaveProperty('loading');
    expect(attributes).not.toHaveProperty('theme');
    expect(attributes).not.toHaveProperty('position');
    expect(attributes).not.toHaveProperty('animation');
    expect(attributes).not.toHaveProperty('minduration');
    expect(attributes).not.toHaveProperty('max-duration');
    expect(attributes).not.toHaveProperty('showpercentage');
    expect(attributes).not.toHaveProperty('show-percentage');
    expect(attributes).not.toHaveProperty('percentage');
    expect(attributes).not.toHaveProperty('autohide');
    expect(attributes).not.toHaveProperty('auto-hide-delay');
    expect(attributes).not.toHaveProperty('draggable');
    expect(attributes).not.toHaveProperty('arialabel');
  });

  it('颜色与层级仅接受有效运行时值', async () => {
    const wrapper = mountLoading({ props: { color: ' #ff00aa ', zIndex: 1200.9 } });
    const loading = wrapper.get('.ex-loading');

    expect(loading.attributes('style')).toContain('--ex-loading-color: #ff00aa');
    expect(loading.attributes('style')).toContain('--ex-loading-z-index: 1200');

    await wrapper.setProps({ color: '   ', zIndex: Number.NaN });
    expect(wrapper.get('.ex-loading').attributes('style') ?? '').not.toContain(
      '--ex-loading-color'
    );
    expect(
      (wrapper.get('.ex-loading').element as HTMLElement).style.getPropertyValue(
        '--ex-loading-z-index'
      )
    ).toBe('1040');
  });

  it('遮罩默认不可关闭，启用后发送受控更新与 close 事件', async () => {
    const fixed = mountLoading();
    await fixed.get('.ex-loading__mask').trigger('click');
    expect(fixed.emitted('update:visible')).toBeUndefined();
    expect(fixed.emitted('close')).toBeUndefined();

    const closable = mountLoading({ props: { maskClosable: true } });
    await closable.get('.ex-loading__mask').trigger('click');
    expect(closable.emitted('update:visible')).toEqual([[false]]);
    expect(closable.emitted('close')).toEqual([[]]);
    // 组件遵循受控语义，调用方未更新 visible 时不擅自隐藏。
    expect(closable.find('.ex-loading').exists()).toBe(true);
  });

  it('暴露 close 与 getElement，并避免隐藏状态重复发送关闭事件', async () => {
    const wrapper = mountLoading();
    const exposed = wrapper.vm as unknown as ExLoadingExposed;

    expect(exposed.getElement()).toBe(wrapper.get('.ex-loading').element);
    exposed.close();
    expect(wrapper.emitted('update:visible')).toEqual([[false]]);
    expect(wrapper.emitted('close')).toEqual([[]]);

    await wrapper.setProps({ visible: false });
    exposed.close();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('全屏浮层传送到 body，并在显示期间成对锁定滚动', async () => {
    document.body.style.overflow = 'auto';
    const wrapper = mountLoading({
      attachTo: document.body,
      props: { fullscreen: true },
    });

    await nextTick();
    const loading = document.body.querySelector<HTMLElement>('.ex-loading');
    expect(loading?.classList.contains('ex-loading--fullscreen')).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');

    await wrapper.setProps({ visible: false });
    expect(document.body.style.overflow).toBe('auto');
  });

  it('全屏 Teleport 以内联层级继承最近 ConfigProvider', async () => {
    const wrapper = mount(ExConfigProvider, {
      attachTo: document.body,
      props: { zIndex: 3000 },
      slots: { default: () => h(ExLoading, { fullscreen: true }) },
    });
    wrappers.push(wrapper);
    await nextTick();

    const loading = document.body.querySelector<HTMLElement>('.ex-loading');
    expect(loading?.style.getPropertyValue('--ex-loading-z-index')).toBe('3050');

    await wrapper.setProps({ zIndex: 3200 });
    await nextTick();
    expect(loading?.style.getPropertyValue('--ex-loading-z-index')).toBe('3250');
  });

  it('全屏 Teleport 显式继承动画与霓虹开关', async () => {
    const wrapper = mount(ExConfigProvider, {
      attachTo: document.body,
      props: { animation: false, neonEffect: false },
      slots: { default: () => h(ExLoading, { fullscreen: true }) },
    });
    wrappers.push(wrapper);
    await nextTick();

    const loading = document.body.querySelector<HTMLElement>('.ex-loading');
    expect(loading?.classList.contains('ex-loading--no-animation')).toBe(true);
    expect(loading?.classList.contains('ex-loading--no-neon')).toBe(true);
  });

  it('无遮罩全屏提示不会锁定滚动或拦截底层交互', async () => {
    mountLoading({
      attachTo: document.body,
      props: { fullscreen: true, mask: false },
    });

    await nextTick();
    const loading = document.body.querySelector<HTMLElement>('.ex-loading');
    expect(loading?.classList.contains('ex-loading--no-mask')).toBe(true);
    expect(document.body.style.overflow).toBe('');
    expect(loading?.querySelector('.ex-loading__mask')).toBeNull();
  });

  it('多个全屏实例通过引用计数保持滚动锁直到最后一个关闭', async () => {
    const first = mountLoading({ attachTo: document.body, props: { fullscreen: true } });
    const second = mountLoading({ attachTo: document.body, props: { fullscreen: true } });
    expect(document.body.style.overflow).toBe('hidden');

    await first.setProps({ visible: false });
    expect(document.body.style.overflow).toBe('hidden');
    await second.setProps({ visible: false });
    expect(document.body.style.overflow).toBe('');
  });

  it('目标容器接收浮层并在隐藏时恢复原始定位', async () => {
    const host = document.createElement('section');
    document.body.append(host);
    const wrapper = mountLoading({
      attachTo: document.body,
      props: { target: host },
    });

    await nextTick();
    expect(host.querySelector('.ex-loading')).not.toBeNull();
    expect(host.style.position).toBe('relative');

    await wrapper.setProps({ visible: false });
    expect(host.style.position).toBe('');
  });

  it('同一目标的多个实例使用引用计数恢复定位', async () => {
    const host = document.createElement('section');
    document.body.append(host);
    const first = mountLoading({ attachTo: document.body, props: { target: host } });
    const second = mountLoading({ attachTo: document.body, props: { target: host } });
    expect(host.style.position).toBe('relative');

    await first.setProps({ visible: false });
    expect(host.style.position).toBe('relative');
    await second.setProps({ visible: false });
    expect(host.style.position).toBe('');
  });

  it('动态切换目标时恢复旧容器并定位新容器', async () => {
    const firstHost = document.createElement('section');
    const secondHost = document.createElement('section');
    document.body.append(firstHost, secondHost);
    const wrapper = mountLoading({
      attachTo: document.body,
      props: { target: firstHost },
    });

    await wrapper.setProps({ target: secondHost });
    await nextTick();
    expect(firstHost.style.position).toBe('');
    expect(firstHost.querySelector('.ex-loading')).toBeNull();
    expect(secondHost.style.position).toBe('relative');
    expect(secondHost.querySelector('.ex-loading')).not.toBeNull();
  });

  it('选择器目标支持有效值，缺失或非法选择器安全回退为原位渲染', async () => {
    const host = document.createElement('section');
    host.id = 'loading-host';
    document.body.append(host);
    const valid = mountLoading({
      attachTo: document.body,
      props: { target: '#loading-host' },
    });
    await nextTick();
    expect(host.querySelector('.ex-loading')).not.toBeNull();

    const missing = mountLoading({ props: { target: '#missing-host' } });
    const invalid = mountLoading({ props: { target: '[' } });
    expect(missing.find('.ex-loading').exists()).toBe(true);
    expect(invalid.find('.ex-loading').exists()).toBe(true);
    expect(valid.exists()).toBe(true);
  });
});
