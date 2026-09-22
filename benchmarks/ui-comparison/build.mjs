import { build } from 'vite';
import { resolve } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { performance } from 'node:perf_hooks';

const root = import.meta.dirname;
const libraries = ['exui', 'element', 'naive', 'ant'];
const output = resolve(root, 'results');
await mkdir(output, { recursive: true });
const packages = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const records = [];

// 串行构建保证相同的机器资源条件，四个页面各自生成独立生产产物。
for (const library of libraries) {
  const started = performance.now();
  const result = await build({
    root,
    configFile: false,
    logLevel: 'warn',
    base: `/${library}/`,
    resolve: {
      alias: {
        '@adapter': resolve(root, 'adapters', `${library}.mjs`),
        vue: resolve(root, 'node_modules/vue/dist/vue.runtime.esm-bundler.js'),
      },
      dedupe: ['vue'],
    },
    build: {
      outDir: resolve(root, 'dist', library),
      emptyOutDir: true,
      sourcemap: true,
      target: 'es2020',
      minify: true,
      cssCodeSplit: true,
    },
  });
  const chunks = (Array.isArray(result) ? result : [result]).flatMap(item => item.output);
  const files = chunks
    .filter(item => !item.fileName.endsWith('.map'))
    .map(item => {
      const bytes = Buffer.from(item.type === 'chunk' ? item.code : item.source);
      return {
        file: item.fileName,
        bytes: bytes.length,
        gzip: gzipSync(bytes).length,
        brotli: brotliCompressSync(bytes).length,
      };
    });
  const modules = chunks
    .filter(item => item.type === 'chunk')
    .flatMap(item =>
      Object.entries(item.modules).map(([id, info]) => ({
        id,
        renderedLength: info.renderedLength,
      }))
    )
    .sort((a, b) => b.renderedLength - a.renderedLength);
  records.push({ library, buildMs: performance.now() - started, files, modules });
  process.stdout.write(`${library} ${JSON.stringify(files)}\n`);
}
await writeFile(
  resolve(output, 'build.json'),
  JSON.stringify({ dependencies: packages.dependencies, records }, null, 2)
);
