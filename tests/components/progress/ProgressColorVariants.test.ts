import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExProgress from '../../../src/components/progress/ExProgress.vue';

describe('进度变体颜色与边界', () => {
  it.each(['circle', 'dashboard', 'wave', 'wave-circle'] as const)(
    '%s 保留渐变次序且不修改业务颜色数组',
    async type => {
      const colors = [
        { percentage: 100, color: '#0000ff' },
        { percentage: 0, color: '#ff0000' },
      ];
      const wrapper = mount(ExProgress, {
        props: { type, percentage: 45, color: colors, waveAnimated: false, style: 'padding: 2px' },
      });
      const stops = wrapper.findAll('stop');
      expect(stops[0]!.attributes('offset')).toBe('0%');
      expect(stops[1]!.attributes('offset')).toBe('100%');
      expect(colors[0]!.percentage).toBe(100);
      expect(wrapper.findAll('path').every(path => !path.attributes('d')?.includes('NaN'))).toBe(
        true
      );
      await wrapper.setProps({ showText: false });
      expect(wrapper.text()).not.toContain('45%');
      expect(wrapper.vm.getElement()).toBe(wrapper.element);
      wrapper.unmount();
    }
  );

  it.each(['success', 'exception', 'warning'] as const)(
    '%s 状态在圆形和波浪中采用语义色',
    async status => {
      const color = status === 'exception' ? 'error' : status;
      const wrapper = mount(ExProgress, {
        props: { type: 'circle', percentage: 100, status, showIcon: true, waveAnimated: false },
      });
      expect(wrapper.get('.ex-progress__circle-path').attributes('stroke')).toBe(
        `var(--ex-color-${color})`
      );
      await wrapper.setProps({ type: 'wave-circle' });
      expect(wrapper.get('stop').attributes('stop-color')).toBe(`var(--ex-color-${color})`);
      wrapper.unmount();
    }
  );

  it('颜色函数接收收敛后的进度，格式化文字与实际进度一致', async () => {
    const wrapper = mount(ExProgress, {
      props: {
        type: 'circle',
        percentage: 200,
        color: value => (value === 100 ? '#008000' : '#ff0000'),
        format: value => `完成 ${value}`,
        waveAnimated: false,
      },
    });
    expect(wrapper.attributes('aria-valuenow')).toBe('100');
    expect(wrapper.get('.ex-progress__circle-path').attributes('stroke')).toBe('#008000');
    expect(wrapper.text()).toContain('完成 100');
    await wrapper.setProps({ type: 'wave', percentage: Number.NaN });
    expect(wrapper.attributes('aria-valuenow')).toBe('0');
    expect(wrapper.get('stop').attributes('stop-color')).toBe('#ff0000');
    wrapper.unmount();
  });
});
