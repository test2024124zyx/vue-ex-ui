import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, type Component } from 'vue';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';
import ExTimePicker from '../../../src/components/time-picker/ExTimePicker.vue';

const wrappers: Array<{ unmount(): void }> = [];
const observations: Array<{ target: Element; callback: ResizeObserverCallback }> = [];
const disconnect = vi.fn();
beforeEach(() => {
  vi.useFakeTimers();
  observations.length = 0;
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        observations.push({ target, callback: this.callback });
      }
      disconnect = disconnect;
    }
  );
});
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('选择器动态面板布局与卸载', () => {
  it.each([
    ['日期', ExDateTimePicker, '.ex-datetime-picker__dropdown'],
    ['时间', ExTimePicker, '.ex-time-picker__panel'],
  ] as const)('%s 面板增长时重新贴合视口，关闭后停止测量', async (_name, component, selector) => {
    const wrapper = mount(component as Component, { props: { teleported: false } });
    wrappers.push(wrapper);
    const trigger = wrapper.get<HTMLElement>('[role="combobox"]');
    vi.spyOn(trigger.element, 'getBoundingClientRect').mockReturnValue({
      top: 400,
      bottom: 436,
      left: 50,
      right: 250,
      width: 200,
      height: 36,
      x: 50,
      y: 400,
      toJSON: () => ({}),
    });
    await trigger.trigger('click');
    await nextTick();
    const panel = wrapper.get<HTMLElement>(selector).element;
    Object.defineProperty(panel, 'offsetHeight', { configurable: true, value: 500 });
    Object.defineProperty(panel, 'offsetWidth', { configurable: true, value: 300 });
    await wrapper.setProps({ teleported: true });
    await nextTick();
    await nextTick();
    const observation = observations.find(item => item.target === panel);
    expect(observation).toBeDefined();
    Object.defineProperty(panel, 'offsetHeight', { configurable: true, value: 620 });
    observation!.callback([], {} as ResizeObserver);
    await vi.advanceTimersByTimeAsync(20);
    const top = Number.parseFloat(panel.style.top);
    expect(top + 620).toBeLessThanOrEqual(window.innerHeight);
    await trigger.trigger('keydown', { key: 'Escape' });
    expect(disconnect).toHaveBeenCalled();
  });
});
