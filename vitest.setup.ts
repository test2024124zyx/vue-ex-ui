// 为 JSDOM 补齐组件运行时依赖的浏览器 API。
class ResizeObserverStub {
  constructor(_callback: ResizeObserverCallback) {}
  observe(_target: Element): void {}
  unobserve(_target: Element): void {}
  disconnect(): void {}
}

if (!globalThis.ResizeObserver) {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: ResizeObserverStub,
    writable: true,
  });
}

class IntersectionObserverStub {
  constructor(_callback: IntersectionObserverCallback) {}
  observe(_target: Element): void {}
  unobserve(_target: Element): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (!globalThis.IntersectionObserver) {
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    value: IntersectionObserverStub,
    writable: true,
  });
}

if (!globalThis.matchMedia) {
  globalThis.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  });
}

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    value: {
      getRandomValues: <T extends ArrayBufferView | null>(array: T): T => {
        if (!array) throw new TypeError('随机数目标不能为空');
        const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
        for (let index = 0; index < bytes.length; index += 1) {
          bytes[index] = Math.floor(Math.random() * 256);
        }
        return array;
      },
    },
    writable: true,
  });
}

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = callback =>
    setTimeout(() => callback(performance.now()), 16) as unknown as number;
  globalThis.cancelAnimationFrame = handle => clearTimeout(handle);
}
