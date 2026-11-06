import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { glob } from 'glob';

const projectRoot = resolve(import.meta.dirname, '../..');
const readDoc = (path: string): Promise<string> => readFile(resolve(projectRoot, path), 'utf8');

const matchesExportSubpath = (subpath: string, exportKey: string): boolean => {
  if (!exportKey.includes('*')) return subpath === exportKey;
  const wildcardIndex = exportKey.indexOf('*');
  const prefix = exportKey.slice(0, wildcardIndex);
  const suffix = exportKey.slice(wildcardIndex + 1);
  return (
    subpath.startsWith(prefix) &&
    subpath.endsWith(suffix) &&
    subpath.length >= prefix.length + suffix.length
  );
};

describe('发布指南契约', () => {
  it('指南展示的当前版本与包清单一致', async () => {
    const [guide, manifestSource] = await Promise.all([
      readDoc('docs/guide/index.md'),
      readDoc('package.json'),
    ]);
    const manifest = JSON.parse(manifestSource) as { version: string };

    expect(guide).toContain(`当前版本：\`v${manifest.version}\``);
  });

  it('按需与摇树指南只展示实际存在的公开入口', async () => {
    const [onDemand, treeShaking] = await Promise.all([
      readDoc('docs/guide/on-demand.md'),
      readDoc('docs/guide/tree-shaking.md'),
    ]);

    expect(onDemand).not.toContain('ExMessage.success');
    expect(onDemand).toContain("import { ExButton, ExInput, message } from 'vue-ex-ui'");
    expect(treeShaking).not.toContain('vue-ex-ui/es/styles');
    expect(treeShaking).not.toMatch(/~\d+\s*KB/u);
    expect(treeShaking).toContain('npm run verify:tree-shaking');
    expect(treeShaking).toContain('vue-ex-ui/es/components/button');
  });

  it('国际化与服务指南说明 App 和 ConfigProvider 隔离边界', async () => {
    const [readme, optionalDependencies, configProvider] = await Promise.all([
      readDoc('README.md'),
      readDoc('docs/guide/optional-dependencies.md'),
      readDoc('docs/components/config-provider.md'),
    ]);

    expect(readme).toMatch(/不会为宿主业务安装\s+`vue-i18n`/u);
    expect(readme).toContain('app.use(i18n)');
    expect(readme).toContain('同一个响应式语言状态');
    expect(optionalDependencies).toContain('每个 Vue App');
    expect(optionalDependencies).toContain('不会异步调用 `app.use()`');
    expect(optionalDependencies).toContain('不能让宿主直接调用 `vue-i18n` 的 `useI18n()`');
    expect(configProvider).toContain('useMessageService');
    expect(configProvider).toContain('useNotificationService');
    expect(configProvider).toContain('display: contents');
    expect(configProvider).toContain('宿主仍须自行 `app.use(i18n)`');
  });

  it('Notification 与 PageHeader API 表反映运行时默认值和返回值', async () => {
    const [notification, pageHeader] = await Promise.all([
      readDoc('docs/components/notification.md'),
      readDoc('docs/components/page-header.md'),
    ]);

    expect(notification).toMatch(/notification\.close\(id\)[^\n]*boolean/u);
    expect(notification).toMatch(/maxCount[^\n]*10/u);
    expect(notification).toContain('string | VNode');
    expect(pageHeader).toContain('ConfigProvider 基础层级 + 20');
  });

  it('VitePress 侧栏可访问主题 API 与摇树指南', async () => {
    const config = await readDoc('docs/.vitepress/config.ts');

    expect(config).toContain("link: '/guide/theme-api'");
    expect(config).toContain("link: '/guide/tree-shaking'");
  });

  it('全部文档示例的包子路径均由 package exports 公开', async () => {
    const manifest = JSON.parse(await readDoc('package.json')) as {
      name: string;
      exports: Record<string, unknown>;
    };
    const files = await glob(['README.md', 'docs/**/*.{md,ts,vue}'], {
      cwd: projectRoot,
      nodir: true,
    });
    const packageName = manifest.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const importPattern = new RegExp(
      String.raw`(?:\bfrom\s*|\bimport\s*(?:type\s*)?|\bimport\s*\(\s*)['"](${packageName}(?:\/[^'"]+)?)['"]`,
      'gu'
    );
    const unsupported: string[] = [];

    for (const file of files) {
      const source = await readDoc(file);
      for (const match of source.matchAll(importPattern)) {
        const specifier = match[1]!;
        const subpath =
          specifier === manifest.name ? '.' : `.${specifier.slice(manifest.name.length)}`;
        if (!Object.keys(manifest.exports).some(key => matchesExportSubpath(subpath, key))) {
          unsupported.push(`${file}: ${specifier}`);
        }
      }
    }

    expect(unsupported).toEqual([]);
  });

  it('无障碍媒体查询只使用标准 prefers-contrast 值', async () => {
    const files = await glob(['README.md', 'docs/**/*.{md,ts,vue,scss}'], {
      cwd: projectRoot,
      nodir: true,
    });
    const invalidExamples: string[] = [];

    for (const file of files) {
      if ((await readDoc(file)).includes('prefers-contrast: high')) invalidExamples.push(file);
    }

    expect(invalidExamples).toEqual([]);
  });
});
