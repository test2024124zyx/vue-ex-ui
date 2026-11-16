import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import ExChart from '../../../src/components/chart/ExChart.vue';
import type {
  ChartEventParams,
  ChartOption,
  ExChartExposed,
} from '../../../src/components/chart/types';
import { resolveChartColor } from '../../../src/components/chart/chart-runtime';
import { deepClone } from '../../../src/utils/clone';

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
    getOption: vi.fn<() => ChartOption>(() => ({ series: [{ type: 'bar', data: [1, 2] }] })),
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
  it('等值的新 option 不会重新设置图表，实际修改仍更新', async () => {
    const { wrapper, runtime } = await mountChart();
    await wrapper.setProps({ option: { series: [{ type: 'bar', data: [1, 2] }] } });
    expect(runtime.setOption).toHaveBeenCalledOnce();
    expect(wrapper.emitted('updated')).toBeUndefined();
    await wrapper.setProps({ option: { series: [{ type: 'bar', data: [1, 3] }] } });
    expect(runtime.setOption).toHaveBeenCalledTimes(2);
    expect(wrapper.emitted('updated')).toHaveLength(1);
  });

  it.each(['clear', 'setOption'] as const)('%s 清空后收到同值数据仍能恢复绘制', async method => {
    const { wrapper, api, runtime } = await mountChart();
    if (method === 'clear') api.clear();
    else api.setOption({ series: [] }, { notMerge: true });
    runtime.setOption.mockClear();
    await wrapper.setProps({ option: { series: [{ type: 'bar', data: [1, 2] }] } });
    expect(runtime.setOption).toHaveBeenCalledOnce();
  });

  it('series 的响应式 getter 返回新数据时重新设置图表', async () => {
    const state = reactive({ points: [1, 2] });
    const option: ChartOption = {
      series: [
        {
          type: 'bar',
          get data() {
            return state.points;
          },
        },
      ],
    };
    const { runtime } = await mountChart({ option });
    state.points = [3, 4];
    await nextTick();
    expect(runtime.setOption).toHaveBeenCalledTimes(2);
    expect(runtime.setOption.mock.lastCall?.[0].series[0].data).toEqual([3, 4]);
  });

  it('无显式维度的对象数据集换列时同步绘制和键盘导航', async () => {
    const withSource = (row: Record<string, unknown>): ChartOption => ({
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
      series: [{ type: 'bar' }],
      dataset: { source: [row] },
    });
    const first = withSource({ product: 'A', sales: 10, cost: 20 });
    const next = withSource({ product: 'A', cost: 20, sales: 10 });
    engine.init.mockImplementationOnce(() => {
      const instance = createRuntime();
      instance.setOption.mockImplementation((option: ChartOption) =>
        instance.getOption.mockReturnValue(option)
      );
      return instance;
    });
    const { wrapper, api, runtime } = await mountChart({ option: first });
    const readItem = () => wrapper.get('[role="option"]').text();
    expect(readItem()).toContain('10');
    await wrapper.setProps({ option: next });
    expect(runtime.setOption).toHaveBeenCalledTimes(2);
    expect(readItem()).toContain('20');
    api.setOption(first);
    await nextTick();
    expect(readItem()).toContain('10');
  });

  it('配置快照保留原生提示容器身份并识别容器替换', async () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    const withTooltip = (appendTo: HTMLElement): ChartOption => ({
      series: [{ type: 'bar', data: [1] }],
      tooltip: { appendTo },
    });
    const { wrapper, runtime } = await mountChart({ option: withTooltip(first) });
    expect(deepClone(first)).toBe(first);
    await wrapper.setProps({ option: withTooltip(first) });
    expect(runtime.setOption).toHaveBeenCalledOnce();
    await wrapper.setProps({ option: withTooltip(second) });
    expect(runtime.setOption).toHaveBeenCalledTimes(2);
    expect(runtime.setOption.mock.lastCall?.[0].tooltip.appendTo).toBe(second);
  });

  it('连续缩放不读取数据快照，连续渲染回调合并但事件仍逐次转发', async () => {
    const { wrapper, api, runtime } = await mountChart();
    const zoom = runtime.handlers.get('datazoom')!;
    const finished = runtime.handlers.get('finished')!;
    runtime.getOption.mockClear();
    vi.useFakeTimers();
    for (let index = 0; index < 15; index++) zoom({ start: index });
    expect(runtime.getOption).not.toHaveBeenCalled();
    expect(wrapper.emitted('datazoom')).toHaveLength(15);
    for (let index = 0; index < 15; index++) finished({});
    expect(wrapper.emitted('finished')).toHaveLength(15);
    expect(runtime.getOption).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(100);
    expect(runtime.getOption).toHaveBeenCalledTimes(2);
    runtime.getOption.mockClear();
    finished({});
    api.dispose();
    await vi.advanceTimersByTimeAsync(100);
    expect(runtime.getOption).not.toHaveBeenCalled();
  });
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
