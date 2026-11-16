import type { InjectionKey } from 'vue';
import { hasInjectionContext, inject, ssrContextKey } from 'vue';

// 协议版本用于隔离不兼容的上下文结构；整包、按需包和模块副本使用相同身份。
const RUNTIME_NAMESPACE = 'vue-ex-ui:runtime:v1';
const DOCUMENT_RUNTIME_KEY = Symbol.for(`${RUNTIME_NAMESPACE}:document`);
const SSR_RUNTIME_KEY = Symbol.for(`${RUNTIME_NAMESPACE}:ssr`);
type RuntimeOwner = {
  [DOCUMENT_RUNTIME_KEY]?: Map<string, unknown>;
  [SSR_RUNTIME_KEY]?: Map<string, unknown>;
};

/** 注入键共享身份，具体值仍由 Vue 的组件树和 App 作用域隔离。 */
export function createSharedInjectionKey<T>(name: string): InjectionKey<T> {
  return Symbol.for(`${RUNTIME_NAMESPACE}:context:${name}`);
}

/** 浏览器按文档共享运行时，服务端只在同一次 Vue 渲染内共享。 */
export function createDocumentRuntime<T>(name: string, create: (owner?: Document) => T): () => T {
  return () => {
    const ownerDocument = typeof document === 'undefined' ? undefined : document;
    const owner =
      (ownerDocument as (Document & RuntimeOwner) | undefined) ??
      (hasInjectionContext()
        ? inject<RuntimeOwner | undefined>(ssrContextKey, undefined)
        : undefined);
    if (!owner) return create();

    const key = ownerDocument ? DOCUMENT_RUNTIME_KEY : SSR_RUNTIME_KEY;
    let registry = owner[key];
    if (!registry) {
      registry = new Map();
      Object.defineProperty(owner, key, { value: registry });
    }
    if (!registry.has(name)) registry.set(name, create(ownerDocument));
    return registry.get(name) as T;
  };
}
