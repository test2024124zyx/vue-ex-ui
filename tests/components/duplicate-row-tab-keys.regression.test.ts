import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils';
import {
  createSSRApp,
  defineAsyncComponent,
  defineComponent,
  h,
  nextTick,
  ref,
  type Component,
} from 'vue';
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

  it('包装组件创建的重复面板在挂载后只渲染首项', async () => {
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const Pane = { render: () => h(ExTabPane, { name: 'same', label: '标签' }, () => '面板') };
    const host = { render: () => h(ExTabs, {}, () => [h(Pane), h(Pane)]) };
    const wrapper = mount(host);
    await nextTick();
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(1);
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(1);
    const html = await renderToString(createSSRApp(host));
    expect(html).not.toContain('role="tabpanel"');
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

  it('同一个包装组件内部 keyed 重排后切换首项', async () => {
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const order = ref(['甲', '乙']);
    const Wrapped = {
      render: () =>
        h(
          'section',
          order.value.map(label =>
            h(ExTabPane, { key: label, name: 'same', label }, () => `${label}面板`)
          )
        ),
    };
    const wrapper = mount(ExTabs, { slots: { default: () => h(Wrapped) } });
    await flushPromises();
    expect(wrapper.get('[role="tab"]').text()).toBe('甲');
    order.value = ['乙', '甲'];
    await flushPromises();
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(1);
    expect(wrapper.get('[role="tab"]').text()).toBe('乙');
    expect(wrapper.get('[role="tabpanel"]').text()).toBe('乙面板');
  });

  it.each([false, true])('混合包装标签的 SSR 导航和活动面板一致，重复：%s', async duplicate => {
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const Wrapped = {
      render: () => h(ExTabPane, { name: 'wrapped', label: '包装标签' }, () => '包装面板'),
    };
    const host = {
      render: () =>
        h(ExTabs, {}, () => [
          h(Wrapped),
          h(
            ExTabPane,
            { name: duplicate ? 'wrapped' : 'direct', label: '直声明标签' },
            () => '直声明面板'
          ),
        ]),
    };
    const root = document.createElement('div');
    root.innerHTML = await renderToString(createSSRApp(host));
    const assertActive = (label: string, panel: string) => {
      const tab = root.querySelector('[role="tab"][aria-selected="true"]');
      const active = root.querySelector('[role="tabpanel"][aria-hidden="false"]');
      expect(tab?.textContent?.trim()).toBe(label);
      expect(active?.textContent?.trim()).toBe(panel);
      expect(tab?.getAttribute('aria-controls')).toBe(active?.id);
    };
    assertActive('直声明标签', '直声明面板');
    const app = createSSRApp(host);
    document.body.append(root);
    try {
      app.mount(root);
      await flushPromises();
      assertActive('包装标签', '包装面板');
      expect(root.querySelectorAll('[role="tabpanel"]')).toHaveLength(duplicate ? 1 : 2);
      expect(errors.mock.calls.flat().join(' ')).not.toMatch(/hydrat/i);
      expect(warn.mock.calls.flat().join(' ')).not.toMatch(/hydrat/i);
    } finally {
      app.unmount();
      root.remove();
    }
  });

  it('相同类型的多个无 key 包装组件各自按插槽位置参与', async () => {
    vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const Wrapped = defineComponent({
      props: { name: { type: String, required: true } },
      setup: props => () =>
        h(ExTabPane, { name: props.name, label: `包装 ${props.name}` }, () => `面板 ${props.name}`),
    });
    const wrapper = mount(ExTabs, {
      slots: {
        default: () => [
          h(Wrapped, { name: 'same' }),
          h(ExTabPane, { name: 'same', label: '直声明' }, () => '直声明面板'),
          h(Wrapped, { name: 'other' }),
        ],
      },
    });
    await flushPromises();
    expect(wrapper.findAll('[role="tab"]').map(tab => tab.text())).toEqual([
      '包装 same',
      '包装 other',
    ]);
    expect(wrapper.get('[role="tabpanel"][aria-hidden="false"]').text()).toBe('面板 same');
  });

  it('客户端异步包装页自身挂载前继续使用静态 hydration 输出', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const Wrapped = {
      render: () => h(ExTabPane, { name: 'async', label: '异步页' }, () => '异步面板'),
    };
    let resolveClient!: (component: Component) => void;
    const server = defineAsyncComponent(async () => Wrapped);
    const client = defineAsyncComponent(
      () =>
        new Promise<Component>(resolve => {
          resolveClient = resolve;
        })
    );
    const host = (component: Component) => ({
      render: () =>
        h(ExTabs, {}, () => [
          h(component),
          h(ExTabPane, { name: 'direct', label: '静态页' }, () => '静态面板'),
        ]),
    });
    const root = document.createElement('div');
    root.innerHTML = await renderToString(createSSRApp(host(server)));
    document.body.append(root);
    const app = createSSRApp(host(client));
    try {
      app.mount(root);
      await flushPromises();
      expect(root.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toBe('静态页');
      resolveClient(Wrapped);
      await flushPromises();
      expect(root.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toBe('异步页');
      expect(root.querySelector('[role="tabpanel"][aria-hidden="false"]')?.textContent).toBe(
        '异步面板'
      );
      expect(errors.mock.calls.flat().join(' ')).not.toMatch(/hydrat/i);
      expect(warnings.mock.calls.flat().join(' ')).not.toMatch(/hydrat/i);
    } finally {
      app.unmount();
      root.remove();
    }
  });
});
