import { resolve } from 'node:path';
import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// 构建配置使用的解析器独立输出，避免引入组件、CSS 和浏览器运行时。
export default defineConfig({
  plugins: [
    dts({
      include: ['src/resolver/**/*.ts'],
      entryRoot: 'src/resolver',
      outDir: 'dist/resolver',
      afterDiagnostic(diagnostics) {
        if (diagnostics.length > 0) {
          throw new Error(`解析器声明生成失败，共发现 ${diagnostics.length} 个类型诊断`);
        }
      },
      async afterBuild() {
        // CommonJS 消费者需要匹配模块格式的声明扩展名。
        await copyFile(
          resolve(import.meta.dirname, 'dist/resolver/index.d.ts'),
          resolve(import.meta.dirname, 'dist/resolver/index.d.cts')
        );
      },
    }),
  ],
  build: {
    target: 'es2020',
    outDir: 'dist/resolver',
    emptyOutDir: true,
    rollupOptions: {
      output: { exports: 'named' },
    },
    lib: {
      entry: resolve(import.meta.dirname, 'src/resolver/index.ts'),
      formats: ['es', 'cjs'],
      fileName: format => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
  },
});
