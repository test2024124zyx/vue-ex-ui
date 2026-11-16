import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick, type Component } from 'vue';
import ExAnchor from '../../src/components/anchor/ExAnchor.vue';
import ExAnchorLink from '../../src/components/anchor/ExAnchorLink.vue';
import ExCascader from '../../src/components/cascader/ExCascader.vue';
import ExColorPicker from '../../src/components/color-picker/ExColorPicker.vue';
import ExDateTimePicker from '../../src/components/datetime-picker/ExDateTimePicker.vue';
import ExHeatmap from '../../src/components/heatmap/ExHeatmap.vue';
import ExSelect from '../../src/components/select/ExSelect.vue';
import ExTimePicker from '../../src/components/time-picker/ExTimePicker.vue';
import ExTreeSelect from '../../src/components/tree-select/ExTreeSelect.vue';

enableAutoUnmount(afterEach);
beforeEach(() => vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] }));
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('按帧合并滚动定位', () => {
  it.each([
    ['Cascader', ExCascader, '.ex-cascader__input-wrapper'],
    ['ColorPicker', ExColorPicker, '.ex-color-picker__trigger'],
    ['DateTimePicker', ExDateTimePicker, '[role="combobox"]'],
    ['Heatmap', ExHeatmap, '.ex-heatmap__cell', 'mouseenter'],
    ['Select', ExSelect, '.ex-select__trigger'],
    ['TimePicker', ExTimePicker, '[role="combobox"]'],
    ['TreeSelect', ExTreeSelect, '[role="combobox"]'],
  ] as const)(
    '%s 浮层定位每帧只测量一次，卸载取消待执行定位',
    async (_name, control, selector, event?: string) => {
      const container = document.createElement('div');
      document.body.append(container);
      const props: Record<string, unknown> =
        control === ExHeatmap
          ? {
              data: [{ date: '2024-01-01', value: 2 }],
              startDate: '2024-01-01',
              endDate: '2024-01-01',
            }
          : { teleported: true };
      const wrapper = mount(control as Component, { attachTo: container, props });
      try {
        await wrapper.get(selector).trigger(event ?? 'click');
        await nextTick();
        await vi.advanceTimersByTimeAsync(20);
        const measure = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
        container.dispatchEvent(new Event('scroll'));
        container.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
        await nextTick();
        expect(measure).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(20);
        const target = measure.mock.instances.find(element => wrapper.element.contains(element));
        expect(target).toBeDefined();
        expect(measure.mock.instances.filter(element => element === target)).toHaveLength(1);
        measure.mockClear();
        container.dispatchEvent(new Event('scroll'));
        wrapper.unmount();
        await vi.advanceTimersByTimeAsync(20);
        expect(measure).not.toHaveBeenCalled();
      } finally {
        container.remove();
      }
    }
  );

  it('Anchor 合并容器滚动并只读取一次容器矩形，内容移动后仍选中最近锚点', async () => {
    const container = document.createElement('div');
    const first = document.createElement('article');
    const second = document.createElement('article');
    first.id = 'frame-first';
    second.id = 'frame-second';
    container.append(first, second);
    document.body.append(container);
    const containerRect = vi
      .spyOn(container, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 50));
    const firstRect = vi.spyOn(first, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 45));
    const secondRect = vi
      .spyOn(second, 'getBoundingClientRect')
      .mockReturnValue(new DOMRect(0, 100));
    const wrapper = mount(ExAnchor, {
      props: { container: () => container, bounds: 0 },
      slots: {
        default: () => [
          h(ExAnchorLink, { href: '#frame-second', title: '第二节' }),
          h(ExAnchorLink, { href: '#frame-first', title: '第一节' }),
        ],
      },
    });
    try {
      expect(wrapper.emitted('change')).toEqual([['#frame-first']]);
      containerRect.mockClear();
      firstRect.mockClear();
      secondRect.mockClear().mockReturnValue(new DOMRect(0, 48));
      container.dispatchEvent(new Event('scroll'));
      container.dispatchEvent(new Event('scroll'));
      expect(containerRect).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(20);
      expect(containerRect).toHaveBeenCalledTimes(1);
      expect(firstRect).toHaveBeenCalledTimes(1);
      expect(secondRect).toHaveBeenCalledTimes(1);
      expect(wrapper.emitted('change')).toEqual([['#frame-first'], ['#frame-second']]);
    } finally {
      container.remove();
    }
  });
});
