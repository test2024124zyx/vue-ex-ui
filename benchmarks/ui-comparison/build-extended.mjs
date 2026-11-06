import { build } from 'vite';
import { resolve } from 'node:path';

// 使用与四方基准相同的 Vue、构建目标和生产模式。
const root = import.meta.dirname;
await build({
  root,
  configFile: false,
  logLevel: 'warn',
  base: '/extended/',
  resolve: {
    alias: { vue: resolve(root, 'node_modules/vue/dist/vue.runtime.esm-bundler.js') },
    dedupe: ['vue'],
  },
  build: {
    outDir: resolve(root, 'dist/extended'),
    emptyOutDir: true,
    target: 'es2020',
    sourcemap: true,
    rollupOptions: { input: resolve(root, 'extended.html') },
  },
});
