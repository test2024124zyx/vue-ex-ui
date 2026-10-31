import { createApp, h, nextTick, reactive, ref, type Component, type VNodeChild } from 'vue';
import * as ui from '../../src';
import { componentDirectories } from '../../src/resolver/component-map';
import '../../src/style-full';
import './fixture.css';

const IMAGE_SOURCE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="100"><rect width="160" height="100" fill="#1668dc"/><circle cx="80" cy="50" r="30" fill="#ffffff"/></svg>'
)}`;
const options = [
  { value: 'a', label: '项目甲' },
  { value: 'b', label: '项目乙' },
];
const columns = [
  { key: 'name', title: '名称', sortable: true },
  { key: 'amount', title: '数量' },
];
const rows = [
  { key: 'a', name: '项目甲', amount: 1 },
  { key: 'b', name: '项目乙', amount: 2 },
];
const tree = [{ key: 'root', label: '项目', children: [{ key: 'a', label: '项目甲' }] }];
const nestedOptions = [{ value: 'root', label: '项目', children: options }];
const params = new URLSearchParams(location.search);
const moduleName = params.get('component') ?? 'button';
const theme = params.get('theme') === 'light' ? 'light' : 'neon-blue';
const fixtureErrors = ref<string[]>([]);
const mediaResult = ref('');
const reportError = (error: unknown) => {
  fixtureErrors.value.push(error instanceof Error ? error.message : String(error));
};
document.documentElement.dataset.theme = theme;
const component = (name: string) => {
  const resolved = (ui as unknown as Record<string, Component>)[name];
  if (!resolved) throw new Error(`公开组件入口缺失：${name}`);
  return resolved;
};
const render = (name: string, props: Record<string, unknown> = {}, content?: VNodeChild) =>
  h(component(name), props, content === undefined ? undefined : { default: () => content });

const basicProps: Record<string, Record<string, unknown>> = {
  affix: { offsetTop: 0 },
  alert: {
    title: '任务已完成',
    description: '可以继续下一步操作',
    closable: true,
    type: params.get('type') ?? 'info',
    variant: params.get('variant') ?? 'standard',
  },
  avatar: { text: '张三' },
  'back-top': { visibilityHeight: 0 },
  badge: { count: 8 },
  barcode: { value: '123456789' },
  breadcrumb: { items: [{ label: '首页', path: '#home' }, { label: '当前页' }] },
  calendar: { modelValue: new Date(2024, 4, 15), showSolarTerm: false },
  cascader: { options: nestedOptions, filterable: true },
  chart: {
    option: {
      xAxis: { type: 'category', data: ['甲', '乙'] },
      yAxis: {},
      series: [{ type: 'bar', data: [2, 5] }],
    },
    renderer: 'svg',
    height: 300,
  },
  checkbox: { label: '接受条款' },
  code: { code: 'const count = 1;', language: 'javascript' },
  'color-picker': { modelValue: '#ff0000', predefine: ['#0000ff'], 'aria-label': '主题颜色' },
  'datetime-picker': { modelValue: new Date(2024, 4, 15), ariaLabel: '预约日期' },
  dialog: { modelValue: true, title: '确认操作' },
  drawer: { modelValue: true, title: '编辑信息' },
  dropdown: {
    items: [
      { key: 'edit', label: '编辑' },
      { key: 'delete', label: '删除' },
    ],
    trigger: 'click',
  },
  ellipsis: { lines: 1, expandable: true },
  'file-download': { url: '/docs/public/demo-assets/download-sample.csv' },
  'file-list': { files: [{ id: 'a', name: '数据.csv', size: 32, type: 'text/csv' }] },
  'file-preview': { file: { url: IMAGE_SOURCE, name: '预览图片' }, visible: true },
  'file-upload': { autoUpload: false, multiple: true },
  heatmap: {
    data: [{ date: '2024-05-15', value: 3 }],
    startDate: '2024-05-01',
    endDate: '2024-05-31',
  },
  icon: { icon: 'check-line', ariaLabel: '完成' },
  image: { src: IMAGE_SOURCE, alt: '示例图片', width: 160, height: 100 },
  'image-compress': {
    src: IMAGE_SOURCE,
    autoCompress: true,
    mode: 'dimension',
    maxWidth: 80,
    maxHeight: 50,
    outputType: 'image/png',
    onCompress: (result: ui.CompressResult) => {
      mediaResult.value = JSON.stringify({
        bytes: result.blob.size,
        ...result.compressedDimension,
      });
    },
    onError: reportError,
  },
  'image-crop': {
    src: IMAGE_SOURCE,
    onCrop: (result: ui.CropResult) => {
      mediaResult.value = JSON.stringify({ bytes: result.blob.size, ...result.outputSize });
    },
    onError: reportError,
  },
  input: { label: '项目名称' },
  link: { href: '#target' },
  list: { data: [{ key: 'a', title: '项目甲', description: '待处理' }] },
  loading: { visible: true, text: '正在处理' },
  'loading-bar': { visible: true, percentage: 50 },
  menu: {
    mode: 'inline',
    defaultOpenKeys: ['more'],
    items: [
      { key: 'a', label: '项目甲' },
      { key: 'more', label: '更多项目', children: [{ key: 'b', label: '项目乙' }] },
    ],
  },
  message: { content: '任务已保存', duration: 0 },
  modal: { modelValue: true, title: '确认操作' },
  notification: { title: '任务更新', content: '有新的处理结果', duration: 0 },
  'number-input': { modelValue: 1, ariaLabel: '数量' },
  'page-header': { title: '项目详情', showBack: true },
  pagination: { total: 120, showSizeChanger: true, showQuickJumper: true },
  panel: { title: '项目面板' },
  popconfirm: { title: '确认删除？' },
  popover: { title: '详细信息', content: '可操作的业务内容', trigger: 'click' },
  progress: { percentage: 60 },
  qrcode: { value: 'https://example.com' },
  radio: { value: 'a', label: '项目甲' },
  rate: { modelValue: params.has('half') ? 3.5 : 3, allowHalf: params.has('half') },
  select: { options, ariaLabel: '项目选择' },
  skeleton: { variant: 'article', rows: 3 },
  slider: { modelValue: 35, ariaLabel: '完成比例' },
  table: { columns, data: rows },
  'time-picker': { modelValue: '09:30:00', ariaLabel: '开始时间' },
  tooltip: { content: '提示内容' },
  tree: { data: tree, defaultExpandAll: true },
  'tree-select': { data: nestedOptions, defaultExpandAll: true, ariaLabel: '项目树选择' },
  typography: { text: '项目概览' },
  'verification-code': { label: '验证码' },
  'virtual-list': { dataSource: rows, height: 200, itemHeight: 40 },
  watermark: { text: '内部资料', fullPage: false },
};

const formModel = reactive({ amount: 1 });
const validationValue = ref<unknown>();
const tableRef = ref<InstanceType<typeof ui.ExTable>>();
const selectedKeys = ref<Array<string | number>>([]);
const switchValue = ref<boolean | string | number>(params.has('checked'));
const grouped: Record<string, () => VNodeChild> = {
  switch: () =>
    render('ExSwitch', {
      modelValue: switchValue.value,
      'onUpdate:modelValue': (value: boolean | string | number) => {
        switchValue.value = value;
      },
      ariaLabel: '启用任务',
      loading: params.has('loading'),
      inlinePrompt: params.has('inline'),
      activeText: params.has('inline') ? '开' : undefined,
      inactiveText: params.has('inline') ? '关' : undefined,
    }),
  loading: () =>
    h('div', { class: 'loading-target' }, [
      h('p', '正在读取项目数据'),
      render('ExLoading', { visible: true, text: '正在处理' }),
    ]),
  avatar: () =>
    render('ExAvatarGroup', { maxCount: 2 }, [
      render('ExAvatar', { text: '张三' }),
      render('ExAvatar', { text: '李四' }),
      render('ExAvatar', { text: '王五' }),
    ]),
  checkbox: () =>
    params.has('indeterminate')
      ? render('ExCheckbox', { indeterminate: true, label: '部分选择' })
      : render('ExCheckboxGroup', { modelValue: ['a'], options }),
  radio: () =>
    render('ExRadioGroup', { modelValue: 'a' }, [
      render('ExRadio', { value: 'a', label: '项目甲' }),
      render('ExRadio', { value: 'b', label: '项目乙' }),
    ]),
  tag: () => [render('ExTag', {}, '进行中'), render('ExTagInput')],
  'config-provider': () =>
    render('ExConfigProvider', { size: 'small' }, render('ExButton', {}, '局部配置按钮')),
  anchor: () =>
    render('ExAnchor', {}, render('ExAnchorLink', { href: '#target', title: '内容导航' })),
  carousel: () =>
    render('ExCarousel', { autoplay: false, height: 180 }, [
      render('ExCarouselItem', {}, '第一屏'),
      render('ExCarouselItem', {}, '第二屏'),
    ]),
  collapse: () =>
    render(
      'ExCollapse',
      {},
      render('ExCollapseItem', { name: 'detail', title: '详情' }, '项目内容')
    ),
  descriptions: () =>
    render(
      'ExDescriptions',
      { title: '项目信息' },
      render('ExDescriptionsItem', { label: '状态' }, '进行中')
    ),
  flex: () =>
    render('ExFlex', {}, [render('ExFlexItem', {}, '甲'), render('ExFlexItem', {}, '乙')]),
  grid: () =>
    render('ExGrid', {}, [
      render('ExGridItem', { span: 12 }, '甲'),
      render('ExGridItem', { span: 12 }, '乙'),
    ]),
  layout: () =>
    render('ExLayout', { direction: 'vertical' }, [
      render('ExHeader', {}, '项目标题'),
      render('ExLayout', {}, [
        render('ExSider', { width: 120, collapsible: true }, '侧栏'),
        render('ExContent', { tag: 'section' }, render('ExContainer', {}, '业务内容')),
      ]),
      render('ExFooter', {}, '页脚'),
    ]),
  space: () =>
    render('ExSpace', {}, [render('ExButton', {}, '保存'), render('ExButton', {}, '取消')]),
  steps: () =>
    render('ExSteps', { current: 1 }, [
      render('ExStep', { title: '提交' }),
      render('ExStep', { title: '审核' }),
      render('ExStep', { title: '完成' }),
    ]),
  tabs: () =>
    render('ExTabs', {}, [
      render('ExTabPane', { name: 'a', label: '概览' }, '概览内容'),
      render('ExTabPane', { name: 'b', label: '详情' }, '详情内容'),
    ]),
  timeline: () =>
    render('ExTimeline', {}, [
      render('ExTimelineItem', { timestamp: '09:00' }, '开始处理'),
      render('ExTimelineItem', { timestamp: '10:00' }, '处理完成'),
    ]),
  form: () =>
    h(
      ui.ExForm,
      {
        model: formModel,
        rules: {
          amount: [
            {
              trigger: 'input',
              validator: (_rule, value, done) => {
                validationValue.value = value;
                done();
              },
            },
          ],
        },
      },
      () => [
        h(ui.ExFormItem, { prop: 'amount', label: '数量' }, () =>
          h(ui.ExNumberInput, {
            modelValue: formModel.amount,
            'onUpdate:modelValue': value => {
              formModel.amount = value ?? 0;
            },
          })
        ),
        h('output', { id: 'validated-value' }, String(validationValue.value ?? '')),
      ]
    ),
  table: () => [
    h(
      'button',
      { id: 'select-all', onClick: () => tableRef.value?.toggleAllSelection() },
      '调用全选'
    ),
    h(ui.ExTable, {
      ref: tableRef,
      columns,
      data: rows,
      selectable: true,
      selectionType: 'radio',
      'onUpdate:selectedRowKeys': value => {
        selectedKeys.value = value;
      },
    }),
    h('output', { id: 'selected-keys' }, JSON.stringify(selectedKeys.value)),
  ],
  'virtual-list': () =>
    h(
      ui.ExVirtualList,
      { dataSource: rows, height: 200, itemHeight: 40 },
      { default: ({ item }: { item: (typeof rows)[number] }) => h('div', item.name) }
    ),
};
const renderScene = () => {
  if (grouped[moduleName]) return grouped[moduleName]!();
  const name = [...componentDirectories].find(([, directory]) => directory === moduleName)?.[0];
  if (!name) throw new Error(`未知组件：${moduleName}`);
  const content = ['dropdown', 'popover', 'popconfirm', 'tooltip'].includes(moduleName)
    ? render('ExButton', {}, '打开操作')
    : [
          'button',
          'link',
          'tag',
          'card',
          'panel',
          'watermark',
          'affix',
          'ellipsis',
          'config-provider',
        ].includes(moduleName)
      ? '业务内容与操作'
      : undefined;
  const props = { ...basicProps[moduleName] };
  if (['chart', 'qrcode', 'file-preview', 'watermark'].includes(moduleName))
    props.onError = reportError;
  return render(name, props, content);
};

const app = createApp({
  render: () =>
    h(
      ui.ExConfigProvider,
      {
        theme,
        locale: 'zh-CN',
        size: params.get('size') === 'small' ? 'small' : 'medium',
        animation: false,
        themeOverrides: params.has('font')
          ? { '--ex-font-secondary': params.get('font')! }
          : undefined,
      },
      () =>
        h('main', { class: 'ex-app', 'data-component': moduleName }, [
          h('h1', moduleName),
          h('section', { id: 'example' }, [renderScene()]),
          h('output', { id: 'media-result' }, mediaResult.value),
          h('output', { id: 'fixture-errors', role: 'alert' }, fixtureErrors.value.join('\n')),
          h('div', { id: 'target' }, '内容结束'),
        ])
    ),
});
app.config.errorHandler = reportError;
app.config.warnHandler = message => {
  // 参数契约错误必须使验收失败，不能用仍存在的外壳掩盖无效场景。
  if (/Missing required prop|Invalid prop/.test(message)) reportError(message);
};
app.mount('#app');
void nextTick(() => {
  document.documentElement.dataset.ready = 'true';
});
