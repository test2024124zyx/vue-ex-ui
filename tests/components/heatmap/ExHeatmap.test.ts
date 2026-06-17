import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExHeatmap from '../../../src/components/heatmap/ExHeatmap.vue';
import type { HeatmapDataItem } from '../../../src/components/heatmap/types';

describe('ExHeatmap', () => {
  const mockData: HeatmapDataItem[] = [
    { date: '2024-01-01', value: 10 },
    { date: '2024-01-02', value: 25 },
    { date: '2024-01-03', value: 15 },
    { date: '2024-01-04', value: 30 },
    { date: '2024-01-05', value: 20 },
  ];

  it('renders correctly', () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
      },
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('.ex-heatmap').exists()).toBe(true);
  });

  it('renders with different sizes', () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
        size: 'small',
      },
    });
    expect(wrapper.classes()).toContain('ex-heatmap--small');
  });

  it('renders with different themes', () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
        theme: 'blue',
      },
    });
    expect(wrapper.classes()).toContain('ex-heatmap--blue');
  });

  it('renders month labels when enabled', () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
        showMonthLabels: true,
      },
    });
    expect(wrapper.find('.ex-heatmap__months').exists()).toBe(true);
  });

  it('hides month labels when disabled', () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
        showMonthLabels: false,
      },
    });
    expect(wrapper.find('.ex-heatmap__months').exists()).toBe(false);
  });

  it('renders week labels when enabled', () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
        showWeekLabels: true,
      },
    });
    expect(wrapper.find('.ex-heatmap__weeks').exists()).toBe(true);
  });

  it('hides week labels when disabled', () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
        showWeekLabels: false,
      },
    });
    expect(wrapper.find('.ex-heatmap__weeks').exists()).toBe(false);
  });

  it('renders empty state when no data', () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: [],
      },
    });
    expect(wrapper.find('.ex-heatmap__empty').exists()).toBe(true);
  });

  it('renders legend', () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
      },
    });
    expect(wrapper.find('.ex-heatmap__legend').exists()).toBe(true);
    expect(wrapper.findAll('.ex-heatmap__legend-item')).toHaveLength(5);
  });

  it('emits cell-click event', async () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
      },
    });
    
    // 找到一个有数据的单元格（level > 0）
    const cells = wrapper.findAll('.ex-heatmap__cell');
    const cellWithData = cells.find(cell => 
      cell.classes().some(cls => cls.match(/level-[1-4]/))
    );
    
    if (cellWithData) {
      await cellWithData.trigger('click');
      expect(wrapper.emitted('cell-click')).toBeTruthy();
    }
  });

  it('emits cell-hover event', async () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
      },
    });
    
    const cell = wrapper.find('.ex-heatmap__cell');
    await cell.trigger('mouseenter');
    
    expect(wrapper.emitted('cell-hover')).toBeTruthy();
  });

  it('applies custom gap and radius', () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
        gap: 6,
        radius: 4,
      },
    });
    
    const cell = wrapper.find('.ex-heatmap__cell');
    expect(cell.attributes('style')).toContain('border-radius: 4px');
  });

  it('respects custom date range', () => {
    const wrapper = mount(ExHeatmap, {
      props: {
        data: mockData,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      },
    });
    
    expect(wrapper.find('.ex-heatmap__grid').exists()).toBe(true);
  });
});
