import { spawnSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = join(projectRoot, 'dist');
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'vue-ex-ui-consumer-'));
const consumerDirectory = join(temporaryDirectory, 'consumer');

const requiredFiles = [
  'index.d.ts',
  'ex-ui.js',
  'ex-ui.cjs',
  'ex-ui.css',
  'noto-sans-sc-chinese-simplified-400-normal.woff2',
  'noto-sans-sc-chinese-simplified-500-normal.woff2',
  'noto-sans-sc-chinese-simplified-700-normal.woff2',
  'es/index.d.ts',
  'es/index.js',
  'es/assets/style-base.css',
  'es/assets/style-font.css',
  'es/assets/noto-sans-sc-chinese-simplified-400-normal.woff2',
  'es/assets/noto-sans-sc-chinese-simplified-500-normal.woff2',
  'es/assets/noto-sans-sc-chinese-simplified-700-normal.woff2',
];

const requiredStyleMarkers = [
  { name: '全局颜色 Token', pattern: /--ex-color-primary\s*:/ },
  { name: '全局背景 Token', pattern: /--ex-color-bg-primary\s*:/ },
  { name: '应用级基础样式作用域', pattern: /\.ex-app(?:\s|\{|:)/ },
  { name: '亮色主题选择器', pattern: /\[data-theme=['"]?light['"]?\]/ },
  { name: '赛博扫描线关键帧', pattern: /@keyframes\s+ex-cyber-scanline/ },
];

const runCommand = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? projectRoot,
    encoding: 'utf8',
    env: { ...process.env, HUSKY: '0' },
    shell: options.shell ?? false,
  });

  if (result.error) {
    throw new Error(`${options.name ?? command} 无法启动：${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      `${options.name ?? command} 失败（退出码 ${String(result.status)}）：\n${result.stdout}${result.stderr}`
    );
  }
  return result.stdout.trim();
};

const runNpm = (args, options = {}) => {
  if (process.env.npm_execpath) {
    return runCommand(process.execPath, [process.env.npm_execpath, ...args], options);
  }
  const npmExecutable = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  return runCommand(npmExecutable, args, {
    ...options,
    shell: process.platform === 'win32',
  });
};

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
  const componentEntries = Object.entries(module).filter(([, value]) =>
    isRenderableComponent(value)
  );
  if (componentEntries.length === 0) {
    throw new Error(`${format} 产物没有导出任何公共组件`);
  }
  for (const [name, component] of componentEntries) {
    if (typeof component.install !== 'function') {
      throw new Error(`${format} 产物的 ${name} 不是可安装组件`);
    }
  }
  return componentEntries.map(([name]) => name).sort();
};

try {
  for (const file of requiredFiles) {
    await access(join(distRoot, file));
  }

  const fullStyle = await readFile(join(distRoot, 'ex-ui.css'), 'utf8');
  const fontStyle = await readFile(join(distRoot, 'es/assets/style-font.css'), 'utf8');
  const requiredFontFiles = [
    'noto-sans-sc-chinese-simplified-400-normal.woff2',
    'noto-sans-sc-chinese-simplified-500-normal.woff2',
    'noto-sans-sc-chinese-simplified-700-normal.woff2',
  ];
  for (const fontFile of requiredFontFiles) {
    const marker = `./${fontFile}`;
    if (!fullStyle.includes(marker) || !fontStyle.includes(marker)) {
      throw new Error(`中文字体引用缺失：${fontFile}`);
    }
  }

  const missingStyleMarkers = requiredStyleMarkers
    .filter(({ pattern }) => !pattern.test(fullStyle))
    .map(({ name }) => name);
  if (missingStyleMarkers.length > 0) {
    throw new Error(`整包样式缺少全局契约：${missingStyleMarkers.join('、')}`);
  }

  const esmModule = await import(`${pathToFileURL(join(distRoot, 'ex-ui.js')).href}?verify=1`);
  const publicComponentNames = verifyRuntimeExports(esmModule, 'ESM');

  const packOutput = runNpm(
    ['pack', '--json', '--ignore-scripts', '--pack-destination', temporaryDirectory],
    { name: 'npm pack' }
  );
  const packEntries = JSON.parse(packOutput);
  const packEntry = packEntries[0];
  if (!packEntry?.filename || !Array.isArray(packEntry.files)) {
    throw new Error('npm pack 未返回可验证的包清单');
  }
  const packedPaths = new Set(packEntry.files.map(file => file.path));
  for (const file of requiredFiles) {
    if (!packedPaths.has(`dist/${file}`)) {
      throw new Error(`npm tarball 缺少 dist/${file}`);
    }
  }
  if (!packedPaths.has('LICENSE') || !packedPaths.has('package.json')) {
    throw new Error('npm tarball 缺少许可证或包清单');
  }

  const tarballPath = join(temporaryDirectory, packEntry.filename);
  await access(tarballPath);
  await writeFile(
    join(temporaryDirectory, 'package.json'),
    JSON.stringify(
      {
        private: true,
        type: 'module',
        dependencies: {
          'vue-ex-ui': `file:${tarballPath.replaceAll('\\', '/')}`,
          vue: '^3.5.41',
        },
      },
      null,
      2
    ),
    'utf8'
  );
  runNpm(['install', '--ignore-scripts', '--no-audit', '--no-fund', '--package-lock=false'], {
    cwd: temporaryDirectory,
    name: 'tarball 消费安装',
  });

  await mkdir(consumerDirectory);
  const sourcePath = join(consumerDirectory, 'consumer.ts');
  const tsconfigPath = join(consumerDirectory, 'tsconfig.json');
  await writeFile(
    sourcePath,
    [
      "import ExUI, * as ExUIExports from 'vue-ex-ui';",
      "import ExButton from 'vue-ex-ui/es/components/button';",
      "import { useTheme } from 'vue-ex-ui/es/composables/useTheme';",
      "import { createLocaleProvider } from 'vue-ex-ui/es/locale';",
      "import { deepClone } from 'vue-ex-ui/es/utils';",
      "import 'vue-ex-ui/base.css';",
      "import type { ExButtonProps, Theme } from 'vue-ex-ui';",
      "import type { ExNotificationProps, ExNotificationEmits, ExNotificationSlots, ExNotificationExposed, NotificationOptions, NotificationTypedOptions, NotificationInstance, NotificationService, NotificationGlobalConfig, NotificationType, NotificationPosition } from 'vue-ex-ui';",
      "import type { DrawerGuard, DrawerPlacement, DrawerPresetSize, DrawerSize, ExDrawerProps, ExDrawerEmits, ExDrawerExposed } from 'vue-ex-ui';",
      "import type { PopoverPlacement, PopoverTrigger, PopoverPosition, PopoverBoundaryCheck, PopoverConfig, ExPopoverProps, ExPopoverEmits, ExPopoverExposed } from 'vue-ex-ui';",
      "import type { ProgressType, ProgressStatus, ProgressColor, ExProgressProps, ExProgressEmits, ExProgressExposed } from 'vue-ex-ui';",
      "import type { TooltipPlacement, TooltipTrigger, TooltipEffect, ExTooltipProps, ExTooltipEmits, ExTooltipExposed } from 'vue-ex-ui';",
      '',
      'type NotificationContract = [ExNotificationProps, ExNotificationEmits, ExNotificationSlots, ExNotificationExposed, NotificationOptions, NotificationTypedOptions, NotificationInstance, NotificationService, NotificationGlobalConfig, NotificationType, NotificationPosition];',
      'type OverlayContract = [DrawerGuard, DrawerPlacement, DrawerPresetSize, DrawerSize, ExDrawerProps, ExDrawerEmits, ExDrawerExposed, PopoverPlacement, PopoverTrigger, PopoverPosition, PopoverBoundaryCheck, PopoverConfig, ExPopoverProps, ExPopoverEmits, ExPopoverExposed, ProgressType, ProgressStatus, ProgressColor, ExProgressProps, ExProgressEmits, ExProgressExposed, TooltipPlacement, TooltipTrigger, TooltipEffect, ExTooltipProps, ExTooltipEmits, ExTooltipExposed];',
      "const theme: Theme = 'light';",
      'const props: ExButtonProps = {};',
      'void [ExUI, ExButton, useTheme, createLocaleProvider, deepClone, theme, props];',
      ...publicComponentNames.map(name => `void ExUIExports.${name}.install;`),
      '',
    ].join('\n'),
    'utf8'
  );
  await writeFile(
    tsconfigPath,
    JSON.stringify(
      {
        compilerOptions: {
          lib: ['ES2022', 'DOM'],
          module: 'ESNext',
          moduleResolution: 'Bundler',
          noEmit: true,
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
  runCommand(
    process.execPath,
    [join(projectRoot, 'node_modules/typescript/bin/tsc'), '-p', tsconfigPath],
    { cwd: consumerDirectory, name: '发布声明消费验证' }
  );

  await writeFile(
    join(consumerDirectory, 'index.html'),
    '<!doctype html><html><body><div id="app"></div><script type="module" src="/consumer.ts"></script></body></html>',
    'utf8'
  );
  runCommand(
    process.execPath,
    [
      join(projectRoot, 'node_modules/vite/bin/vite.js'),
      'build',
      '--outDir',
      'bundle',
      '--emptyOutDir',
      '--logLevel',
      'error',
    ],
    { cwd: consumerDirectory, name: 'tarball Vite 消费构建' }
  );

  const runtimeEsmPath = join(consumerDirectory, 'runtime.mjs');
  await writeFile(
    runtimeEsmPath,
    [
      "import ExUI, { ExButton, createMessageService } from 'vue-ex-ui';",
      "if (typeof ExUI.install !== 'function') throw new Error('默认 ESM 插件不可安装');",
      "if (typeof ExButton.install !== 'function') throw new Error('ESM 组件不可安装');",
      "if (typeof createMessageService !== 'function') throw new Error('ESM 服务工厂缺失');",
      '',
    ].join('\n'),
    'utf8'
  );
  runCommand(process.execPath, [runtimeEsmPath], {
    cwd: consumerDirectory,
    name: 'tarball ESM 运行时验证',
  });

  const runtimeCjsPath = join(consumerDirectory, 'runtime.cjs');
  await writeFile(
    runtimeCjsPath,
    [
      "const ExUI = require('vue-ex-ui');",
      "if (typeof ExUI.default?.install !== 'function') throw new Error('默认 CJS 插件不可安装');",
      "if (typeof ExUI.ExButton?.install !== 'function') throw new Error('CJS 组件不可安装');",
      '',
    ].join('\n'),
    'utf8'
  );
  runCommand(process.execPath, [runtimeCjsPath], {
    cwd: consumerDirectory,
    name: 'tarball CommonJS 运行时验证',
  });
} finally {
  // 包消费验证的所有写入都限制在独立临时目录，并在成功或失败后统一清理。
  await rm(temporaryDirectory, { force: true, recursive: true });
}
