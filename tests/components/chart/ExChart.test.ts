import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive } from 'vue';
import ExChart from '../../../src/components/chart/ExChart.vue';
import type { ExChartProps } from '../../../src/components/chart/types';
import { CONFIG_PROVIDER_INJECTION_KEY } from '../../../src/components/config-provider/types';
import {
  createDefaultDataZoom,
  createDefaultLegend,
  createDefaultToolbox,
  createDefaultTooltip,
  formatNumber,
} from '../../../src/components/chart/utils';
import * as echarts from 'echarts';

// Mock echarts
vi.mock('echarts', async importOriginal => ({
  color: (await importOriginal<typeof import('echarts')>()).color,
  default: {
    init: vi.fn(() => ({
      setOption: vi.fn(),
      resize: vi.fn(),
      clear: vi.fn(),
      dispose: vi.fn(),
      on: vi.fn(),
      showLoading: vi.fn(),
      hideLoading: vi.fn(),
      getDataURL: vi.fn(() => 'data:image/png;base64,mock'),
      convertToPixel: vi.fn(() => 100),
      convertFromPixel: vi.fn(() => 100),
    })),
  },
  init: vi.fn(() => ({
    setOption: vi.fn(),
    resize: vi.fn(),
    clear: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    showLoading: vi.fn(),
    hideLoading: vi.fn(),
    getDataURL: vi.fn(() => 'data:image/png;base64,mock'),
    convertToPixel: vi.fn(() => 100),
    convertFromPixel: vi.fn(() => 100),
  })),
}));

describe('ExChart', () => {
  let wrapper: ReturnType<typeof mount>;

  const defaultOption: ExChartProps['option'] = {
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'line',
      },
    ],
  };

  it('uses readable light-theme colors for chart auxiliary controls', () => {
    const tooltip = createDefaultTooltip('light');
    const legend = createDefaultLegend('light');
    const dataZoom = createDefaultDataZoom('light');

    expect(tooltip.backgroundColor).toBe('#ffffff');
    expect((tooltip.textStyle as Record<string, unknown>).color).toBe('#1a2332');
    expect((legend.textStyle as Record<string, unknown>).color).toBe('#1a2332');
    expect((dataZoom[0]!.textStyle as Record<string, unknown>).color).toBe('#1a2332');
  });

  it('保留多组件数组与单对象 dataZoom 的 ECharts 配置形式', async () => {
    const legend = [
      { id: 'primary', left: 2 },
      { id: 'secondary', right: 2 },
    ];
    const toolbox = [{ id: 'tools', left: 5 }];
    const dataZoom = { type: 'inside', yAxisIndex: 0, start: 25, end: 75 };
    wrapper = mount(ExChart, {
      props: {
        option: { ...defaultOption, legend, toolbox, dataZoom },
        showDataZoom: true,
        showToolbox: true,
      },
    });
    await flushPromises();
    const instance = vi.mocked(echarts.init).mock.results.at(-1)!.value;
    const actual = instance.setOption.mock.calls.at(-1)?.[0];
    expect(actual.legend).toEqual(legend.map(item => expect.objectContaining(item)));
    expect(actual.toolbox).toEqual(toolbox.map(item => expect.objectContaining(item)));
    expect(actual.dataZoom).toEqual(dataZoom);
    expect(legend).toEqual([
      { id: 'primary', left: 2 },
      { id: 'secondary', right: 2 },
    ]);
  });

  it('原生加载颜色解析为 Canvas 可用值并读取当前品牌变量', async () => {
    const { parse } = await import('zrender/lib/tool/color.js');
    wrapper = mount(ExChart, { props: { option: defaultOption } });
    await flushPromises();
    const instance = vi.mocked(echarts.init).mock.results.at(-1)!.value;
    (wrapper.vm as unknown as { showLoading: () => void }).showLoading();
    expect(parse(instance.showLoading.mock.calls.at(-1)?.[1].color)).toBeDefined();
    wrapper
      .find<HTMLElement>('.ex-chart__container')
      .element.style.setProperty('--ex-color-primary', '#aa0033');
    (wrapper.vm as unknown as { showLoading: () => void }).showLoading();
    expect(instance.showLoading.mock.calls.at(-1)?.[1].color).toBe('#aa0033');
  });

  it('主题 token 同步到标题、扇区边框和全部附属控件，并保留显式业务颜色', async () => {
    const { default: ExConfigProvider } =
      await import('../../../src/components/config-provider/ExConfigProvider.vue');
    const state = reactive({ option: defaultOption });
    wrapper = mount(ExConfigProvider, {
      props: {
        themeOverrides: {
          '--ex-color-primary': 'rgb(170, 0, 51)',
          '--ex-color-text-primary': '#112233',
          '--ex-color-text-secondary': '#334455',
          '--ex-color-bg-elevated': '#abcdef',
          '--ex-color-border-secondary': '#6789ab',
        },
      },
      slots: {
        default: () => h(ExChart, { option: state.option, showToolbox: true, showDataZoom: true }),
      },
    });
    await flushPromises();
    const theme = vi.mocked(echarts.init).mock.calls.at(-1)?.[1] as {
      title: { textStyle: { color: string } };
      pie: { itemStyle: { borderColor: string } };
    };
    const main = vi.mocked(echarts.init).mock.results.at(-1)!.value;
    const option = main.setOption.mock.calls.at(-1)?.[0];
    expect(theme.title.textStyle.color).toBe('#112233');
    expect(theme.pie.itemStyle.borderColor).toBe('#abcdef');
    expect(option.legend.textStyle.color).toBe('#112233');
    expect(option.legend.pageTextStyle.color).toBe('#334455');
    expect(option.tooltip.backgroundColor).toBe('#abcdef');
    expect(option.toolbox.emphasis.iconStyle.borderColor).toBe('rgb(170, 0, 51)');
    expect(option.dataZoom[0].borderColor).toBe('#6789ab');
    const { parse } = await import('zrender/lib/tool/color.js');
    expect(parse(option.dataZoom[0].fillerColor)).toBeDefined();
    state.option = { ...defaultOption, tooltip: { backgroundColor: 'pink' } };
    await nextTick();
    expect(main.setOption.mock.calls.at(-1)?.[0].tooltip.backgroundColor).toBe('pink');
  });

  it('使用真实 ECharts SVG 渲染器导出并销毁临时实例', async () => {
    const real = await vi.importActual<typeof import('echarts')>('echarts');
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      measureText: (value: string) => ({ width: value.length * 8 }),
    } as unknown as CanvasRenderingContext2D);
    wrapper = mount(ExChart, { props: { option: defaultOption } });
    await flushPromises();
    const main = vi.mocked(echarts.init).mock.results.at(-1)!.value;
    Object.assign(main, {
      getOption: () => defaultOption,
      getWidth: () => 640,
      getHeight: () => 360,
    });
    const temporary = real.init(null, undefined, {
      renderer: 'svg',
      ssr: true,
      width: 640,
      height: 360,
    });
    const dispose = vi.spyOn(temporary, 'dispose');
    vi.mocked(echarts.init).mockReturnValueOnce(temporary as never);
    try {
      const uri = (wrapper.vm as unknown as { getSvgDataURL: () => string }).getSvgDataURL();
      const svg = new DOMParser().parseFromString(
        decodeURIComponent(uri.split(',')[1]!),
        'image/svg+xml'
      );
      expect(svg.querySelector('parsererror')).toBeNull();
      expect(svg.documentElement.tagName).toBe('svg');
      expect(svg.documentElement.getAttribute('width')).toBe('640');
      expect(svg.querySelectorAll('path').length).toBeGreaterThan(0);
      expect(svg.documentElement.textContent).toContain('Mon');
      expect(dispose).toHaveBeenCalledOnce();
    } finally {
      if (!temporary.isDisposed()) temporary.dispose();
      context.mockRestore();
    }
  });

  it('特殊系列仍完整传给渲染器，但不产生未经确认的键盘导航点', async () => {
    const renderItem = () => ({ type: 'rect', shape: { x: 0, y: 0, width: 20, height: 20 } });
    const option = { series: [{ type: 'custom', data: [7], renderItem }] };
    wrapper = mount(ExChart, { props: { option } });
    await flushPromises();
    const main = vi.mocked(echarts.init).mock.results.at(-1)!.value;
    expect(main.setOption.mock.calls.at(-1)?.[0].series).toMatchObject(option.series);
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
    expect(wrapper.attributes('role')).toBe('img');
  });

  it('Canvas 主实例也能导出当前交互状态的真实 SVG，临时实例始终销毁', async () => {
    wrapper = mount(ExChart, { props: { option: defaultOption } });
    await flushPromises();
    const main = vi.mocked(echarts.init).mock.results.at(-1)!.value;
    const current = {
      ...defaultOption,
      legend: [{ selected: { a: false } }],
      dataZoom: [{ start: 25, end: 75 }],
    };
    Object.assign(main, {
      getOption: vi.fn(() => current),
      getWidth: () => 800,
      getHeight: () => 400,
    });
    const temporary = {
      ...main,
      dispose: vi.fn(),
      setOption: vi.fn(),
      renderToSVGString: vi.fn(
        () => '<svg xmlns="http://www.w3.org/2000/svg"><text>current</text></svg>'
      ),
    };
    vi.mocked(echarts.init).mockReturnValueOnce(temporary);
    const api = wrapper.vm as unknown as { getSvgDataURL: () => string };
    const result = api.getSvgDataURL();
    expect(result).toMatch(/^data:image\/svg\+xml/);
    expect(decodeURIComponent(result.split(',')[1]!)).toContain('current');
    expect(echarts.init).toHaveBeenLastCalledWith(
      null,
      expect.any(Object),
      expect.objectContaining({ renderer: 'svg', ssr: true, width: 800, height: 400 })
    );
    expect(temporary.setOption).toHaveBeenCalledWith(
      expect.objectContaining(current),
      expect.any(Object)
    );
    expect(temporary.dispose).toHaveBeenCalledOnce();
    expect(main.dispose).not.toHaveBeenCalled();
    temporary.renderToSVGString.mockImplementationOnce(() => {
      throw new Error('export failed');
    });
    vi.mocked(echarts.init).mockReturnValueOnce(temporary);
    expect(api.getSvgDataURL()).toBe('');
    expect(wrapper.emitted('error')?.at(-1)?.[0]).toMatchObject({ message: 'export failed' });
    expect(temporary.dispose).toHaveBeenCalledTimes(2);
  });

  it('格式化负数时同样使用数量级且归一化非法小数位', () => {
    expect(formatNumber(-1_500, 1)).toBe('-1.5K');
    expect(formatNumber(-2_500_000, Number.NaN)).toBe('-2.50M');
    expect(formatNumber(12.34, -4)).toBe('12');
  });

  it('工具箱默认文本使用当前语言，并允许传入最近 Provider 的翻译器', async () => {
    const { setLocale } = await import('../../../src/locale');
    setLocale('en-US');
    expect(createDefaultToolbox().feature).toMatchObject({
      saveAsImage: { title: 'Save as Image' },
      dataZoom: { title: { zoom: 'Zoom area' } },
    });
    expect(createDefaultToolbox('light', key => `local:${key}`).feature).toMatchObject({
      restore: { title: 'local:chart.restore' },
    });
  });

  it('键盘导航调用当前实例动作，并让公开 setOption、clear 同步替代数据', async () => {
    wrapper = mount(ExChart, { props: { option: defaultOption } });
    await flushPromises();
    const main = vi.mocked(echarts.init).mock.results.at(-1)!.value;
    const dispatchAction = vi.fn();
    Object.assign(main, { dispatchAction });
    const navigation = wrapper.find('[role="listbox"]');
    await navigation.trigger('focus');
    expect(dispatchAction).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'highlight', seriesIndex: 0, dataIndex: 0 })
    );
    await navigation.trigger('keydown', { key: 'ArrowRight' });
    await navigation.trigger('keydown', { key: 'Enter' });
    expect(wrapper.emitted('click')?.at(-1)?.[0]).toMatchObject({
      seriesIndex: 0,
      dataIndex: 1,
      value: 200,
      name: 'Tue',
    });
    await navigation.trigger('keydown', { key: 'Escape' });
    expect(dispatchAction).toHaveBeenLastCalledWith({ type: 'hideTip' });
    Object.assign(main, { getOption: () => ({ series: [{ name: 'new', data: [8] }] }) });
    (wrapper.vm as unknown as { setOption: (option: object) => void }).setOption({
      series: [{ data: [8] }],
    });
    await nextTick();
    expect(wrapper.find('[role="option"]').text()).toBe('new: 8');
    (wrapper.vm as unknown as { clear: () => void }).clear();
    await nextTick();
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  });

  it('公开 setOption 和 clear 同步真实空状态，声明式更新仍能重新呈现数据', async () => {
    wrapper = mount(ExChart, { props: { option: {} }, attachTo: document.body });
    await flushPromises();
    const api = wrapper.vm as unknown as { setOption(option: object): void; clear(): void };
    expect(wrapper.get('.ex-chart__empty').isVisible()).toBe(true);
    api.setOption(defaultOption);
    await nextTick();
    expect(wrapper.get('.ex-chart__empty').isVisible()).toBe(false);
    api.clear();
    await nextTick();
    expect(wrapper.get('.ex-chart__empty').isVisible()).toBe(true);
    await wrapper.setProps({ option: defaultOption });
    expect(wrapper.get('.ex-chart__empty').isVisible()).toBe(false);
  });

  it('父 Modal 中第一次 Escape 清除图表高亮，第二次才请求关闭对话框', async () => {
    const { default: ExModal } = await import('../../../src/components/modal/ExModal.vue');
    wrapper = mount(ExModal, {
      attachTo: document.body,
      props: { modelValue: true },
      slots: { default: () => h(ExChart, { option: defaultOption }) },
    });
    await flushPromises();
    const main = vi.mocked(echarts.init).mock.results.at(-1)!.value;
    Object.assign(main, { dispatchAction: vi.fn() });
    const navigation = wrapper.findComponent(ExChart).find('[role="listbox"]');
    await navigation.trigger('focus');
    await navigation.trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
    await navigation.trigger('keydown', { key: 'Escape' });
    expect(wrapper.emitted('update:modelValue')).toEqual([[false]]);
  });

  it('父 Modal 保留图表实例时隐藏外置提示并取消键盘高亮', async () => {
    const { default: ExModal } = await import('../../../src/components/modal/ExModal.vue');
    wrapper = mount(ExModal, {
      attachTo: document.body,
      props: { modelValue: true },
      slots: { default: () => h(ExChart, { option: defaultOption }) },
    });
    await flushPromises();
    const main = vi.mocked(echarts.init).mock.results.at(-1)!.value;
    const dispatchAction = vi.fn();
    Object.assign(main, { dispatchAction });
    await wrapper.findComponent(ExChart).find('[role="listbox"]').trigger('focus');
    await wrapper.setProps({ modelValue: false });
    expect(dispatchAction).toHaveBeenLastCalledWith({ type: 'hideTip' });
    expect(main.dispose).not.toHaveBeenCalled();
  });

  beforeEach(() => {
    // 清理 mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
    vi.unstubAllGlobals();
  });

  it('渲染正确的默认属性', () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
      },
    });

    expect(wrapper.find('.ex-chart').exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-chart');
    expect(wrapper.classes()).toContain('ex-chart--medium');
    expect(wrapper.classes()).toContain('ex-chart--neon-blue');
    expect(wrapper.classes()).toContain('ex-chart--neon');
  });

  it('使用全局主题配置', () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
      },
      global: {
        provide: {
          [CONFIG_PROVIDER_INJECTION_KEY as symbol]: {
            theme: { value: 'light' },
            locale: { value: 'zh-CN' },
            size: { value: 'medium' },
            neonEffect: { value: true },
            animation: { value: true },
            namespace: { value: 'ex' },
            zIndex: { value: 1000 },
          },
        },
      },
    });
    expect(wrapper.classes()).toContain('ex-chart--light');
  });

  it('渲染不同的尺寸', () => {
    const sizes: ExChartProps['size'][] = ['small', 'medium', 'large'];

    sizes.forEach(size => {
      wrapper = mount(ExChart, {
        props: {
          option: defaultOption,
          size,
        },
      });
      expect(wrapper.classes()).toContain(`ex-chart--${size}`);
      wrapper.unmount();
    });
  });

  it('正确处理加载状态', async () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
        loading: true,
      },
    });

    await nextTick();

    // 使用 ExLoading 组件后，类名变为 ex-loading
    expect(wrapper.findComponent({ name: 'ExLoading' }).exists()).toBe(true);
    expect(wrapper.classes()).toContain('ex-chart--loading');
  });

  it('正确处理空状态', async () => {
    wrapper = mount(ExChart, {
      props: {
        option: {
          series: [],
        },
      },
    });

    await nextTick();

    expect(wrapper.find('.ex-chart__empty').exists()).toBe(true);
    // 使用 ExEmpty 组件后，类名变为 ex-empty
    expect(wrapper.find('.ex-empty').exists()).toBe(true);
  });

  it('自定义加载文本', async () => {
    const loadingText = '数据加载中...';
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
        loading: true,
        loadingText,
      },
    });

    await nextTick();

    // 使用 ExLoading 组件后，通过 props 传递文本
    const loadingComponent = wrapper.findComponent({ name: 'ExLoading' });
    expect(loadingComponent.exists()).toBe(true);
    expect(loadingComponent.props('text')).toBe(loadingText);
  });

  it('自定义空状态插槽', async () => {
    wrapper = mount(ExChart, {
      props: {
        option: {
          series: [],
        },
      },
      slots: {
        empty: '<div class="custom-empty">自定义空状态</div>',
      },
    });

    await nextTick();

    expect(wrapper.find('.custom-empty').exists()).toBe(true);
    expect(wrapper.find('.custom-empty').text()).toBe('自定义空状态');
  });

  it('正确设置宽度和高度', () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
        width: '600px',
        height: '300px',
      },
    });

    const chartElement = wrapper.find('.ex-chart').element as HTMLElement;
    expect(chartElement.style.width).toBe('600px');
    expect(chartElement.style.height).toBe('300px');
  });

  it('支持数字类型的宽度和高度', () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
        width: 600,
        height: 300,
      },
    });

    const chartElement = wrapper.find('.ex-chart').element as HTMLElement;
    expect(chartElement.style.width).toBe('600px');
    expect(chartElement.style.height).toBe('300px');
  });

  it('正确应用自定义类名', () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
        class: 'custom-chart',
      },
    });

    expect(wrapper.classes()).toContain('custom-chart');
  });

  it('正确应用自定义样式', () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
        style: { backgroundColor: 'red' },
      },
    });

    const chartElement = wrapper.find('.ex-chart').element as HTMLElement;
    expect(chartElement.style.backgroundColor).toBe('red');
  });

  it('根据全局配置控制霓虹发光效果', () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
      },
      global: {
        provide: {
          [CONFIG_PROVIDER_INJECTION_KEY as symbol]: {
            theme: { value: 'neon-blue' },
            locale: { value: 'zh-CN' },
            size: { value: 'medium' },
            neonEffect: { value: false },
            animation: { value: true },
            namespace: { value: 'ex' },
            zIndex: { value: 1000 },
          },
        },
      },
    });

    expect(wrapper.classes()).not.toContain('ex-chart--neon');
  });

  it('初始化时调用 echarts.init', async () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
      },
    });

    // ECharts 现为按需动态加载，需等待动态 import 完成
    await flushPromises();
    await nextTick();

    expect(echarts.init).toHaveBeenCalled();
  });

  it('暴露正确的方法', () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
      },
    });

    const vm = wrapper.vm as unknown as {
      getInstance: () => unknown;
      getElement: () => unknown;
      resize: () => void;
      clear: () => void;
      dispose: () => void;
      setOption: () => void;
      showLoading: () => void;
      hideLoading: () => void;
      getDataURL: () => string;
      getSvgDataURL: () => string;
      convertToPixel: () => number | number[];
      convertFromPixel: () => number | number[];
    };

    expect(typeof vm.getInstance).toBe('function');
    expect(typeof vm.getElement).toBe('function');
    expect(typeof vm.resize).toBe('function');
    expect(typeof vm.clear).toBe('function');
    expect(typeof vm.dispose).toBe('function');
    expect(typeof vm.setOption).toBe('function');
    expect(typeof vm.showLoading).toBe('function');
    expect(typeof vm.hideLoading).toBe('function');
    expect(typeof vm.getDataURL).toBe('function');
    expect(typeof vm.getSvgDataURL).toBe('function');
    expect(typeof vm.convertToPixel).toBe('function');
    expect(typeof vm.convertFromPixel).toBe('function');
  });

  it('正确处理无障碍属性', () => {
    const ariaLabel = '销售数据图表';
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
        ariaLabel,
      },
    });

    expect(wrapper.attributes('aria-label')).toBe(ariaLabel);
    expect(wrapper.attributes('role')).toBe('img');
  });

  it('支持不同的渲染器', () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
        renderer: 'svg',
      },
    });

    expect(wrapper.find('.ex-chart').exists()).toBe(true);
  });

  it('将工具栏、缩放、图例和提示开关转换为真实 ECharts 配置', async () => {
    wrapper = mount(ExChart, {
      props: {
        option: defaultOption,
        showToolbox: true,
        showDataZoom: true,
        showLegend: false,
        showTooltip: false,
      },
    });
    await flushPromises();

    const instance = vi.mocked(echarts.init).mock.results.at(-1)?.value as unknown as {
      setOption: ReturnType<typeof vi.fn>;
    };
    const appliedOption = instance.setOption.mock.calls.at(-1)?.[0] as Record<string, unknown>;

    expect(appliedOption.toolbox).toMatchObject({ show: true });
    expect(appliedOption.dataZoom).toBeInstanceOf(Array);
    expect(appliedOption.legend).toMatchObject({ show: false });
    expect(appliedOption.tooltip).toMatchObject({ show: false });
  });

  it('保留调用方显式设置的 tooltip 挂载与边界策略', async () => {
    wrapper = mount(ExChart, {
      props: {
        option: {
          ...defaultOption,
          tooltip: { appendToBody: false, confine: true },
        },
      },
    });
    await flushPromises();
    const instance = vi.mocked(echarts.init).mock.results.at(-1)?.value as unknown as {
      setOption: ReturnType<typeof vi.fn>;
    };

    expect(instance.setOption.mock.calls.at(-1)?.[0].tooltip).toMatchObject({
      appendToBody: false,
      confine: true,
    });
  });

  it('系统要求减少动画时关闭 ECharts 动画并释放媒体查询监听', async () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    vi.stubGlobal('matchMedia', () => ({
      matches: true,
      addEventListener,
      removeEventListener,
    }));
    wrapper = mount(ExChart, { props: { option: defaultOption } });
    await flushPromises();
    const instance = vi.mocked(echarts.init).mock.results.at(-1)?.value as unknown as {
      setOption: ReturnType<typeof vi.fn>;
    };
    const appliedOption = instance.setOption.mock.calls.at(-1)?.[0];

    expect(appliedOption).toMatchObject({ animation: false, animationDuration: 0 });
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    wrapper.unmount();
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('应用霓虹效果时不修改调用方传入的 option', async () => {
    const option = {
      series: [{ type: 'line', data: [1, 2, 3] }],
    };
    wrapper = mount(ExChart, { props: { option } });

    await flushPromises();

    expect(option.series[0]).not.toHaveProperty('lineStyle');
    expect(option.series[0]).not.toHaveProperty('itemStyle');
  });

  it('响应 option 的嵌套数据变化', async () => {
    const option = reactive({
      series: [{ type: 'line', data: [1, 2] }],
    });
    const host = defineComponent({
      setup() {
        return () => h(ExChart, { option });
      },
    });
    wrapper = mount(host);
    await flushPromises();
    const instance = vi.mocked(echarts.init).mock.results.at(-1)?.value as unknown as {
      setOption: ReturnType<typeof vi.fn>;
    };
    const callsBeforeMutation = instance.setOption.mock.calls.length;

    option.series[0]?.data.push(3);
    await nextTick();

    expect(instance.setOption.mock.calls.length).toBeGreaterThan(callsBeforeMutation);
  });

  it('autoResize 动态切换时创建并释放 ResizeObserver', async () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    class ResizeObserverMock {
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
    }
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    wrapper = mount(ExChart, {
      props: { option: defaultOption, autoResize: false },
    });
    await flushPromises();
    expect(observe).not.toHaveBeenCalled();

    await wrapper.setProps({ autoResize: true });
    expect(observe).toHaveBeenCalledOnce();

    await wrapper.setProps({ autoResize: false });
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
