import { afterEach, expect, it, vi } from 'vitest';
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExChart from '../../../src/components/chart/ExChart.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import type { ChartOption, ExChartExposed } from '../../../src/components/chart/types';
import type { Theme, ThemeVariables } from '../../../src/types/theme';

enableAutoUnmount(afterEach);

vi.mock('echarts', async importOriginal => {
  const library = await importOriginal<typeof import('echarts')>();
  library.setPlatformAPI({ measureText: text => ({ width: text.length * 8 }) });
  return {
    ...library,
    init: (_element: HTMLElement, theme: object) =>
      library.init(null, theme, { renderer: 'svg', ssr: true, width: 640, height: 320 }),
  };
});

it('切换主题只更新视觉属性，保留实际 ECharts 的数据、图例与缩放', async () => {
  const theme = ref<Theme>('light');
  const overrides = ref<Partial<ThemeVariables>>({});
  const chart = ref<ExChartExposed>();
  const option = ref<ChartOption>({
    title: { text: '声明标题' },
    xAxis: { type: 'category', data: ['甲', '乙', '丙', '丁'], axisLabel: { color: '#662200' } },
    yAxis: {},
    series: [{ type: 'line', name: '销量', data: [1, 2, 3, 4] }],
  });
  const wrapper = mount({
    render: () =>
      h(
        ExConfigProvider,
        { theme: theme.value, themeOverrides: overrides.value, animation: false },
        () =>
          h(ExChart, {
            ref: chart,
            option: option.value,
            showDataZoom: true,
            showLegend: true,
          })
      ),
  });
  await flushPromises();
  await vi.dynamicImportSettled();
  await flushPromises();
  const instance = chart.value!.getInstance()!;
  expect(instance).toBeTruthy();
  instance.setOption({
    title: { text: '运行时标题' },
    series: [{ type: 'line', data: [1, 20, 30, 4] }],
  });
  instance.dispatchAction({ type: 'legendUnSelect', name: '销量' });
  instance.dispatchAction({ type: 'dataZoom', start: 20, end: 80 });
  const light = instance.getOption();
  theme.value = 'neon-blue';
  await nextTick();
  await flushPromises();

  expect(chart.value!.getInstance() === instance).toBe(true);
  const dark = instance.getOption();
  expect(dark.color).not.toEqual(light.color);
  expect(dark.title).toMatchObject([{ text: '运行时标题' }]);
  expect(dark.series).toMatchObject([{ data: [1, 20, 30, 4] }]);
  expect(dark.legend).toMatchObject([{ selected: { 销量: false } }]);
  expect(dark.dataZoom).toMatchObject([
    { start: 20, end: 80 },
    { start: 20, end: 80 },
  ]);
  expect(dark.xAxis).toMatchObject([{ axisLabel: { color: '#662200' } }]);
  expect(wrapper.getComponent(ExChart).classes()).toContain('ex-chart--neon-blue');

  overrides.value = { '--ex-color-primary': '#8e33ff' };
  await nextTick();
  expect(instance.getOption().color).toMatchObject([
    '#8e33ff',
    ...(dark.color as string[]).slice(1),
  ]);

  option.value = { ...option.value, series: [{ type: 'line', name: '销量', data: [3, 2, 1, 0] }] };
  await nextTick();
  expect(instance.getOption().series).toMatchObject([{ data: [3, 2, 1, 0] }]);
  expect((instance.getOption().color as string[])[0]).toBe('#8e33ff');
});
