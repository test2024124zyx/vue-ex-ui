import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExChart from '../../../src/components/chart/ExChart.vue';
import type { ExChartProps } from '../../../src/components/chart/types';
import { CONFIG_PROVIDER_INJECTION_KEY } from '../../../src/components/config-provider/types';
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

  beforeEach(() => {
    // 清理 mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
    }
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
            theme: { value: 'neon-pink' },
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
    expect(wrapper.classes()).toContain('ex-chart--neon-pink');
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
});
