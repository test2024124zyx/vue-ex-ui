import { describe, expect, it } from 'vitest';
import { getChartTheme } from '../../../src/components/chart/utils';
import { mergeChartComponent } from '../../../src/components/chart/chart-runtime';

it('控件补齐局部样式，工具功能保留调用方声明的集合', () => {
  const defaults = {
    feature: { restore: {}, dataView: {} },
    emphasis: { iconStyle: { borderColor: 'blue' } },
  };
  const custom = { feature: { restore: {} }, emphasis: { iconStyle: { borderWidth: 3 } } };
  expect(mergeChartComponent(custom, defaults, true)).toEqual({
    feature: { restore: {} },
    emphasis: { iconStyle: { borderColor: 'blue', borderWidth: 3 } },
    show: true,
  });
});

describe('图表坐标轴主题', () => {
  it.each(['light', 'neon-blue'] as const)('%s 的全部坐标轴、图例与网格使用主题色', theme => {
    const result = getChartTheme(theme, {
      text: '#123456',
      mutedText: '#456789',
      border: '#abcdef',
    });
    for (const axis of ['categoryAxis', 'valueAxis', 'logAxis', 'timeAxis']) {
      expect(result).toHaveProperty(axis, {
        axisLine: { lineStyle: { color: '#abcdef' } },
        axisTick: { lineStyle: { color: '#abcdef' } },
        axisLabel: { color: '#456789' },
        nameTextStyle: { color: '#456789' },
        splitLine: { lineStyle: { color: '#abcdef' } },
      });
    }
    expect(result).toHaveProperty('legend.textStyle.color', '#123456');
  });
});
