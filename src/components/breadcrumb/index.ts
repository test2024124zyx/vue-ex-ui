import type { App } from 'vue'
import ExBreadcrumb from './ExBreadcrumb.vue'
import ExBreadcrumbItem from './ExBreadcrumbItem.vue'
import './ExBreadcrumb.scss'
import './ExBreadcrumbItem.scss'

// 导出组件
export { ExBreadcrumb, ExBreadcrumbItem }

// 导出类型
export type {
  BreadcrumbProps,
  BreadcrumbItemProps,
  BreadcrumbItem,
  BreadcrumbEmits,
  BreadcrumbItemEmits
} from './types'

// Vue插件
export const BreadcrumbPlugin = {
  install(app: App) {
    app.component('ExBreadcrumb', ExBreadcrumb)
    app.component('ExBreadcrumbItem', ExBreadcrumbItem)
  }
}

export default BreadcrumbPlugin