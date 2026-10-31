import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// 使用真实组件源代码和样式，浏览器验收不依赖 JSDOM 的布局替身。
export default defineConfig({
  plugins: [vue()],
  // 验收期间不让编辑器保存触发热更新，页面状态只由测试中的真实操作改变。
  server: { hmr: false },
});
