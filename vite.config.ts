import { defineConfig, normalizePath } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { dirname, relative, resolve } from 'node:path';
import browserTargets from './browser-targets.json';

/// <reference types="vitest" />

const fullStyleEntryPath = normalizePath(resolve(import.meta.dirname, 'src/index.ts'));

const addVueShimReference = (filePath: string, content: string) => {
  if (filePath.endsWith('shims-vue.d.ts') || !content.includes('.vue')) return;
  const shimPath = normalizePath(
    relative(dirname(filePath), resolve(import.meta.dirname, 'dist/shims-vue.d.ts'))
  );
  const referencePath = shimPath.startsWith('.') ? shimPath : `./${shimPath}`;
  return { content: `/// <reference path="${referencePath}" />\n${content}` };
};

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
          // 直接注入 CSS 模块，避免 package.json 的 sideEffects 规则把仅含样式导入的 TS 包装模块裁掉。
          return [
            "import '@fontsource/orbitron/latin-700.css';",
            "import '@fontsource/orbitron/latin-900.css';",
            "import '@fontsource/jetbrains-mono/latin-400.css';",
            "import '@fontsource/jetbrains-mono/latin-500.css';",
            "import '@fontsource/jetbrains-mono/latin-700.css';",
            "import '@fontsource/share-tech-mono/latin-400.css';",
            "import './styles/font.scss';",
            "import './styles/index.scss';",
            code,
          ].join('\n');
        }
        return null;
      },
    },
    vue(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: true,
      include: ['src/**/*'],
      beforeWriteFile: addVueShimReference,
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
    target: browserTargets,
    cssTarget: browserTargets,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
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
        'tus-js-client',
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
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  define: {
    __EX_UI_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
