import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import ExCarousel from '../../../src/components/carousel/ExCarousel.vue';
import ExCarouselItem from '../../../src/components/carousel/ExCarouselItem.vue';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('轮播手势边界', () => {
  it('动态减少动画偏好停止自动播放，手动切换不等待动画锁', async () => {
    vi.useFakeTimers();
    let notify: ((event: MediaQueryListEvent) => void) | undefined;
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: (_event: string, listener: (event: MediaQueryListEvent) => void) => {
        notify = listener;
      },
      removeEventListener: () => {},
    }));
    const wrapper = mount(ExCarousel, {
      props: { interval: Number.NaN, direction: 'vertical' },
      slots: {
        default: () => [h(ExCarouselItem, {}, () => '甲'), h(ExCarouselItem, {}, () => '乙')],
      },
    });
    await wrapper.vm.$nextTick();
    notify!({ matches: true } as MediaQueryListEvent);
    await wrapper.vm.$nextTick();
    await vi.advanceTimersByTimeAsync(4000);
    expect(wrapper.emitted('change')).toBeUndefined();
    wrapper.vm.next();
    wrapper.vm.prev();
    expect(wrapper.emitted('change')).toHaveLength(2);
    expect(wrapper.get('.ex-carousel__track').attributes('style')).toContain('transition: none');
    notify!({ matches: false } as MediaQueryListEvent);
    await vi.advanceTimersByTimeAsync(3000);
    expect(wrapper.emitted('change')).toHaveLength(3);
    wrapper.unmount();
  });
  it('缺省配置使用默认周期自动切换并循环播放', async () => {
    vi.useFakeTimers();
    const wrapper = mount(ExCarousel, {
      slots: {
        default: () => [h(ExCarouselItem, {}, () => '甲'), h(ExCarouselItem, {}, () => '乙')],
      },
    });
    await wrapper.vm.$nextTick();
    await vi.advanceTimersByTimeAsync(3000);
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1]);
    await vi.advanceTimersByTimeAsync(3000);
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0]);
    wrapper.unmount();
  });
  it.each(['horizontal', 'vertical'] as const)('%s 反向滑动回到上一项，空触摸事件不产生切换', async direction => {
    vi.useFakeTimers();
    const wrapper = mount(ExCarousel, {
      props: { autoplay: false, direction, loop: true, style: { padding: '2px' } },
      slots: { default: () => [
        h(ExCarouselItem, { style: 'color: red' }, () => '甲'), h(ExCarouselItem, {}, () => '乙'),
      ] },
    });
    const track = wrapper.get('.ex-carousel__track');
    await track.trigger('touchstart', { touches: [] });
    await track.trigger('touchmove', { touches: [] });
    await track.trigger('touchend', { changedTouches: [] });
    expect(wrapper.emitted('change')).toBeUndefined();
    await track.trigger('touchstart', { touches: [{ clientX: 0, clientY: 0 }] });
    await track.trigger('touchmove', { touches: [] });
    await track.trigger('touchend', { changedTouches: [{ clientX: direction === 'horizontal' ? 120 : 0, clientY: direction === 'vertical' ? 120 : 0 }] });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1]);
    await vi.advanceTimersByTimeAsync(300);
    await track.trigger('touchstart', { touches: [{ clientX: 0, clientY: 0 }] });
    await track.trigger('touchcancel');
    await track.trigger('touchend', { changedTouches: [{ clientX: 200, clientY: 200 }] });
    expect(wrapper.emitted('change')).toHaveLength(1);
    wrapper.unmount();
  });

  it('空轮播和非法播放周期不创建不可控的自动播放任务', async () => {
    vi.useFakeTimers();
    const wrapper = mount(ExCarousel, { props: { interval: Number.NaN } });
    wrapper.vm.next();
    wrapper.vm.prev();
    wrapper.vm.goTo(10);
    await vi.advanceTimersByTimeAsync(10000);
    expect(wrapper.emitted('change')).toBeUndefined();
    wrapper.unmount();
  });
});
