import { mergeConfig, defineConfig } from 'vitest/config';
import original from '../../vitest.config.ts';

// 审计探针单独执行，保留原有测试及覆盖率分母。
export default mergeConfig(
  original,
  defineConfig({
    test: {
      include: ['audits/2026-09-22/*.probe.ts'],
      maxWorkers: 2,
      coverage: { enabled: false },
    },
  })
);
