import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { resolve } from 'node:path';

/// <reference types="vitest" />

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
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
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ExUI',
      formats: ['es', 'cjs'],
      // 产物实际为 ESM 与 CommonJS（非 UMD），文件名如实命名
      fileName: format => `ex-ui.${format === 'es' ? 'js' : 'cjs'}`,
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        'vue',
        'vue-i18n',
        'echarts',
        'qrcode',
        'jsbarcode',
        'lunar-javascript',
        'highlight.js',
        'highlight.js/lib/common',
      ],
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
      '@': resolve(__dirname, 'src'),
    },
  },
  esbuild: {
    target: 'es2020',
  },
  define: {
    __EX_UI_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
