import type { ChartOption } from './types';

export interface ChartNavigationItem {
  seriesIndex: number;
  dataIndex: number;
  label: string;
  value: string | number | Array<string | number>;
  seriesName?: string;
  seriesType?: string;
  name?: string;
}

type RecordValue = Record<string, unknown>;
const record = (value: unknown): RecordValue =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as RecordValue) : {};
const components = (value: unknown): RecordValue[] =>
  value === undefined ? [] : (Array.isArray(value) ? value : [value]).map(record);
const scalar = (value: unknown): value is string | number =>
  typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value));
// 自定义、层级和依赖特殊布局的系列无法仅由公开 option 还原可操作索引。
const NAVIGABLE_SERIES_TYPES = new Set([
  'line',
  'bar',
  'pie',
  'scatter',
  'effectScatter',
  'candlestick',
  'radar',
  'funnel',
  'gauge',
]);

function readableValue(value: unknown): ChartNavigationItem['value'] | undefined {
  if (scalar(value)) return value;
  if (Array.isArray(value)) {
    const values = value.filter(scalar);
    return values.length ? values : undefined;
  }
  return undefined;
}

interface DatasetRows {
  dimensions: string[];
  rows: unknown[][];
}

/** 从公开 dataset.source 还原列，复杂 transform 不猜测处理后的数据。 */
function datasetRows(dataset: RecordValue, byRow: boolean): DatasetRows {
  const source = dataset.source;
  const declared = Array.isArray(dataset.dimensions)
    ? dataset.dimensions.map(value =>
        typeof value === 'string' ? value : String(record(value).name ?? '')
      )
    : [];
  if (Array.isArray(source) && source.length && !Array.isArray(source[0])) {
    const dimensions = declared.length ? declared : Object.keys(record(source[0]));
    return { dimensions, rows: source.map(row => dimensions.map(name => record(row)[name])) };
  }
  if (!Array.isArray(source)) {
    const columns = record(source);
    const dimensions = declared.length ? declared : Object.keys(columns);
    const length = dimensions.reduce(
      (max, name) => Math.max(max, Array.isArray(columns[name]) ? columns[name].length : 0),
      0
    );
    return {
      dimensions,
      rows: Array.from({ length }, (_, index) =>
        dimensions.map(name => (columns[name] as unknown[] | undefined)?.[index])
      ),
    };
  }
  let rows = source.filter(Array.isArray) as unknown[][];
  if (byRow) {
    const length = rows.reduce((max, row) => Math.max(max, row.length), 0);
    rows = Array.from({ length }, (_, index) => rows.map(row => row[index]));
  }
  const first = rows[0] ?? [];
  const header =
    dataset.sourceHeader === true ||
    (dataset.sourceHeader !== false &&
      first.length > 0 &&
      first.every(value => typeof value === 'string'));
  return {
    dimensions: declared.length
      ? declared
      : header
        ? first.map(String)
        : first.map((_, index) => String(index)),
    rows: header ? rows.slice(1) : rows,
  };
}

function readDimension(
  row: unknown[],
  dimensions: string[],
  specification: unknown,
  fallback: number
): unknown {
  if (Array.isArray(specification)) {
    return specification.map(value => readDimension(row, dimensions, value, fallback));
  }
  const index =
    typeof specification === 'number'
      ? specification
      : typeof specification === 'string'
        ? dimensions.indexOf(specification)
        : fallback;
  return index >= 0 ? row[index] : undefined;
}

function boundCategoryAxis(
  option: ChartOption,
  series: RecordValue
): { axis: RecordValue; direction: 'x' | 'y' } | undefined {
  for (const direction of ['x', 'y'] as const) {
    const axes = components(option[`${direction}Axis`]);
    const id = series[`${direction}AxisId`];
    const index = series[`${direction}AxisIndex`];
    const axis =
      id !== undefined
        ? axes.find(candidate => candidate.id !== undefined && String(candidate.id) === String(id))
        : axes[typeof index === 'number' ? index : 0];
    if (axis && (axis.type === 'category' || Array.isArray(axis.data))) return { axis, direction };
  }
  return undefined;
}

/** 仅使用 ECharts 公开 getOption() 返回的数据，输出有真实索引的键盘导航项。 */
export function getChartNavigationItems(option: ChartOption): ChartNavigationItem[] {
  const series = components(option.series);
  const datasets = components(option.dataset);
  const hiddenNames = new Set(
    components(option.legend).flatMap(legend =>
      Object.entries(record(legend.selected))
        .filter(([, selected]) => selected === false)
        .map(([name]) => name)
    )
  );
  const datasetSeriesCounts = new Map<string, number>();
  const items: ChartNavigationItem[] = [];

  series.forEach((entry, seriesIndex) => {
    const explicitName = typeof entry.name === 'string' ? entry.name : '';
    const seriesType = typeof entry.type === 'string' ? entry.type : undefined;
    if (seriesType && !NAVIGABLE_SERIES_TYPES.has(seriesType)) return;
    const category = boundCategoryAxis(option, entry);
    const append = (dataIndex: number, name: unknown, raw: unknown, seriesName = explicitName) => {
      if (hiddenNames.has(seriesName)) return;
      const value = readableValue(raw);
      if (value === undefined) return;
      const pointName = scalar(name) ? String(name) : '';
      items.push({
        seriesIndex,
        dataIndex,
        value,
        seriesName,
        seriesType,
        name: pointName,
        label: [seriesName, pointName].filter(Boolean).join(', '),
      });
    };

    if (Array.isArray(entry.data)) {
      const categoryAxis = category?.axis;
      const labels = Array.isArray(categoryAxis?.data) ? categoryAxis.data : [];
      entry.data.forEach((datum, dataIndex) => {
        const fields = record(datum);
        const category = record(labels[dataIndex]).value ?? labels[dataIndex];
        const raw = Object.prototype.hasOwnProperty.call(fields, 'value') ? fields.value : datum;
        const tupleName = Array.isArray(raw) && typeof raw[0] === 'string' ? raw[0] : undefined;
        append(dataIndex, fields.name ?? category ?? tupleName, raw);
      });
      return;
    }

    const datasetIndex =
      typeof entry.datasetId === 'string'
        ? datasets.findIndex(dataset => dataset.id === entry.datasetId)
        : typeof entry.datasetIndex === 'number'
          ? entry.datasetIndex
          : 0;
    const dataset = datasets[datasetIndex];
    if (!dataset || dataset.transform) return;
    const layoutKey = `${datasetIndex}:${entry.seriesLayoutBy === 'row'}`;
    const ordinal = datasetSeriesCounts.get(layoutKey) ?? 0;
    datasetSeriesCounts.set(layoutKey, ordinal + 1);
    const { dimensions, rows } = datasetRows(dataset, entry.seriesLayoutBy === 'row');
    const encode = record(entry.encode);
    const defaultDimension = (rows[0]?.length ?? 0) > 1 ? ordinal + 1 : 0;
    const valueDimension =
      encode.value ??
      (category?.direction === 'y' ? encode.x : encode.y) ??
      encode.radius ??
      defaultDimension;
    const dimensionIndex =
      typeof valueDimension === 'number'
        ? valueDimension
        : dimensions.indexOf(String(valueDimension));
    const seriesName = explicitName || dimensions[dimensionIndex] || '';
    rows.forEach((row, dataIndex) => {
      const name = readDimension(
        row,
        dimensions,
        encode.itemName ?? (category?.direction === 'y' ? encode.y : encode.x),
        0
      );
      const value = readDimension(row, dimensions, valueDimension, defaultDimension);
      append(dataIndex, name, value, seriesName);
    });
  });
  return items;
}
