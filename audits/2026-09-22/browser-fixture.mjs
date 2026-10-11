import { createApp, h, nextTick, reactive, ref } from 'vue';
import {
  ExModal,
  ExDialog,
  ExDrawer,
  ExSelect,
  ExConfigProvider,
  ExForm,
  ExFormItem,
  ExInput,
  ExButton,
  ExTable,
  ExMessage,
  ExNotification,
  ExPagination,
  ExSlider,
  ExSwitch,
  ExCheckbox,
  ExTabs,
  ExTabPane,
  sanitizeHtml,
  setLocale,
} from '../../dist/es/index.js';
import '../../dist/ex-ui.css';

const OPTION_COUNT = 1000;
const ROW_HEIGHT = 48;
const VIEWPORT_HEIGHT = 400;
const TRANSITION_SETTLE_MS = 400;
const options = Array.from({ length: OPTION_COUNT }, (_, index) => ({
  value: index,
  label: `选项 ${String(index).padStart(4, '0')}`,
}));
const columns = [
  { key: 'id', title: '编号', width: 100, sortable: true },
  { key: 'name', title: '名称', width: 260 },
  { key: 'amount', title: '金额', width: 140, sortable: true },
];
let app;
let state;
let form;
let inputEvents;

const button = (id, label, handler) => h('button', { id, type: 'button', onClick: handler }, label);
const makeRows = count =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `记录 ${index + 1}`,
    amount: count - index,
  }));

async function unmount() {
  if (!app) return;
  app.unmount();
  app = undefined;
  await nextTick();
  // 等待 Vue 离场动画释放节点，防止下一用例误选到上一个场景的 Teleport。
  await new Promise(resolve => setTimeout(resolve, TRANSITION_SETTLE_MS));
}

async function mount(scene, config = {}) {
  await unmount();
  state = reactive({
    open: false,
    value: undefined,
    input: '',
    theme: config.theme ?? 'light',
    rows: makeRows(config.rows ?? 100),
    counter: 0,
    current: config.current ?? 1,
    containerWidth: config.containerWidth ?? '100%',
  });
  form = ref();
  inputEvents = [];
  const select = () =>
    h(ExSelect, {
      options,
      modelValue: state.value,
      searchable: config.searchable ?? true,
      virtual: config.virtual ?? true,
      multiple: config.multiple ?? false,
      'aria-label': '客户选项',
      'onUpdate:modelValue': value => {
        state.value = value;
      },
    });
  const input = () =>
    h(ExInput, {
      modelValue: state.input,
      'aria-label': '姓名',
      'onUpdate:modelValue': value => {
        state.input = value;
        inputEvents.push(value);
      },
    });
  const renderScene = () => {
    if (scene === 'overlay' || scene === 'focus') {
      const component = { modal: ExModal, dialog: ExDialog, drawer: ExDrawer }[
        config.kind ?? 'modal'
      ];
      return [
        button('opener', '打开编辑', () => {
          state.open = true;
        }),
        h(
          component,
          {
            modelValue: state.open,
            'onUpdate:modelValue': value => {
              state.open = value;
            },
            title: '审计编辑面板',
            showFooter: false,
            showClose: false,
            closable: false,
            destroyOnClose: true,
          },
          {
            default: () =>
              scene === 'focus'
                ? [
                    h('fieldset', { disabled: true }, [
                      h('legend', '已停用资料'),
                      h('input', { id: 'fieldset-input', 'aria-label': '停用输入' }),
                    ]),
                    button('valid-first', '可用一', () => {}),
                    button('valid-last', '可用二', () => {}),
                  ]
                : [
                    select(),
                    input(),
                    button('inside', '保存', () => {
                      state.open = false;
                    }),
                  ],
          }
        ),
      ];
    }
    if (scene === 'form')
      return h(
        ExForm,
        {
          ref: form,
          model: state,
          rules: { input: [{ required: true }] },
          scrollToError: false,
        },
        {
          default: () => [
            h(ExFormItem, { prop: 'input', label: '姓名' }, { default: input }),
            button('validate', '校验', () => {
              void form.value.validate();
            }),
            button('reset', '重置', () => {
              form.value.resetFields();
            }),
          ],
        }
      );
    if (scene === 'table')
      return h(ExTable, {
        data: state.rows,
        columns,
        rowKey: 'id',
        virtual: config.virtual ?? true,
        virtualHeight: VIEWPORT_HEIGHT,
        maxHeight: VIEWPORT_HEIGHT,
        rowHeight: ROW_HEIGHT,
        immutable: config.immutable ?? false,
      });
    if (scene === 'input') return input();
    if (scene === 'security')
      return [
        h(ExMessage, { content: config.html, dangerouslyUseHTMLString: true, duration: 0 }),
        h(ExNotification, {
          title: '本地 HTML 样本',
          content: config.html,
          dangerouslyUseHTMLString: true,
          duration: 0,
        }),
      ];
    if (scene === 'pagination')
      return h(
        'div',
        {
          id: 'pagination-container',
          style: { width: state.containerWidth, maxWidth: '100%' },
        },
        [
          h(ExPagination, {
            total: config.total ?? 100,
            current: state.current,
            size: config.size ?? 'medium',
            align: config.align ?? 'left',
            showPages: config.showPages ?? 7,
            showTotal: config.showTotal ?? true,
            showSizeChanger: config.showSizeChanger ?? false,
            showQuickJumper: config.showQuickJumper ?? false,
            simple: config.simple ?? false,
            disabled: config.disabled ?? false,
            totalText: config.longText
              ? () => '分页总数与当前数据范围会随容器宽度自然换行而保持完整可读'
              : undefined,
            'onUpdate:current': value => {
              state.current = value;
              state.counter++;
            },
          }),
        ]
      );
    return [
      h(ExButton, {}, () => '确认'),
      input(),
      select(),
      h(ExSwitch, { 'aria-label': '启用通知' }),
      h(ExCheckbox, {}, () => '同意条款'),
      h(ExSlider, { 'aria-label': '音量' }),
      h(ExPagination, { total: 100 }),
      h(
        ExTabs,
        { modelValue: 'one' },
        {
          default: () => [
            h(ExTabPane, { name: 'one', label: '概览' }, () => '内容一'),
            h(ExTabPane, { name: 'two', label: '详情' }, () => '内容二'),
          ],
        }
      ),
    ].map(child => h('div', { style: 'margin-bottom:16px' }, [child]));
  };
  setLocale('en-US');
  app = createApp({
    render: () =>
      h(
        ExConfigProvider,
        {
          theme: state.theme,
          locale: config.locale ?? 'zh-CN',
          animation: false,
        },
        {
          default: () =>
            h(
              'main',
              {
                style:
                  'padding:24px;min-height:400px;background:var(--ex-color-bg-primary);color:var(--ex-color-text-primary)',
              },
              [h('h1', '组件审计'), ...[renderScene()].flat()]
            ),
        }
      ),
  });
  app.mount('#app');
  await nextTick();
}

window.__audit = {
  mount,
  unmount,
  snapshot: () => ({ ...state, inputEvents: [...inputEvents] }),
  async patch(values) {
    Object.assign(state, values);
    await nextTick();
  },
  async replaceRows(count) {
    state.rows = makeRows(count);
    await nextTick();
  },
  async updateRow() {
    state.rows = state.rows.map((row, index) => (index ? row : { ...row, name: '更新后的记录' }));
    await nextTick();
  },
  reset: () => form.value.resetFields(),
  sanitizeHtml,
};
void mount('gallery');
