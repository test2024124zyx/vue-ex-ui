import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExRate from '../../../src/components/rate/ExRate.vue';

describe('评分键盘与运行时边界', () => {
  it('半星键盘导航遵守上下界，禁用或只读后公开方法不能改值', async () => {
    const wrapper = mount(ExRate, {
      props: {
        allowHalf: true,
        showScore: true,
        customClass: 'business-rate',
        customStyle: 'padding: 2px',
      },
    });
    for (const [key, value] of [
      ['ArrowUp', 0.5],
      ['ArrowRight', 1],
      ['ArrowDown', 0.5],
      ['ArrowLeft', 0],
      ['End', 5],
      ['Home', 0],
    ] as const) {
      await wrapper.trigger('keydown', { key });
      expect(wrapper.attributes('aria-valuenow')).toBe(String(value));
    }
    await wrapper.trigger('keydown', { key: 'Tab' });
    wrapper.vm.setCurrentValue(3.5);
    await wrapper.vm.$nextTick();
    await wrapper.setProps({ max: 2 });
    expect(wrapper.attributes('aria-valuenow')).toBe('2');
    await wrapper.setProps({ readonly: true });
    wrapper.vm.resetCurrentValue();
    await wrapper.trigger('keydown', { key: 'Home' });
    expect(wrapper.attributes('aria-valuenow')).toBe('2');
    wrapper.unmount();
  });

  it('无效最大值和非有限评分回退到有效状态，缺少评分文案时不会显示 undefined', async () => {
    const wrapper = mount(ExRate, {
      props: { max: Number.NaN, modelValue: Number.NaN, showText: true, texts: ['差'] },
    });
    expect(wrapper.findAll('.ex-rate__star')).toHaveLength(5);
    expect(wrapper.attributes('aria-valuenow')).toBe('0');
    await wrapper.setProps({ modelValue: 4 });
    expect(wrapper.text()).not.toContain('undefined');
    wrapper.unmount();
  });
});
