import type { App } from 'vue'
import ExTimePicker from './ExTimePicker.vue'
import type { ExTimePickerProps } from './types'
import './ExTimePicker.scss'


// 导出组件
export { ExTimePicker }
export type { ExTimePickerProps }

// 导出类型
export type {
  TimeValue,
  TimeFormat,
  TimeStep,
  DisabledTime,
  TimeChangeEvent
} from './types'

// 插件安装函数
export const TimePickerPlugin = {
  install(app: App) {
    app.component('ExTimePicker', ExTimePicker)
  }
}

export default ExTimePicker