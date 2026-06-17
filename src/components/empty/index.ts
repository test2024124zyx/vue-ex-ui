import type { App } from 'vue'
import Empty from './ExEmpty.vue'

Empty.install = (app: App) => {
  app.component('ExEmpty', Empty)
}

export default Empty
export { Empty as ExEmpty }
export * from './types'
