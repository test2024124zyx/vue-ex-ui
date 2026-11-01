import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ExTable from '../../../src/components/table/ExTable.vue';

const wrappers: Array<{ unmount(): void }> = [];
afterEach(() => wrappers.splice(0).forEach(wrapper => wrapper.unmount()));

describe('表格列拖动属于当前实例和当前会话', () => {
  it.each([false, true])('自定义格式丢失=%s 时仍隔离跨表、过期和禁用来源', async missing => {
    const props = {
      data: [],
      columns: [
        { key: 'a', title: '甲' },
        { key: 'b', title: '乙' },
      ],
      reorderableColumns: true,
    };
    const first = mount(ExTable, { props, attachTo: document.body });
    const second = mount(ExTable, { props, attachTo: document.body });
    wrappers.push(first, second);
    const data = new Map<string, string>();
    const transfer = {
      setData: (type: string, value: string) => data.set(type, value),
      getData: (type: string) => (missing && type !== 'text/plain' ? '' : (data.get(type) ?? '')),
    };
    const start = () =>
      first
        .findAll('.ex-table-column-controls__drag')[1]!
        .trigger('dragstart', { dataTransfer: transfer });
    const drop = (table: typeof first) =>
      table
        .findAll('.ex-table-column-controls__drag')[0]!
        .trigger('drop', { dataTransfer: transfer });
    await start();
    await drop(second);
    expect(second.emitted('update:columnOrder')).toBeUndefined();
    await drop(first);
    expect(first.emitted('update:columnOrder')).toEqual([[['b', 'a']]]);
    await drop(first);
    expect(first.emitted('update:columnOrder')).toHaveLength(1);
    await start();
    document.dispatchEvent(new Event('dragstart', { bubbles: true }));
    await drop(first);
    expect(first.emitted('update:columnOrder')).toHaveLength(1);
    await start();
    await first.setProps({ loading: true });
    await first.setProps({ loading: false });
    await drop(first);
    expect(first.emitted('update:columnOrder')).toHaveLength(1);
  });
});
