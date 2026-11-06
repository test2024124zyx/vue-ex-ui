import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { docsDemoPlugin } from './demo-server';

// Vite 的预览钩子同时提供静态构建产物与文档演示接口。
export default defineConfig({
  appType: 'mpa',
  root: fileURLToPath(new URL('../', import.meta.url)),
  plugins: [docsDemoPlugin()],
  build: { outDir: fileURLToPath(new URL('./dist', import.meta.url)) },
  preview: { host: '127.0.0.1', port: 4173 },
});
