import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import ExChart from '../../../src/components/chart/ExChart.vue';
import type {
  ChartEventParams,
  ChartOption,
  ExChartExposed,
} from '../../../src/components/chart/types';
import { resolveChartColor } from '../../../src/components/chart/chart-runtime';

const engine = vi.hoisted(() => ({ init: vi.fn() }));
vi.mock('echarts', () => ({ init: engine.init, color: { modifyAlpha: (color: string) => color } }));

const createRuntime = () => {
  const handlers = new Map<string, (params: ChartEventParams) => void>();
  return {
    handlers,
    setOption: vi.fn(),
    resize: vi.fn(),
    clear: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn((event: string, handler: (params: ChartEventParams) => void) =>
      handlers.set(event, handler)
    ),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    dispatchAction: vi.fn(),
    getOption: vi.fn(() => ({ series: [{ type: 'bar', data: [1, 2] }] })),
    getWidth: () => 320,
    getHeight: () => 200,
    renderToSVGString: vi.fn(() => '<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
    getDataURL: vi.fn(() => 'data:image/png;base64,valid'),
    convertToPixel: vi.fn(() => [12, 24]),
    convertFromPixel: vi.fn(() => [1, 2]),
  };
};
const wrappers: Array<{ unmount(): void }> = [];
beforeEach(() => engine.init.mockReset().mockImplementation(createRuntime));
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
const mountChart = async (props = {}) => {
  const wrapper = mount(ExChart, {
    props: { option: { series: [{ type: 'bar', data: [1, 2] }] }, ...props },
  });
  wrappers.push(wrapper);
  await flushPromises();
  const runtime = engine.init.mock.results.at(-1)!.value as ReturnType<typeof createRuntime>;
  return { wrapper, api: wrapper.vm as unknown as ExChartExposed, runtime };
};

describe('图表公开能力与运行时生命周期', () => {
  it('转发全部交互事件并支持真实参数的公开命令', async () => {
    const { wrapper, api, runtime } = await mountChart({ style: 'height: 200px' });
    for (const event of [
      'click',
      'dblclick',
      'mouseover',
      'mouseout',
      'mousemove',
      'datazoom',
      'legendselectchanged',
    ]) {
      const payload = { type: event, name: '业务数据' };
      runtime.handlers.get(event)!(payload);
      expect(wrapper.emitted(event)?.at(-1)).toEqual([payload]);
    }
    runtime.handlers.get('finished')!({});
    expect(wrapper.emitted('finished')).toHaveLength(1);
    api.resize({ width: 480 });
    expect(runtime.resize).toHaveBeenCalledWith({ width: 480 });
    api.showLoading('default', { text: '更新中' });
    expect(runtime.showLoading.mock.calls.at(-1)?.[1]).toMatchObject({ text: '更新中' });
    api.hideLoading();
    expect(runtime.hideLoading).toHaveBeenCalledOnce();
    expect(api.getDataURL({ type: 'png' })).toContain('data:image/png');
    expect(api.convertToPixel({}, [1, 2])).toEqual([12, 24]);
    expect(api.convertFromPixel({}, [12, 24])).toEqual([1, 2]);
    const option: ChartOption = {
      series: { type: 'line', data: [3], lineStyle: { width: 2 }, itemStyle: { color: '#123456' } },
    };
    api.setOption(option, { notMerge: true });
    expect(runtime.setOption).toHaveBeenLastCalledWith(option, { notMerge: true });
    api.clear();
    expect(runtime.clear).toHaveBeenCalledOnce();
    api.dispose();
    expect(api.getInstance()).toBeNull();
    expect(api.getDataURL()).toBe('');
    expect(api.getSvgDataURL()).toBe('');
    expect(api.convertToPixel({}, 1)).toBe(0);
    expect(api.convertFromPixel({}, 1)).toBe(0);
  });

  it('SVG 导出使用独立实例且无论成功或失败都释放临时实例', async () => {
    const { wrapper, api, runtime } = await mountChart();
    expect(api.getDataURL({ type: 'svg', backgroundColor: '#ffffff' })).toContain(
      'data:image/svg+xml'
    );
    const temporary = engine.init.mock.results.at(-1)!.value as ReturnType<typeof createRuntime>;
    expect(temporary.dispose).toHaveBeenCalledOnce();
    expect(runtime.dispose).not.toHaveBeenCalled();
    const broken = createRuntime();
    broken.renderToSVGString.mockImplementation(() => {
      throw new Error('SVG 编码失败');
    });
    engine.init.mockReturnValueOnce(broken);
    expect(api.getSvgDataURL()).toBe('');
    expect(broken.dispose).toHaveBeenCalledOnce();
    expect(wrapper.emitted('error')?.at(-1)?.[0]).toBeInstanceOf(Error);
  });

  it('容器连续调整只执行最后一次 resize，关闭自动调整会撤销待执行任务', async () => {
    let resize: ResizeObserverCallback | undefined;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
      }
    );
    const { wrapper, runtime } = await mountChart({ resizeDelay: 20 });
    vi.useFakeTimers();
    resize!([], {} as ResizeObserver);
    resize!([], {} as ResizeObserver);
    await vi.advanceTimersByTimeAsync(20);
    expect(runtime.resize).toHaveBeenCalledOnce();
    resize!([], {} as ResizeObserver);
    await wrapper.setProps({ autoResize: false });
    await vi.advanceTimersByTimeAsync(20);
    expect(runtime.resize).toHaveBeenCalledOnce();
  });

  it('初始化和更新错误通过 error 反馈，调用方数据不被更改', async () => {
    engine.init.mockImplementationOnce(() => {
      throw new Error('初始化失败');
    });
    const failed = mount(ExChart, { props: { option: {} } });
    wrappers.push(failed);
    await flushPromises();
    expect(failed.emitted('error')?.[0]?.[0]).toBeInstanceOf(Error);
    const { wrapper, runtime } = await mountChart();
    runtime.setOption.mockImplementationOnce(() => {
      throw new Error('配置失败');
    });
    const option = {
      series: { type: 'line', data: [2], lineStyle: { width: 1 }, itemStyle: { color: 'red' } },
    };
    await wrapper.setProps({ option });
    expect(wrapper.emitted('error')?.at(-1)?.[0]).toBeInstanceOf(Error);
    expect(option.series.lineStyle).toEqual({ width: 1 });
  });

  it('Canvas 颜色解析处理缺失、非法颜色和 CSS 变量，不残留探测节点', () => {
    expect(resolveChartColor(undefined, '--brand', '#123456')).toBe('#123456');
    const element = document.createElement('div');
    element.style.setProperty('--brand', 'not-a-color');
    expect(resolveChartColor(element, '--brand', '#123456')).toBe('#123456');
    element.style.setProperty('--brand', 'var(--real-brand)');
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      color: 'rgb(1, 2, 3)',
      getPropertyValue: () => '',
    } as unknown as CSSStyleDeclaration);
    expect(resolveChartColor(element, '--brand', '#123456')).toBe('rgb(1, 2, 3)');
    expect(element.children).toHaveLength(0);
  });
});
