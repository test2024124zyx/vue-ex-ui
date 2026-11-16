import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { createSSRApp, h, nextTick, ref } from 'vue';
import { renderToString } from '@vue/server-renderer';
import ExTable from '../../src/components/table/ExTable.vue';
import ExTabs from '../../src/components/tabs/ExTabs.vue';
import ExTabPane from '../../src/components/tabs/ExTabPane.vue';
import { logger } from '../../src/utils/logger';

enableAutoUnmount(afterEach);
afterEach(() => vi.restoreAllMocks());

describe('表格与标签页的唯一键', () => {
  it.each([false, true])('表格保留首次出现的行，避免选择状态串行，树形=%s', async tree => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const data = [
      { key: 'same', name: '首行', children: [{ key: 'nested', name: '保留子行' }] },
      { key: 'same', name: '重复行', children: [{ key: 'other', name: '重复子行' }] },
      { key: 'last', name: '末行' },
    ];
    const wrapper = mount(ExTable, {
      props: {
        data,
        tree,
        defaultExpandAllRows: true,
        selectable: true,
        columns: [{ key: 'name', title: '名称' }],
      },
    });
    expect(wrapper.findAll('.ex-table__row').map(row => row.text())).toEqual(
      tree ? ['首行', '保留子行', '末行'] : ['首行', '末行']
    );
    expect(warn).toHaveBeenCalledOnce();
    wrapper.vm.toggleRowSelection(data[0]!, true);
    await nextTick();
    expect(wrapper.findAll('.ex-table__row--selected').map(row => row.text())).toEqual(['首行']);
  });

  it('标签页仅保留首个同名标签及面板，移除后可显示后续同名页', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const first = ref(true);
    const wrapper = mount({
      render: () =>
        h(ExTabs, {}, () => [
          first.value
            ? h(ExTabPane, { key: 'one', name: 'same', label: '首标签' }, () => '首面板')
            : null,
          h(ExTabPane, { key: 'two', name: 'same', label: '重复标签' }, () => '重复面板'),
        ]),
    });
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(1);
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(1);
    expect(wrapper.get('[role="tab"]').text()).toBe('首标签');
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('首面板');
    expect(warn).toHaveBeenCalled();
    first.value = false;
    await nextTick();
    expect(wrapper.get('[role="tab"]').text()).toBe('重复标签');
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('重复面板');
  });

  it('服务端和封装组件创建的重复面板也只渲染首项', async () => {
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const Pane = { render: () => h(ExTabPane, { name: 'same', label: '标签' }, () => '面板') };
    const host = { render: () => h(ExTabs, {}, () => [h(Pane), h(Pane)]) };
    const wrapper = mount(host);
    await nextTick();
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(1);
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(1);
    const html = await renderToString(createSSRApp(host));
    expect(html.match(/role="tabpanel"/g)).toHaveLength(1);
  });

  it('封装标签出现在直声明标签前时，重排后仍采用第一个出现的标签', async () => {
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const directFirst = ref(false);
    const Wrapped = {
      render: () => h(ExTabPane, { name: 'same', label: '封装标签' }, () => '封装面板'),
    };
    const host = {
      render: () =>
        h(ExTabs, {}, () => {
          const wrapped = h(Wrapped, { key: 'wrapped' });
          const direct = h(
            ExTabPane,
            { key: 'direct', name: 'same', label: '直接标签' },
            () => '直接面板'
          );
          return directFirst.value ? [direct, wrapped] : [wrapped, direct];
        }),
    };
    const wrapper = mount(host);
    await nextTick();
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(1);
    expect(wrapper.get('[role="tab"]').text()).toBe('封装标签');
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('封装面板');
    directFirst.value = true;
    await nextTick();
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(1);
    expect(wrapper.get('[role="tab"]').text()).toBe('直接标签');
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('直接面板');
  });
});
