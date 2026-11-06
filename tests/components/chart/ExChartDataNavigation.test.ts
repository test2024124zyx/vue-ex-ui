import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ExChartDataNavigation from '../../../src/components/chart/ExChartDataNavigation.vue';

describe('图表键盘数据导航', () => {
  const items = [
    { seriesIndex: 0, dataIndex: 0, label: 'Sales, Mon', value: 12 },
    { seriesIndex: 0, dataIndex: 1, label: 'Sales, Tue', value: 20 },
    { seriesIndex: 1, dataIndex: 0, label: 'Cost, Mon', value: 8 },
  ];

  it('方向和首尾键导航真实数据，Enter 激活，Escape 清除高亮且 Tab 保持原生退出', async () => {
    const wrapper = mount(ExChartDataNavigation, { props: { items } });
    const navigation = wrapper.find('[role="listbox"]');
    await navigation.trigger('focus');
    expect(wrapper.emitted('highlight')?.at(-1)?.[0]).toEqual(items[0]);
    await navigation.trigger('keydown', { key: 'ArrowRight' });
    expect(wrapper.find('[role="option"]').text()).toContain('Sales, Tue: 20');
    expect(wrapper.find('[role="option"]').attributes('aria-posinset')).toBe('2');
    await navigation.trigger('keydown', { key: 'End' });
    await navigation.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('activate')?.at(-1)?.[0]).toEqual(items[2]);
    await navigation.trigger('keydown', { key: 'Home' });
    expect(wrapper.find('[role="option"]').attributes('aria-posinset')).toBe('1');
    await navigation.trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('highlight')?.at(-1)?.[0]).toBeNull();
    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
    navigation.element.dispatchEvent(tab);
    expect(tab.defaultPrevented).toBe(false);
    wrapper.unmount();
  });

  it('仅渲染当前项并在数据替换、空数据和组合输入时维持有效状态', async () => {
    const wrapper = mount(ExChartDataNavigation, {
      props: {
        items: Array.from({ length: 10_000 }, (_, dataIndex) => ({ ...items[0]!, dataIndex })),
      },
    });
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1);
    const navigation = wrapper.find('[role="listbox"]');
    await navigation.trigger('keydown', { key: 'End', isComposing: true });
    expect(wrapper.find('[role="option"]').attributes('aria-posinset')).toBe('1');
    await navigation.trigger('keydown', { key: 'End' });
    await wrapper.setProps({ items: [items[0]!] });
    expect(wrapper.find('[role="option"]').attributes('aria-posinset')).toBe('1');
    await wrapper.setProps({ items: [] });
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    wrapper.unmount();
  });
});
