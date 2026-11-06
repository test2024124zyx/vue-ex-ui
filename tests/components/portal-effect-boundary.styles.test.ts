import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils';
import { compileStyle, parse } from '@vue/compiler-sfc';
import { compileString } from 'sass-embedded';
import { defineComponent, nextTick, ref } from 'vue';
import ConfigProvider from '../../src/components/config-provider/ExConfigProvider.vue';
import BackTop from '../../src/components/back-top/ExBackTop.vue';
import Cascader from '../../src/components/cascader/ExCascader.vue';
import Dialog from '../../src/components/dialog/ExDialog.vue';
import Drawer from '../../src/components/drawer/ExDrawer.vue';
import Dropdown from '../../src/components/dropdown/ExDropdown.vue';
import FilePreview from '../../src/components/file-preview/ExFilePreview.vue';
import Loading from '../../src/components/loading/ExLoading.vue';
import Message from '../../src/components/message/ExMessage.vue';
import Notification from '../../src/components/notification/ExNotification.vue';
import Popover from '../../src/components/popover/ExPopover.vue';
import Select from '../../src/components/select/ExSelect.vue';
import Tooltip from '../../src/components/tooltip/ExTooltip.vue';

enableAutoUnmount(afterEach);
const styleElements: HTMLStyleElement[] = [];
afterEach(() => {
  styleElements.splice(0).forEach(element => element.remove());
  document.body.innerHTML = '';
});

const installStyle = (css: string) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  styleElements.push(style);
};

const installComponentStyle = (file: string, scopeId: string) => {
  const fileUrl = pathToFileURL(resolve('src/components', file));
  const source = readFileSync(fileUrl, 'utf8');
  const scss = file.endsWith('.vue') ? parse(source).descriptor.styles[0]!.content : source;
  const css = compileString(scss, { url: fileUrl }).css;
  const compiled = compileStyle({ source: css, filename: file, id: scopeId, scoped: true });
  expect(compiled.errors).toEqual([]);
  installStyle(compiled.code);
};

const cases = [
  ['back-top/ExBackTop.vue', BackTop, '.ex-back-top', 'default', ':visibility-height="0"'],
  [
    'cascader/ExCascader.scss',
    Cascader,
    '.ex-cascader__dropdown',
    'option',
    ':options="[{ value: 1, label: \'选项\' }]"',
    '.ex-cascader__input-wrapper',
  ],
  ['dialog/ExDialog.scss', Dialog, '.ex-dialog-wrapper', 'default', ':model-value="true"'],
  ['drawer/ExDrawer.scss', Drawer, '.ex-drawer-wrapper', 'default', ':model-value="true"'],
  ['dropdown/ExDropdown.scss', Dropdown, '.ex-dropdown__menu', 'menu', ':visible="true"'],
  [
    'file-preview/ExFilePreview.scss',
    FilePreview,
    '.ex-file-preview',
    'toolbar',
    ':visible="true" file="/preview.png"',
  ],
  ['message/ExMessage.scss', Message, '.ex-message', 'default', ':duration="0"'],
  [
    'notification/ExNotification.scss',
    Notification,
    '.ex-notification',
    'default',
    ':duration="0"',
  ],
  ['popover/ExPopover.scss', Popover, '.ex-popover__popper', 'content', ':model-value="true"'],
  [
    'select/ExSelect.scss',
    Select,
    '.ex-select__dropdown',
    'option',
    ':options="[{ value: 1, label: \'选项\' }]"',
    '.ex-select__trigger',
  ],
  ['tooltip/ExTooltip.scss', Tooltip, '.ex-tooltip__popper', 'content', ':model-value="true"'],
] as const;

describe('浮层禁用效果的最近 Provider 边界', () => {
  it.each([
    ['spinner', '.ex-loading__spinner-circle'],
    ['dots', '.ex-loading__dot'],
    ['pulse', '.ex-loading__pulse-ring'],
    ['bars', '.ex-loading__bar'],
    ['neon', '.ex-loading__neon-ring'],
  ])('Loading 的 %s 递归实例保留内层 Provider 的独立装饰效果', async (type, selector) => {
    installComponentStyle(
      'loading/ExLoading.scss',
      (Loading as unknown as { __scopeId: string }).__scopeId
    );
    const wrapper = mount(
      defineComponent({
        __scopeId: 'data-v-effect-consumer',
        components: { ConfigProvider, Loading },
        setup: () => ({ type }),
        template: `
          <ConfigProvider :animation="false" :neon-effect="false">
            <Loading :type="type">
              <ConfigProvider :animation="true" :neon-effect="true">
                <Loading :type="type" class="nested-loading" />
              </ConfigProvider>
            </Loading>
          </ConfigProvider>`,
      }),
      { attachTo: document.body }
    );
    await nextTick();
    const nested = wrapper.get('.nested-loading').get(selector).element;
    const inheritedDisableRule = Array.from(styleElements.at(-1)!.sheet!.cssRules).some(
      rule =>
        rule instanceof CSSStyleRule &&
        rule.selectorText.includes('.ex-loading--no-animation') &&
        rule.style.animation === 'none' &&
        nested.matches(rule.selectorText)
    );
    expect(inheritedDisableRule).toBe(false);
    expect(getComputedStyle(nested).animation).not.toBe('none');
    if (type === 'pulse') expect(getComputedStyle(nested).opacity).toBe('0');
    if (type === 'neon') expect(getComputedStyle(nested).filter).not.toBe('none');
    if (type === 'dots') expect(getComputedStyle(nested).boxShadow).not.toBe('none');
  });

  it('递归 Notification 的关闭按钮遵循内层 Provider 的动画配置', async () => {
    installComponentStyle(
      'notification/ExNotification.scss',
      (Notification as unknown as { __scopeId: string }).__scopeId
    );
    const wrapper = mount(
      defineComponent({
        __scopeId: 'data-v-effect-consumer',
        components: { ConfigProvider, Notification },
        template: `
          <ConfigProvider :animation="false">
            <Notification :duration="0">
              <ConfigProvider :animation="true">
                <Notification :duration="0" content="内层通知" class="nested-notification" />
              </ConfigProvider>
            </Notification>
          </ConfigProvider>`,
      }),
      { attachTo: document.body }
    );
    await nextTick();
    const close = wrapper.get('.nested-notification .ex-notification__close').element;
    expect(getComputedStyle(close).transition).not.toBe('none');
  });

  it.each(cases)('%s 真实公共插槽遵循最近 Provider 并响应动态配置', async (...entry) => {
    const [file, component, rootSelector, slot, props, trigger] = entry;
    installStyle('.ex-effect-probe { animation: probe 1s infinite; box-shadow: 0 0 3px red; }');
    installComponentStyle(file, (component as unknown as { __scopeId: string }).__scopeId);
    const enabled = ref(true);
    // 编译消费方模板产生真实插槽作用域，不手动添加浮层组件的 scope 属性。
    const wrapper = mount(
      defineComponent({
        __scopeId: 'data-v-effect-consumer',
        components: { ConfigProvider, Target: component },
        setup: () => ({ enabled }),
        template: `
          <ConfigProvider :animation="false" :neon-effect="false">
            <Target ${props}>
              ${slot === 'default' ? '' : '<button>触发器</button>'}
              <template #${slot}>
                <span class="ex-effect-probe owned-content">普通内容</span>
                <ConfigProvider :animation="enabled" :neon-effect="enabled"
                  class="ex-effect-probe nested-provider">
                  <span class="ex-effect-probe nested-content">独立配置</span>
                </ConfigProvider>
              </template>
            </Target>
          </ConfigProvider>`,
      }),
      { attachTo: document.body }
    );
    if (trigger) await wrapper.get(trigger).trigger('click');
    await flushPromises();
    await nextTick();
    const root = document.querySelector(rootSelector)!;
    expect(root).not.toBeNull();
    const style = (selector: string) => getComputedStyle(root.querySelector(selector)!);

    expect(getComputedStyle(root).animation).toBe('none');
    expect(getComputedStyle(root).boxShadow).toBe('none');
    expect(style('.owned-content').animation).toBe('none');
    expect(style('.owned-content').boxShadow).toBe('none');
    for (const selector of ['.nested-provider', '.nested-content']) {
      expect(style(selector).animation).toBe('probe 1s infinite');
      expect(style(selector).boxShadow).toBe('0 0 3px red');
    }
    enabled.value = false;
    await nextTick();
    expect(style('.nested-content').animation).toBe('none');
    expect(style('.nested-content').boxShadow).toBe('none');
    enabled.value = true;
    await nextTick();
    expect(style('.nested-content').animation).toBe('probe 1s infinite');
    expect(style('.nested-content').boxShadow).toBe('0 0 3px red');
  });

  it('真实 Dialog 的 Teleport 插槽保留子 Provider 的效果开关', async () => {
    installStyle('.ex-effect-probe { animation: probe 1s infinite; box-shadow: 0 0 3px red; }');
    installComponentStyle(
      'dialog/ExDialog.scss',
      (Dialog as unknown as { __scopeId: string }).__scopeId
    );
    mount(
      defineComponent({
        __scopeId: 'data-v-effect-consumer',
        components: { ConfigProvider, TargetDialog: Dialog },
        template: `
          <ConfigProvider :animation="false" :neon-effect="false">
            <TargetDialog :model-value="true">
              <ConfigProvider :animation="true" :neon-effect="true"
                class="ex-effect-probe nested-provider">
                <span class="ex-effect-probe nested-content">开启效果</span>
              </ConfigProvider>
            </TargetDialog>
          </ConfigProvider>`,
      }),
      { attachTo: document.body }
    );
    await nextTick();
    await nextTick();
    const dialog = document.querySelector('.ex-dialog-wrapper')!;
    expect(dialog.closest('[data-ex-provider]')).toBeNull();
    expect(getComputedStyle(dialog).animation).toBe('none');
    for (const selector of ['.nested-provider', '.nested-content']) {
      const target = dialog.querySelector(selector)!;
      expect(getComputedStyle(target).animation).toBe('probe 1s infinite');
      expect(getComputedStyle(target).boxShadow).toBe('0 0 3px red');
    }
  });
});
