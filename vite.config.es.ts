import { defineConfig, normalizePath } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { dirname, relative, resolve } from 'node:path';
import { glob } from 'glob';
import browserTargets from './browser-targets.json';

/**
 * 按需打包构建（per-component packaging）
 *
 * 产物输出到 dist/es，保留源码目录结构（每个组件、composable、util 各自成块），
 * 并借助 vite-plugin-lib-inject-css 让每个组件的 JS 自动 import 自己的 scoped CSS，
 * 从而实现「导入一个组件 = 只加载该组件的 CSS」的真正按需。
 *
 * 全局主题/令牌（tokens、themes、reset、animations）是组件样式依赖的 CSS 变量来源，
 * 仍需引入一次：见 dist/es/style.css（由 src/style-base.ts 产出）。
 */

const external = [
  'vue',
  'vue-i18n',
  'echarts',
  'qrcode',
  'jsbarcode',
  'lunar-javascript',
  'tus-js-client',
];

const addVueShimReference = (filePath: string, content: string) => {
  if (filePath.endsWith('shims-vue.d.ts') || !content.includes('.vue')) return;
  const shimPath = normalizePath(
    relative(dirname(filePath), resolve(import.meta.dirname, 'dist/shims-vue.d.ts'))
  );
  const referencePath = shimPath.startsWith('.') ? shimPath : `./${shimPath}`;
  return { content: `/// <reference path="${referencePath}" />\n${content}` };
};

// 入口为「公共 API 出口」：整包 barrel、基础样式、各组件 index、composables、
// 工具与国际化入口。组件内部的子文件（如 DatePanel.vue）会作为依赖被打进各自
// 组件 chunk，无需单独作为入口（也避免把未被引用的内部文件强行编译）。
const entryFiles = [
  'src/index.ts',
  'src/style-base.ts',
  'src/style-font.ts',
  'src/locale/index.ts',
  'src/utils/index.ts',
  ...glob.sync('src/components/*/index.ts'),
  ...glob.sync('src/composables/*.ts'),
];

const entries = Object.fromEntries(
  entryFiles.map(file => {
    // 入口名：去掉 src/ 前缀与扩展名，作为 dist/es 下的相对路径
    const name = file.slice('src/'.length).replace(/\.(ts|vue)$/, '');
    return [name, resolve(import.meta.dirname, file)];
  })
);

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    libInjectCss(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      outDirs: 'dist/es',
      entryRoot: 'src',
      beforeWriteFile: addVueShimReference,
      afterDiagnostic(diagnostics) {
        // 按需构建的声明错误同样必须阻断发布。
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
    outDir: 'dist/es',
    emptyOutDir: true,
    cssCodeSplit: true,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      external,
      input: entries,
      output: {
        dir: 'dist/es',
        format: 'es',
        entryFileNames: '[name].js',
        // CSS 等资源放入 assets/，由 libInjectCss 注入相对引用，消费者无需手动引入
        assetFileNames: 'assets/[name][extname]',
        // 共享的内部 chunk（如被多个组件复用的工具）放入 _chunks/
        chunkFileNames: '_chunks/[name]-[hash].js',
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
