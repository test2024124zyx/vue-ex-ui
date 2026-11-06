import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick, reactive, ref, toDisplayString } from 'vue';
import ExTable from '../../../src/components/table/ExTable.vue';

describe('表格内容的轻量渲染与兼容边界', () => {
  it('纯文本数据不按单元格创建额外组件实例', () => {
    const wrapper = mount(ExTable, {
      props: {
        columns: [{ key: 'name' }, { key: 'amount' }],
        data: Array.from({ length: 100 }, (_, key) => ({ key, name: `订单 ${key}`, amount: key })),
      },
    });
    expect(wrapper.findAll('tbody td')).toHaveLength(200);
    expect(wrapper.findAllComponents({ name: 'CellContent' })).toHaveLength(0);
    wrapper.unmount();
  });

  it('数字、对象、空值和混合数组沿用 Vue 文本展示语义并转义 HTML', () => {
    const values = [
      0,
      false,
      null,
      undefined,
      '<img src=x onerror=alert(1)>',
      { value: 1 },
      [1, '二'],
    ];
    const wrapper = mount(ExTable, {
      props: {
        columns: [{ key: 'value' }],
        data: values.map((value, key) => ({ key, value })),
      },
    });
    expect(wrapper.findAll('tbody td').map(cell => cell.text())).toEqual(
      values.map(toDisplayString)
    );
    expect(wrapper.find('tbody img').exists()).toBe(false);
    wrapper.unmount();
  });

  it('格式化结果在文本、VNode 和 VNode 数组之间切换时正确更新事件和标题', async () => {
    const clicked = vi.fn();
    const rows = reactive([{ key: 1, mode: 'text' }]);
    const wrapper = mount(ExTable, {
      props: {
        columns: [
          {
            key: 'mode',
            ellipsis: true,
            render: value =>
              value === 'text'
                ? '订单文字'
                : value === 'node'
                  ? h('button', { onClick: clicked }, '编辑')
                  : [h('b', '金额'), h('i', '10')],
          },
        ],
        data: rows,
      },
    });
    expect(wrapper.get('tbody td').attributes('title')).toBe('订单文字');
    rows[0]!.mode = 'node';
    await nextTick();
    await wrapper.get('tbody button').trigger('click');
    expect(clicked).toHaveBeenCalledTimes(1);
    expect(wrapper.get('tbody td').attributes('title')).toBeUndefined();
    rows[0]!.mode = 'array';
    await nextTick();
    expect(wrapper.get('tbody b').text()).toBe('金额');
    expect(wrapper.get('tbody i').text()).toBe('10');
    rows[0]!.mode = 'text';
    await nextTick();
    expect(wrapper.get('tbody td').text()).toBe('订单文字');
    expect(wrapper.find('tbody button').exists()).toBe(false);
    wrapper.unmount();
  });

  it('动态新增、清空和移除插槽时仍显示正确的内容与回退值', async () => {
    const enabled = ref(false);
    const empty = ref(false);
    const suffix = ref('甲');
    const data = [{ key: 1, amount: 20 }];
    const columns = [{ key: 'amount', render: (value: unknown) => `金额 ${value}` }];
    const wrapper = mount(() =>
      h(
        ExTable,
        { data, columns, immutable: true },
        enabled.value
          ? { 'cell-amount': () => (empty.value ? [] : h('b', `自定义 ${suffix.value}`)) }
          : {}
      )
    );
    expect(wrapper.get('tbody td').text()).toBe('金额 20');
    enabled.value = true;
    await nextTick();
    expect(wrapper.get('tbody b').text()).toBe('自定义 甲');
    suffix.value = '乙';
    await nextTick();
    expect(wrapper.get('tbody b').text()).toBe('自定义 乙');
    empty.value = true;
    await nextTick();
    expect(wrapper.get('tbody td').text()).toBe('金额 20');
    enabled.value = false;
    await nextTick();
    expect(wrapper.get('tbody td').text()).toBe('金额 20');
    expect(wrapper.findAllComponents({ name: 'CellContent' })).toHaveLength(0);
    wrapper.unmount();
  });

  it('对象内容的深层响应式更新仍限制在单元格内', async () => {
    const updated = vi.fn();
    const rows = reactive([{ key: 1, detail: { amount: 10 } }]);
    const wrapper = mount(ExTable, {
      props: { columns: [{ key: 'detail' }], data: rows, onVnodeUpdated: updated },
    });
    rows[0]!.detail.amount = 20;
    await nextTick();
    expect(wrapper.get('tbody td').text()).toContain('20');
    expect(updated).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
