import { build } from 'vite';
import { resolve } from 'node:path';

// 复用仓库已审查的业务工作负载，只重建 ExUI 的当前生产产物。
const root = resolve(import.meta.dirname, '../../benchmarks/ui-comparison');
await build({
  root,
  configFile: false,
  logLevel: 'warn',
  base: '/exui/',
  resolve: {
    alias: {
      '@adapter': resolve(root, 'adapters/exui.mjs'),
      vue: resolve(root, 'node_modules/vue/dist/vue.runtime.esm-bundler.js'),
    },
    dedupe: ['vue'],
  },
  build: {
    outDir: resolve(root, 'dist/exui'),
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2020',
    minify: true,
    cssCodeSplit: true,
  },
});
