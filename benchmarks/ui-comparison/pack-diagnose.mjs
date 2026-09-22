import { build } from 'vite';
import { resolve } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const root = import.meta.dirname;
const output = resolve(root, 'results/pack-diagnostics');
await mkdir(output, { recursive: true });
const manifest = JSON.parse(await readFile(resolve(root, '../../package.json'), 'utf8'));
const entries = {
  publishedBrowser: {
    button: `../../${manifest.exports['.'].import}`,
    style: `../../${manifest.exports['./base.css']}`,
  },
  full: { button: '../../dist/ex-ui.js', style: '../../dist/ex-ui.css' },
  esBarrel: { button: '../../dist/es/index.js', style: '../../dist/es/assets/style-base.css' },
  component: {
    button: '../../dist/es/components/button/index.js',
    style: '../../dist/es/assets/style-base.css',
  },
};
const records = [];
// Vue 和可选插件均外置，只计算组件库消费入口带来的内容。
for (const [name, entry] of Object.entries(entries)) {
  const result = await build({
    root,
    configFile: false,
    logLevel: 'error',
    resolve: {
      alias: {
        '@probe-button': resolve(root, entry.button),
        '@probe-style': resolve(root, entry.style),
      },
    },
    build: {
      write: false,
      target: 'es2020',
      minify: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        input: resolve(root, 'pack-probe.mjs'),
        external: ['vue', 'vue-i18n', 'echarts', 'qrcode', 'jsbarcode', 'lunar-javascript'],
      },
    },
  });
  const assets = (Array.isArray(result) ? result : [result])
    .flatMap(item => item.output)
    .map(item => {
      const content = Buffer.from(item.type === 'chunk' ? item.code : item.source);
      return { name: item.fileName, bytes: content.length, gzip: gzipSync(content).length };
    });
  records.push({ name, assets });
}
await writeFile(resolve(output, 'summary.json'), JSON.stringify(records, null, 2));
process.stdout.write(`${JSON.stringify(records, null, 2)}\n`);
