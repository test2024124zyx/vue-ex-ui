import { afterEach, expect, it, vi } from 'vitest';
import { setPlatformAPI } from 'echarts';
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, ref } from 'vue';
import ExChart from '../../../src/components/chart/ExChart.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import type { ChartOption, ExChartExposed } from '../../../src/components/chart/types';
import type { Theme, ThemeVariables } from '../../../src/types/theme';

enableAutoUnmount(afterEach);

// 用真实 SVG 绘制与合并，仅提供 jsdom 缺少的字体测量。
setPlatformAPI({ measureText: text => ({ width: text.length * 8 }) });
const initOptions = { renderer: 'svg' as const, width: 640, height: 320 };

async function mountThemedChart(option: ChartOption) {
  const theme = ref<Theme>('light');
  const chart = ref<ExChartExposed>();
  mount({
    render: () =>
      h(ExConfigProvider, { theme: theme.value, animation: false }, () =>
        h(ExChart, { ref: chart, option, initOptions })
      ),
  });
  await flushPromises();
  await vi.dynamicImportSettled();
  await flushPromises();
  return { theme, api: chart.value!, instance: chart.value!.getInstance()! };
}

it('普通合并中新建的标题采用当前主题，显式使用旧色的标题不变', async () => {
  const base: ChartOption = { xAxis: {}, yAxis: {}, series: [{ type: 'line', data: [1, 2] }] };
  const reference = await mountThemedChart({ ...base, title: { text: '参考' } });
  const lightTitle = (reference.instance.getOption().title as [{ textStyle: { color: string } }])[0]
    .textStyle.color;
  reference.theme.value = 'neon-blue';
  await nextTick();
  const darkTitle = (reference.instance.getOption().title as [{ textStyle: { color: string } }])[0]
    .textStyle.color;
  expect(darkTitle).not.toBe(lightTitle);

  const { theme, api, instance } = await mountThemedChart(base);
  theme.value = 'neon-blue';
  await nextTick();
  api.setOption({
    title: [
      { id: 'default', text: '新标题' },
      { id: 'explicit', text: '业务标题', textStyle: { color: lightTitle } },
    ],
  });
  expect(instance.getOption().title).toMatchObject([
    { id: 'default', textStyle: { color: darkTitle } },
    { id: 'explicit', textStyle: { color: lightTitle } },
  ]);
});

it('命令式全量替换后，旧声明的配色不阻止下一次主题更新', async () => {
  const base: ChartOption = { xAxis: {}, yAxis: {}, series: [{ type: 'bar', data: [1] }] };
  const { theme, api, instance } = await mountThemedChart({ ...base, color: ['red'] });
  expect(instance.getOption().color).toEqual(['red']);
  api.setOption(base, { notMerge: true });
  const light = instance.getOption().color;
  expect(light).not.toEqual(['red']);
  theme.value = 'neon-blue';
  await nextTick();
  expect(instance.getOption().color).not.toEqual(light);
});

it('局部替换时保留同 ID 标题的业务样式，新标题使用当前主题', async () => {
  const { theme, api, instance } = await mountThemedChart({
    title: [
      { id: 'retained', text: '保留', textStyle: { color: '#663300' } },
      { id: 'removed', text: '删除' },
    ],
  });
  const before = (instance.getOption().title as Array<{ textStyle: { color: string } }>)[1]!
    .textStyle.color;
  theme.value = 'neon-blue';
  await nextTick();
  api.setOption(
    {
      title: [
        { id: 'new', text: '新增' },
        { id: 'retained', text: '已更新' },
      ],
    },
    { replaceMerge: 'title' }
  );
  const titles = instance.getOption().title as Array<{ id: string; textStyle: { color: string } }>;
  expect(titles.map(title => title.id)).toEqual(['retained', 'new']);
  expect(titles[0]!.textStyle.color).toBe('#663300');
  expect(titles[1]!.textStyle.color).not.toBe(before);
  theme.value = 'light';
  await nextTick();
  expect(instance.getOption().title).toMatchObject([
    { id: 'retained', textStyle: { color: '#663300' } },
    { id: 'new', textStyle: { color: before } },
  ]);
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
            initOptions,
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
