import type { App } from 'vue'
import ExDatePicker from './ExDatePicker.vue'
import type { ExDatePickerProps, DateValue, DateRangeValue, DateShortcut } from './types'
import './ExDatePicker.scss'
// 导出组件
export { ExDatePicker }

// 导出类型
export type { 
  ExDatePickerProps, 
  DateValue, 
  DateRangeValue, 
  DateShortcut 
}

// 导出工具函数
export { dateUtils } from './utils'

// 插件安装
ExDatePicker.install = (app: App): void => {
  app.component('ExDatePicker', ExDatePicker)
}

const ExDatePickerPlugin = {
  install(app: App): void {
    app.component('ExDatePicker', ExDatePicker)
  }
}

export { ExDatePickerPlugin }
export default ExDatePicker