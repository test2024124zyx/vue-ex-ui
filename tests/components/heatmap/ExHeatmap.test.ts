import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExHeatmap from '../../../src/components/heatmap/ExHeatmap.vue';
import { setLocale } from '../../../src/locale';
import type { ExHeatmapProps, HeatmapDataItem } from '../../../src/components/heatmap/types';

describe('ExHeatmap', () => {
  const wrappers: VueWrapper[] = [];
  const hosts: HTMLElement[] = [];
  const data: HeatmapDataItem[] = [
    { date: '2024-01-01', value: 2, source: 'first' },
    { date: '2024-01-02', value: 5 },
    { date: '2024-01-03', value: 10 },
  ];

  const mountHeatmap = (
    props: Partial<ExHeatmapProps> = {},
    slots: Record<string, string> = {}
  ) => {
    const host = document.createElement('div');
    document.body.append(host);
    hosts.push(host);
    const wrapper = mount(ExHeatmap, {
      attachTo: host,
      props: {
        data,
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        ...props,
      },
      slots,
    });
    wrappers.push(wrapper);
    return wrapper;
  };

  beforeEach(() => {
    setLocale('en-US');
  });

  afterEach(() => {
    // Teleport 浮层和挂载容器都必须清理，避免跨用例污染 DOM。
    wrappers.splice(0).forEach(wrapper => wrapper.unmount());
    hosts.splice(0).forEach(host => host.remove());
    document.querySelectorAll('.ex-heatmap__tooltip').forEach(node => node.remove());
  });

  it('按给定范围渲染可命名的日期按钮，并只保留一个 Tab 入口', () => {
    const wrapper = mountHeatmap();
    const cells = wrapper.findAll<HTMLButtonElement>('.ex-heatmap__cell');

    expect(wrapper.attributes('role')).toBe('group');
    expect(wrapper.attributes('aria-label')).toBe('Data heatmap');
    expect(cells).toHaveLength(7);
    expect(cells.filter(cell => cell.attributes('tabindex') === '0')).toHaveLength(1);
    const firstDate = wrapper.find('[data-date="2024-01-01"]');
    expect(firstDate.attributes('tabindex')).toBe('0');
    expect(firstDate.attributes('aria-label')).toContain('2');
    expect(firstDate.attributes('title')).toBeUndefined();
  });

  it('范围外补位仅用于对齐完整周，不会伪装成可交互日期', () => {
    const wrapper = mountHeatmap({ startDate: '2024-01-02', endDate: '2024-01-05' });

    expect(wrapper.findAll('.ex-heatmap__placeholder')).toHaveLength(3);
    expect(wrapper.findAll('.ex-heatmap__cell')).toHaveLength(4);
    expect(wrapper.find('[data-date="2023-12-31"]').exists()).toBe(false);
  });

  it('无有效数据时渲染空状态并支持自定义插槽', () => {
    const empty = mountHeatmap({ data: [] }, { empty: '<strong class="custom-empty">空</strong>' });
    expect(empty.find('.custom-empty').exists()).toBe(true);
    expect(empty.find('.ex-heatmap__legend').exists()).toBe(false);

    const invalid = mountHeatmap({ data: [{ date: '2024-02-30', value: 1 }] });
    expect(invalid.find('.ex-heatmap__empty').exists()).toBe(true);
    expect(invalid.findAll('.ex-heatmap__cell')).toHaveLength(0);
  });

  it('无效、倒置或超过上限的范围显示明确错误，而不是空网格', () => {
    const invalid = mountHeatmap({ startDate: '2024-02-30', endDate: '2024-03-01' });
    const reversed = mountHeatmap({ startDate: '2024-03-02', endDate: '2024-03-01' });
    const oversized = mountHeatmap({ startDate: '2023-01-01', endDate: '2024-01-02' });

    for (const wrapper of [invalid, reversed, oversized]) {
      expect(wrapper.find('.ex-heatmap__empty--error').text()).toBe(
        'The date range must be valid and no longer than 366 days'
      );
      expect(wrapper.find('.ex-heatmap__body').exists()).toBe(false);
    }
  });

  it('尺寸、主题、自定义类和像素参数均真实作用于根样式', () => {
    const wrapper = mountHeatmap({
      size: 'large',
      theme: 'green',
      gap: 6,
      radius: 100,
      class: ['activity-map', 'compact'],
      style: { maxWidth: '600px' },
    });

    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        'ex-heatmap',
        'ex-heatmap--large',
        'ex-heatmap--green',
        'activity-map',
        'compact',
      ])
    );
    expect(wrapper.attributes('style')).toContain('--ex-heatmap-cell-size: 32px');
    expect(wrapper.attributes('style')).toContain('--ex-heatmap-gap: 6px');
    expect(wrapper.attributes('style')).toContain('--ex-heatmap-radius: 16px');
    expect(wrapper.attributes('style')).toContain('max-width: 600px');
  });

  it('月份和星期标签与网格列对齐，并可分别关闭', async () => {
    const wrapper = mountHeatmap({ startDate: '2024-01-30', endDate: '2024-02-05' });

    expect(wrapper.findAll('.ex-heatmap__month-slot')).toHaveLength(2);
    expect(wrapper.find('.ex-heatmap__month-grid').text()).toContain('Feb');
    expect(wrapper.findAll('.ex-heatmap__week-label')).toHaveLength(7);
    expect(wrapper.findAll('.ex-heatmap__week-label').filter(label => label.text())).toHaveLength(
      3
    );

    await wrapper.setProps({ showMonthLabels: false, showWeekLabels: false });
    expect(wrapper.find('.ex-heatmap__months').exists()).toBe(false);
    expect(wrapper.find('.ex-heatmap__weeks').exists()).toBe(false);
  });

  it('按有效最大值计算等级，并忽略非有限 maxValue', async () => {
    const wrapper = mountHeatmap({ maxValue: 20 });
    expect(wrapper.find('[data-date="2024-01-03"]').classes()).toContain(
      'ex-heatmap__cell--level-3'
    );

    await wrapper.setProps({ maxValue: Number.POSITIVE_INFINITY });
    expect(wrapper.find('[data-date="2024-01-03"]').classes()).toContain(
      'ex-heatmap__cell--level-4'
    );
  });

  it('点击发出规范化数据和真实 MouseEvent', async () => {
    const wrapper = mountHeatmap({
      data: [{ date: '2024-01-02', value: -5, source: 'server' }],
    });

    await wrapper.find('[data-date="2024-01-02"]').trigger('click');
    const event = wrapper.emitted('cell-click')?.[0];
    expect(event?.[0]).toMatchObject({ date: '2024-01-02', value: 0, source: 'server' });
    expect(event?.[1]).toBeInstanceOf(MouseEvent);
  });

  it('指针悬停发出 hover 事件，键盘聚焦仅控制单实例 Tooltip', async () => {
    const wrapper = mountHeatmap();
    const cell = wrapper.find<HTMLButtonElement>('[data-date="2024-01-01"]');

    await cell.trigger('mouseenter');
    await nextTick();
    expect(wrapper.emitted('cell-hover')?.[0]?.[0]).toMatchObject({ date: '2024-01-01' });
    expect(document.body.querySelectorAll('.ex-heatmap__tooltip')).toHaveLength(1);
    expect(cell.attributes('aria-describedby')).toMatch(/^ex-heatmap-tooltip-/);

    await cell.trigger('mouseleave');
    await cell.trigger('focus');
    await nextTick();
    expect(wrapper.emitted('cell-hover')).toHaveLength(2);
    expect(wrapper.emitted('cell-hover')?.[1]?.[0]).toBeNull();
    expect(document.body.querySelectorAll('.ex-heatmap__tooltip')).toHaveLength(1);
  });

  it('Teleport Tooltip 使用最近 ConfigProvider 的语义层级', async () => {
    const host = document.createElement('div');
    document.body.append(host);
    hosts.push(host);
    const wrapper = mount(ExConfigProvider, {
      attachTo: host,
      props: { zIndex: 2400, animation: false, neonEffect: false },
      slots: {
        default: () =>
          h(ExHeatmap, {
            data,
            startDate: '2024-01-01',
            endDate: '2024-01-07',
          }),
      },
    });
    wrappers.push(wrapper);

    await wrapper.get('[data-date="2024-01-01"]').trigger('mouseenter');
    await nextTick();

    const tooltip = document.body.querySelector<HTMLElement>('.ex-heatmap__tooltip');
    expect(tooltip?.style.zIndex).toBe('2490');
    expect(tooltip?.classList.contains('ex-no-animation')).toBe(true);
    expect(tooltip?.classList.contains('ex-no-neon')).toBe(true);
  });

  it('关闭 Tooltip 后不会创建隐藏或裁剪的伪浮层', async () => {
    const wrapper = mountHeatmap({ showTooltip: false });
    await wrapper.find('[data-date="2024-01-01"]').trigger('mouseenter');
    await nextTick();

    expect(document.body.querySelector('.ex-heatmap__tooltip')).toBeNull();
    expect(wrapper.find('[data-date="2024-01-01"]').attributes('aria-describedby')).toBeUndefined();
  });

  it('方向键按二维周历移动焦点，并在范围边缘停止', async () => {
    const wrapper = mountHeatmap({ endDate: '2024-01-21' });
    const first = wrapper.find<HTMLButtonElement>('[data-date="2024-01-01"]');
    first.element.focus();

    await first.trigger('keydown', { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(first.element);

    await first.trigger('keydown', { key: 'ArrowRight' });
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2024-01-08');

    await wrapper.find('[data-date="2024-01-08"]').trigger('keydown', { key: 'ArrowDown' });
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2024-01-09');
    expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(1);
  });

  it('日期范围更新后重置失效的漫游焦点', async () => {
    const wrapper = mountHeatmap();
    await wrapper.find('[data-date="2024-01-03"]').trigger('focus');
    await wrapper.setProps({ startDate: '2024-01-10', endDate: '2024-01-12' });

    expect(wrapper.find('[tabindex="0"]').attributes('data-date')).toBe('2024-01-10');
    expect(document.body.querySelector('.ex-heatmap__tooltip')).toBeNull();

    await wrapper.setProps({ startDate: '2024-01-01', endDate: '2024-01-07' });
    expect(document.body.querySelector('.ex-heatmap__tooltip')).toBeNull();
  });

  it('只暴露真实可用的根元素，不再保留伪刷新 API', () => {
    const wrapper = mountHeatmap();
    const exposed = wrapper.vm as unknown as {
      getElement: () => HTMLDivElement | null;
      refresh?: unknown;
    };

    expect(exposed.getElement()).toBe(wrapper.element);
    expect(exposed.refresh).toBeUndefined();
  });
});
