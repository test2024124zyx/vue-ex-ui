import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import { logger } from '../../../src/utils/logger';

enableAutoUnmount(afterEach);
afterEach(() => vi.restoreAllMocks());

describe('下拉选项使用统一索引', () => {
  it.each([false, true])('重复值保留首项，普通渲染与虚拟渲染一致：%s', async virtual => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {});
    const wrapper = mount(ExSelect, {
      props: {
        virtual,
        searchable: true,
        options: [
          { value: 0, label: '首项' },
          {
            label: '分组',
            options: [
              { value: 0, label: '重复项' },
              { value: 1, label: '末项' },
            ],
          },
        ],
      },
      attachTo: document.body,
    });
    const input = wrapper.get<HTMLInputElement>('input[role="combobox"]');
    await input.trigger('click');
    const items = () => [...document.body.querySelectorAll('[role="option"]')];
    expect(items().map(option => option.textContent?.trim())).toEqual(['首项', '末项']);
    expect(new Set(items().map(option => option.id)).size).toBe(2);
    expect(warn).toHaveBeenCalledTimes(1);
    await input.trigger('keydown', { key: 'End' });
    expect(
      document.getElementById(input.attributes('aria-activedescendant')!)?.textContent
    ).toContain('末项');
    await input.setValue('重复');
    expect(items()).toHaveLength(0);
  });

  it('选项顺序变化后保留活动值，活动项原地禁用时移动到可用项', async () => {
    const options = reactive([
      { value: 0, label: '甲', disabled: false },
      { value: 1, label: '乙', disabled: false },
    ]);
    const wrapper = mount(ExSelect, { props: { options, modelValue: 0 }, attachTo: document.body });
    const trigger = wrapper.get('[role="combobox"]');
    await trigger.trigger('click');
    await nextTick();
    const activeItem = () =>
      document.getElementById(trigger.attributes('aria-activedescendant')!)?.textContent?.trim();
    expect(activeItem()).toBe('甲');
    options.reverse();
    await nextTick();
    expect(activeItem()).toBe('甲');
    options[1]!.disabled = true;
    await nextTick();
    expect(activeItem()).toBe('乙');
  });
});
