import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, markRaw, nextTick, reactive, ref } from 'vue';
import ExTable from '../../../src/components/table/ExTable.vue';

describe('ExTable 显式不可变数据模式', () => {
  it('替换一行时只重算该行，默认模式仍能识别原地修改后换数组', async () => {
    const rows = Array.from({ length: 100 }, (_, key) => markRaw({ key, amount: key }));
    const render = vi.fn(value => `金额 ${value}`);
    const wrapper = mount(ExTable, {
      props: { columns: [{ key: 'amount', render }], data: rows, immutable: true },
    });
    expect(render).toHaveBeenCalledTimes(rows.length);
    render.mockClear();
    const changed = rows.map(row => (row.key === 5 ? { ...row, amount: 200 } : row));
    await wrapper.setProps({ data: changed });
    expect(render).toHaveBeenCalledTimes(1);
    expect(wrapper.findAll('tbody td')[5]?.text()).toBe('金额 200');
    await wrapper.setProps({ immutable: false });
    rows[0]!.amount = 300;
    await wrapper.setProps({ data: [...changed] });
    expect(wrapper.findAll('tbody td')[0]?.text()).toBe('金额 300');
    await wrapper.setProps({ immutable: true });
    render.mockClear();
    await wrapper.setProps({ data: [...changed] });
    expect(render).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('缓存仍追踪格式化器的外部响应式依赖，事件使用最新业务状态', async () => {
    const selected = ref(-1);
    const records = [markRaw({ key: 1 }), markRaw({ key: 2 })];
    const render = vi.fn((_value, record) =>
      h(
        'button',
        {
          onClick: () => {
            selected.value = record.key;
          },
        },
        selected.value === record.key ? '已选' : '未选'
      )
    );
    const wrapper = mount(ExTable, {
      props: { columns: [{ key: 'key', render }], data: records, immutable: true },
    });
    await wrapper.findAll('tbody button')[1]!.trigger('click');
    expect(wrapper.findAll('tbody button').map(button => button.text())).toEqual(['未选', '已选']);
    await wrapper.findAll('tbody button')[0]!.trigger('click');
    expect(wrapper.findAll('tbody button').map(button => button.text())).toEqual(['已选', '未选']);
    render.mockClear();
    await wrapper.setProps({ data: [...records] });
    expect(render).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('行换位、字段切换和渲染函数替换会使对应缓存失效', async () => {
    const rows = [markRaw({ key: 1, a: 10, b: 20 }), markRaw({ key: 2, a: 30, b: 40 })];
    const columns = reactive([
      {
        key: 'value',
        dataIndex: 'a',
        render: (value: unknown, _row: unknown, index: number) => `${index}:${value}`,
      },
    ]);
    const wrapper = mount(ExTable, { props: { columns, data: rows, immutable: true } });
    await wrapper.setProps({ data: [...rows].reverse() });
    expect(wrapper.findAll('tbody td').map(cell => cell.text())).toEqual(['0:30', '1:10']);
    columns[0]!.dataIndex = 'b';
    await nextTick();
    expect(wrapper.findAll('tbody td').map(cell => cell.text())).toEqual(['0:40', '1:20']);
    columns[0]!.render = value => `新 ${value}`;
    await nextTick();
    expect(wrapper.findAll('tbody td').map(cell => cell.text())).toEqual(['新 40', '新 20']);
    wrapper.unmount();
  });

  it('移除的行不会永久保留缓存，重新插入时读取新闭包值', async () => {
    const rows = [markRaw({ key: 1, amount: 10 }), markRaw({ key: 2, amount: 20 })];
    let suffix = '元';
    const render = vi.fn(value => `${value}${suffix}`);
    const wrapper = mount(ExTable, {
      props: { columns: [{ key: 'amount', render }], data: rows, immutable: true },
    });
    await wrapper.setProps({ data: [rows[0]!] });
    suffix = '分';
    render.mockClear();
    await wrapper.setProps({ data: [...rows] });
    expect(wrapper.findAll('tbody td').map(cell => cell.text())).toEqual(['10元', '20分']);
    expect(render).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });

  it('不可变模式兼容响应式记录以及动态插槽', async () => {
    const rows = reactive([{ key: 1, amount: 10 }]);
    const suffix = ref('元');
    const wrapper = mount(ExTable, {
      props: {
        columns: [{ key: 'amount', render: value => Number(value) * 2 }],
        data: rows,
        immutable: true,
      },
      slots: {
        'cell-amount': ({ value }: { value: unknown }) => h('span', `${value}${suffix.value}`),
      },
    });
    rows[0]!.amount = 20;
    suffix.value = '分';
    await nextTick();
    expect(wrapper.get('tbody td').text()).toBe('40分');
    wrapper.unmount();
  });
});
