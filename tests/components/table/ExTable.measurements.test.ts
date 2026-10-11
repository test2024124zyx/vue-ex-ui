import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExTable from '../../../src/components/table/ExTable.vue';

enableAutoUnmount(afterEach);
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Table 动态虚拟高度和位置语义', () => {
  const columns = [{ key: 'name', title: '名称' }];
  const data = Array.from({ length: 50 }, (_, key) => ({ key, name: `记录${key}` }));

  function observer() {
    let callback: ResizeObserverCallback | undefined;
    const disconnect = vi.fn();
    const observe = vi.fn();
    const unobserve = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(value: ResizeObserverCallback) {
          callback = value;
        }
        observe = observe;
        unobserve = unobserve;
        disconnect = disconnect;
      }
    );
    return {
      disconnect,
      observe,
      unobserve,
      resize(element: Element, height: number) {
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ height } as DOMRect);
        callback?.([{ target: element } as ResizeObserverEntry], {} as ResizeObserver);
      },
    };
  }

  it('详情实测高度参与定位，详情收起后回收观察并保留有效窗口', async () => {
    const measurement = observer();
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data,
        virtual: true,
        rowHeight: 40,
        virtualHeight: 80,
        virtualBuffer: 0,
        defaultDetailExpandedRowKeys: [0],
      },
      slots: { 'expanded-row': () => '可变化的详情' },
    });
    const detail = wrapper.get('.ex-table__expanded-row');
    measurement.resize(detail.element, 200);
    await nextTick();
    const container = wrapper.get('.ex-table__container');
    container.element.scrollTop = 160;
    await container.trigger('scroll');
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    expect(wrapper.findAll('.ex-table__row')[0]!.text()).toBe('记录0');
    wrapper.vm.toggleDetailExpansion(data[0]!, false);
    await nextTick();
    expect(measurement.unobserve).toHaveBeenCalledWith(detail.element);
    expect(wrapper.findAll('.ex-table__row')[0]!.text()).toBe('记录4');
    wrapper.unmount();
    expect(measurement.disconnect).toHaveBeenCalled();
  });

  it('卡片虚拟表格使用实测数据行高度，编辑错误不会被固定高度裁剪', async () => {
    const measurement = observer();
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data,
        virtual: true,
        layout: 'card',
        rowHeight: 40,
        virtualHeight: 80,
        virtualBuffer: 0,
      },
    });
    const row = wrapper.get('.ex-table__row');
    measurement.resize(row.element, 160);
    await nextTick();
    expect(row.attributes('style')).toBeUndefined();
    expect(wrapper.classes()).toContain('ex-table--dynamic-rows');
    const container = wrapper.get('.ex-table__container');
    container.element.scrollTop = 120;
    await container.trigger('scroll');
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    expect(wrapper.findAll('.ex-table__row')[0]!.text()).toBe('记录0');
    await wrapper.setProps({ data: data.slice(0, 1) });
    expect(wrapper.findAll('.ex-table__row')).toHaveLength(1);
    expect(container.element.scrollTop).toBeLessThanOrEqual(80);
  });

  it('虚拟表格总行数及绝对行索引包含详情行', () => {
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data,
        virtual: true,
        virtualHeight: 500,
        defaultDetailExpandedRowKeys: [0],
      },
      slots: { 'expanded-row': () => '详情' },
    });
    expect(wrapper.get('table').attributes('aria-rowcount')).toBe('52');
    expect(wrapper.get('.ex-table__expanded-row').attributes('aria-rowindex')).toBe('3');
    expect(wrapper.findAll('.ex-table__row')[1]!.attributes('aria-rowindex')).toBe('4');
  });

  it('缓冲行高度变化保持当前阅读位置，退出动态布局释放行观察', async () => {
    const measurement = observer();
    const wrapper = mount(ExTable, {
      props: {
        columns,
        data,
        virtual: true,
        layout: 'card',
        rowHeight: 40,
        virtualHeight: 80,
        virtualBuffer: 2,
      },
    });
    const container = wrapper.get('.ex-table__container');
    container.element.scrollTop = 200;
    await container.trigger('scroll');
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    const buffered = wrapper.findAll('.ex-table__row')[0]!;
    expect(buffered.text()).toBe('记录3');
    measurement.resize(buffered.element, 80);
    await nextTick();
    expect(container.element.scrollTop).toBe(240);
    await wrapper.setProps({ layout: 'table' });
    expect(measurement.unobserve).toHaveBeenCalledWith(buffered.element);
  });
});
