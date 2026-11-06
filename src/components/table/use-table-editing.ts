import { computed, nextTick, onBeforeUnmount, shallowReactive, toRaw, watch } from 'vue';
import type { ComputedRef } from 'vue';
import { deepClone } from '../../utils/clone';
import { useLocale } from '../../locale';
import { equalEditSnapshot, TableEditConflictError } from './table-editing-state';
import type { TableColumn, TableDataItem } from './types';
import type {
  TableEditContext,
  TableEditErrors,
  TableEditingEmits,
  TableEditingProps,
  TableRowEditState,
} from './table-editing-types';

interface EditingOptions extends TableEditingProps {
  data: TableDataItem[];
  columns: TableColumn[];
  rowKey?: string;
  childrenKey?: string;
  tree?: boolean;
  loading?: boolean;
}

interface EditSession {
  source: TableDataItem;
  original: TableDataItem;
  index: number;
  state: TableRowEditState;
  controller?: AbortController;
}

type EditEmit = <K extends keyof TableEditingEmits>(
  event: K,
  ...args: TableEditingEmits[K]
) => void;
const UNSAFE_FIELDS = new Set(['__proto__', 'prototype', 'constructor']);

/** 根层保持可写，深层内容与父级隔离，兼容被冻结的不可变记录。 */
const cloneRecord = (record: TableDataItem): TableDataItem => ({ ...deepClone(record) });

/** 使用后序遍历复制目标的祖先链，其他行保持引用，避免破坏不可变缓存。 */
function replaceRecord(
  data: TableDataItem[],
  source: TableDataItem,
  replacement: TableDataItem,
  childrenKey: string | undefined
) {
  const replacements = new Map<TableDataItem, TableDataItem>([[source, replacement]]);
  if (childrenKey) {
    const visited = new Set<TableDataItem>();
    const order: TableDataItem[] = [];
    const pending = [...data];
    while (pending.length) {
      const record = pending.pop()!;
      if (visited.has(record)) continue;
      visited.add(record);
      order.push(record);
      const children = record[childrenKey];
      if (Array.isArray(children)) pending.push(...children);
    }
    for (const record of order.reverse()) {
      if (record === source) continue;
      const children = record[childrenKey];
      if (!Array.isArray(children)) continue;
      if (children.some(child => replacements.has(child))) {
        replacements.set(record, {
          ...record,
          [childrenKey]: children.map(child => replacements.get(child) ?? child),
        });
      }
    }
  }
  return data.map(record => replacements.get(record) ?? record);
}

/** 按行隔离编辑事务；校验、提交、取消和外部数据更新共同约束结果有效期。 */
export function useTableEditing(
  props: EditingOptions,
  emit: EditEmit,
  rows: ComputedRef<Array<{ record: TableDataItem; sourceIndex: number }>>,
  getRowKey: (record: TableDataItem, index: number) => string | number
) {
  const { t } = useLocale('table');
  const sessions = shallowReactive(new Map<string | number, EditSession>());
  let commitQueue: Promise<void> = Promise.resolve();
  const recordIndices = computed(
    () => new Map(rows.value.map(row => [toRaw(row.record), row.sourceIndex]))
  );
  const columns = computed(() => {
    const result = new Map<string, TableColumn>();
    const pending = [...props.columns];
    const visited = new Set<TableColumn>();
    while (pending.length) {
      const column = pending.pop()!;
      if (visited.has(column)) continue;
      visited.add(column);
      if (column.children?.length) pending.push(...column.children);
      else result.set(column.key, column);
    }
    return result;
  });
  const indexFor = (record: TableDataItem, index?: number) =>
    recordIndices.value.get(toRaw(record)) ?? index ?? -1;
  const sessionFor = (record: TableDataItem, index?: number) => {
    // 普通只读表格不构建编辑索引，保留大数据渲染的轻量路径。
    if (sessions.size === 0) return undefined;
    const session = sessions.get(getRowKey(record, indexFor(record, index)));
    return session && toRaw(session.source) === toRaw(record) ? session : undefined;
  };
  const canEditCell = (record: TableDataItem, column: TableColumn, index: number) => {
    const configured = columns.value.get(column.key);
    const field = configured?.dataIndex || configured?.key;
    if (!props.editable || !field || UNSAFE_FIELDS.has(field) || field === (props.rowKey ?? 'key'))
      return false;
    if (props.tree && field === (props.childrenKey ?? 'children')) return false;
    return typeof configured?.editable === 'function'
      ? configured.editable(record, index)
      : configured?.editable === true;
  };
  const canEditRow = (record: TableDataItem, index?: number) => {
    const sourceIndex = indexFor(record, index);
    return (
      props.editable === true &&
      !props.loading &&
      recordIndices.value.has(toRaw(record)) &&
      props.isRowEditable?.(record, sourceIndex) !== false &&
      [...columns.value.values()].some(column => canEditCell(record, column, sourceIndex))
    );
  };
  const cancelRowEdit = (record: TableDataItem, index?: number) => {
    const session = sessionFor(record, index);
    if (!session) return false;
    const key = getRowKey(record, session.index);
    session.controller?.abort();
    sessions.delete(key);
    emit('edit-cancel', key);
    return true;
  };
  const startRowEdit = (record: TableDataItem, index?: number) => {
    const sourceIndex = indexFor(record, index);
    if (!canEditRow(record, sourceIndex)) return false;
    if (sessionFor(record, sourceIndex)) return true;
    const key = getRowKey(record, sourceIndex);
    sessions.set(key, {
      source: rows.value.find(row => toRaw(row.record) === toRaw(record))!.record,
      original: deepClone(record),
      index: sourceIndex,
      state: shallowReactive({ draft: cloneRecord(record), errors: {}, saving: false }),
    });
    emit('edit-start', key, cloneRecord(record));
    return true;
  };
  const setEditValue = (
    record: TableDataItem,
    index: number,
    column: TableColumn,
    value: unknown
  ) => {
    const session = sessionFor(record, index);
    if (
      !session ||
      session.state.saving ||
      !canEditRow(record, index) ||
      !canEditCell(record, column, index)
    )
      return false;
    const configured = columns.value.get(column.key)!;
    if (
      configured.editor === 'number' &&
      value !== null &&
      (typeof value !== 'number' || !Number.isFinite(value))
    )
      return false;
    const field = configured.dataIndex || configured.key;
    session.state.draft = { ...session.state.draft, [field]: deepClone(value) };
    const errors = { ...session.state.errors };
    delete errors[field];
    delete errors.$row;
    session.state.errors = errors;
    return true;
  };
  const getEditState = (record: TableDataItem, index?: number) => sessionFor(record, index)?.state;
  const saveRowEdit = async (record: TableDataItem, index?: number): Promise<boolean> => {
    const session = sessionFor(record, index);
    if (!session || session.state.saving || !canEditRow(record, index)) return false;
    const key = getRowKey(record, session.index);
    const controller = new AbortController();
    session.controller = controller;
    session.state.saving = true;
    session.state.errors = {};
    const active = () => sessions.get(key) === session && !controller.signal.aborted;
    const context: TableEditContext = {
      key,
      index: session.index,
      original: cloneRecord(session.original),
      signal: controller.signal,
    };
    const assertUnchanged = () => {
      if (!equalEditSnapshot(session.source, session.original)) throw new TableEditConflictError();
    };
    try {
      assertUnchanged();
      const errors = await props.validateEdit?.(cloneRecord(session.state.draft), context);
      if (!active()) return false;
      assertUnchanged();
      if (errors && Object.keys(errors).length) {
        const safeErrors: TableEditErrors = {};
        for (const [field, message] of Object.entries(errors)) {
          if (!UNSAFE_FIELDS.has(field) && typeof message === 'string' && message)
            safeErrors[field] = message;
        }
        if (Object.keys(safeErrors).length) {
          session.state.errors = safeErrors;
          return false;
        }
      }
      const saved = await props.saveEdit?.(cloneRecord(session.state.draft), context);
      if (!active()) return false;
      assertUnchanged();
      if (
        saved !== undefined &&
        (saved === null || typeof saved !== 'object' || Array.isArray(saved))
      )
        throw new Error('编辑提交必须返回记录对象或 undefined');
      const replacement = cloneRecord(saved ?? session.state.draft);
      if (getRowKey(replacement, session.index) !== key) throw new Error('编辑提交不能改变行标识');
      let committed = false;
      const commit = async () => {
        // 同批保存逐个等待父级回写，下一行始终基于最新记录合成，避免覆盖前一行。
        await nextTick();
        if (!active()) return;
        assertUnchanged();
        const data = replaceRecord(
          props.data,
          session.source,
          replacement,
          props.tree ? (props.childrenKey ?? 'children') : undefined
        );
        sessions.delete(key);
        emit('update:data', data);
        emit('edit-save', { key, record: replacement, original: cloneRecord(session.original) });
        committed = true;
        await nextTick();
      };
      const pending = commitQueue.then(commit);
      commitQueue = pending.catch(() => undefined);
      await pending;
      return committed;
    } catch (error) {
      if (active()) {
        session.state.errors = {
          $row: t(error instanceof TableEditConflictError ? 'editConflict' : 'editError'),
        };
        emit('edit-error', error, key);
      }
      return false;
    } finally {
      if (active()) session.state.saving = false;
    }
  };
  watch(
    [recordIndices, () => props.editable],
    () => {
      for (const session of sessions.values()) {
        if (!props.editable || !recordIndices.value.has(toRaw(session.source)))
          cancelRowEdit(session.source, session.index);
      }
    },
    { flush: 'sync' }
  );
  watch(
    [() => props.saveEdit, () => props.validateEdit],
    () => {
      for (const session of sessions.values()) {
        session.controller?.abort();
        session.state.saving = false;
      }
    },
    { flush: 'sync' }
  );
  onBeforeUnmount(() => {
    for (const session of sessions.values()) session.controller?.abort();
    sessions.clear();
  });
  return {
    getEditState,
    canEditRow,
    canEditCell,
    startRowEdit,
    setEditValue,
    saveRowEdit,
    cancelRowEdit,
  };
}
