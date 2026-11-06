import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExTimePicker from '../../../src/components/time-picker/ExTimePicker.vue';
import ExTreeSelect from '../../../src/components/tree-select/ExTreeSelect.vue';
import ExDateTimePicker from '../../../src/components/datetime-picker/ExDateTimePicker.vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';

const wrappers: Array<{ unmount(): void }> = [];
function track<T extends { unmount(): void }>(wrapper: T): T {
  wrappers.push(wrapper);
  return wrapper;
}
afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount());
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('选择器动态状态与键盘边界', () => {
  it.each([0.5, 0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'TimePicker 非法步长 %s 生成有限且可操作的时间列',
    async step => {
      const wrapper = track(
        mount(ExTimePicker, {
          props: { hourStep: step, minuteStep: step, secondStep: step },
          attachTo: document.body,
        })
      );
      await wrapper.get('[role="combobox"]').trigger('click');
      await flushPromises();
      expect(document.querySelectorAll('.ex-time-picker__cell')).toHaveLength(24 + 60 + 60);
    }
  );

  it('TimePicker 展开期间的外部值更新不会被旧草稿覆盖', async () => {
    const wrapper = track(
      mount(ExTimePicker, {
        props: { modelValue: '01:02:03' },
        attachTo: document.body,
      })
    );
    await wrapper.get('[role="combobox"]').trigger('click');
    await wrapper.setProps({ modelValue: '04:05:06' });
    document.querySelector<HTMLButtonElement>('.ex-time-picker__confirm')!.click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['04:05:06']);
  });

  it('TimePicker 清空和 TreeSelect 标签删除按钮保留原生 Enter 激活', async () => {
    const time = track(
      mount(ExTimePicker, { props: { modelValue: '01:02:03' }, attachTo: document.body })
    );
    const tree = track(
      mount(ExTreeSelect, {
        props: { multiple: true, modelValue: ['a'], data: [{ value: 'a', label: '甲' }] },
        attachTo: document.body,
      })
    );
    for (const [wrapper, selector] of [
      [time, '.ex-time-picker__clear'],
      [tree, '.ex-tree-select__tag-close'],
    ] as const) {
      const button = wrapper.get<HTMLButtonElement>(selector);
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
      button.element.dispatchEvent(event);
      await nextTick();
      expect(event.defaultPrevented).toBe(false);
      expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('false');
      button.element.click();
      await nextTick();
      expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
    }
  });

  it.each([{ isComposing: true }, { keyCode: 229 }])(
    'TreeSelect 输入法确认不提交节点：%j',
    async composition => {
      const wrapper = track(
        mount(ExTreeSelect, {
          props: { data: [{ value: 'a', label: '甲' }] },
          attachTo: document.body,
        })
      );
      await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'ArrowDown' });
      await flushPromises();
      const node = document.querySelector<HTMLElement>('[role="treeitem"]')!;
      node.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, ...composition })
      );
      await nextTick();
      expect(wrapper.emitted('update:modelValue')).toBeUndefined();
      expect(wrapper.get('[role="combobox"]').attributes('aria-expanded')).toBe('true');
    }
  );

  it('DateTimePicker 禁用规则更新后无法确认被禁用的草稿', async () => {
    const wrapper = track(
      mount(ExDateTimePicker, {
        props: { modelValue: new Date(2024, 0, 15), type: 'datetime' },
        attachTo: document.body,
      })
    );
    await wrapper.get('input').trigger('click');
    await wrapper.setProps({ disabledDate: () => true });
    const confirm = document.querySelector<HTMLButtonElement>('.ex-datetime-picker__confirm-btn')!;
    expect(confirm.disabled).toBe(true);
    confirm.click();
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toBeUndefined();
  });

  it('Select 数据缩短后活动后代仍存在，清空数据后移除活动后代', async () => {
    const wrapper = track(
      mount(ExSelect, {
        props: {
          options: [
            { value: 'a', label: '甲' },
            { value: 'b', label: '乙' },
          ],
        },
        attachTo: document.body,
      })
    );
    const combo = wrapper.get('[role="combobox"]');
    await combo.trigger('keydown', { key: 'ArrowDown' });
    await combo.trigger('keydown', { key: 'End' });
    await wrapper.setProps({ options: [{ value: 'a', label: '甲' }] });
    expect(document.getElementById(combo.attributes('aria-activedescendant')!)).not.toBeNull();
    await wrapper.setProps({ options: [] });
    expect(combo.attributes('aria-activedescendant')).toBeUndefined();
  });

  it('Select 虚拟列表打开后为远处已选值渲染活动后代', async () => {
    vi.useFakeTimers();
    const wrapper = track(
      mount(ExSelect, {
        props: {
          virtual: true,
          modelValue: 900,
          options: Array.from({ length: 1000 }, (_, value) => ({ value, label: String(value) })),
        },
        attachTo: document.body,
      })
    );
    await wrapper.get('[role="combobox"]').trigger('click');
    await nextTick();
    document.querySelector('.ex-virtual-list__wrapper')!.dispatchEvent(new Event('scroll'));
    await vi.advanceTimersByTimeAsync(50);
    await flushPromises();
    const id = wrapper.get('[role="combobox"]').attributes('aria-activedescendant')!;
    expect(document.getElementById(id)).not.toBeNull();
    expect(document.getElementById(id)?.textContent).toContain('900');
  });

  it('Select 普通长列表的 End 导航滚动到活动选项', async () => {
    const wrapper = track(
      mount(ExSelect, {
        props: {
          options: Array.from({ length: 100 }, (_, value) => ({ value, label: String(value) })),
        },
        attachTo: document.body,
      })
    );
    await wrapper.get('[role="combobox"]').trigger('click');
    const option = document.querySelectorAll<HTMLElement>('.ex-select__option')[99]!;
    const scroll = vi.fn();
    option.scrollIntoView = scroll;
    await wrapper.get('[role="combobox"]').trigger('keydown', { key: 'End' });
    expect(scroll).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
    expect(wrapper.get('[role="combobox"]').attributes('aria-activedescendant')).toBe(option.id);
  });
});
