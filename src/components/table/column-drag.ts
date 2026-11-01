import { onBeforeUnmount, provide, shallowRef, watch } from 'vue';
import { createSharedInjectionKey } from '../../utils/shared-runtime';
import { generateId } from '../../utils/id';
import type { TableColumn } from './types';

const SESSION_TYPE = 'application/x-ex-ui-table-column-session';
interface ColumnDragScope {
  start(key: string, event: DragEvent): void;
  consume(event: DragEvent): string | undefined;
  clear(): void;
}
export const TABLE_COLUMN_DRAG_KEY = createSharedInjectionKey<ColumnDragScope>('table-column-drag');

/** 来源归属于当前表格，内存会话兼容 WebKit 丢失自定义拖动格式的情况。 */
export function provideTableColumnDrag(
  sourceFor: (key: string) => TableColumn | undefined,
  canReorder: (column: TableColumn) => boolean
) {
  const session = shallowRef<{ source: TableColumn; token: string }>();
  const clear = () => {
    session.value = undefined;
    if (typeof document === 'undefined') return;
    document.removeEventListener('dragstart', clear, true);
    document.removeEventListener('dragend', clear, true);
  };
  provide(TABLE_COLUMN_DRAG_KEY, {
    clear,
    start(key, event) {
      clear();
      const source = sourceFor(key);
      if (!source || !canReorder(source) || !event.dataTransfer) return;
      const token = generateId('table-column-drag');
      session.value = { source, token };
      event.dataTransfer.setData(SESSION_TYPE, token);
      event.dataTransfer.setData('text/plain', key);
      document.addEventListener('dragstart', clear, true);
      document.addEventListener('dragend', clear, true);
    },
    consume(event) {
      const current = session.value;
      clear();
      if (!current || !event.dataTransfer) return;
      const token = event.dataTransfer.getData(SESSION_TYPE);
      const key = event.dataTransfer.getData('text/plain');
      if ((token && token !== current.token) || (key && key !== current.source.key)) return;
      return current.source.key;
    },
  });
  watch(
    () =>
      !session.value ||
      (sourceFor(session.value.source.key) === session.value.source &&
        canReorder(session.value.source)),
    valid => {
      if (!valid) clear();
    },
    { flush: 'sync' }
  );
  onBeforeUnmount(clear);
}
