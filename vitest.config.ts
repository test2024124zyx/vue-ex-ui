import { configDefaults, defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    // 独立基准使用 Node 测试运行器，不应被 Vitest 重复发现和执行。
    exclude: [...configDefaults.exclude, 'benchmarks/**'],
    setupFiles: ['./vitest.setup.ts'],
    // 虚拟列表大数据场景在覆盖率插桩下需要更长的稳定窗口，避免误报超时。
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      // 文档新增的交互状态与 HTTP 服务同样纳入可执行代码覆盖率门禁。
      include: [
        'src/**/*.{ts,vue}',
        'docs/.vitepress/demo-server.ts',
        'docs/.vitepress/demos/**/*.ts',
      ],
      exclude: ['src/**/types.ts', 'src/**/*.d.ts'],
      // 可执行源代码的覆盖率门禁，类型声明文件不参与分母。
      thresholds: {
        statements: 80,
        lines: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
});
