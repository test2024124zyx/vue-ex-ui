import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExPagination from '../../../src/components/pagination/ExPagination.vue';

const wrappers: Array<{ unmount(): void }> = [];
let availableWidth: number;
let itemWidth: number;
const observers: Array<{ callback: ResizeObserverCallback; disconnect: ReturnType<typeof vi.fn> }> =
  [];

async function resize(width: number) {
  availableWidth = width;
  observers.forEach(observer => observer.callback([], {} as ResizeObserver));
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  await nextTick();
  await nextTick();
}

beforeEach(() => {
  availableWidth = 600;
  itemWidth = 44;
  vi.stubGlobal(
    'ResizeObserver',
    class {
      disconnect = vi.fn();
      observe = vi.fn();
      constructor(callback: ResizeObserverCallback) {
        observers.push({ callback, disconnect: this.disconnect });
      }
    }
  );
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement
  ) {
    const width = this.closest('.ex-pagination__measure') ? itemWidth : availableWidth;
    return {
      width,
      height: 44,
      top: 0,
      left: 0,
      right: width,
      bottom: 44,
      x: 0,
      y: 0,
      toJSON() {},
    };
  });
  vi.spyOn(window, 'getComputedStyle').mockReturnValue({ columnGap: '8px' } as CSSStyleDeclaration);
});

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  observers.splice(0);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function create(props = {}) {
  const wrapper = mount(ExPagination, {
    attachTo: document.body,
    props: { total: 1000, current: 50, ...props },
  });
  wrappers.push(wrapper);
  return wrapper;
}

describe('分页容器自适应', () => {
  it('同一帧的尺寸通知合并为一次测量，卸载取消尚未执行的任务', async () => {
    const wrapper = create();
    await nextTick();
    const schedule = vi.spyOn(globalThis, 'requestAnimationFrame');
    const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame');
    for (let index = 0; index < 3; index++) {
      observers.forEach(observer => observer.callback([], {} as ResizeObserver));
    }
    expect(schedule).toHaveBeenCalledTimes(1);
    const frame = schedule.mock.results[0].value;
    wrapper.unmount();
    wrappers.pop();
    expect(cancel).toHaveBeenCalledWith(frame);
  });

  it('窄容器减少相邻页码，宽度恢复后恢复配置上限，且不发出翻页请求', async () => {
    const wrapper = create();
    await resize(600);
    expect(wrapper.findAll('.ex-pagination__items button')).toHaveLength(11);
    await resize(300);
    expect(wrapper.findAll('.ex-pagination__items button').map(button => button.text())).toEqual([
      '',
      '1',
      '50',
      '100',
      '',
    ]);
    expect(wrapper.get('[aria-current="page"]').text()).toBe('50');
    await resize(464);
    expect(wrapper.findAll('.ex-pagination__items button')).toHaveLength(9);
    await resize(600);
    expect(wrapper.findAll('.ex-pagination__items button')).toHaveLength(11);
    expect(wrapper.emitted('change')).toBeUndefined();
    expect(wrapper.emitted('update:current')).toBeUndefined();
  });

  it.each([1, 100])('第 %i 页在极窄容器仍保留首尾与前后翻页', async current => {
    const wrapper = create({ current });
    await resize(200);
    expect(wrapper.findAll('.ex-pagination__items button').map(button => button.text())).toEqual([
      '',
      '1',
      '100',
      '',
    ]);
    expect(wrapper.get('[aria-current="page"]').text()).toBe(String(current));
  });

  it('调整宽度移除已聚焦的相邻页码时，将焦点交还当前页', async () => {
    const wrapper = create();
    await resize(600);
    const adjacent = wrapper.findAll('button').find(button => button.text() === '48')!;
    adjacent.element.focus();
    expect(document.activeElement).toBe(adjacent.element);
    await resize(300);
    expect(document.activeElement).toBe(wrapper.get('[aria-current="page"]').element);
  });

  it('字体或触摸目标变大后重新计算容量，受控翻页仍等待父组件确认', async () => {
    const wrapper = create();
    await resize(464);
    itemWidth = 64;
    await resize(464);
    expect(wrapper.findAll('.ex-pagination__items button')).toHaveLength(5);
    await wrapper.get('.ex-pagination__next').trigger('click');
    expect(wrapper.emitted('update:current')).toEqual([[51]]);
    expect(wrapper.get('[aria-current="page"]').text()).toBe('50');
    await wrapper.setProps({ current: 51 });
    expect(wrapper.get('[aria-current="page"]').text()).toBe('51');
  });

  it('隐藏后重新显示、单页、空数据和简洁模式不产生无效页码，卸载释放观察器', async () => {
    const wrapper = create({ total: 0, hideOnSinglePage: true });
    expect(wrapper.find('.ex-pagination').exists()).toBe(false);
    await wrapper.setProps({ total: 1000 });
    await resize(300);
    expect(wrapper.findAll('.ex-pagination__items button')).toHaveLength(5);
    await wrapper.setProps({ hideOnSinglePage: false, total: 10 });
    expect(wrapper.get('[aria-current="page"]').text()).toBe('1');
    await wrapper.setProps({ total: 0 });
    expect(wrapper.find('[aria-current="page"]').exists()).toBe(false);
    await wrapper.setProps({ total: 1000, simple: true });
    expect(wrapper.get<HTMLInputElement>('input').element.value).toBe('50');
    expect(wrapper.findAll('.ex-pagination__items button')).toHaveLength(2);
    wrapper.unmount();
    wrappers.pop();
    expect(observers.length).toBeGreaterThan(0);
    observers.forEach(observer => expect(observer.disconnect).toHaveBeenCalled());
  });
});
