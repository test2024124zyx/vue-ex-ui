// vitest.setup.ts
// Polyfills for JSDOM

// ResizeObserver
class ResizeObserver {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(_cb: any) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.ResizeObserver = global.ResizeObserver || ResizeObserver;

// IntersectionObserver
class IntersectionObserver {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(_cb: any) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.IntersectionObserver = global.IntersectionObserver || IntersectionObserver;

// matchMedia
// @ts-ignore
if (!global.matchMedia) {
  // @ts-ignore
  global.matchMedia = () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    media: ''
  });
}

// crypto.getRandomValues
// @ts-ignore
if (!global.crypto) {
  // @ts-ignore
  global.crypto = {
    // @ts-ignore
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
      return arr;
    }
  };
}

// requestAnimationFrame
// @ts-ignore
if (!global.requestAnimationFrame) {
  // @ts-ignore
  global.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number;
  // @ts-ignore
  global.cancelAnimationFrame = (id: number) => clearTimeout(id);
}