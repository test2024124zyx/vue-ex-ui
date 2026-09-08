import { defineConfig } from 'vitepress';
import { docsDemoPlugin } from './demo-server';

export default defineConfig({
  title: 'ExUI',
  description: '赛博朋克风格的 Vue 3 组件库 - 未来科技主题',
  lang: 'zh-CN',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#29abe2' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'ExUI - Vue3 Cyberpunk UI Library' }],
    ['meta', { name: 'og:description', content: '专为赛博朋克风格应用打造的 Vue3 组件库' }],
  ],

  // Markdown 配置
  markdown: {
    theme: 'github-dark',
    lineNumbers: true,
  },

  vite: {
    plugins: [docsDemoPlugin()],
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
    ssr: {
      noExternal: ['vue-ex-ui'],
    },
  },

  // 忽略死链接警告（开发中）
  ignoreDeadLinks: false,

  // 强制深色：文档配色全程绑定 ExUI 霓虹深色主题，原生明暗切换无意义，固定为深色
  appearance: 'force-dark',

  themeConfig: {
    logo: '/logo.svg',

    // 本地全文搜索
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },

    // zh-CN 界面文案
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '回到顶部',
    darkModeSwitchLabel: '主题',
    lastUpdatedText: '最后更新',

    nav: [
      { text: '指南', link: '/guide/' },
      { text: '组件', link: '/components/' },
      { text: '版本历史', link: '/design/' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: '快速开始', link: '/guide/quickstart' },
            { text: '按需加载', link: '/guide/on-demand' },
            { text: 'Tree Shaking', link: '/guide/tree-shaking' },
            { text: '可选依赖', link: '/guide/optional-dependencies' },
            { text: '主题定制', link: '/guide/theming' },
            { text: '主题使用指南', link: '/guide/theme-usage' },
            { text: '主题 API', link: '/guide/theme-api' },
          ],
        },
      ],
      '/components/': [
        {
          text: '通用基础组件',
          items: [
            { text: 'ConfigProvider 全局配置', link: '/components/config-provider' },
            { text: 'Typography 排版文本', link: '/components/typography' },
            { text: 'Icon 图标', link: '/components/icon' },
            { text: 'Button 按钮', link: '/components/button' },
            { text: 'Badge 徽标计数', link: '/components/badge' },
            { text: 'Image 图片', link: '/components/image' },
            { text: 'Link 链接', link: '/components/link' },
            { text: 'Avatar 头像', link: '/components/avatar' },
            { text: 'Divider 分割线', link: '/components/divider' },
            { text: 'Space 间距', link: '/components/space' },
            { text: 'Card 卡片容器', link: '/components/card' },
            { text: 'Ellipsis 文本省略', link: '/components/ellipsis' },
            { text: 'Watermark 水印', link: '/components/watermark' },
          ],
        },
        {
          text: '表单类组件',
          items: [
            { text: 'Input 文本输入框', link: '/components/input' },
            { text: 'NumberInput 数字输入框', link: '/components/number-input' },
            { text: 'Select 下拉选择器', link: '/components/select' },
            { text: 'Cascader 级联选择器', link: '/components/cascader' },
            { text: 'Checkbox 复选框', link: '/components/checkbox' },
            { text: 'Radio 单选框', link: '/components/radio' },
            { text: 'Rate 评分', link: '/components/rate' },
            { text: 'Switch 开关', link: '/components/switch' },
            { text: 'Slider 滑块', link: '/components/slider' },
            { text: 'DateTimePicker 日期时间选择器', link: '/components/datetime-picker' },
            { text: 'TimePicker 时间选择器', link: '/components/time-picker' },
            { text: 'ColorPicker 颜色选择器', link: '/components/color-picker' },
            { text: 'TreeSelect 树选择', link: '/components/tree-select' },
            { text: 'Form 表单容器', link: '/components/form' },
            { text: 'Form 表单示例', link: '/components/form-examples' },
            { text: '验证码输入', link: '/components/verification-code' },
          ],
        },
        {
          text: '数据展示组件',
          items: [
            { text: 'Tag 标签', link: '/components/tag' },
            { text: 'Descriptions 描述列表', link: '/components/descriptions' },
            { text: 'calendar 日历', link: '/components/calendar' },
            { text: 'timeline 时间轴', link: '/components/timeline' },
            { text: 'Tree 树形控件', link: '/components/tree' },
            { text: 'Collapse 折叠面板', link: '/components/collapse' },
            { text: 'Carousel 走马灯', link: '/components/carousel' },
            { text: 'List 列表', link: '/components/list' },
            { text: 'VirtualList 虚拟列表', link: '/components/virtual-list' },
            { text: 'Empty 空状态', link: '/components/empty' },
            { text: 'Progress 进度组件', link: '/components/progress' },
            { text: 'Table 表格', link: '/components/table' },
            { text: 'Tabs 选项卡', link: '/components/tabs' },
            { text: 'Panel 面板', link: '/components/panel' },
            { text: 'Code 代码', link: '/components/code' },
            { text: 'QRCode 二维码', link: '/components/qrcode' },
            { text: 'Barcode 条码', link: '/components/barcode' },
            { text: 'Heatmap 热力图', link: '/components/heatmap' },
            { text: 'Chart 图表', link: '/components/chart' },
          ],
        },
        {
          text: '导航与布局组件',
          items: [
            { text: 'Grid 栅格布局', link: '/components/grid' },
            { text: 'Flex 弹性布局容器', link: '/components/flex' },
            { text: 'Layout 布局', link: '/components/layout' },
            { text: 'Menu 导航菜单', link: '/components/menu' },
            { text: 'LoadingBar 加载条', link: '/components/loading-bar' },
            { text: 'Dropdown 下拉菜单', link: '/components/dropdown' },
            { text: 'Breadcrumb 面包屑', link: '/components/breadcrumb' },
            { text: 'Steps 步骤条', link: '/components/steps' },
            { text: 'Anchor 锚点', link: '/components/anchor' },
            { text: 'Pagination 分页器', link: '/components/pagination' },
            { text: 'BackTop 回到顶部', link: '/components/back-top' },
            { text: 'PageHeader 页头', link: '/components/page-header' },
          ],
        },
        {
          text: '反馈与交互组件',
          items: [
            { text: 'Dialog 对话框', link: '/components/dialog' },
            { text: 'Modal 模态对话框', link: '/components/modal' },
            { text: 'Drawer 抽屉', link: '/components/drawer' },
            { text: 'Tooltip 文字提示', link: '/components/tooltip' },
            { text: 'Popover 气泡提示', link: '/components/popover' },
            { text: 'Popconfirm 气泡确认框', link: '/components/popconfirm' },
            { text: 'Message 全局提示', link: '/components/message' },
            { text: 'Notification 系统通知', link: '/components/notification' },
            { text: 'Loading 加载中', link: '/components/loading' },
            { text: 'Skeleton 骨架屏', link: '/components/skeleton' },
            { text: 'Alert 警告提示', link: '/components/alert' },
            { text: 'Affix 固定位置', link: '/components/affix' },
          ],
        },
        {
          text: '文件管理组件',
          items: [
            { text: 'FileUpload 文件上传', link: '/components/file-upload' },
            { text: 'FileDownload 文件下载', link: '/components/file-download' },
            { text: 'FilePreview 文件预览', link: '/components/file-preview' },
            { text: 'ImageCrop 图片裁剪', link: '/components/image-crop' },
            { text: 'ImageCompress 图片压缩', link: '/components/image-compress' },
            { text: 'FileList 文件列表', link: '/components/file-list' },
          ],
        },
      ],
      '/design/': [
        {
          text: '版本历史',
          items: [
            { text: '更新日志', link: '/design/' },
            { text: '主题设计指南', link: '/design/theme-design-guide' },
            { text: '主题色彩参考', link: '/design/theme-colors-reference' },
          ],
        },
      ],
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/zhuhanxin0308/vue-ex-ui' }],
  },
});
