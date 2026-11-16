import { expectTypeOf, it } from 'vitest';
import type { TableSorter, TableSortInfo } from '../../../src/components/table/types';

it('公开排序器与排序事件使用同一组排序方向', () => {
  expectTypeOf<TableSorter['order']>().toEqualTypeOf<TableSortInfo['order']>();
  expectTypeOf<TableSortInfo['order']>().toEqualTypeOf<'asc' | 'desc' | null>();
});
