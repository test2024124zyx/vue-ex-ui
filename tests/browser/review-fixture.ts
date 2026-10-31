import { createApp, defineComponent, h, nextTick, reactive, ref, type VNodeChild } from 'vue';
import * as ui from '../../src';
import '../../src/style-full';
import './fixture.css';

const scenario = new URLSearchParams(location.search).get('scenario') ?? 'controls';
const theme = new URLSearchParams(location.search).get('theme') === 'light' ? 'light' : 'neon-blue';
document.documentElement.dataset.theme = theme;
const errors = ref<string[]>([]);
const action = (id: string, label: string, onClick: () => void) =>
  h(ui.ExButton, { id, onClick }, () => label);
const section = (id: string, title: string, children: VNodeChild[]) =>
  h('section', { id, style: { marginBlock: '24px' } }, [h('h2', { style: { fontSize: '18px' } }, title), ...children]);
const form = ref<ui.FormInstance>();
const model = reactive({ checked: false, radio: 'a', code: '', slider: 10, tags: [] as string[] });
const submissions = ref(0);
const pageSize = ref(10);
const pagination = ref<ui.ExPaginationExposed>();
const anchor = ref<ui.ExAnchorExposed>();
const scrollContainer = ref<HTMLElement>();
const description = ref('帮助说明');
const zIndex = ref(1000);
const virtualList = ref<{ scrollToIndex(index: number): void }>();
const virtualRows = reactive([{ id: 'a', height: 200 }, { id: 'b', height: 300 }, { id: 'c', height: 400 }]);
const dragRequests = ref<string[]>([]);
const cyclicTree: ui.TreeNode = { key: 'root', label: '根节点' };
cyclicTree.children = [cyclicTree, { key: 'leaf', label: '合法子项' }];
const cyclicOptions: ui.CascaderOption = { value: 'root', label: '根节点' };
cyclicOptions.children = [cyclicOptions, { value: 'leaf', label: '合法子项' }];

const Services = defineComponent({
  setup() {
    const message = ui.useMessageService();
    const notification = ui.useNotificationService();
    const loading = ui.useLoadingService();
    const bar = ui.useLoadingBarService();
    const target = ref<HTMLElement>();
    return () => section('services', '全局服务层级', [
      action('open-services', '打开服务', () => {
        message.info({ content: '层级消息', duration: 0 });
        notification.info({ title: '层级通知', duration: 0 });
        loading.show({ target: target.value });
        bar.start();
      }),
      action('raise-services', '提高层级', () => { zIndex.value = 5000; }),
      action('explicit-services', '显式层级', () => {
        message.config({ zIndex: 2000 });
        notification.config({ zIndex: 2000 });
        notification.info({ title: '显式通知', duration: 0 });
      }),
      h('div', { ref: target, style: { minHeight: '160px', position: 'relative', marginTop: '24px' } }),
    ]);
  },
});

const uploader = ref<ui.ExFileUploadExposed>();
const uploadForm = ref<ui.FormInstance>();
const raw = new File(['文件原始内容'], 'initial.txt', { type: 'text/plain' });
const uploadModel = reactive({ files: [{ uid: 'initial', raw, name: raw.name, type: raw.type, size: raw.size, status: 'ready' }] as ui.UploadFile[] });
const uploadSuccess = ref(0);
const downloadName = ref('old.txt');

const scenes: Record<string, () => VNodeChild> = {
  controls: () => [
    section('controlled-input', '受控文本', [h(ui.ExInput, { modelValue: '确认值', clearable: true, ariaLabel: '受控文本' })]),
    section('controlled-radio', '受控单选', [h(ui.ExRadioGroup, { modelValue: 'a' }, () => [h(ui.ExRadio, { value: 'a', label: '甲' }), h(ui.ExRadio, { value: 'b', label: '乙' })])]),
    section('controlled-slider', '受控滑块', [h(ui.ExSlider, { modelValue: 10, showInput: true })]),
    section('finite-number', '有限数值', [h(ui.ExNumberInput, { modelValue: 7 })]),
  ],
  reset: () => [
    h(ui.ExForm, { ref: form, model }, () => [
      h(ui.ExFormItem, { prop: 'checked', label: '本地复选校验' }, () => h(ui.ExCheckbox, {
        modelValue: model.checked, label: '触发错误', rules: [value => value === false || '本地错误'],
        'onUpdate:modelValue': value => { model.checked = value === true; },
      })),
      h(ui.ExFormItem, { prop: 'radio', label: '本地单选校验' }, () => h(ui.ExRadioGroup, {
        modelValue: model.radio, rules: [value => value === 'a' || '单选错误'],
        'onUpdate:modelValue': value => { model.radio = String(value); },
      }, () => [h(ui.ExRadio, { value: 'a', label: '甲' }), h(ui.ExRadio, { value: 'b', label: '乙' })])),
      h(ui.ExFormItem, { prop: 'code', label: '验证码' }, () => h(ui.ExVerificationCode, {
        modelValue: model.code, autoSubmit: true, autoSubmitDelay: 1000,
        'onUpdate:modelValue': value => { model.code = value; }, onSubmit: () => { submissions.value += 1; },
      })),
      h(ui.ExFormItem, { prop: 'slider', label: '滑块' }, () => h(ui.ExSlider, {
        modelValue: model.slider, 'onUpdate:modelValue': value => { model.slider = value as number; },
      })),
      h(ui.ExFormItem, { prop: 'tags', label: '标签' }, () => h(ui.ExTagInput, {
        existingTags: model.tags, onConfirm: value => { model.tags.push(value); },
      })),
    ]),
    action('reset-form', '重置全部', () => form.value!.resetFields()),
    h('output', { id: 'submit-count' }, String(submissions.value)),
    h('output', { id: 'reset-model' }, JSON.stringify(model)),
  ],
  navigation: () => [
    section('partial-pagination', '部分受控分页', [
      h(ui.ExPagination, { ref: pagination, pageSize: pageSize.value, total: 100, showSizeChanger: true }),
      action('page-four', '跳到第四页', () => pagination.value!.goToPage(4)),
      action('accept-size', '确认每页二十条', () => { pageSize.value = 20; }),
    ]),
    section('empty-jump', '空跳页草稿', [h(ui.ExPagination, { current: 5, total: 100, showQuickJumper: true })]),
    section('dynamic-tooltip', '动态说明', [
      h(ui.ExTooltip, { content: '提示说明', trigger: 'click', closeDelay: 0 }, () => h(ui.ExButton, { id: 'tooltip-trigger', 'aria-describedby': description.value }, () => '显示提示')),
      action('change-description', '更新说明', () => { description.value = '当前错误'; }),
    ]),
    section('disabled-menu', '禁用菜单项', [h(ui.ExDropdown, { trigger: 'click' }, {
      default: () => h(ui.ExButton, { id: 'menu-trigger' }, () => '菜单'),
      menu: () => [h('button', { role: 'menuitem', disabled: true }, '禁用项'), h('button', { role: 'menuitem' }, '可用项')],
    })]),
    section('anchor-nav', '公开锚点滚动', [
      h(ui.ExAnchor, { ref: anchor, container: () => scrollContainer.value! }, () => [h(ui.ExAnchorLink, { href: '#anchor-first', title: '第一节' }), h(ui.ExAnchorLink, { href: '#anchor-second', title: '第二节' })]),
      action('jump-anchor', '定位第二节', () => anchor.value!.scrollToAnchor('#anchor-second')),
      h('div', { ref: scrollContainer, style: { height: '160px', overflow: 'auto' } }, [h('div', { id: 'anchor-first', style: { height: '320px' } }, '第一节内容'), h('div', { id: 'anchor-second', style: { height: '320px' } }, '第二节内容')]),
    ]),
  ],
  trees: () => [
    section('cyclic-tree', '静态树循环保护', [h(ui.ExTree, { data: [cyclicTree], defaultExpandAll: true })]),
    section('cyclic-cascader', '级联循环保护', [h(ui.ExCascader, { options: [cyclicOptions], filterable: true })]),
    section('checked-parent', '外部多选联动', [h(ui.ExTreeSelect, {
      data: [{ value: 'p', label: '父节点', children: [{ value: 'a', label: '甲' }, { value: 'b', label: '乙' }] }],
      modelValue: ['a', 'b'], multiple: true, defaultExpandAll: true,
    })]),
    section('drag-source', '外部树', [h(ui.ExTree, { data: [{ key: 'same', label: '外部节点' }], draggable: true })]),
    section('drag-target', '当前树', [h(ui.ExTree, {
      data: [{ key: 'same', label: '当前节点' }, { key: 'target', label: '目标' }], draggable: true,
      onNodeDrop: (node: ui.TreeNode) => { dragRequests.value.push(node.label); },
    })]),
    h('output', { id: 'drop-results' }, JSON.stringify(dragRequests.value)),
  ],
  virtual: () => [
    section('virtual-data', '动态高度列表', [h(ui.ExVirtualList, {
      ref: virtualList, dataSource: virtualRows, itemHeight: (_index, item) => (item as { height: number }).height,
      height: 100, threshold: 1, buffer: 0,
    }, { default: ({ item }: { item: { id: string; height: number } }) => h('div', { style: { height: `${item.height}px` } }, item.id) })]),
    action('reverse-rows', '原地反转', () => { virtualRows.reverse(); }),
    action('scroll-second', '定位第二项', () => virtualList.value!.scrollToIndex(1)),
  ],
  services: () => h(Services),
  files: () => [
    h(ui.ExForm, { ref: uploadForm, model: uploadModel }, () => h(ui.ExFormItem, { prop: 'files', label: '上传事务' }, () => h(ui.ExFileUpload, {
      ref: uploader, action: '/acceptance-upload', autoUpload: false, fileList: uploadModel.files,
      'onUpdate:fileList': value => { uploadModel.files = value; }, onSuccess: () => { uploadSuccess.value += 1; },
    }))),
    action('start-upload', '开始上传', () => { void uploader.value!.submit(); }),
    action('reset-upload', '重置上传', () => uploadForm.value!.resetFields()),
    h('output', { id: 'upload-status' }, uploadModel.files[0]?.status ?? ''),
    h('output', { id: 'upload-success' }, String(uploadSuccess.value)),
    section('snapshot-download', '下载事务', [
      h(ui.ExFileDownload, { url: `/acceptance-download/${downloadName.value}`, filename: downloadName.value, transport: 'fetch' }),
      action('switch-download', '切换下载配置', () => { downloadName.value = 'new.txt'; }),
    ]),
  ],
};

const app = createApp({
  render: () => h(ui.ExConfigProvider, { theme, locale: 'zh-CN', animation: false, zIndex: zIndex.value }, () =>
    h('main', { class: 'ex-app' }, [h('h1', '状态回归验收'), scenes[scenario]?.(), h('output', { id: 'fixture-errors' }, errors.value.join('\n'))])
  ),
});
app.config.errorHandler = error => { errors.value.push(String(error)); };
app.mount('#app');
void nextTick(() => { document.documentElement.dataset.ready = 'true'; });
window.addEventListener('pagehide', () => app.unmount(), { once: true });
