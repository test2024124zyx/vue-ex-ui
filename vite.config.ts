import { defineConfig, normalizePath } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

/// <reference types="vitest" />

const fullStyleEntryPath = normalizePath(resolve(import.meta.dirname, 'src/index.ts'));

/** Vite 的模块 ID 可能使用任一平台分隔符并携带查询参数。 */
export const isFullStyleEntryId = (id: string): boolean => {
  const [path] = id.split('?', 1);
  return normalizePath(path.replace(/\\/gu, '/')) === fullStyleEntryPath;
};

export default defineConfig({
  base: './',
  plugins: [
    {
      name: 'ex-ui-full-style-entry',
      enforce: 'pre',
      transform(code, id) {
        if (isFullStyleEntryId(id)) {
          // 只给完整产物注入样式入口，源码 barrel 与按需 ESM 保持可 tree-shake。
          return `import './style-full';\n${code}`;
        }
        return null;
      },
    },
    vue(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      afterDiagnostic(diagnostics) {
        // 声明生成错误必须直接阻断发布，不能只打印后继续成功退出。
        if (diagnostics.length > 0) {
          throw new Error(`声明生成失败，共发现 ${diagnostics.length} 个类型诊断`);
        }
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  build: {
    target: 'es2020',
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'ExUI',
      formats: ['es', 'cjs'],
      // 产物实际为 ESM 与 CommonJS（非 UMD），文件名如实命名
      fileName: format => `ex-ui.${format === 'es' ? 'js' : 'cjs'}`,
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: ['vue', 'vue-i18n', 'echarts', 'qrcode', 'jsbarcode', 'lunar-javascript'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          'vue-i18n': 'VueI18n',
          echarts: 'echarts',
          qrcode: 'QRCode',
          jsbarcode: 'JsBarcode',
          'lunar-javascript': 'LunarJavascript',
        },
        assetFileNames: assetInfo => {
          // 使用 names 数组替代已弃用的 name 属性
          const fileName = assetInfo.names?.[0] || assetInfo.name || '';
          if (fileName.endsWith('.css')) {
            return 'ex-ui.css';
          }
          return fileName || 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  define: {
    __EX_UI_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
