import { mergeConfig, defineConfig } from 'vitest/config';
import original from '../../vitest.config.ts';

const mutations: Record<string, { suffix: string; before: string; after: string }> = {
  url: {
    suffix: '/src/utils/sanitize.ts',
    before: "if (normalizedName === 'href' && !isSafeUrl(attributeValue)) continue;",
    after: '/* 审计变异：临时移除 URL 协议保护，仅改内存模块。 */',
  },
  path: {
    suffix: '/src/components/form/utils.ts',
    before: 'key.length === 0 || UNSAFE_FIELD_PATH_SEGMENTS.has(key)',
    after: 'key.length === 0',
  },
  merge: {
    suffix: '/src/utils/index.ts',
    before: 'if (UNSAFE_MERGE_KEYS.has(key)) continue;',
    after: '/* 审计变异：临时移除源对象危险键保护，仅改内存模块。 */',
  },
};
const selected = mutations[process.env.AUDIT_MUTATION ?? ''];
export default mergeConfig(
  original,
  defineConfig({
    plugins: [
      {
        name: 'bounded-audit-mutation',
        enforce: 'pre',
        transform(code, id) {
          if (!selected || !id.replaceAll('\\', '/').endsWith(selected.suffix)) return;
          if (code.split(selected.before).length !== 2)
            throw new Error('变异锚点不唯一，拒绝错误计分');
          return code.replace(selected.before, selected.after);
        },
      },
    ],
    test: {
      maxWorkers: 2,
      coverage: { enabled: false },
      include: process.env.AUDIT_MUTATION_CONFIRM
        ? ['audits/2026-09-22/contracts.probe.ts']
        : [
            'tests/utils/sanitize.test.ts',
            'tests/utils/core.test.ts',
            'tests/components/form/form-utils.test.ts',
          ],
      testNamePattern: process.env.AUDIT_MUTATION_CONFIRM ? '不可信 source' : undefined,
    },
  })
);
