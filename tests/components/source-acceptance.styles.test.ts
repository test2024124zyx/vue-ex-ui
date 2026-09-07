import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { enableAutoUnmount, mount } from '@vue/test-utils';
import { compileStyle } from '@vue/compiler-sfc';
import { compileString } from 'sass-embedded';
import { h, nextTick, ref, defineComponent, createSSRApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import ExConfigProvider from '../../src/components/config-provider/ExConfigProvider.vue';
import ExGrid from '../../src/components/grid/ExGrid.vue';
import ExGridItem from '../../src/components/grid/ExGridItem.vue';
import ExIcon from '../../src/components/icon/ExIcon.vue';

enableAutoUnmount(afterEach);
const styleElements: HTMLStyleElement[] = [];
afterEach(() => styleElements.splice(0).forEach(element => element.remove()));

const installStyle = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  styleElements.push(style);
};

describe('真实样式作用域回归', () => {
  it('全局色差与扫描线规则遵循最近 Provider，保留手动无动画工具类', () => {
    const fileUrl = pathToFileURL(resolve('src/styles/base.scss'));
    installStyle(compileString(readFileSync(fileUrl, 'utf8'), { url: fileUrl }).css);
    const wrapper = mount(ExConfigProvider, {
      props: { animation: false },
      slots: {
        default: () => [
          h('div', { class: 'ex-cyber-glitch outer-glitch' }),
          h(ExConfigProvider, { animation: true }, () => [
            h('div', { class: 'ex-cyber-glitch inner-glitch' }),
            h('div', { class: 'ex-app inner-app' }),
          ]),
          h('div', { class: 'ex-app outer-app' }),
        ],
      },
      attachTo: document.body,
    });
    expect(getComputedStyle(wrapper.get('.outer-glitch').element).animation).toBe('none');
    expect(getComputedStyle(wrapper.get('.inner-glitch').element).animation).toContain(
      'ex-cyber-glitch'
    );
    const disabledScanline = (selector: string) =>
      Array.from(document.styleSheets).some(sheet =>
        Array.from(sheet.cssRules).some(
          rule =>
            rule instanceof CSSStyleRule &&
            rule.selectorText.includes('::after') &&
            rule.style.animation === 'none' &&
            wrapper.get(selector).element.matches(rule.selectorText.replaceAll('::after', ''))
        )
      );
    expect(disabledScanline('.outer-app')).toBe(true);
    expect(disabledScanline('.inner-app')).toBe(false);
    const manual = document.createElement('div');
    manual.className = 'ex-no-animation';
    manual.innerHTML = '<div class="ex-cyber-glitch"></div>';
    document.body.appendChild(manual);
    try {
      expect(getComputedStyle(manual.firstElementChild!).animation).toBe('none');
    } finally {
      manual.remove();
    }
  });

  it('同一文档中的独立 Vue App 不共享 Provider 动画和霓虹规则', () => {
    installStyle('.ex-app-probe { box-shadow: 0 0 3px red; animation: probe 1s infinite; }');
    const disabled = mount(ExConfigProvider, {
      props: { animation: false, neonEffect: false },
      slots: { default: () => h('div', { class: 'ex-app-probe' }) },
      attachTo: document.body,
    });
    const enabled = mount(ExConfigProvider, {
      props: { animation: true, neonEffect: true },
      slots: { default: () => h('div', { class: 'ex-app-probe' }) },
      attachTo: document.body,
    });
    expect(disabled.attributes('data-ex-provider')).not.toBe(
      enabled.attributes('data-ex-provider')
    );
    expect(getComputedStyle(disabled.get('.ex-app-probe').element).animation).toBe('none');
    expect(getComputedStyle(enabled.get('.ex-app-probe').element).animation).toBe(
      'probe 1s infinite'
    );
    expect(getComputedStyle(enabled.get('.ex-app-probe').element).boxShadow).toBe('0 0 3px red');
  });

  it('独立 SSR 应用生成隔离边界，水合复用服务端标识和样式', async () => {
    const probe = defineComponent(
      () => () =>
        h(ExConfigProvider, { animation: false, neonEffect: false }, () =>
          h('div', { class: 'ex-ssr-probe' })
        )
    );
    const firstHtml = await renderToString(createSSRApp(probe));
    const secondHtml = await renderToString(createSSRApp(probe));
    const firstHost = document.createElement('div');
    const secondHost = document.createElement('div');
    firstHost.innerHTML = firstHtml;
    secondHost.innerHTML = secondHtml;
    document.body.append(firstHost, secondHost);
    const firstId = firstHost.firstElementChild!.getAttribute('data-ex-provider');
    const secondId = secondHost.firstElementChild!.getAttribute('data-ex-provider');
    const app = createSSRApp(probe);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      expect(firstId).not.toBe(secondId);
      expect(getComputedStyle(firstHost.querySelector('.ex-ssr-probe')!).animation).toBe('none');
      app.mount(firstHost);
      await nextTick();
      expect(firstHost.firstElementChild!.getAttribute('data-ex-provider')).toBe(firstId);
      expect(firstHost.querySelector('style')!.textContent).toContain(firstId);
      expect(warning).not.toHaveBeenCalled();
    } finally {
      app.unmount();
      warning.mockRestore();
      firstHost.remove();
      secondHost.remove();
    }
  });

  it.each([
    ['grid/ExGrid.scss', ExGrid, ExGridItem, '.ex-grid-item', 'padding'],
    ['icon/ExIcon.scss', ExIcon, 'svg', 'svg', 'width'],
  ] as const)('%s 编译后的样式匹配外部插槽节点', (file, parent, child, selector, property) => {
    const fileUrl = pathToFileURL(resolve('src/components', file));
    const css = compileString(readFileSync(fileUrl, 'utf8'), { url: fileUrl }).css;
    const scopeId = (parent as unknown as { __scopeId: string }).__scopeId;
    const compiled = compileStyle({ source: css, filename: file, id: scopeId, scoped: true });
    expect(compiled.errors).toEqual([]);
    installStyle(compiled.code);
    const wrapper = mount(
      defineComponent({
        __scopeId: 'data-v-consumer',
        render: () => h(parent, {}, () => h(child)),
      })
    );
    const target = wrapper.get(selector).element;
    const matches = Array.from(styleElements.at(-1)!.sheet!.cssRules).some(rule => {
      if (!(rule instanceof CSSStyleRule) || !rule.style.getPropertyValue(property)) return false;
      return target.matches(rule.selectorText);
    });
    expect(matches).toBe(true);
  });

  it('三层 Provider 各自应用动画和霓虹配置，并响应运行时切换', async () => {
    installStyle('.ex-effect-probe { box-shadow: 0 0 3px red; animation: probe 1s infinite; }');
    const enabled = ref(true);
    const wrapper = mount(
      defineComponent(
        () => () =>
          h(ExConfigProvider, { animation: false, neonEffect: false }, () => [
            h('div', { class: 'ex-effect-probe outer' }),
            h(ExConfigProvider, { animation: enabled.value, neonEffect: enabled.value }, () => [
              h('div', { class: 'ex-effect-probe middle' }),
              h(ExConfigProvider, { animation: false, neonEffect: false }, () =>
                h('div', { class: 'ex-effect-probe inner' })
              ),
            ]),
          ])
      ),
      { attachTo: document.body }
    );
    const shadow = (selector: string) => getComputedStyle(wrapper.get(selector).element).boxShadow;
    const animation = (selector: string) =>
      getComputedStyle(wrapper.get(selector).element).animation;
    expect(shadow('.outer')).toBe('none');
    expect(shadow('.middle')).toBe('0 0 3px red');
    expect(shadow('.inner')).toBe('none');
    expect(animation('.outer')).toBe('none');
    expect(animation('.middle')).toBe('probe 1s infinite');
    expect(animation('.inner')).toBe('none');
    enabled.value = false;
    await nextTick();
    expect(shadow('.middle')).toBe('none');
    expect(animation('.middle')).toBe('none');
    enabled.value = true;
    await nextTick();
    expect(shadow('.middle')).toBe('0 0 3px red');
  });
});
