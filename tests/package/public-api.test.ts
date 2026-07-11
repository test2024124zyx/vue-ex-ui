import { createApp, defineComponent, h, type Component, type Plugin } from 'vue';
import ExUI, * as publicApi from '@/index';

type InstallableComponent = Component & Plugin;

const componentModules = import.meta.glob('../../src/components/*/index.ts', {
  eager: true,
}) as Record<string, { default: unknown }>;

const isRenderableComponent = (value: unknown): value is InstallableComponent => {
  if ((typeof value !== 'object' || value === null) && typeof value !== 'function') {
    return false;
  }

  const component = value as Record<string, unknown>;
  return (
    typeof component.setup === 'function' ||
    typeof component.render === 'function' ||
    typeof component.__file === 'string'
  );
};

describe('v2 公共组件契约', () => {
  // 运行时 API 可能包含 Ex 前缀的错误类，组件应按可渲染能力识别。
  const componentEntries = Object.entries(publicApi).filter(([, value]) =>
    isRenderableComponent(value)
  );

  it.each(componentEntries)('%s 同时支持按需渲染和 app.use 安装', (name, component) => {
    expect(isRenderableComponent(component)).toBe(true);
    expect(component).toHaveProperty('install');

    const app = createApp(defineComponent(() => () => h('div')));
    app.use(component as InstallableComponent);

    // 公共名称必须与全局注册名称完全一致，避免按需与全量安装产生不同组件。
    expect(app.component(name)).toBe(component);
  });

  it('全量插件注册全部公共组件', () => {
    const app = createApp(defineComponent(() => () => h('div')));
    app.use(ExUI);

    for (const [name, component] of componentEntries) {
      expect(app.component(name), `${name} 未被全量插件注册`).toBe(component);
    }
  });

  it.each(Object.entries(componentModules))('%s 默认导出为可安装组件', (_path, module) => {
    expect(isRenderableComponent(module.default)).toBe(true);
    expect(module.default).toHaveProperty('install');
  });

  it('辅助运行时 API 不会被误判为组件', () => {
    expect(publicApi.ExFileDownloadError).toBeInstanceOf(Function);
    expect(isRenderableComponent(publicApi.ExFileDownloadError)).toBe(false);
    expect(Object.isFrozen(publicApi.ICONS)).toBe(true);
    expect(publicApi.isBuiltinIcon('search-line')).toBe(true);
    expect(publicApi.getBuiltinIcon('missing-icon')).toBe('');
    expect(publicApi.ExImageCropError).toBeInstanceOf(Function);
    expect(publicApi.ExImageCompressError).toBeInstanceOf(Function);
    expect(publicApi.compressImage).toBeInstanceOf(Function);
    expect(publicApi.compressImages).toBeInstanceOf(Function);
    expect(publicApi.downloadCompressedImage).toBeInstanceOf(Function);
    expect(publicApi.formatBytes(1024)).toBe('1.00 KB');
    expect(publicApi.createLoadingBar).toBeInstanceOf(Function);
    expect(publicApi.loadingBar).toEqual(
      expect.objectContaining({
        start: expect.any(Function),
        update: expect.any(Function),
        destroy: expect.any(Function),
      })
    );
  });
});
