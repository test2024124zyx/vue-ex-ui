/// <reference types="node" />

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Timeout {}
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Timer {}
  }

  interface Window {
    vitest?: boolean;
  }
}

export {};
