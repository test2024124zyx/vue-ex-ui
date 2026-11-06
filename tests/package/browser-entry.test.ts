import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('浏览器按需入口与 Node 兼容入口', () => {
  it('浏览器使用分模块产物，Node ESM 和 CommonJS 保留无 CSS 的入口', async () => {
    const manifest = JSON.parse(await readFile(resolve('package.json'), 'utf8'));
    expect(manifest.module).toBe('./dist/es/index.js');
    expect(manifest.exports['.']).toMatchObject({
      node: { import: './dist/ex-ui.js', require: './dist/ex-ui.cjs' },
      import: './dist/es/index.js',
      require: './dist/ex-ui.cjs',
    });
    expect(manifest.exports['./style.css']).toBe('./dist/ex-ui.css');
  });
});
