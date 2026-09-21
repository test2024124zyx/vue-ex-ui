import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'docs/.vitepress/cache/**',
      'docs/.vitepress/dist/**',
      // 独立浏览器基准的编译产物和机器采样数据不作为源代码检查。
      'benchmarks/ui-comparison/dist/**',
      'benchmarks/ui-comparison/results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      // 基础规则
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // TypeScript 规则
      '@typescript-eslint/no-explicit-any': 'warn', // 警告使用 any 类型
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-empty-object-type': 'error', // 禁止空对象类型

      // Vue 规则
      'vue/attributes-order': 'warn', // 启用属性顺序检查
      // 模板换行、缩进与自闭合格式统一由严格 Prettier 门禁负责，避免两套格式器冲突。
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-indent': 'off',
      'vue/html-self-closing': 'off',
      'vue/multi-word-component-names': 'off', // 允许单词组件名称
    },
  },
  {
    files: ['tests/**/*.ts'],
    rules: {
      // 单测会在同一文件声明多个最小宿主组件，用于验证跨 App 与 Provider 隔离。
      'vue/one-component-per-file': 'off',
    },
  }
);
