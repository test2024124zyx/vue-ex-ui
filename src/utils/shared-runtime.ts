import type { InjectionKey } from 'vue';

// 协议版本用于隔离不兼容的上下文结构；整包、按需包和模块副本使用相同身份。
const RUNTIME_NAMESPACE = 'vue-ex-ui:runtime:v1';
const DOCUMENT_RUNTIME_KEY = Symbol.for(`${RUNTIME_NAMESPACE}:document`);

/** 注入键共享身份，具体值仍由 Vue 的组件树和 App 作用域隔离。 */
export function createSharedInjectionKey<T>(name: string): InjectionKey<T> {
  return Symbol.for(`${RUNTIME_NAMESPACE}:context:${name}`);
}

/** 浏览器运行时按 Document 共享；服务端只保留当前模块的回退，不写全局注册表。 */
export function createDocumentRuntime<T>(name: string, create: (owner?: Document) => T): () => T {
  let serverRuntime: T | undefined;
  return () => {
    if (typeof document === 'undefined') {
      serverRuntime ??= create();
      return serverRuntime;
    }

    const owner = document as Document & {
      [DOCUMENT_RUNTIME_KEY]?: Map<string, unknown>;
    };
    let registry = owner[DOCUMENT_RUNTIME_KEY];
    if (!registry) {
      registry = new Map();
      Object.defineProperty(owner, DOCUMENT_RUNTIME_KEY, { value: registry });
    }
    if (!registry.has(name)) registry.set(name, create(owner));
    return registry.get(name) as T;
  };
}
