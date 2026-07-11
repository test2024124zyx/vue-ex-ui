import type { App, Component } from 'vue';

type NamedComponent = Component & {
  name?: string;
  __name?: string;
};

export type InstallableComponent<T extends Component = Component> = T & {
  install(app: App): void;
};

const getComponentName = (component: NamedComponent): string => {
  const name = component.name ?? component.__name;

  if (!name) {
    throw new Error('[ExUI] 全局安装的组件必须声明稳定的组件名称');
  }

  return name;
};

/**
 * 为单文件组件补充统一的 Vue 插件安装能力。
 * 附属组件会一并注册，并挂载到主组件上供按需使用。
 */
export function withInstall<T extends Component>(component: T): InstallableComponent<T>;
export function withInstall<T extends Component, E extends Record<string, Component>>(
  component: T,
  extras: E
): InstallableComponent<T> & E;
export function withInstall<T extends Component, E extends Record<string, Component>>(
  component: T,
  extras?: E
): InstallableComponent<T> & E {
  const installable = component as InstallableComponent<T> & E;

  // 重复聚合公共出口时保留组件已经扩展的安装副作用，例如全局服务挂载。
  if (typeof installable.install !== 'function') {
    installable.install = (app: App): void => {
      app.component(getComponentName(component), component);

      if (extras) {
        for (const extra of Object.values(extras)) {
          app.component(getComponentName(extra), extra);
        }
      }
    };
  }

  if (extras) {
    Object.assign(installable, extras);
  }

  return installable;
}
