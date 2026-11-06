import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExBackTop from '../../../src/components/back-top/ExBackTop.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import { getPositionStyle, resolveTarget } from '../../../src/components/back-top/utils';

describe('ExBackTop', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('字符串自定义样式与必要的固定定位样式正确合并', async () => {
    const wrapper = mount(ExBackTop, {
      attachTo: document.body,
      props: {
        visibilityHeight: 0,
        position: 'bottom-left',
        style: 'color: rgb(255, 0, 0);',
      },
    });
    await nextTick();

    const button = document.body.querySelector<HTMLButtonElement>('.ex-back-top');
    expect(button).not.toBeNull();
    expect(button?.style.position).toBe('fixed');
    expect(button?.style.bottom).toBe('24px');
    expect(button?.style.left).toBe('24px');
    expect(button?.style.color).toBe('rgb(255, 0, 0)');
    wrapper.unmount();
  });

  it('窗口尺寸变化会响应式更新移动端显示条件', async () => {
    let width = 1024;
    vi.spyOn(window, 'innerWidth', 'get').mockImplementation(() => width);
    const wrapper = mount(ExBackTop, {
      attachTo: document.body,
      props: { visibilityHeight: 0, showOnMobile: false, mobileBreakpoint: 768 },
    });
    await nextTick();
    expect(document.body.querySelector('.ex-back-top')).not.toBeNull();

    width = 500;
    window.dispatchEvent(new Event('resize'));
    await nextTick();
    expect(document.body.querySelector('.ex-back-top')).toBeNull();
    wrapper.unmount();
  });

  it('无效目标选择器安全回退到 window', () => {
    expect(() => resolveTarget('#broken[')).not.toThrow();
    expect(resolveTarget('#broken[')).toBe(window);
  });

  it('卸载时中止自定义平滑滚动帧且不发送伪完成事件', async () => {
    const request = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42);
    const cancel = vi.spyOn(window, 'cancelAnimationFrame');
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const wrapper = mount(ExBackTop, {
      attachTo: document.body,
      props: { visibilityHeight: 0, scrollBehavior: 'smooth', scrollDuration: 400 },
    });
    await nextTick();

    document.body.querySelector<HTMLButtonElement>('.ex-back-top')?.click();
    expect(request).toHaveBeenCalled();
    expect(wrapper.emitted('scroll-start')).toHaveLength(1);

    wrapper.unmount();
    await nextTick();
    expect(cancel).toHaveBeenCalledWith(42);
    expect(wrapper.emitted('scroll-end')).toBeUndefined();
  });

  it('居中位置使用独立 translate 属性，不与悬停 transform 冲突', () => {
    expect(getPositionStyle('bottom-center')).toMatchObject({
      left: '50%',
      translate: '-50% 0',
    });
  });

  it('运行时修改可见阈值会立即重新计算，不等待下一次滚动', async () => {
    const target = document.createElement('div');
    Object.defineProperties(target, {
      scrollTop: { configurable: true, value: 100 },
      scrollHeight: { configurable: true, value: 1000 },
      clientHeight: { configurable: true, value: 500 },
    });
    const wrapper = mount(ExBackTop, {
      attachTo: document.body,
      props: { target, visibilityHeight: 200 },
    });
    await nextTick();
    expect(document.body.querySelector('.ex-back-top')).toBeNull();

    await wrapper.setProps({ visibilityHeight: 50 });

    expect(document.body.querySelector('.ex-back-top')).not.toBeNull();
    wrapper.unmount();
  });

  it('系统要求减少动态效果时平滑配置退化为即时滚动', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }))
    );
    const request = vi.spyOn(window, 'requestAnimationFrame');
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const wrapper = mount(ExBackTop, {
      attachTo: document.body,
      props: { visibilityHeight: 0, scrollBehavior: 'smooth', scrollDuration: 400 },
    });
    await nextTick();

    document.body.querySelector<HTMLButtonElement>('.ex-back-top')?.click();
    await nextTick();

    expect(scrollTo).toHaveBeenCalledWith(0, 0);
    expect(request).not.toHaveBeenCalled();
    expect(wrapper.emitted('scroll-end')).toHaveLength(1);
    wrapper.unmount();
    vi.unstubAllGlobals();
  });

  it('默认按钮名称跟随 ConfigProvider 语言', async () => {
    const wrapper = mount(ExConfigProvider, {
      attachTo: document.body,
      props: { locale: 'zh-CN' },
      slots: { default: () => h(ExBackTop, { visibilityHeight: 0 }) },
    });
    await nextTick();

    expect(document.body.querySelector('.ex-back-top')?.getAttribute('aria-label')).toBe(
      '返回顶部'
    );
    await wrapper.setProps({ locale: 'en-US' });
    expect(document.body.querySelector('.ex-back-top')?.getAttribute('aria-label')).toBe(
      'Back to top'
    );
    wrapper.unmount();
  });

  it('Teleport 按钮继承 ConfigProvider 的语义层级和效果开关', async () => {
    const wrapper = mount(ExConfigProvider, {
      attachTo: document.body,
      props: { zIndex: 2400, neonEffect: false, animation: false },
      slots: { default: () => h(ExBackTop, { visibilityHeight: 0 }) },
    });
    await nextTick();

    const button = document.body.querySelector<HTMLButtonElement>('.ex-back-top')!;
    expect(button.style.zIndex).toBe('2420');
    expect(button.classList).toContain('ex-no-neon');
    expect(button.classList).toContain('ex-no-animation');
    wrapper.unmount();
  });
});
