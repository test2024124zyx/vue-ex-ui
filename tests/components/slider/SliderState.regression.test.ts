import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExSlider from '../../../src/components/slider/ExSlider.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('滑块动态配置与公开样式', () => {
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
