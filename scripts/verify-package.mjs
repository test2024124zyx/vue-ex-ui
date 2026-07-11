import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { access, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = join(projectRoot, 'dist');
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'vue-ex-ui-consumer-'));

const requiredFiles = [
  'index.d.ts',
  'ex-ui.js',
  'ex-ui.cjs',
  'ex-ui.css',
  'es/index.d.ts',
  'es/index.js',
  'es/assets/style-base.css',
  'es/assets/style-font.css',
];

const isRenderableComponent = value => {
  if ((typeof value !== 'object' || value === null) && typeof value !== 'function') {
    return false;
  }

  return (
    typeof value.setup === 'function' ||
    typeof value.render === 'function' ||
    typeof value.__file === 'string'
  );
};

const verifyRuntimeExports = (module, format) => {
  // 错误类等运行时 API 也可能使用 Ex 前缀，组件必须按可渲染能力识别。
  const componentEntries = Object.entries(module).filter(([, value]) =>
    isRenderableComponent(value)
  );

  if (componentEntries.length === 0) {
    throw new Error(`${format} 产物没有导出任何公共组件`);
  }

  for (const [name, component] of componentEntries) {
    if (!isRenderableComponent(component) || typeof component.install !== 'function') {
      throw new Error(`${format} 产物的 ${name} 不是可安装组件`);
    }
  }
};

const publicComponentNames = module =>
  Object.entries(module)
    .filter(([, value]) => isRenderableComponent(value))
    .map(([name]) => name)
    .sort();

try {
  for (const file of requiredFiles) {
    await access(join(distRoot, file));
  }

  const esmModule = await import(`${pathToFileURL(join(distRoot, 'ex-ui.js')).href}?verify=1`);
  const require = createRequire(import.meta.url);
  const cjsModule = require(join(distRoot, 'ex-ui.cjs'));

  verifyRuntimeExports(esmModule, 'ESM');
  verifyRuntimeExports(cjsModule, 'CommonJS');

  const sourcePath = join(temporaryDirectory, 'consumer.ts');
  const tsconfigPath = join(temporaryDirectory, 'tsconfig.json');
  const declarationPath = join(distRoot, 'index.d.ts').replaceAll('\\', '/');

  await writeFile(
    sourcePath,
    [
      "import ExUI, * as ExUIExports from 'vue-ex-ui';",
      "import { THEME_CONFIGS } from 'vue-ex-ui';",
      "import type { ExButtonProps, Theme } from 'vue-ex-ui';",
      '',
      "const theme: Theme = 'light';",
      'const props: ExButtonProps = {};',
      'void [ExUI, THEME_CONFIGS[theme], props];',
      ...publicComponentNames(esmModule).map(name => `void ExUIExports.${name}.install;`),
      '',
    ].join('\n'),
    'utf8'
  );

  await writeFile(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          baseUrl: projectRoot.replaceAll('\\', '/'),
          lib: ['ES2022', 'DOM'],
          module: 'ESNext',
          moduleResolution: 'Bundler',
          noEmit: true,
          paths: {
            'vue-ex-ui': [declarationPath],
          },
          skipLibCheck: false,
          strict: true,
          target: 'ES2022',
          types: [],
        },
        files: [sourcePath.replaceAll('\\', '/')],
      },
      null,
      2
    ),
    'utf8'
  );

  const result = spawnSync(
    process.execPath,
    [join(projectRoot, 'node_modules/typescript/bin/tsc'), '-p', tsconfigPath],
    {
      cwd: projectRoot,
      encoding: 'utf8',
    }
  );

  if (result.status !== 0) {
    throw new Error(`发布声明消费验证失败：\n${result.stdout}${result.stderr}`);
  }
} finally {
  // IO 验证必须清理临时消费者目录，避免污染后续测试。
  await rm(temporaryDirectory, { force: true, recursive: true });
}
