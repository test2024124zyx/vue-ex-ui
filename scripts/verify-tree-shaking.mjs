import { resolve } from 'node:path';
import process from 'node:process';
import vue from '@vitejs/plugin-vue';
import { build } from 'vite';
import browserTargets from '../browser-targets.json' with { type: 'json' };

const projectRoot = resolve(import.meta.dirname, '..');
const fixture = resolve(projectRoot, 'tests/fixtures/tree-shaking/root-named-import.ts');

const result = await build({
  configFile: false,
  logLevel: 'error',
  plugins: [vue()],
  build: {
    write: false,
    minify: false,
    target: browserTargets,
    cssTarget: browserTargets,
    lib: {
      entry: fixture,
      formats: ['es'],
      fileName: () => 'fixture.js',
    },
    rollupOptions: {
      external: ['vue', 'vue-i18n', 'echarts', 'qrcode', 'jsbarcode', 'lunar-javascript'],
    },
  },
});

const buildResults = Array.isArray(result) ? result : [result];
const outputs = buildResults.flatMap(item => item.output);
const chunks = outputs.filter(item => item.type === 'chunk');
const cssAssets = outputs.filter(
  item => item.type === 'asset' && item.fileName.toLowerCase().endsWith('.css')
);
const bundledCode = chunks.map(chunk => chunk.code).join('\n');
const bundledCss = cssAssets.map(asset => String(asset.source)).join('\n');
const byteLength = Buffer.byteLength(bundledCode, 'utf8');
const cssByteLength = Buffer.byteLength(bundledCss, 'utf8');
const forbiddenJavaScriptMarkers = ['ExTable', 'ExSelect', 'publicComponents', 'ex-table'];
const forbiddenCssMarkers = ['.ex-table', '.ex-select', '@font-face', '.ex-app'];
const retainedMarkers = [
  ...forbiddenJavaScriptMarkers.filter(marker => bundledCode.includes(marker)),
  ...forbiddenCssMarkers.filter(marker => bundledCss.includes(marker)),
];

if (chunks.length !== 1) {
  throw new Error(`根命名导入应只生成一个 JS chunk，实际为 ${chunks.length} 个`);
}
if (cssAssets.length !== 1) {
  throw new Error(`Button 根命名导入应只生成一个组件 CSS，实际为 ${cssAssets.length} 个`);
}
if (retainedMarkers.length > 0) {
  throw new Error(`根命名导入保留了无关组件：${retainedMarkers.join('、')}`);
}
if (byteLength > 50_000) {
  throw new Error(`Button 根命名导入 JS 体积 ${byteLength} bytes，超过 50000 bytes 门禁`);
}
if (cssByteLength > 30_000) {
  throw new Error(`Button 根命名导入 CSS 体积 ${cssByteLength} bytes，超过 30000 bytes 门禁`);
}
if (!bundledCode.includes('ExButton')) {
  throw new Error('tree-shaking fixture 未保留目标 ExButton 组件');
}

process.stdout.write(
  `tree-shaking fixture: ${byteLength} JS bytes, ${cssByteLength} CSS bytes, 1 component\n`
);
