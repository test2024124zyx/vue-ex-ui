import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExBackTop from '../../../src/components/back-top/ExBackTop.vue';
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
});
