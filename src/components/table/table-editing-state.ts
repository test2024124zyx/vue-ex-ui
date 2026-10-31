// 保留表格内部兼容名称，表单与编辑事务共用同一套值快照比较规则。
export { equalValueSnapshot as equalEditSnapshot } from '../../utils/value-snapshot';

/** 外部更新冲突只能由调用方重新编辑解决，不覆盖新记录。 */
export class TableEditConflictError extends Error {
  constructor() {
    super('记录已在编辑期间更新');
    this.name = 'TableEditConflictError';
  }
}
