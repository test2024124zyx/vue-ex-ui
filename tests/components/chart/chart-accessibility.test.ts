import { describe, expect, it } from 'vitest';
import { getChartNavigationItems } from '../../../src/components/chart/chart-accessibility';

describe('图表可访问数据解析', () => {
  it('从分类轴、系列名称和数据对象读取真实语义，跳过空值与隐藏系列', () => {
    expect(
      getChartNavigationItems({
        xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
        legend: { selected: { hidden: false } },
        series: [
          { type: 'line', name: 'Sales', data: [12, { name: 'special', value: 30 }, null] },
          { name: 'hidden', data: [100] },
        ],
      })
    ).toEqual([
      expect.objectContaining({ seriesIndex: 0, dataIndex: 0, label: 'Sales, Mon', value: 12 }),
      expect.objectContaining({ seriesIndex: 0, dataIndex: 1, label: 'Sales, special', value: 30 }),
    ]);
  });

  it('二维 dataset 默认使用表头和每个系列对应的数据列', () => {
    const items = getChartNavigationItems({
      dataset: {
        source: [
          ['product', 'sales', 'cost'],
          ['A', 10, 4],
          ['B', 20, 8],
        ],
      },
      xAxis: { type: 'category' },
      series: [{ type: 'bar' }, { type: 'line' }],
    });
    expect(items.map(({ label, value }) => ({ label, value }))).toEqual([
      { label: 'sales, A', value: 10 },
      { label: 'sales, B', value: 20 },
      { label: 'cost, A', value: 4 },
      { label: 'cost, B', value: 8 },
    ]);
  });

  it('对象行和列式数据支持具名 dimensions、encode 与 datasetId', () => {
    const items = getChartNavigationItems({
      dataset: [
        { id: 'rows', source: [{ date: 'Mon', count: 12 }], dimensions: ['date', 'count'] },
        { id: 'columns', source: { name: ['x', 'y'], value: [3, 5] } },
      ],
      series: [
        { type: 'bar', datasetId: 'rows', encode: { itemName: 'date', y: 'count' } },
        { type: 'pie', datasetId: 'columns', encode: { itemName: 'name', value: 'value' } },
      ],
    });
    expect(items.map(({ value }) => value)).toEqual([12, 3, 5]);
    expect(items[0]?.label).toContain('Mon');
    expect(items[2]?.label).toContain('y');
  });

  it('按行组织的 dataset 使用每行对应系列，不误读首列标题', () => {
    const items = getChartNavigationItems({
      dataset: {
        source: [
          ['product', 'A', 'B'],
          ['sales', 10, 20],
          ['cost', 4, 8],
        ],
      },
      series: [
        { type: 'bar', seriesLayoutBy: 'row' },
        { type: 'bar', seriesLayoutBy: 'row' },
      ],
    });
    expect(items.map(({ label, value }) => ({ label, value }))).toEqual([
      { label: 'sales, A', value: 10 },
      { label: 'sales, B', value: 20 },
      { label: 'cost, A', value: 4 },
      { label: 'cost, B', value: 8 },
    ]);
  });

  it('不将复杂 transform 或无法解释的对象伪造成数值数据', () => {
    expect(
      getChartNavigationItems({
        dataset: { transform: { type: 'filter' } },
        series: { type: 'custom' },
      })
    ).toEqual([]);
    expect(
      getChartNavigationItems({
        series: { type: 'scatter', data: [[1, 2], { value: [3, 4] }, { unknown: true }] },
      }).map(item => item.value)
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('自定义和层级系列不生成伪导航点，保留普通系列的原始索引', () => {
    expect(
      getChartNavigationItems({
        series: [
          { type: 'custom', data: [3] },
          { type: 'treemap', data: [{ name: 'parent', value: 4, children: [{ value: 4 }] }] },
          { type: 'line', data: [5] },
        ],
      })
    ).toEqual([expect.objectContaining({ seriesIndex: 2, dataIndex: 0, value: 5 })]);
  });

  it('分类名称按系列绑定的坐标轴索引和 ID 解析，不匹配无 ID 的第一个轴', () => {
    const items = getChartNavigationItems({
      xAxis: [
        { type: 'category', data: ['wrong'] },
        { id: 'right-axis', type: 'category', data: ['right'] },
      ],
      yAxis: [
        { type: 'category', data: ['wrong-y'] },
        { id: 'right-y', type: 'category', data: ['right-y'] },
      ],
      series: [
        { xAxisIndex: 1, data: [10] },
        { xAxisId: 'right-axis', data: [20] },
        { xAxisIndex: 99, yAxisIndex: 1, data: [30] },
      ],
    });
    expect(items.map(item => item.label)).toEqual(['right', 'right', 'right-y']);
  });

  it('横向条形图 encode.x 作为值、encode.y 作为分类，并支持单列数据集', () => {
    const horizontal = getChartNavigationItems({
      dataset: {
        source: [
          ['name', 'count'],
          ['A', 12],
        ],
      },
      xAxis: { type: 'value' },
      yAxis: { type: 'category' },
      series: { type: 'bar', encode: { x: 'count', y: 'name' } },
    });
    expect(horizontal[0]).toMatchObject({ label: 'count, A', value: 12 });
    expect(
      getChartNavigationItems({
        dataset: { source: [[5], [8]], sourceHeader: false },
        series: { type: 'line' },
      }).map(item => item.value)
    ).toEqual([5, 8]);
  });
});
