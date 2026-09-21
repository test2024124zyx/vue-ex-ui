import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import * as library from '../../dist/ex-ui.js';

const root = resolve(import.meta.dirname, '../..');
const output = resolve(root, '.tmp/system-audit-2026-09-22');
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map(entry =>
        entry.isDirectory()
          ? files(resolve(directory, entry.name))
          : [resolve(directory, entry.name)]
      )
    )
  ).flat();
}
const sources = await files(resolve(root, 'src'));
const tests = [...(await files(resolve(root, 'tests'))), ...sources].filter(path =>
  /\.(?:test|spec)\.[cm]?[jt]sx?$/.test(path)
);
const text = new Map(
  await Promise.all([...sources, ...tests].map(async path => [path, await readFile(path, 'utf8')]))
);
const coverage = JSON.parse(await readFile(resolve(root, 'coverage/coverage-final.json'), 'utf8'));
const mechanisms = [
  'useOverlay',
  'usePopupOverlay',
  'useGuardedVisibility',
  'useControllableState',
  'useFloatingAutoUpdate',
  'sanitizeHtml',
  'useTableCells',
  'useFormItem',
  'useTheme',
];
const components = [];
for (const directory of await readdir(resolve(root, 'src/components'), { withFileTypes: true })) {
  if (!directory.isDirectory()) continue;
  const prefix = `/src/components/${directory.name}/`;
  const componentSources = sources.filter(path => path.replaceAll('\\', '/').includes(prefix));
  const statements = [];
  const branches = [];
  for (const [path, data] of Object.entries(coverage)) {
    if (!path.replaceAll('\\', '/').includes(prefix)) continue;
    statements.push(...Object.values(data.s));
    branches.push(...Object.values(data.b).flat());
  }
  const ratio = values =>
    values.length
      ? Number(((values.filter(value => value > 0).length * 100) / values.length).toFixed(2))
      : null;
  components.push({
    name: directory.name,
    sourceFiles: componentSources.length,
    directTestFiles: tests
      .filter(path => path.replaceAll('\\', '/').includes(`/components/${directory.name}/`))
      .map(path => relative(root, path)),
    mechanisms: mechanisms.filter(name =>
      componentSources.some(path => text.get(path).includes(name))
    ),
    statements: ratio(statements),
    branches: ratio(branches),
    coveredStatements: statements.filter(value => value > 0).length,
  });
}
const oversized = sources
  .filter(path => /\.(ts|vue|scss)$/.test(path))
  .map(path => ({ path: relative(root, path), lines: text.get(path).split('\n').length }))
  .filter(file => file.lines > 1000);
const result = {
  sourceFiles: sources.length,
  vueFiles: sources.filter(path => path.endsWith('.vue')).length,
  testFiles: tests.length,
  publicComponents: Object.entries(library)
    .filter(
      ([name, value]) => name.startsWith('Ex') && value && typeof value.install === 'function'
    )
    .map(([name]) => name),
  components,
  oversized,
  note: '目录归属只表示可追踪测试位置；集成测试还会跨目录覆盖。代码覆盖率不代表业务、设备或浏览器覆盖率。',
};
await writeFile(resolve(output, 'inventory.json'), JSON.stringify(result, null, 2));
process.stdout.write(
  JSON.stringify(
    {
      sourceFiles: result.sourceFiles,
      vueFiles: result.vueFiles,
      testFiles: tests.length,
      publicComponents: result.publicComponents.length,
      componentDirectories: components.length,
      componentsWithExecution: components.filter(item => item.coveredStatements > 0).length,
      lowestBranches: [...components].sort((a, b) => a.branches - b.branches).slice(0, 10),
      oversized,
    },
    null,
    2
  ) + '\n'
);
