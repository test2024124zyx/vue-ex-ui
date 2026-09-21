// 四个适配器共享业务数据和操作，避免不同算法污染组件性能比较。
export const CONFIG = Object.freeze({
  totalRows: 1000,
  virtualRows: 10000,
  pageSize: 100,
  fieldCount: 24,
  minimumFieldLength: 3,
  amountIncrement: 100,
  batchSize: 100,
  viewportHeight: 480,
  tableWidth: 1120,
  rowHeight: 48,
  optionCount: 1000,
  cycles: 30,
});

export function makeRows(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    customer: `客户 ${String(index + 1).padStart(5, '0')}`,
    region: ['华东', '华南', '华北', '西南'][index % 4],
    amount: ((index * 7919) % 100003) + 100,
    status: ['待处理', '处理中', '已完成'][index % 3],
    owner: `负责人 ${index % 20}`,
    date: `2026-09-${String((index % 28) + 1).padStart(2, '0')}`,
    priority: ['高', '中', '低'][index % 3],
  }));
}

export function selectRows(source, { query = '', sort = '', page = 1, pageSize = 0 }) {
  let rows = query ? source.filter(row => row.customer.includes(query)) : source;
  if (sort) rows = [...rows].sort((a, b) => sort === 'asc' ? a.amount - b.amount : b.amount - a.amount);
  const total = rows.length;
  return { total, rows: pageSize ? rows.slice((page - 1) * pageSize, page * pageSize) : rows };
}

export function updateRows(rows, count) {
  return rows.map((row, index) => index < count ? { ...row, amount: row.amount + CONFIG.amountIncrement } : row);
}

export function makeFields(valid) {
  return Object.fromEntries(Array.from({ length: CONFIG.fieldCount }, (_, index) => [
    `field${index}`, valid ? `业务资料 ${index}` : '',
  ]));
}

export function summarize(values) {
  if (!values.length) return { count: 0, median: null, p95: null, min: null, max: null };
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return {
    count: sorted.length,
    median: sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2,
    p95: sorted[Math.ceil(sorted.length * 0.95) - 1],
    min: sorted[0],
    max: sorted.at(-1),
  };
}
