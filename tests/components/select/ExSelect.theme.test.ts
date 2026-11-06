import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { h, nextTick, reactive } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import ExSelect from '../../../src/components/select/ExSelect.vue';

enableAutoUnmount(afterEach);
afterEach(() => document.body.replaceChildren());

describe('Select 实际列表节点的主题上下文', () => {
  it.each([false, true])(
    'virtual=%s 时多个 Provider 的主题与变量保持隔离且动态更新',
    async virtual => {
      const first = reactive({ theme: 'light' as 'light' | 'neon-blue', color: '#123456' });
      const wrapper = mount(
        {
          render: () =>
            h('div', [
              h(
                ExConfigProvider,
                {
                  theme: first.theme,
                  themeOverrides: { '--ex-color-primary': first.color },
                },
                {
                  default: () =>
                    h(ExSelect, {
                      id: 'themed-first',
                      virtual,
                      options: [{ value: 1, label: '第一项' }],
                    }),
                }
              ),
              h(
                ExConfigProvider,
                {
                  theme: 'neon-blue',
                  themeOverrides: { '--ex-color-primary': '#abcdef' },
                },
                {
                  default: () =>
                    h(ExSelect, {
                      id: 'themed-second',
                      virtual,
                      options: [{ value: 2, label: '第二项' }],
                    }),
                }
              ),
            ]),
        },
        { attachTo: document.body }
      );
      for (const select of wrapper.findAllComponents(ExSelect)) {
        await select.get('[role="combobox"]').trigger('click');
      }
      const firstList = document.querySelector<HTMLElement>('#themed-first-dropdown')!;
      const secondList = document.querySelector<HTMLElement>('#themed-second-dropdown')!;
      expect(firstList.getAttribute('role')).toBe('listbox');
      expect(firstList.dataset.theme).toBe('light');
      expect(firstList.style.getPropertyValue('--ex-color-primary')).toBe('#123456');
      expect(secondList.dataset.theme).toBe('neon-blue');
      expect(secondList.style.getPropertyValue('--ex-color-primary')).toBe('#abcdef');
      first.theme = 'neon-blue';
      first.color = '#654321';
      await nextTick();
      expect(firstList.dataset.theme).toBe('neon-blue');
      expect(firstList.style.getPropertyValue('--ex-color-primary')).toBe('#654321');
      expect(secondList.style.getPropertyValue('--ex-color-primary')).toBe('#abcdef');
    }
  );
});
