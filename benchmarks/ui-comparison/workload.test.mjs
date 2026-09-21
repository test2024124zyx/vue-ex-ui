import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG, makeRows, selectRows, updateRows, makeFields, summarize } from './workload.mjs';

test('数据集确定、主键唯一，业务字段完整', () => {
  const rows = makeRows(CONFIG.totalRows);
  assert.deepEqual(rows, makeRows(CONFIG.totalRows));
  assert.equal(new Set(rows.map(row => row.id)).size, CONFIG.totalRows);
  assert.deepEqual(Object.keys(rows[0]), ['id', 'customer', 'region', 'amount', 'status', 'owner', 'date', 'priority']);
  assert.deepEqual(makeRows(0), []);
});

test('搜索、排序和分页共同生效且不改变原始数据', () => {
  const rows = makeRows(CONFIG.totalRows);
  const original = structuredClone(rows);
  const matches = selectRows(rows, { query: '客户 000', sort: 'asc', page: 1, pageSize: 10 });
  assert.equal(matches.total, 99);
  assert.equal(matches.rows.length, 10);
  assert.ok(matches.rows.every((row, index) => index === 0 || row.amount >= matches.rows[index - 1].amount));
  const reverse = selectRows(rows, { query: '', sort: 'desc', page: 2, pageSize: 20 });
  assert.equal(reverse.rows.length, 20);
  assert.ok(reverse.rows[0].amount >= reverse.rows[19].amount);
  assert.equal(selectRows(rows, { query: '不存在', page: 1, pageSize: 10 }).total, 0);
  assert.equal(selectRows(rows, { query: '', page: 1, pageSize: 0 }).rows.length, CONFIG.totalRows);
  assert.deepEqual(rows, original);
});

test('批量更新恰好改变指定业务行并保留其余对象身份', () => {
  const rows = makeRows(100);
  const updated = updateRows(rows, 10);
  assert.equal(updated.filter((row, index) => row !== rows[index]).length, 10);
  assert.equal(updated[0].amount, rows[0].amount + CONFIG.amountIncrement);
  assert.equal(updated[10], rows[10]);
  assert.deepEqual(updateRows([], 10), []);
});

test('表单为空值与有效值时覆盖全部字段', () => {
  const empty = makeFields(false);
  const valid = makeFields(true);
  assert.equal(Object.keys(empty).length, CONFIG.fieldCount);
  assert.ok(Object.values(empty).every(value => value === ''));
  assert.ok(Object.values(valid).every(value => value.length >= CONFIG.minimumFieldLength));
});

test('统计保留样本数，中位数与最近秩 P95 适用于奇偶样本', () => {
  assert.deepEqual(summarize([]), { count: 0, median: null, p95: null, min: null, max: null });
  assert.deepEqual(summarize([8, 1, 3, 2]), { count: 4, median: 2.5, p95: 8, min: 1, max: 8 });
  assert.equal(summarize([9, 1, 3]).median, 3);
});
