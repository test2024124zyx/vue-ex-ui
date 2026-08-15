import { createApp, defineComponent, h, type App, type Component } from 'vue';
import ExUI, * as publicApi from '@/index';
import type {
  ExNotificationEmits,
  ExNotificationExposed,
  ExNotificationProps,
  ExNotificationSlots,
  NotificationGlobalConfig,
  NotificationInstance,
  NotificationOptions,
  NotificationPosition,
  NotificationService,
  NotificationTypedOptions,
  NotificationType,
  DrawerGuard,
  DrawerPlacement,
  DrawerPresetSize,
  DrawerSize,
  ExDrawerEmits,
  ExDrawerExposed,
  ExDrawerProps,
  ExPopoverEmits,
  ExPopoverExposed,
  ExPopoverProps,
  PopoverBoundaryCheck,
  PopoverConfig,
  PopoverPlacement,
  PopoverPosition,
  PopoverTrigger,
  ExProgressEmits,
  ExProgressExposed,
  ExProgressProps,
  ProgressColor,
  ProgressStatus,
  ProgressType,
  ExTooltipEmits,
  ExTooltipExposed,
  ExTooltipProps,
  TooltipEffect,
  TooltipPlacement,
  TooltipTrigger,
} from '@/index';

type InstallableComponent = Component & { install: (app: App) => void };
type NotificationPublicContract = [
  ExNotificationProps,
  ExNotificationEmits,
  ExNotificationSlots,
  ExNotificationExposed,
  NotificationOptions,
  NotificationTypedOptions,
  NotificationInstance,
  NotificationService,
  NotificationGlobalConfig,
  NotificationType,
  NotificationPosition,
];
type OverlayPublicContract = [
  DrawerGuard,
  DrawerPlacement,
  DrawerPresetSize,
  DrawerSize,
  ExDrawerProps,
  ExDrawerEmits,
  ExDrawerExposed,
  PopoverPlacement,
  PopoverTrigger,
  PopoverPosition,
  PopoverBoundaryCheck,
  PopoverConfig,
  ExPopoverProps,
  ExPopoverEmits,
  ExPopoverExposed,
  ProgressType,
  ProgressStatus,
  ProgressColor,
  ExProgressProps,
  ExProgressEmits,
  ExProgressExposed,
  TooltipPlacement,
  TooltipTrigger,
  TooltipEffect,
  ExTooltipProps,
  ExTooltipEmits,
  ExTooltipExposed,
];

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
  const namedComponentModuleEntries = (() => {
    const seen = new Set<unknown>();
    return Object.entries(componentModules).flatMap(([path, module]) =>
      Object.entries(module).flatMap(([name, value]) => {
        if (name === 'default' || !isRenderableComponent(value) || seen.has(value)) return [];
        seen.add(value);
        return [[`${path}#${name}`, name, value] as const];
      })
    );
  })();

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
    const anotherApp = createApp(defineComponent(() => () => h('div')));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      app.use(ExUI);
      anotherApp.use(ExUI);

      const duplicateWarnings = warn.mock.calls
        .map(args => args.map(String).join(' '))
        .filter(value => value.includes('already been registered'));
      expect(duplicateWarnings).toEqual([]);
    } finally {
      warn.mockRestore();
    }

    for (const [name, component] of componentEntries) {
      expect(app.component(name), `${name} 未被全量插件注册`).toBe(component);
    }
    expect(app.config.globalProperties.$message).not.toBe(publicApi.message);
    expect(app.config.globalProperties.$notification).not.toBe(publicApi.notification);
    expect(app.config.globalProperties.$loadingBar).not.toBe(publicApi.loadingBar);
    expect(app.config.globalProperties.$message).not.toBe(
      anotherApp.config.globalProperties.$message
    );
    expect(app.config.globalProperties.$notification).not.toBe(
      anotherApp.config.globalProperties.$notification
    );
    expect(app.config.globalProperties.$loadingBar).not.toBe(
      anotherApp.config.globalProperties.$loadingBar
    );
  });

  it.each(Object.entries(componentModules))('%s 默认导出为可安装组件', (_path, module) => {
    expect(isRenderableComponent(module.default)).toBe(true);
    expect(module.default).toHaveProperty('install');
    expect(componentEntries.map(([, component]) => component)).toContain(module.default);
  });

  it.each(namedComponentModuleEntries)(
    '%s 命名组件在根入口保持同一实例且可独立安装',
    (_source, name, component) => {
      expect(component.install).toBeTypeOf('function');
      expect((publicApi as Record<string, unknown>)[name]).toBe(component);

      const app = createApp(defineComponent(() => () => h('div')));
      app.use(component);
      expect(app.component(name)).toBe(component);
    }
  );

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
    expect(publicApi.createLoadingService).toBeInstanceOf(Function);
    expect(publicApi.useLoadingService).toBeInstanceOf(Function);
    expect(publicApi.createMessageService).toBeInstanceOf(Function);
    expect(publicApi.useMessageService).toBeInstanceOf(Function);
    expect(publicApi.createNotificationService).toBeInstanceOf(Function);
    expect(publicApi.useNotificationService).toBeInstanceOf(Function);
    expect(publicApi.useLoadingBarService).toBeInstanceOf(Function);
    expect(publicApi.loadingBar).toEqual(
      expect.objectContaining({
        start: expect.any(Function),
        update: expect.any(Function),
        destroy: expect.any(Function),
      })
    );
  });

  it('Notification 根入口暴露声明式组件与编程式服务的完整类型契约', () => {
    expectTypeOf<NotificationPublicContract>().not.toBeAny();
    expectTypeOf(publicApi.createNotificationService()).toEqualTypeOf<NotificationService>();
  });

  it('浮层与进度组件的根入口类型契约与各组件入口一致', () => {
    expectTypeOf<OverlayPublicContract>().not.toBeAny();
  });
});
