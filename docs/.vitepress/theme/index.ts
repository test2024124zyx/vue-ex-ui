import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import './custom.scss'
import ExUI from '../../../src'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册 ExUI 组件库
    app.use(ExUI)
  }
} satisfies Theme