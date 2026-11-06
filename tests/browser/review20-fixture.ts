import {
  createApp,
  defineComponent,
  h,
  nextTick,
  reactive,
  ref,
  type Component,
  type VNodeChild,
} from 'vue';
import * as ui from '../../src';
import '../../src/style-full';
import './fixture.css';

const params = new URLSearchParams(location.search);
const scene = params.get('scene') ?? 'controls';
const errors = ref<string[]>([]);
const action = (id: string, text: string, onClick: () => void) =>
  h(ui.ExButton, { id, onClick }, () => text);
const section = (id: string, title: string, children: VNodeChild[]) =>
  h('section', { id, style: { marginBlock: '24px' } }, [h('h2', title), ...children]);

const form = ref<ui.FormInstance>();
const model = reactive({ fast: '内容', slow: '内容' });
const validation = ref('未开始');
const fastRule: ui.FormRule = { required: true, message: '必填' };
let finishValidation: (() => void) | undefined;
const slowRule: ui.FormRule = {
  validator: (_rule, _value, done) => {
    finishValidation = done;
  },
};

const raw = new File(['第一个文件'], 'first.txt', { type: 'text/plain' });
const files = ref<ui.UploadFile[]>([
  { uid: 'first', name: raw.name, type: raw.type, size: raw.size, raw, status: 'ready' },
]);
const upload = ref<ui.ExFileUploadExposed>();
const waitingBeforeAdd = ref(false);
let finishAdd: (() => void) | undefined;
const beforeAdd = () => {
  waitingBeforeAdd.value = true;
  return new Promise<void>(resolve => {
    finishAdd = () => {
      waitingBeforeAdd.value = false;
      resolve();
    };
  });
};

const checked = ref(false);
const checkboxRule = (value: unknown) => value === false || '本地错误';
const panelLoading = ref(true);
const panelClicks = ref(0);
const expanded = ref<boolean | undefined>(true);
const showAnchor = ref(false);

const selectorKind = params.get('kind') ?? 'select';
const selectorForm = ref<ui.FormInstance>();
const selectorModel = reactive({ choice: selectorKind === 'cascader' ? [] : null });
const nodeOptions = [{ value: 'root', label: '根节点', isLeaf: false }];
const requestCount = ref(0);
const abortCount = ref(0);
const pendingLoads: Array<() => void> = [];
const load = (_value: unknown, { signal }: { signal: AbortSignal }) => {
  const index = ++requestCount.value;
  signal.addEventListener('abort', () => abortCount.value++, { once: true });
  return new Promise<Array<{ value: string; label: string }>>(resolve => {
    pendingLoads.push(() => resolve([{ value: String(index), label: `第${index}次结果` }]));
  });
};
const renderSelector = () => {
  if (selectorKind === 'select')
    return h(ui.ExSelect, { modelValue: null, searchable: true, remote: true, remoteLoader: load });
  if (selectorKind === 'tree-select')
    return h(ui.ExTreeSelect, { modelValue: null, data: nodeOptions, loadData: load });
  return h(ui.ExCascader, {
    modelValue: selectorModel.choice,
    options: nodeOptions,
    loadData: load,
  });
};

const treeKeys = ref(['p']);
const tree = [
  {
    key: 'p',
    label: '父节点',
    children: [
      { key: 'a', label: '甲' },
      { key: 'b', label: '乙' },
    ],
  },
];
const columns = [
  { key: 'a', title: '甲列' },
  { key: 'b', title: '乙列' },
];
const reorderCounts = reactive({ first: 0, second: 0 });
const dropdownContent = () => [
  action('before-dropdown', '之前', () => undefined),
  h(ui.ExDropdown, { trigger: 'click', items: [{ key: 'a', label: '菜单项' }] }, () =>
    action('dropdown-trigger', '打开菜单', () => undefined)
  ),
  action('after-dropdown', '之后', () => undefined),
];

const zIndex = ref(1000);
const Services = defineComponent({
  setup() {
    const service = ui.useNotificationService();
    return () => [
      action('show-notification', '显示通知', () =>
        service.info({ title: '焦点通知', duration: 0 })
      ),
      action('raise-layer', '提高层级', () => {
        zIndex.value = 5000;
      }),
      action('outside-notification', '其他操作', () => undefined),
    ];
  },
});

const chart = ref<ui.ExChartExposed>();
const chartOption = ref<ui.ChartOption>({});
const chartReady = ref(false);
const barOption: ui.ChartOption = {
  xAxis: { type: 'category', data: ['甲'] },
  yAxis: {},
  series: [{ type: 'bar', data: [3] }],
};
const pieOption: ui.ChartOption = {
  legend: { selected: { 隐藏项: false } },
  series: [
    {
      type: 'pie',
      data: [
        { name: '隐藏项', value: 2 },
        { name: '显示项', value: 3 },
      ],
    },
  ],
};

const imageSource = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#1668dc"/><circle cx="400" cy="300" r="100" fill="white"/></svg>'
)}`;
const crop = ref<ui.ExImageCropExposed>();
const area = ref<ui.CropArea>();
const triggers = ref<'hover' | 'click'>('hover');
const popupKey = ref(0);

const scenes: Record<string, () => VNodeChild> = {
  form: () => [
    h(ui.ExForm, { ref: form, model, scrollToError: false }, () => [
      h(ui.ExFormItem, { prop: 'fast', rules: fastRule }, () =>
        h(ui.ExInput, {
          modelValue: model.fast,
          'onUpdate:modelValue': value => {
            model.fast = String(value);
          },
        })
      ),
      h(ui.ExFormItem, { prop: 'slow', rules: slowRule }),
    ]),
    action('start-validation', '校验', () => {
      validation.value = '等待中';
      void form.value!.validate().then(result => {
        validation.value = JSON.stringify(result);
      });
    }),
    action('finish-validation', '完成慢校验', () => finishValidation?.()),
    h('output', { id: 'validation-result' }, validation.value),
  ],
  upload: () => [
    h(ui.ExFileUpload, {
      ref: upload,
      action: '/review20-upload',
      fileList: files.value,
      beforeAdd,
      autoUpload: false,
      'onUpdate:fileList': value => {
        files.value = value.map(file => ({ ...file }));
      },
    }),
    action('start-upload', '开始上传', () => {
      void upload.value!.submit();
    }),
    action('finish-add', '允许添加', () => finishAdd?.()),
    h('output', { id: 'waiting-add' }, String(waitingBeforeAdd.value)),
    h(
      'output',
      { id: 'file-results' },
      JSON.stringify(files.value.map(file => ({ name: file.name, status: file.status })))
    ),
  ],
  controls: () => [
    section(
      'independent-radio',
      '独立同名单选',
      ['a', 'b'].map(value => h(ui.ExRadio, { name: 'same', modelValue: 'a', value, label: value }))
    ),
    section('large-number', '大数精度', [h(ui.ExNumberInput, { modelValue: 1e308, precision: 2 })]),
    section('local-error', '外部值恢复', [
      h(ui.ExCheckbox, {
        modelValue: checked.value,
        label: '触发错误',
        rules: [checkboxRule],
        'onUpdate:modelValue': value => {
          checked.value = Boolean(value);
        },
      }),
      action('restore-checkbox', '恢复合法值', () => {
        checked.value = false;
      }),
    ]),
    section('panel-state', '加载交互', [
      h(
        ui.ExPanel,
        {
          loading: panelLoading.value,
          hoverable: true,
          title: '操作面板',
          onClick: () => panelClicks.value++,
        },
        () => '面板内容'
      ),
      action('finish-panel', '加载完成', () => {
        panelLoading.value = false;
      }),
      h('output', { id: 'panel-clicks' }, String(panelClicks.value)),
    ]),
    section('ellipsis-state', '解除控制', [
      h(ui.ExEllipsis, { expanded: expanded.value, expandable: true }, () =>
        '完整内容 '.repeat(20)
      ),
      action('release-ellipsis', '解除展开控制', () => {
        expanded.value = undefined;
      }),
    ]),
    h('span', { id: 'audit-anchor', style: { position: 'absolute', top: '0' } }),
    h(ui.ExAnchor, {}, () =>
      showAnchor.value ? h(ui.ExAnchorLink, { href: '#audit-anchor', title: '当前位置' }) : null
    ),
    action('add-anchor', '添加锚点', () => {
      showAnchor.value = true;
    }),
  ],
  selectors: () => [
    h(ui.ExForm, { ref: selectorForm, model: selectorModel }, () =>
      h(ui.ExFormItem, { prop: 'choice' }, renderSelector)
    ),
    action('reset-selector', '重置选择器', () => selectorForm.value!.resetFields()),
    action('finish-loads', '返回请求', () => pendingLoads.splice(0).forEach(finish => finish())),
    h('output', { id: 'request-count' }, String(requestCount.value)),
    h('output', { id: 'abort-count' }, String(abortCount.value)),
  ],
  trees: () => [
    h(ui.ExTree, {
      data: tree,
      checkedKeys: treeKeys.value,
      checkable: true,
      defaultExpandAll: true,
    }),
    action('check-children', '传入全部子节点', () => {
      treeKeys.value = ['a', 'b'];
    }),
    ...(['first', 'second'] as const).map(name =>
      section(`table-${name}`, name, [
        h(ui.ExTable, {
          columns,
          data: [{ key: 'row', a: '甲', b: '乙' }],
          reorderableColumns: true,
          'onUpdate:columnOrder': () => reorderCounts[name]++,
        }),
        h('output', { id: `order-${name}` }, String(reorderCounts[name])),
      ])
    ),
  ],
  dropdown: () =>
    params.get('modal') === 'true'
      ? h(ui.ExModal, { modelValue: true, showClose: false, showFooter: false }, dropdownContent)
      : dropdownContent(),
  services: () => h(Services),
  chart: () => [
    h(ui.ExChart, {
      ref: chart,
      option: chartOption.value,
      renderer: 'svg',
      height: 300,
      onInit: () => {
        chartReady.value = true;
      },
    }),
    action('chart-data', '公开方法填充数据', () => chart.value!.setOption(barOption)),
    action('chart-clear', '清空图表', () => chart.value!.clear()),
    action('chart-pie', '隐藏饼图项', () => {
      chartOption.value = pieOption;
    }),
    h('output', { id: 'chart-ready' }, String(chartReady.value)),
  ],
  crop: () => [
    h(ui.ExImageCrop, {
      ref: crop,
      src: imageSource,
      onChange: value => {
        area.value = value;
      },
    }),
    action('reset-crop', '重置裁剪事务', () => crop.value!.reset()),
    h('output', { id: 'crop-area' }, JSON.stringify(area.value)),
  ],
  popups: () => [
    ...(['dropdown', 'popover', 'tooltip'] as const).map(kind =>
      section(kind, kind, [
        kind === 'dropdown'
          ? h(
              ui.ExDropdown,
              {
                trigger: triggers.value,
                showDelay: 100,
                hideDelay: 100,
                items: [{ key: 'a', label: '菜单' }],
              },
              () => action(`trigger-${kind}`, '触发菜单', () => undefined)
            )
          : h(
              (kind === 'popover' ? ui.ExPopover : ui.ExTooltip) as Component,
              { trigger: triggers.value, openDelay: 100, closeDelay: 100, content: '浮层内容' },
              () => h('button', { id: `trigger-${kind}`, key: popupKey.value }, '触发提示')
            ),
      ])
    ),
    action('click-triggers', '切为点击触发', () => {
      triggers.value = 'click';
    }),
    action('replace-popup-trigger', '替换触发按钮', () => {
      popupKey.value++;
    }),
  ],
};

const app = createApp({
  render: () =>
    h(
      ui.ExConfigProvider,
      { locale: 'zh-CN', theme: 'light', animation: false, zIndex: zIndex.value },
      () =>
        h('main', { class: 'ex-app' }, [
          h('h1', '业务回归'),
          scenes[scene]?.(),
          h('output', { id: 'fixture-errors' }, errors.value.join('\n')),
        ])
    ),
});
app.config.errorHandler = error => {
  errors.value.push(String(error));
};
app.mount('#app');
void nextTick(() => {
  document.documentElement.dataset.ready = 'true';
});
window.addEventListener('pagehide', () => app.unmount(), { once: true });
