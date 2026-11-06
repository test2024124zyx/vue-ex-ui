// @vitest-environment node
import { readFile } from 'node:fs/promises';
import { Worker } from 'node:worker_threads';
import { describe, expect, it } from 'vitest';
import ts from 'typescript';

/** 在可终止的工作线程运行真实入口，避免有缺陷的正则挂死测试进程。 */
async function createModuleUrl(path: string): Promise<string> {
  let source = await readFile(new URL(path, import.meta.url), 'utf8');
  const imports = [...source.matchAll(/from '(\.\/[^']+)'/g)];
  for (const match of imports) {
    const dependency = await createModuleUrl(
      new URL(`${match[1]}.ts`, new URL(path, import.meta.url)).href
    );
    source = source.replace(match[0], `from '${dependency}'`);
  }
  const result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return `data:text/javascript;base64,${Buffer.from(result.outputText).toString('base64')}`;
}

describe('代码高亮性能边界', () => {
  it('反复插值的未闭合模板不会造成灾难性回溯，并保留全部文本', async () => {
    const url = await createModuleUrl('../../../src/components/code/highlighter/index.ts');
    const input = String.fromCharCode(96) + '${a}'.repeat(28);
    const worker = new Worker(
      `const { parentPort, workerData } = require('node:worker_threads');
       import(workerData.url).then(({ tokenizeToLines }) => {
         parentPort.postMessage(tokenizeToLines(workerData.input, 'typescript').flat().map(t => t.value).join(''));
       }).catch(error => { throw error; });`,
      { eval: true, workerData: { url, input } }
    );
    try {
      const result = await new Promise<string>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('短模板字符串的高亮超过 2 秒')), 2000);
        worker.once('message', value => {
          clearTimeout(timer);
          resolve(value);
        });
        worker.once('error', error => {
          clearTimeout(timer);
          reject(error);
        });
      });
      expect(result).toBe(input);
    } finally {
      await worker.terminate();
    }
  });
});
