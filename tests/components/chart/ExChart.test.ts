import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive } from 'vue';
import ExChart from '../../../src/components/chart/ExChart.vue';
import type { ExChartProps } from '../../../src/components/chart/types';
import { CONFIG_PROVIDER_INJECTION_KEY } from '../../../src/components/config-provider/types';
import {
  createDefaultDataZoom,
  createDefaultLegend,
  createDefaultTooltip,
} from '../../../src/components/chart/utils';
import * as echarts from 'echarts';

// Mock echarts
vi.mock('echarts', () => ({
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

  const defaultOption: echarts.EChartsOption = {
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
    const ResizeObserverMock = vi.fn(function (this: {
      observe: typeof observe;
      disconnect: typeof disconnect;
    }) {
      this.observe = observe;
      this.disconnect = disconnect;
    });
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
