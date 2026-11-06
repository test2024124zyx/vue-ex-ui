import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import ExConfigProvider from '../../../src/components/config-provider/ExConfigProvider.vue';
import { useConfig, useThemeOverrides } from '../../../src/components/config-provider/composables';
import ExSelect from '../../../src/components/select/ExSelect.vue';
import { setTheme } from '../../../src/composables/useTheme';

describe('全局主题与组件配置的一致性', () => {
  const wrappers: Array<ReturnType<typeof mount>> = [];

  beforeEach(() => setTheme('neon-blue'));

  afterEach(() => {
    wrappers.forEach(wrapper => wrapper.unmount());
    wrappers.length = 0;
    document.body.innerHTML = '';
    setTheme('neon-blue');
  });

  it('未使用 Provider 时，已打开的下拉层响应全局主题变化', async () => {
    const wrapper = mount(ExSelect, {
      props: { options: [{ label: '上海', value: 'shanghai' }] },
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    await wrapper.get('[role="combobox"]').trigger('click');
    setTheme('light');
    await nextTick();

    expect(document.querySelector('[role="listbox"]')?.getAttribute('data-theme')).toBe('light');
  });

  it('未指定主题的根 Provider 跟随全局状态，显式的局部主题保持独立', async () => {
    const themes: string[] = [];
    const Probe = {
      setup() {
        const config = useConfig();
        return () => {
          themes.push(config.theme.value);
          return h('span', config.theme.value);
        };
      },
    };
    const wrapper = mount(ExConfigProvider, {
      slots: {
        default: () => [
          h(Probe),
          h(ExConfigProvider, { theme: 'neon-blue' }, { default: () => h(Probe) }),
        ],
      },
    });
    wrappers.push(wrapper);
    themes.length = 0;
    setTheme('light');
    await nextTick();

    expect(wrapper.findAll('span').map(span => span.text())).toEqual(['light', 'neon-blue']);
    expect(themes).toContain('light');
  });

  it('品牌变量逐层合并并响应更新，浮层上下文不携带普通布局样式', async () => {
    let variables: ReturnType<typeof useThemeOverrides> | undefined;
    const Probe = {
      setup() {
        variables = useThemeOverrides();
        return () => h('span');
      },
    };
    const wrapper = mount(ExConfigProvider, {
      props: {
        themeOverrides: { '--ex-color-primary': '#112233', '--ex-color-secondary': '#334455' },
        style: 'width: 500px; --ex-brand-image: url("data:image/svg+xml;a;b");',
      },
      slots: {
        default: () =>
          h(
            ExConfigProvider,
            { themeOverrides: { '--ex-color-primary': '#abcdef' } },
            { default: () => h(Probe) }
          ),
      },
    });
    wrappers.push(wrapper);

    expect(variables?.value).toEqual({
      '--ex-color-primary': '#abcdef',
      '--ex-color-secondary': '#334455',
      '--ex-brand-image': 'url("data:image/svg+xml;a;b")',
    });
    expect(wrapper.get('.ex-config-provider').attributes('style')).toContain('#112233');
    await wrapper.setProps({
      themeOverrides: { '--ex-color-primary': '#223344', '--ex-color-secondary': '#445566' },
    });
    expect(variables?.value['--ex-color-secondary']).toBe('#445566');
    expect(variables?.value['--ex-color-primary']).toBe('#abcdef');
  });
});
