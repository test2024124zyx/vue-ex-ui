import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils';
import ExVirtualList from '../../../src/components/virtual-list/ExVirtualList.vue';
import type { ExVirtualListProps, VisibleRange } from '../../../src/components/virtual-list/types';

describe('ExVirtualList 动态布局回归', () => {
  const wrappers: VueWrapper[] = [];
  const observers: { callback: ResizeObserverCallback; observe: ReturnType<typeof vi.fn> }[] = [];
  const data = Array.from({ length: 100 }, (_, id) => ({ id, height: 50 }));

  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
        constructor(callback: ResizeObserverCallback) {
          observers.push({ callback, observe: this.observe });
        }
      }
    );
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    wrappers.forEach(wrapper => wrapper.unmount());
    wrappers.length = 0;
    vi.unstubAllGlobals();
  });

  const createList = async (props: Partial<ExVirtualListProps> = {}) => {
    const wrapper = mount(ExVirtualList, {
      props: { dataSource: data, height: 100, itemHeight: 50, buffer: 0, threshold: 1, ...props },
    });
    wrappers.push(wrapper);
    const viewport = wrapper.get('.ex-virtual-list__wrapper').element as HTMLElement;
    let viewportHeight = 100;
    Object.defineProperty(viewport, 'clientHeight', { get: () => viewportHeight });
    const methods = wrapper.vm as unknown as { getVisibleRange: () => VisibleRange };
    await flushPromises();
    return {
      wrapper,
      viewport,
      range: methods.getVisibleRange,
      resize: (height: number) => {
        viewportHeight = height;
      },
    };
  };

  const notifyResize = (target: HTMLElement) => {
    const observer = observers.find(item => item.observe.mock.calls.some(([el]) => el === target));
    expect(observer).toBeDefined();
    observer!.callback(
      [
        {
          target,
          contentRect: new DOMRect(0, 0, 0, Math.max(0, target.offsetHeight - 2)),
          borderBoxSize: [],
          contentBoxSize: [],
          devicePixelContentBoxSize: [],
        },
      ],
      {} as ResizeObserver
    );
  };

  it('修改容器高度和缓冲范围后无需滚动即可重新渲染窗口', async () => {
    const list = await createList();
    expect(list.range().visibleCount).toBe(2);
    list.resize(800);
    await list.wrapper.setProps({ height: 800 });
    await flushPromises();
    expect(list.range().visibleCount).toBe(16);
    await list.wrapper.setProps({ buffer: 2 });
    await flushPromises();
    expect(list.range().visibleCount).toBe(18);
  });

  it('固定行高也观察容器的实际尺寸变化', async () => {
    const list = await createList({ height: '100%' });
    list.resize(250);
    notifyResize(list.viewport);
    await flushPromises();
    expect(list.range().visibleCount).toBe(5);
  });

  it('切换虚拟模式和阈值时同步重置渲染范围及偏移', async () => {
    const list = await createList();
    list.viewport.scrollTop = 500;
    await list.wrapper.get('.ex-virtual-list__wrapper').trigger('scroll');
    expect(list.range().startIndex).toBe(10);
    await list.wrapper.setProps({ virtual: false });
    await flushPromises();
    expect(list.range()).toEqual({ startIndex: 0, endIndex: 100, visibleCount: 100 });
    expect(list.wrapper.get('.ex-virtual-list__items').attributes('style')).toContain('0, 0px, 0');
    await list.wrapper.setProps({ virtual: true, threshold: 200 });
    await flushPromises();
    expect(list.range().visibleCount).toBe(100);
    await list.wrapper.setProps({ threshold: 1 });
    await flushPromises();
    expect(list.range().startIndex).toBe(10);
    expect(list.range().visibleCount).toBe(2);
  });

  it('行高变化但窗口索引不变时也更新前缀偏移', async () => {
    const list = await createList({
      itemHeight: (_index, item) => (item as { height: number }).height,
    });
    list.viewport.scrollTop = 125;
    await list.wrapper.get('.ex-virtual-list__wrapper').trigger('scroll');
    expect(list.range().startIndex).toBe(2);
    await list.wrapper.setProps({
      dataSource: data.map(item => (item.id === 0 ? { ...item, height: 60 } : item)),
    });
    await flushPromises();
    expect(list.range().startIndex).toBe(2);
    expect(list.wrapper.get('.ex-virtual-list__items').attributes('style')).toContain(
      '0, 110px, 0'
    );
  });

  it('动态行高测量采用完整边框盒并允许内容收缩', async () => {
    const list = await createList({ itemHeight: () => 50, buffer: 1 });
    const firstItem = list.wrapper.get('.ex-virtual-list__item').element as HTMLElement;
    let actualHeight = 80;
    Object.defineProperty(firstItem, 'offsetHeight', { get: () => actualHeight });
    notifyResize(firstItem);
    await flushPromises();
    expect(list.wrapper.get('.ex-virtual-list__spacer').attributes('style')).toContain('5030px');
    expect(list.wrapper.get('.ex-virtual-list__item').attributes('style') ?? '').not.toContain(
      'min-height'
    );
    actualHeight = 30;
    notifyResize(firstItem);
    await flushPromises();
    expect(list.wrapper.get('.ex-virtual-list__spacer').attributes('style')).toContain('4980px');
  });

  it('滚动后清空数据时公开范围与占位偏移归零', async () => {
    const list = await createList();
    list.viewport.scrollTop = 500;
    await list.wrapper.get('.ex-virtual-list__wrapper').trigger('scroll');
    await list.wrapper.setProps({ dataSource: [] });
    await flushPromises();
    expect(list.range()).toEqual({ startIndex: 0, endIndex: 0, visibleCount: 0 });
    expect(list.wrapper.get('.ex-virtual-list__items').attributes('style')).toContain('0, 0px, 0');
  });

  it('固定与动态行高相互切换后更新测量订阅及总高度', async () => {
    const list = await createList();
    await list.wrapper.setProps({ itemHeight: () => 25 });
    await flushPromises();
    expect(list.range().visibleCount).toBe(4);
    const firstItem = list.wrapper.get('.ex-virtual-list__item').element as HTMLElement;
    Object.defineProperty(firstItem, 'offsetHeight', { value: 80 });
    notifyResize(firstItem);
    await flushPromises();
    expect(list.wrapper.get('.ex-virtual-list__spacer').attributes('style')).toContain('2555px');
    await list.wrapper.setProps({ itemHeight: 10 });
    await flushPromises();
    expect(list.range().visibleCount).toBe(10);
    expect(list.wrapper.get('.ex-virtual-list__spacer').attributes('style')).toContain('1000px');
  });

  it('同一轮多个动态项目测量后一次刷新整批偏移和可见范围', async () => {
    const list = await createList({ itemHeight: () => 50, buffer: 2 });
    const items = list.wrapper.findAll('.ex-virtual-list__item');
    const firstItem = items[0]!.element as HTMLElement;
    const secondItem = items[1]!.element as HTMLElement;
    Object.defineProperty(firstItem, 'offsetHeight', { value: 80 });
    Object.defineProperty(secondItem, 'offsetHeight', { value: 90 });
    notifyResize(firstItem);
    notifyResize(secondItem);
    await flushPromises();
    expect(list.wrapper.get('.ex-virtual-list__spacer').attributes('style')).toContain('5070px');
    list.viewport.scrollTop = 270;
    await list.wrapper.setProps({ buffer: 0 });
    await flushPromises();
    expect(list.range()).toEqual({ startIndex: 4, endIndex: 6, visibleCount: 2 });
    expect(list.wrapper.get('.ex-virtual-list__items').attributes('style')).toContain(
      '0, 270px, 0'
    );
  });

  it('数据缩短后把滚动位置夹取到有效视口，避免整个列表空白', async () => {
    const list = await createList();
    list.viewport.scrollTop = 4500;
    await list.wrapper.get('.ex-virtual-list__wrapper').trigger('scroll');
    await list.wrapper.setProps({ dataSource: data.slice(0, 10) });
    await flushPromises();
    expect(list.viewport.scrollTop).toBe(400);
    expect(list.range()).toEqual({ startIndex: 8, endIndex: 10, visibleCount: 2 });
  });
});
