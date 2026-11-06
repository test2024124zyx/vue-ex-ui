import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(resolve(projectRoot, 'package.json'), 'utf8'));
const packageSpecifier = `${manifest.name}@${manifest.version}`;
const npmArgs = ['view', packageSpecifier, 'version', '--json'];

const result = process.env.npm_execpath
  ? spawnSync(process.execPath, [process.env.npm_execpath, ...npmArgs], {
      cwd: projectRoot,
      encoding: 'utf8',
    })
  : spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', npmArgs, {
      cwd: projectRoot,
      encoding: 'utf8',
      shell: process.platform === 'win32',
    });

if (result.error) {
  throw new Error(`无法查询 npm 版本：${result.error.message}`);
}

if (result.status === 0) {
  const publishedVersion = JSON.parse(result.stdout);
  if (publishedVersion === manifest.version) {
    throw new Error(
      `${packageSpecifier} 已发布。请由维护者确定下一个语义化版本并更新 changelog 后再发布。`
    );
  }
  throw new Error(`npm 返回了意外版本：${String(publishedVersion)}`);
}

const lookupError = `${result.stdout}\n${result.stderr}`;
if (!lookupError.includes('E404')) {
  throw new Error(`无法确认 ${packageSpecifier} 是否可发布：\n${lookupError}`);
}

process.stdout.write(`${packageSpecifier} 尚未发布，可以继续执行本地发布门禁。\n`);
