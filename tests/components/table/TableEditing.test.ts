import { afterEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed, defineComponent, h, nextTick, reactive } from 'vue';
import type { TableColumn, TableDataItem } from '../../../src/components/table/types';
import type { TableEditingProps } from '../../../src/components/table/table-editing-types';
import { useTableEditing } from '../../../src/components/table/use-table-editing';

const cleanup: Array<() => void> = [];
afterEach(() => cleanup.splice(0).forEach(dispose => dispose()));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((accept, fail) => {
    resolve = accept;
    reject = fail;
  });
  return { promise, resolve, reject };
}

function create(overrides: TableEditingProps = {}, records?: TableDataItem[]) {
  const props = reactive({
    editable: true,
    data: records ?? [{ key: 'a', name: '甲', count: 1, extra: { enabled: true } }],
    columns: [
      { key: 'name', editable: true },
      { key: 'count', editable: true, editor: 'number' },
    ] as TableColumn[],
    rowKey: 'key',
    tree: true,
    childrenKey: 'children',
    ...overrides,
  });
  const emit = vi.fn((_event: string, ..._args: unknown[]) => {});
  let api!: ReturnType<typeof useTableEditing>;
  const wrapper = mount(
    defineComponent({
      setup() {
        const rows = computed(() => {
          const result: Array<{ record: TableDataItem; sourceIndex: number }> = [];
          const queue = [...props.data];
          for (const record of queue) {
            result.push({ record, sourceIndex: result.length });
            if (Array.isArray(record.children)) queue.push(...record.children);
          }
          return result;
        });
        api = useTableEditing(props, emit, rows, (record, index) => record.key ?? index);
        return () => h('div');
      },
    })
  );
  cleanup.push(() => wrapper.unmount());
  return { props, emit, api, wrapper };
}

describe('Table 行级草稿与受控提交', () => {
  it('草稿独立于原记录，保存发新数组并等待父级回写', async () => {
    const { props, api, emit } = create();
    const record = props.data[0]!;
    expect(api.startRowEdit(record, 0)).toBe(true);
    expect(api.setEditValue(record, 0, props.columns[0]!, '修改后')).toBe(true);
    expect(record.name).toBe('甲');
    expect(api.getEditState(record, 0)?.draft.extra).not.toBe(record.extra);
    expect(await api.saveRowEdit(record, 0)).toBe(true);
    const result = emit.mock.calls.find(
      ([event]) => event === 'update:data'
    )?.[1] as TableDataItem[];
    expect(result[0]?.name).toBe('修改后');
    expect(result[0]).not.toBe(record);
    expect(props.data[0]?.name).toBe('甲');
    expect(api.getEditState(record, 0)).toBeUndefined();
  });

  it('异步字段校验失败保留草稿，修正字段后可重试', async () => {
    const saveEdit = vi.fn();
    const { props, api } = create({
      validateEdit: draft => (draft.name === '' ? { name: '姓名必填' } : undefined),
      saveEdit,
    });
    const record = props.data[0]!;
    api.startRowEdit(record, 0);
    api.setEditValue(record, 0, props.columns[0]!, '');
    expect(await api.saveRowEdit(record, 0)).toBe(false);
    expect(api.getEditState(record, 0)?.errors.name).toBe('姓名必填');
    expect(saveEdit).not.toHaveBeenCalled();
    api.setEditValue(record, 0, props.columns[0]!, '有效');
    expect(api.getEditState(record, 0)?.errors.name).toBeUndefined();
    expect(await api.saveRowEdit(record, 0)).toBe(true);
  });

  it('保存失败显示通用错误且保留数据，重试接受服务端返回记录', async () => {
    const saveEdit = vi.fn().mockRejectedValueOnce(new Error('private endpoint detail'));
    saveEdit.mockResolvedValueOnce({ key: 'a', name: '服务端规范值', count: 3 });
    const { props, api, emit } = create({ saveEdit });
    const record = props.data[0]!;
    api.startRowEdit(record, 0);
    api.setEditValue(record, 0, props.columns[0]!, '草稿');
    expect(await api.saveRowEdit(record, 0)).toBe(false);
    expect(api.getEditState(record, 0)?.errors.$row).not.toContain('private endpoint');
    expect(api.getEditState(record, 0)?.draft.name).toBe('草稿');
    expect(await api.saveRowEdit(record, 0)).toBe(true);
    expect(emit.mock.calls.find(([event]) => event === 'update:data')?.[1]).toEqual([
      { key: 'a', name: '服务端规范值', count: 3 },
    ]);
  });

  it('同一行只允许一个提交，取消会中止请求且丢弃迟到成功', async () => {
    const task = deferred<void>();
    const saveEdit = vi.fn((_draft, _context) => task.promise);
    const { props, api, emit } = create({ saveEdit });
    const record = props.data[0]!;
    api.startRowEdit(record, 0);
    const first = api.saveRowEdit(record, 0);
    await nextTick();
    expect(await api.saveRowEdit(record, 0)).toBe(false);
    expect(api.cancelRowEdit(record, 0)).toBe(true);
    expect(saveEdit.mock.calls[0]?.[1].signal.aborted).toBe(true);
    task.resolve();
    expect(await first).toBe(false);
    expect(emit.mock.calls.some(([event]) => event === 'update:data')).toBe(false);
  });

  it('行被替换或组件卸载后，异步结果不能覆盖新数据', async () => {
    const task = deferred<void>();
    const { props, api, emit, wrapper } = create({ saveEdit: () => task.promise });
    const record = props.data[0]!;
    api.startRowEdit(record, 0);
    const result = api.saveRowEdit(record, 0);
    props.data = [{ key: 'a', name: '外部更新' }];
    await nextTick();
    wrapper.unmount();
    task.resolve();
    expect(await result).toBe(false);
    expect(emit.mock.calls.some(([event]) => event === 'update:data')).toBe(false);
    expect(props.data[0]?.name).toBe('外部更新');
  });

  it('树中编辑只替换目标及其祖先，保留其余记录引用', async () => {
    const { props, api, emit } = create({}, [
      { key: 'root', children: [{ key: 'child', name: '子节点' }] },
      { key: 'other', name: '其他' },
    ]);
    const child = (props.data[0]!.children as TableDataItem[])[0]!;
    api.startRowEdit(child, 2);
    api.setEditValue(child, 2, props.columns[0]!, '已修改');
    expect(await api.saveRowEdit(child, 2)).toBe(true);
    const output = emit.mock.calls.find(
      ([event]) => event === 'update:data'
    )?.[1] as TableDataItem[];
    expect(output[0]).not.toBe(props.data[0]);
    expect(output[1]).toBe(props.data[1]);
    expect((output[0]!.children as TableDataItem[])[0]?.name).toBe('已修改');
    expect(child.name).toBe('子节点');
  });

  it('禁止修改身份字段、原型键及非编辑列，拒绝非有限数字', () => {
    const { props, api } = create();
    const record = props.data[0]!;
    api.startRowEdit(record, 0);
    for (const key of ['key', '__proto__', 'constructor', 'prototype']) {
      expect(api.setEditValue(record, 0, { key, editable: true }, 'bad')).toBe(false);
    }
    expect(api.setEditValue(record, 0, { key: 'extra' }, 'bad')).toBe(false);
    expect(api.setEditValue(record, 0, props.columns[1]!, Number.POSITIVE_INFINITY)).toBe(false);
    expect(api.setEditValue(record, 0, props.columns[1]!, 'abc')).toBe(false);
    expect(api.setEditValue(record, 0, props.columns[1]!, {})).toBe(false);
    expect(api.setEditValue(record, 0, props.columns[1]!, null)).toBe(true);
    expect(record.key).toBe('a');
  });

  it('不可编辑行和加载状态阻止开始，冻结输入仍能编辑独立草稿', () => {
    const { props, api } = create({ isRowEditable: () => false });
    expect(api.startRowEdit(props.data[0]!, 0)).toBe(false);
    const frozen = Object.freeze({ key: 'frozen', name: '冻结' });
    const second = create({}, [frozen]);
    expect(second.api.startRowEdit(second.props.data[0]!, 0)).toBe(true);
    expect(
      second.api.setEditValue(second.props.data[0]!, 0, second.props.columns[0]!, '新值')
    ).toBe(true);
    expect(frozen.name).toBe('冻结');
  });

  it('多行同时保存时等待父级回写，后一个提交不能覆盖前一个结果', async () => {
    const first = deferred<void>();
    const second = deferred<void>();
    const { props, api, emit } = create(
      { saveEdit: draft => (draft.key === 'a' ? first.promise : second.promise) },
      [
        { key: 'a', name: '甲' },
        { key: 'b', name: '乙' },
      ]
    );
    emit.mockImplementation((event, ...args) => {
      // 模拟 Vue 父级回写在下一轮更新中传递到子组件。
      if (event === 'update:data')
        queueMicrotask(() => {
          props.data = args[0] as TableDataItem[];
        });
    });
    const a = props.data[0]!;
    const b = props.data[1]!;
    api.startRowEdit(a);
    api.startRowEdit(b);
    api.setEditValue(a, 0, props.columns[0]!, '甲已保存');
    api.setEditValue(b, 1, props.columns[0]!, '乙已保存');
    const saves = [api.saveRowEdit(a), api.saveRowEdit(b)];
    first.resolve();
    second.resolve();
    expect(await Promise.all(saves)).toEqual([true, true]);
    await nextTick();
    expect(props.data.map(record => record.name)).toEqual(['甲已保存', '乙已保存']);
  });

  it('保存处理器替换后使旧请求失效，但保留草稿供新处理器重试', async () => {
    const task = deferred<void>();
    const { props, api, emit } = create({ saveEdit: () => task.promise });
    const record = props.data[0]!;
    api.startRowEdit(record);
    api.setEditValue(record, 0, props.columns[0]!, '未丢失草稿');
    const old = api.saveRowEdit(record);
    await nextTick();
    props.saveEdit = async () => undefined;
    await nextTick();
    task.resolve();
    expect(await old).toBe(false);
    expect(emit.mock.calls.some(([event]) => event === 'update:data')).toBe(false);
    expect(api.getEditState(record)?.draft.name).toBe('未丢失草稿');
    expect(await api.saveRowEdit(record)).toBe(true);
  });
});
