import { afterEach, expect, it, vi } from 'vitest';
import { setPlatformAPI } from 'echarts';
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils';
import { h, nextTick, reactive, ref } from 'vue';
import ExChart from '../../../src/components/chart/ExChart.vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import type { ChartOption, ExChartExposed } from '../../../src/components/chart/types';
import type { Theme, ThemeVariables } from '../../../src/types/theme';

enableAutoUnmount(afterEach);

// 用真实 SVG 绘制与合并，仅提供 jsdom 缺少的字体测量。
setPlatformAPI({ measureText: text => ({ width: text.length * 8 }) });
const initOptions = { renderer: 'svg' as const, width: 640, height: 320 };

async function mountThemedChart(option: ChartOption, showToolbox = false) {
  const theme = ref<Theme>('light');
  const chart = ref<ExChartExposed>();
  mount({
    render: () =>
      h(ExConfigProvider, { theme: theme.value, animation: false }, () =>
        h(ExChart, { ref: chart, option, initOptions, showToolbox })
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

it('追加业务图例时保留自动图例的主题位置', async () => {
  const { theme, api, instance } = await mountThemedChart({
    xAxis: {},
    yAxis: {},
    series: [{ type: 'bar', name: '数据', data: [1] }],
  });
  const legends = () => instance.getOption().legend as Array<{ textStyle: { color: string } }>;
  const light = legends()[0]!.textStyle.color;
  api.setOption({ legend: { id: 'business', textStyle: { color: 'red' } } });
  expect(legends()).toHaveLength(2);
  theme.value = 'neon-blue';
  await nextTick();
  expect(legends()[0]!.textStyle.color).not.toBe(light);
  expect(legends()[1]!.textStyle.color).toBe('red');
});

it('新 ID 的同名标题追加后仍采用主题色', async () => {
  const { theme, api, instance } = await mountThemedChart({
    title: { name: 'same', text: '原有', textStyle: { color: 'red' } },
  });
  api.setOption({ title: { id: 'new', name: 'same', text: '新增' } });
  const titles = () => instance.getOption().title as Array<{ textStyle: { color: string } }>;
  expect(titles()).toHaveLength(2);
  const light = titles()[1]!.textStyle.color;
  theme.value = 'neon-blue';
  await nextTick();
  expect(titles()[0]!.textStyle.color).toBe('red');
  expect(titles()[1]!.textStyle.color).not.toBe(light);
});

it('图例从隐式 plain 改为 scroll 后遵从当前文字主题', async () => {
  const { theme, api, instance } = await mountThemedChart({
    legend: { id: 'legend', textStyle: { color: 'red' } },
  });
  api.setOption({ legend: { id: 'legend', type: 'scroll' } });
  const legend = () => (instance.getOption().legend as Array<{ textStyle: { color: string } }>)[0]!;
  const light = legend().textStyle.color;
  expect(light).not.toBe('red');
  theme.value = 'neon-blue';
  await nextTick();
  expect(legend().textStyle.color).not.toBe(light);
});

it('主题往返切换更新生成的光晕并保留运行时阴影覆盖', async () => {
  const { theme, instance } = await mountThemedChart({
    xAxis: {},
    yAxis: {},
    series: [{ type: 'line', data: [1, 2] }],
  });
  const styles = () =>
    (
      instance.getOption().series as Array<{
        lineStyle: { shadowColor: string };
        itemStyle: { shadowColor: string };
      }>
    )[0]!;
  expect(styles().lineStyle.shadowColor).toBe('rgba(22, 104, 220, 0.25)');
  theme.value = 'neon-blue';
  await nextTick();
  expect(styles().lineStyle.shadowColor).toBe('rgba(0, 240, 255, 0.3)');
  instance.setOption({ series: [{ lineStyle: { shadowColor: 'red' } }] });
  theme.value = 'light';
  await nextTick();
  expect(styles().lineStyle.shadowColor).toBe('red');
  expect(styles().itemStyle.shadowColor).toBe('rgba(22, 104, 220, 0.25)');
});

it('还原交互配置后保留当前主题颜色和光晕', async () => {
  const { theme, api, instance } = await mountThemedChart(
    {
      title: { text: '原始标题' },
      xAxis: { type: 'category', data: ['甲', '乙'] },
      yAxis: {},
      series: [{ type: 'line', data: [1, 2] }],
    },
    true
  );
  theme.value = 'neon-blue';
  await nextTick();
  const dark = instance.getOption();
  api.setOption({ title: { text: '临时标题' }, series: [{ data: [9, 8] }] });
  instance.dispatchAction({ type: 'restore' });
  expect(instance.getOption()).toMatchObject({
    color: dark.color,
    title: dark.title,
    xAxis: dark.xAxis,
    series: dark.series,
  });
});

it('图例的局部业务样式在声明式重绘与还原后仍使用当前默认色', async () => {
  const option = reactive<ChartOption>({
    legend: { textStyle: { fontSize: 16 } },
    xAxis: { type: 'category', data: ['甲', '乙'] },
    yAxis: {},
    series: [{ type: 'line', data: [1, 2] }],
  });
  const { theme, instance } = await mountThemedChart(option, true);
  const legendStyle = () =>
    (instance.getOption().legend as Array<{ textStyle: { color: string; fontSize: number } }>)[0]!
      .textStyle;
  const light = legendStyle().color;
  theme.value = 'neon-blue';
  await nextTick();
  const dark = legendStyle().color;
  expect(dark).not.toBe(light);
  option.series = [{ type: 'line', data: [3, 4] }];
  await nextTick();
  expect(legendStyle()).toMatchObject({ color: dark, fontSize: 16 });
  instance.dispatchAction({ type: 'restore' });
  expect(legendStyle()).toMatchObject({ color: dark, fontSize: 16 });
});

it('被生成光晕覆写的声明式阴影也随主题更新', async () => {
  const { theme, instance } = await mountThemedChart({
    xAxis: {},
    yAxis: {},
    series: [{ type: 'line', data: [1], lineStyle: { shadowColor: 'red' } }],
  });
  const color = () =>
    (instance.getOption().series as Array<{ lineStyle: { shadowColor: string } }>)[0]!.lineStyle
      .shadowColor;
  expect(color()).toBe('rgba(22, 104, 220, 0.25)');
  theme.value = 'neon-blue';
  await nextTick();
  expect(color()).toBe('rgba(0, 240, 255, 0.3)');
});

it.each([undefined, 'series'])('系列类型改变时重置旧模型的显式样式：%s', async replaceMerge => {
  const { theme, api, instance } = await mountThemedChart({ xAxis: {}, yAxis: {}, series: [] });
  api.setOption({
    series: { id: 'metric', type: 'bar', data: [1], itemStyle: { borderColor: 'red' } },
  });
  api.setOption(
    { series: { id: 'metric', type: 'pie', data: [{ name: '甲', value: 1 }] } },
    { replaceMerge }
  );
  const series = () => instance.getOption().series as Array<{ itemStyle: { borderColor: string } }>;
  const light = series()[0]!.itemStyle.borderColor;
  expect(light).not.toBe('red');
  theme.value = 'neon-blue';
  await nextTick();
  expect(series()[0]!.itemStyle.borderColor).not.toBe(light);
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
