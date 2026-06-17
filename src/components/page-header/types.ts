export interface PageHeaderProps {
  /** 页面标题 */
  title?: string
  /** 页面副标题 */
  subtitle?: string
  /** 返回按钮文本 */
  backText?: string
  /** 返回按钮图标 */
  backIcon?: string
  /** 是否显示返回按钮 */
  showBack?: boolean
  /** 面包屑数据 */
  breadcrumb?: Array<{
    title: string
    path?: string
  }>
  /** 标签列表 */
  tags?: Array<{
    text: string
    type?: 'default' | 'primary' | 'success' | 'warning' | 'error'
    color?: string
  }>
  /** 头像信息 */
  avatar?: {
    src?: string
    alt?: string
    size?: 'small' | 'medium' | 'large'
  }
  /** 是否显示分割线 */
  showDivider?: boolean
  /** 页头高度 */
  height?: string | number
  /** 是否固定 */
  fixed?: boolean
  /** 固定时的z-index */
  zIndex?: number
}

export interface PageHeaderEmits {
  /** 点击返回按钮时触发 */
  (e: 'back'): void
  /** 点击面包屑时触发 */
  (e: 'breadcrumb-click', path: string, index: number): void
}