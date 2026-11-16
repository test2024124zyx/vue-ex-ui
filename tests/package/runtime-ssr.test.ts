// @vitest-environment node
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { describe, expect, it } from 'vitest';
import { getTheme, setTheme, useTheme } from '../../src/composables/useTheme';
import { getCurrentLocale, setLocale, useLocale } from '../../src/locale';

describe('服务端运行时隔离', () => {
  it('并发请求内的父子组件共享偏好，另一个请求拥有独立的默认值', async () => {
    let release = () => {};
    const gate = new Promise<void>(resolve => {
      release = resolve;
    });
    const probe = {
      setup() {
        const { theme } = useTheme();
        const { t } = useLocale('common');
        return () => h('span', `${theme.value}|${t('confirm')}|${getCurrentLocale()}`);
      },
    };
    const first = createSSRApp({
      setup() {
        setTheme('light');
        setLocale('zh-CN');
        return () =>
          h({
            async setup() {
              await gate;
              return () => h(probe);
            },
          });
      },
    });
    const second = createSSRApp(probe);
    const firstHtml = renderToString(first);
    const secondHtml = await renderToString(second);
    release();

    expect(await firstHtml).toBe('<span>light|确认|zh-CN</span>');
    expect(secondHtml).toBe('<span>neon-blue|Confirm|en-US</span>');
  });

  it('渲染作用域外的写入不会改变后续请求的默认主题和语言', () => {
    setTheme('light');
    setLocale('zh-CN');
    expect(getTheme()).toBe('neon-blue');
    expect(getCurrentLocale()).toBe('en-US');
  });
});
