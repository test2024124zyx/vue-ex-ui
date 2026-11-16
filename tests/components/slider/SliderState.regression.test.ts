import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExSlider from '../../../src/components/slider/ExSlider.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('滑块动态配置与公开样式', () => {
  it('滑块键盘步进保留精确小数，非法配置使用有效步长', async () => {
    const wrapper = mount(ExSlider, { props: { modelValue: 0.2, min: 0, max: 1, step: 0.1 } });
    wrappers.push(wrapper);
    const thumb = wrapper.get('[role="slider"]');
    await thumb.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([0.3]);
    await wrapper.setProps({ modelValue: 4, max: 100, step: Number.NaN });
    await thumb.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([5]);
    await thumb.trigger('keydown', { key: 'PageUp' });
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([14]);
  });

  it('塌缩区间可以沿轨道向任意方向扩张，始终保持端点顺序', async () => {
    const wrapper = mount(ExSlider, { props: { modelValue: [50, 50], range: true } });
    wrappers.push(wrapper);
    const track = wrapper.get('.ex-slider__track-wrapper');
    const bounds = vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 8,
    } as DOMRect);
    try {
      await track.trigger('mousedown', { clientX: 30 });
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[30, 50]]);
      await track.trigger('mousedown', { clientX: 70 });
      expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[50, 70]]);
    } finally {
      bounds.mockRestore();
    }
  });

  it.each([
    { modelValue: 30, range: false, points: [29, 30] },
    { modelValue: [30, 70] as [number, number], range: true, points: [30, 70] },
  ])('点击落在当前刻度时不提交重复值：$modelValue', async ({ modelValue, range, points }) => {
    const wrapper = mount(ExSlider, { props: { modelValue, range, step: 5 } });
    wrappers.push(wrapper);
    const track = wrapper.get('.ex-slider__track-wrapper');
    const bounds = vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 8,
    } as DOMRect);
    try {
      for (const clientX of points) await track.trigger('mousedown', { clientX });
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      expect(wrapper.emitted('change')).toBeUndefined();
    } finally {
      bounds.mockRestore();
    }
  });

  it('动态边界和步长同步滑块、ARIA 与输入框', async () => {
    const wrapper = mount(ExSlider, { props: { modelValue: 80, showInput: true } });
    wrappers.push(wrapper);
    await wrapper.setProps({ max: 23, step: 5 });
    expect(Number(wrapper.get('[role="slider"]').attributes('aria-valuenow'))).toBeLessThanOrEqual(
      23
    );
    expect(Number(wrapper.get('input').element.value)).toBeLessThanOrEqual(23);
    await wrapper.setProps({ modelValue: 12, min: 10, max: 30, step: 5 });
    expect(wrapper.get('[role="slider"]').attributes('aria-valuenow')).toBe('10');
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it.each(['horizontal', 'vertical'] as const)('反向 %s 区间轨道与两个手柄端点一致', direction => {
    const wrapper = mount(ExSlider, {
      props: { modelValue: [20, 40], range: true, reverse: true, direction },
    });
    wrappers.push(wrapper);
    const bar = wrapper.get<HTMLElement>('.ex-slider__bar').element.style;
    expect(direction === 'horizontal' ? bar.right : bar.top).toBe('20%');
    expect(direction === 'horizontal' ? bar.width : bar.height).toBe('20%');
    expect(
      wrapper
        .findAll('[role="slider"]')
        .every(thumb => thumb.attributes('aria-orientation') === direction)
    ).toBe(true);
  });

  it('支持自定义 class、根样式及标记样式，保留必要定位样式', () => {
    const wrapper = mount(ExSlider, {
      props: {
        direction: 'vertical',
        class: ['业务滑块'],
        style: 'color: red;',
        marks: { 25: { value: 25, label: '四分之一', style: { color: 'blue' } } },
      },
    });
    wrappers.push(wrapper);
    expect(wrapper.classes()).toContain('业务滑块');
    expect(wrapper.element.style.color).toBe('red');
    expect(wrapper.element.style.height).toBe('200px');
    const mark = wrapper.get<HTMLElement>('.ex-slider__mark').element.style;
    expect(mark.color).toBe('blue');
    expect(mark.bottom).toBe('25%');
  });

  it('动态切换单值与区间后，新手柄保留进入和离开提示行为', async () => {
    const wrapper = mount(ExSlider, { props: { modelValue: 20, showTooltip: true } });
    wrappers.push(wrapper);
    for (const range of [true, false, true]) {
      await wrapper.setProps({ range });
      for (const thumb of wrapper.findAll('[role="slider"]')) {
        await thumb.trigger('mouseenter');
        expect(thumb.find('.ex-slider__tooltip').exists()).toBe(true);
        await thumb.trigger('mouseleave');
        expect(thumb.find('.ex-slider__tooltip').exists()).toBe(false);
      }
    }
  });
});
