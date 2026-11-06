import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './style.css';
import './custom.scss';
import ExUI from '../../../src';
import DocsLayout from './DocsLayout.vue';

export default {
  extends: DefaultTheme,
  // 在顶部导航栏菜单之后插入「组件库主题」切换按钮（按顺序循环全部主题）
  Layout: DocsLayout,
  enhanceApp({ app }) {
    // 注册 ExUI 组件库
    app.use(ExUI);
    // 文档站启用赛博朋克氛围（库默认不侵入宿主，需主动 opt-in）
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('ex-app');
    }
  },
} satisfies Theme;
