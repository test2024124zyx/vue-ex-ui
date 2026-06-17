import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.{js,ts,vue}'],
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
      'vue/singleline-html-element-content-newline': 'warn', // 启用单行HTML元素换行检查
      'vue/multi-word-component-names': 'off', // 允许单词组件名称
    },
  }
);
