import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compileScript, parse } from '@vue/compiler-sfc';
import { mount, type VueWrapper } from '@vue/test-utils';
import * as Vue from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExButton from '../../src/components/button/ExButton.vue';
import ExDialog from '../../src/components/dialog/ExDialog.vue';
import ExPopconfirm from '../../src/components/popconfirm/ExPopconfirm.vue';
import * as notificationModule from '../../src/components/notification';
import * as dialogDemos from '../../docs/.vitepress/demos/useDialogDemos';

const readDocument = (name: string) =>
  readFileSync(resolve(process.cwd(), `docs/components/${name}.md`), 'utf8').replace(/\r\n/g, '\n');

const readSection = (document: string, heading?: string) => {
  if (!heading) return document;
  return document.split(`## ${heading}\n`)[1]?.split('\n## ')[0] ?? '';
};

// 编译真实文档脚本和模板，避免静态字符串存在却无法运行的假阳性。
const compileDemo = (name: string, heading?: string, copy = false) => {
  const document = readDocument(name);
  const section = readSection(document, heading);
  const script = document
    .replace(/```[\s\S]*?```/g, '')
    .match(/<script setup>([\s\S]*?)<\/script>/)?.[1];
  const live = [...section.matchAll(/::: raw\s*\n([\s\S]*?)\n:::/g)]
    .map(match => match[1])
    .join('\n');
  const source = copy
    ? (section.match(/```vue\s*\n([\s\S]*?)\n```/)?.[1] ?? '')
    : `<script setup>${script}</script><template>${live}</template>`;
  expect(source.length).toBeGreaterThan(0);
  const { descriptor } = parse(source);
  const compiled = compileScript(descriptor, { id: `docs-${name}`, inlineTemplate: true }).content;
  const executable = compiled
    .replace(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"];?/g, (_, names, path) => {
      const bindings = String(names).replace(/\s+as\s+/g, ': ');
      return `const {${bindings}} = dependencies[${JSON.stringify(path)}];`;
    })
    .replace('export default', 'return');
  return new Function('dependencies', executable)({
    vue: Vue,
    '../../src/components/notification': notificationModule,
    '../.vitepress/demos/useDialogDemos': dialogDemos,
    'vue-ex-ui': notificationModule,
  }) as Vue.Component;
};

describe('反馈组件文档的真实交互', () => {
  const wrappers: VueWrapper[] = [];

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    wrappers.splice(0).forEach(wrapper => wrapper.unmount());
    notificationModule.notification.closeAll();
    document.body.innerHTML = '';
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const mountDemo = (name: string, heading?: string, copy = false) => {
    const wrapper = mount(compileDemo(name, heading, copy), {
      attachTo: document.body,
      global: { components: { ExButton, ExDialog, ExPopconfirm } },
    });
    wrappers.push(wrapper);
    return wrapper;
  };

  it('Dialog 的类型和嵌套演示独立，打开成功类型不会打开外层对话框', async () => {
    const wrapper = mountDemo('dialog');
    const button = wrapper.findAll('button').find(button => button.text() === '成功对话框');
    await button!.trigger('click');
    const visibleTitles = wrapper
      .findAllComponents(ExDialog)
      .filter(dialog => dialog.props('modelValue'))
      .map(dialog => dialog.props('title'));
    expect(visibleTitles).toEqual(['操作成功']);
  });

  it.each([false, true])(
    'Dialog 自定义底部具有操作插槽且等待提交完成（复制示例：%s）',
    async copy => {
      const wrapper = mountDemo('dialog', '自定义底部', copy);
      await wrapper.find('button').trigger('click');
      const dialog = wrapper.findComponent(ExDialog);
      expect(dialog.vm.$slots.footer).toBeTypeOf('function');
      const submit = document.querySelector<HTMLButtonElement>(
        '.ex-dialog__footer button:last-child'
      );
      submit!.click();
      await Vue.nextTick();
      expect(submit!.disabled).toBe(true);
      expect(dialog.props('modelValue')).toBe(true);
      document.querySelector<HTMLButtonElement>('.ex-dialog__close')!.click();
      await Vue.nextTick();
      expect(dialog.props('modelValue')).toBe(true);
      await vi.advanceTimersByTimeAsync(2000);
      expect(dialog.props('modelValue')).toBe(false);
    }
  );

  it.each([false, true])(
    'Popconfirm 提交期间保持浮层并显示加载，完成后关闭（复制示例：%s）',
    async copy => {
      const wrapper = mountDemo('popconfirm', '确认加载状态', copy);
      await wrapper.find('button').trigger('click');
      const confirm = document.querySelector<HTMLButtonElement>(
        '.ex-popconfirm__footer button:last-child'
      );
      confirm!.click();
      await Vue.nextTick();
      await vi.advanceTimersByTimeAsync(500);
      expect(document.querySelector('.ex-popconfirm')).not.toBeNull();
      expect(confirm!.disabled).toBe(true);
      expect(wrapper.findComponent(ExPopconfirm).emitted('confirm')).toBeUndefined();
      await vi.advanceTimersByTimeAsync(1800);
      expect(document.querySelector('.ex-popconfirm')).toBeNull();
      expect(wrapper.findComponent(ExPopconfirm).emitted('confirm')).toHaveLength(1);
    }
  );

  it.each([false, true])(
    'Notification 四个位置的处理函数完整可执行（复制示例：%s）',
    async copy => {
      const info = vi.spyOn(notificationModule.notification, 'info');
      const wrapper = mountDemo('notification', '不同位置', copy);
      for (const button of wrapper.findAll('button')) await button.trigger('click');
      expect(info.mock.calls.map(([options]) => options.position)).toEqual([
        'top-right',
        'top-left',
        'bottom-right',
        'bottom-left',
      ]);
    }
  );

  it.each([false, true])(
    'Popconfirm 关闭后重开提交也会清理全部延时（复制示例：%s）',
    async copy => {
      const wrapper = mountDemo('popconfirm', '确认加载状态', copy);
      const popconfirm = wrapper.findComponent(ExPopconfirm);
      await wrapper.find('button').trigger('click');
      const submit = () =>
        document
          .querySelector<HTMLButtonElement>('.ex-popconfirm__footer button:last-child')!
          .click();
      submit();
      await Vue.nextTick();
      popconfirm.vm.hide();
      await vi.advanceTimersByTimeAsync(300);
      popconfirm.vm.show();
      await Vue.nextTick();
      submit();
      await Vue.nextTick();
      wrapper.unmount();
      wrappers.splice(wrappers.indexOf(wrapper), 1);
      await Vue.nextTick();
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it.each([false, true])('Notification 的 VNode 示例能渲染真实链接（复制示例：%s）', async copy => {
    const wrapper = mountDemo('notification', 'VNode 内容', copy);
    expect(wrapper.find('button').exists()).toBe(true);
    await wrapper.find('button').trigger('click');
    const link = document.querySelector<HTMLAnchorElement>('.ex-notification a');
    expect(link?.textContent).toBe('查看使用方式');
    expect(link?.getAttribute('href')).toBe('#基础用法');
  });

  it.each([false, true])('Notification 离页后清理常驻通知（复制示例：%s）', async copy => {
    const wrapper = mountDemo('notification', '自定义时长', copy);
    await wrapper.findAll('button')[1]!.trigger('click');
    expect(document.querySelector('.ex-notification')).not.toBeNull();
    wrapper.unmount();
    wrappers.splice(wrappers.indexOf(wrapper), 1);
    expect(document.querySelector('.ex-notification')).toBeNull();
  });

  it.each([
    ['dialog', '自定义底部', '.ex-dialog__footer button:last-child', false],
    ['dialog', '自定义底部', '.ex-dialog__footer button:last-child', true],
    ['popconfirm', '确认加载状态', '.ex-popconfirm__footer button:last-child', false],
    ['popconfirm', '确认加载状态', '.ex-popconfirm__footer button:last-child', true],
  ] as const)(
    '%s 提交期间卸载会清理延时（%s，%s，复制示例：%s）',
    async (name, heading, selector, copy) => {
      const wrapper = mountDemo(name, heading, copy);
      await wrapper.find('button').trigger('click');
      document.querySelector<HTMLButtonElement>(selector)!.click();
      await Vue.nextTick();
      expect(vi.getTimerCount()).toBeGreaterThan(0);
      wrapper.unmount();
      wrappers.splice(wrappers.indexOf(wrapper), 1);
      await Vue.nextTick();
      expect(vi.getTimerCount()).toBe(0);
    }
  );
});
