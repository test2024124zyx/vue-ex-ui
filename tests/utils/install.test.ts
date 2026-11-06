import { createApp, h } from 'vue';
import { describe, expect, it } from 'vitest';
import { withInstall } from '../../src/utils/install';

const TestRoot = { name: 'InstallTestRoot', render: () => h('div') };

describe('withInstall', () => {
  it('注册主组件并挂载、注册附属组件', () => {
    const Item = { name: 'ExInstallItem', render: () => h('span') };
    const Main = { name: 'ExInstallMain', render: () => h('div') };
    const Installable = withInstall(Main, { Item });
    const app = createApp(TestRoot);

    app.use(Installable);

    expect(app.component('ExInstallMain')).toBe(Main);
    expect(app.component('ExInstallItem')).toBe(Item);
    expect(Installable.Item).toBe(Item);
  });

  it('没有稳定名称时拒绝注册，不产生匿名全局组件', () => {
    const Anonymous = { render: () => h('div') };
    const Installable = withInstall(Anonymous);
    const app = createApp(TestRoot);

    expect(() => app.use(Installable)).toThrow('全局安装的组件必须声明稳定的组件名称');
  });

  it('重复包装时保留组件已经扩展的安装生命周期', () => {
    const Main = { name: 'ExCustomInstall', render: () => h('div') };
    const Installable = withInstall(Main);
    const installComponent = Installable.install;
    Installable.install = app => {
      installComponent(app);
      app.config.globalProperties.$customInstall = true;
    };

    const Reused = withInstall(Installable);
    const app = createApp(TestRoot);
    app.use(Reused);

    expect(app.component('ExCustomInstall')).toBe(Main);
    expect(app.config.globalProperties.$customInstall).toBe(true);
  });
});
