import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { UserConfig } from 'vite';
import viteFullConfig, { isFullStyleEntryId } from '../../vite.config';
import viteEsConfig from '../../vite.config.es';

interface PackageManifest {
  version: string;
  exports: Record<string, unknown>;
  scripts: Record<string, string>;
  devDependencies?: Record<string, string>;
  engines?: { node?: string; npm?: string };
  publishConfig?: { access?: string; provenance?: boolean };
  repository?: { type?: string; url?: string };
  homepage?: string;
  bugs?: { url?: string };
}

interface LockManifest {
  version: string;
  packages: Record<string, { version?: string }>;
}

const projectRoot = resolve(import.meta.dirname, '../..');

const readJson = async <T>(path: string): Promise<T> =>
  JSON.parse(await readFile(resolve(projectRoot, path), 'utf8')) as T;

describe('发布配置契约', () => {
  it('完整样式注入入口跨平台识别路径并忽略 Vite 查询参数', () => {
    const entry = resolve(projectRoot, 'src/index.ts');
    const windowsEntry = entry.replace(/\//gu, '\\');
    const posixEntry = entry.replace(/\\/gu, '/');

    expect(isFullStyleEntryId(windowsEntry)).toBe(true);
    expect(isFullStyleEntryId(`${posixEntry}?vue&type=script`)).toBe(true);
    expect(isFullStyleEntryId(resolve(projectRoot, 'src/style-full.ts'))).toBe(false);
  });

  it('两类 Vite 产物都通过 Vite 8 的 build.target 声明编译目标', () => {
    const esConfig = viteEsConfig as UserConfig;
    const fullConfig = viteFullConfig as UserConfig;

    const minimumBrowsers = ['chrome108', 'edge108', 'firefox121', 'safari16'];
    expect(esConfig.build?.target).toEqual(minimumBrowsers);
    expect(fullConfig.build?.target).toEqual(minimumBrowsers);
    expect(esConfig.build?.cssTarget).toEqual(minimumBrowsers);
    expect(fullConfig.build?.cssTarget).toEqual(minimumBrowsers);
    expect(esConfig.esbuild).not.toMatchObject({ target: expect.anything() });
  });

  it('各入口文档对最低浏览器版本给出一致承诺', async () => {
    for (const path of ['docs/guide/index.md', 'src/components/chart/README.md']) {
      const content = await readFile(resolve(projectRoot, path), 'utf8');
      for (const requirement of [
        'Chrome >= 108',
        'Edge >= 108',
        'Firefox >= 121',
        'Safari >= 16',
      ]) {
        expect(content).toContain(requirement);
      }
    }
  });

  it('包版本、许可证与发布来源元数据保持一致', async () => {
    const packageManifest = await readJson<PackageManifest>('package.json');
    const lockManifest = await readJson<LockManifest>('package-lock.json');

    expect(packageManifest.version).toBe(lockManifest.version);
    expect(packageManifest.version).toBe(lockManifest.packages['']?.version);
    expect(packageManifest.publishConfig).toEqual({ access: 'public', provenance: true });
    expect(packageManifest.repository?.url).toBe(
      'git+https://github.com/zhuhanxin0308/vue-ex-ui.git'
    );
    expect(packageManifest.homepage).toBe('https://github.com/zhuhanxin0308/vue-ex-ui#readme');
    expect(packageManifest.bugs?.url).toBe('https://github.com/zhuhanxin0308/vue-ex-ui/issues');
    await expect(access(resolve(projectRoot, 'LICENSE'))).resolves.toBeUndefined();
  });

  it('包导出映射与实际 ESM 目录结构一致', async () => {
    const packageManifest = await readJson<PackageManifest>('package.json');

    expect(packageManifest.exports).toMatchObject({
      './es/components/*': {
        types: './dist/es/components/*/index.d.ts',
        import: './dist/es/components/*/index.js',
      },
      './es/composables/*': {
        types: './dist/es/composables/*.d.ts',
        import: './dist/es/composables/*.js',
      },
      './es/locale': {
        types: './dist/es/locale/index.d.ts',
        import: './dist/es/locale/index.js',
      },
      './es/utils': {
        types: './dist/es/utils/index.d.ts',
        import: './dist/es/utils/index.js',
      },
    });
    expect(packageManifest.exports).not.toHaveProperty('./es/*');
  });

  it('本地发布入口执行完整质量门禁', async () => {
    const packageManifest = await readJson<PackageManifest>('package.json');

    expect(packageManifest.scripts.typecheck).toContain('vue-tsc');
    expect(packageManifest.scripts['test:coverage']).toContain('--coverage');
    expect(packageManifest.scripts['verify:release']).toContain('format:check');
    expect(packageManifest.scripts['verify:release']).toContain('verify:version');
    expect(packageManifest.scripts['verify:release']).toContain('verify:tree-shaking');
    expect(packageManifest.scripts['verify:release']).toContain('verify:package');
    expect(packageManifest.scripts['audit:production']).toBe(
      'npm audit --omit=dev --audit-level=high'
    );
    expect(packageManifest.scripts['verify:release']).toContain('npm run audit:production');
    expect(packageManifest.scripts.prepublishOnly).toBe('npm run verify:release');
  });

  it('包验证器消费真实 npm tarball 与导出映射', async () => {
    const verifier = await readFile(resolve(projectRoot, 'scripts/verify-package.mjs'), 'utf8');

    expect(verifier).toContain("'pack'");
    expect(verifier).toContain("'vue-ex-ui/es/components/button'");
    expect(verifier).toContain("'vue-ex-ui/es/composables/useTheme'");
    expect(verifier).toContain("'vue-ex-ui/es/locale'");
    expect(verifier).toContain("'vue-ex-ui/es/utils'");
    expect(verifier).not.toContain('paths:');
  });

  it('类型检查覆盖测试，CI 使用固定版本的只读动作并运行发布门禁', async () => {
    const tsconfig = await readFile(resolve(projectRoot, 'tsconfig.json'), 'utf8');
    const testTsconfig = await readJson<{
      compilerOptions?: Record<string, unknown>;
      include?: string[];
    }>('tsconfig.tests.json');
    const packageManifest = await readJson<PackageManifest>('package.json');
    const workflow = await readFile(resolve(projectRoot, '.github/workflows/ci.yml'), 'utf8');

    expect(tsconfig).not.toContain('**/*.spec.ts');
    expect(tsconfig).not.toContain('**/*.test.ts');
    expect(testTsconfig.include).toContain('tests/**/*.ts');
    expect(testTsconfig.include).toContain('vitest.setup.ts');
    const permittedFalseOptions = new Set([
      'declaration',
      'declarationMap',
      'noImplicitOverride',
      'noUncheckedIndexedAccess',
    ]);
    const unexpectedDisabledOptions = Object.entries(testTsconfig.compilerOptions ?? {})
      .filter(([option, value]) => value === false && !permittedFalseOptions.has(option))
      .map(([option]) => option);
    expect(unexpectedDisabledOptions).toEqual([]);
    expect(packageManifest.scripts.typecheck).toContain('tsconfig.tests.json');
    expect(packageManifest.engines?.node).toBe('^20.19.0 || ^22.13.0 || >=24.0.0');
    expect(packageManifest.devDependencies?.['@types/node']).toMatch(/^\^20\./u);
    expect(workflow).toContain('permissions:\n  contents: read');
    expect(workflow).toMatch(/actions\/checkout@[0-9a-f]{40}/u);
    expect(workflow).toMatch(/actions\/setup-node@[0-9a-f]{40}/u);
    expect(workflow).toContain("node-version: '24'");
    expect(workflow).toContain('npm run format:check');
    expect(workflow).toContain('npm run test:coverage');
    expect(workflow).toContain('npm run verify:tree-shaking');
    expect(workflow).toContain('npm run audit:production');
  });
});
