import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import type { SelectOptions } from '../../../src/components/select/types';

enableAutoUnmount(afterEach);
afterEach(() => vi.useRealTimers());

const list = (length: number): SelectOptions => [
  {
    label: '业务数据',
    options: Array.from({ length }, (_, value) => ({ value, label: `记录${value}` })),
  },
];

function open(options: SelectOptions, attrs: { virtual?: boolean; remote?: boolean } = {}) {
  const wrapper = mount(ExSelect, {
    props: { options, searchable: true, ...attrs },
    attachTo: document.body,
  });
  const input = wrapper.get<HTMLInputElement>('input[role="combobox"]');
  const popup = () => document.getElementById(input.attributes('aria-controls') ?? '');
  const items = () => [...(popup()?.querySelectorAll('[role="option"]') ?? [])];
  return { wrapper, input, popup, items };
}

describe('Select 大列表', () => {
  it.each([
    { size: 499, virtual: undefined, expected: false },
    { size: 500, virtual: undefined, expected: true },
    { size: 500, virtual: false, expected: false },
  ])(
    '选项数 $size 且 virtual=$virtual 时虚拟化为 $expected',
    async ({ size, virtual, expected }) => {
      const { popup, items, input } = open(list(size), virtual === undefined ? {} : { virtual });
      await input.trigger('click');
      expect(popup()!.classList.contains('ex-select__options--virtual')).toBe(expected);
      expect(items().length < size).toBe(expected);
    }
  );

  it('只提交最后一次本地搜索，键盘确认时即时应用尚未执行的查询', async () => {
    vi.useFakeTimers();
    const { wrapper, input, items } = open(list(500));
    await input.trigger('click');
    await input.setValue('记录12');
    await vi.advanceTimersByTimeAsync(75);
    await input.setValue('记录499');
    await vi.advanceTimersByTimeAsync(25);
    expect(items().some(option => option.textContent?.trim() === '记录499')).toBe(false);
    expect(items().length).toBeGreaterThan(1);
    await vi.advanceTimersByTimeAsync(75);
    expect(items().map(option => option.textContent?.trim())).toEqual(['记录499']);

    await input.setValue('记录299');
    await input.trigger('keydown', { key: 'Enter' });
    await nextTick();
    expect(wrapper.emitted('update:modelValue')).toEqual([[299]]);
    await vi.runOnlyPendingTimersAsync();
    await input.trigger('click');
    expect(items().length).toBeGreaterThan(1);
  });

  it('小列表继续即时搜索，远程列表不执行本地过滤', async () => {
    const local = open(list(499));
    await local.input.trigger('click');
    await local.input.setValue('记录498');
    expect(local.items().map(option => option.textContent?.trim())).toEqual(['记录498']);
    const remote = open(list(500), { remote: true });
    await remote.input.trigger('click');
    const before = remote.items().map(option => option.textContent?.trim());
    expect(before.length).toBeGreaterThan(0);
    await remote.input.setValue('服务端术语');
    expect(remote.items().map(option => option.textContent?.trim())).toEqual(before);
  });
});
