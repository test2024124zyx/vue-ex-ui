import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 使用真实组件源代码和样式，浏览器验收不依赖 JSDOM 的布局替身。
export default defineConfig({ plugins: [vue()] });
