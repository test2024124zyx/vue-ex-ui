import { h, ref, reactive, nextTick } from 'vue';
import { ExTree } from '../../../dist/es/components/tree/index.js';
import { ExModal } from '../../../dist/es/components/modal/index.js';
import { ExForm, ExFormItem } from '../../../dist/es/components/form/index.js';
import { ExInput } from '../../../dist/es/components/input/index.js';
import { ExButton } from '../../../dist/es/components/button/index.js';

export const WORKFLOW_SCALES = { branches: 100, leaves: 100, fields: 100, height: 480 };
const button = (text, action, id) => h(ExButton, { onClick: action, 'data-action': id }, () => text);

export function virtualTree() {
  const data = [{ key: 'root', label: '组织根节点', children: Array.from({ length: WORKFLOW_SCALES.branches }, (_, branch) => ({
    key: `branch-${branch}`, label: `部门 ${branch}`, children: Array.from({ length: WORKFLOW_SCALES.leaves }, (_, index) => {
      const id = branch * WORKFLOW_SCALES.leaves + index;
      return { key: `leaf-${id}`, label: `成员 ${String(id).padStart(5, '0')}` };
    }),
  })) }];
  const tree = ref();
  const checked = ref([]);
  const selected = ref([]);
  const expanded = ref(['root']);
  return {
    state: () => ({ checked: [...checked.value], selected: [...selected.value], expanded: [...expanded.value],
      halfChecked: tree.value?.getHalfCheckedNodes().map(node => node.key) || [] }),
    actions: {
      expand: () => tree.value.requestExpandAll(),
      collapse: () => tree.value.requestCollapseAll(),
      checkRoot: () => tree.value.requestNodeCheck('root', true),
      uncheckLast: () => tree.value.requestNodeCheck('leaf-9999', false),
      clearCheck: () => tree.value.requestNodeCheck('root', false),
      filterLast: () => tree.value.filter('09999'),
      clearFilter: () => tree.value.filter(''),
      selectLast: () => tree.value.requestNodeSelection('leaf-9999', true),
    },
    render: () => h(ExTree, { ref: tree, data, checkable: true, virtual: true, height: WORKFLOW_SCALES.height,
      checkedKeys: checked.value, 'onUpdate:checkedKeys': value => { checked.value = value; },
      selectedKeys: selected.value, 'onUpdate:selectedKeys': value => { selected.value = value; },
      expandedKeys: expanded.value, 'onUpdate:expandedKeys': value => { expanded.value = value; },
      filterNodeMethod: (query, node) => node.label.includes(query) }),
  };
}

export function formWorkflow() {
  const form = ref();
  const opened = ref(false);
  const inner = ref(false);
  const model = reactive(Object.fromEntries(Array.from({ length: WORKFLOW_SCALES.fields }, (_, index) => [`field${index}`, ''])));
  const rules = Object.fromEntries(Object.keys(model).map(key => [key, { required: true, message: '必填字段', trigger: 'blur' }]));
  rules.field0 = [{ required: true, message: '必填字段', trigger: 'blur' }, {
    async validator(_rule, value) {
      await new Promise(resolve => setTimeout(resolve, value === 'bad' ? 60 : 5));
      if (value === 'bad') throw new Error('旧校验失败');
    },
  }];
  const lastResult = ref(null);
  const raceResult = ref(null);
  const actions = {
    open: () => { opened.value = true; },
    close: () => { opened.value = false; },
    openInner: () => { inner.value = true; },
    closeInner: () => { inner.value = false; },
    fill: () => { for (const key of Object.keys(model)) model[key] = '完整业务资料'; },
    validate: async () => { lastResult.value = await form.value.validate(); },
    async race() {
      model.field0 = 'bad';
      await nextTick();
      const outdated = form.value.validate();
      model.field0 = 'good';
      await nextTick();
      const current = form.value.validate();
      const [oldResult, newResult] = await Promise.all([outdated, current]);
      raceResult.value = { oldOutOfDate: oldResult.outOfDate, currentValid: newResult.valid };
    },
  };
  return {
    actions,
    state: () => ({ opened: opened.value, inner: inner.value, lastResult: lastResult.value, raceResult: raceResult.value,
      bodyOverflow: document.body.style.overflow, focusedId: document.activeElement?.id }),
    render: () => h('section', [
      h(ExButton, { id: 'workflow-trigger', onClick: actions.open }, () => '打开业务表单'),
      h(ExModal, { modelValue: opened.value, 'onUpdate:modelValue': value => { opened.value = value; },
        title: '百字段业务表单', width: 1000, destroyOnClose: true, showFooter: false, bodyStyle: { maxHeight: '650px', overflow: 'auto' } }, {
        default: () => [h(ExForm, { ref: form, model, rules, scrollToError: false, focusToError: false }, {
          default: () => [h('div', { class: 'form-grid' }, Object.keys(model).map(key => h(ExFormItem, { prop: key, key, label: key }, {
            default: () => h(ExInput, { modelValue: model[key], 'onUpdate:modelValue': value => { model[key] = value; } }),
          }))), button('提交校验', actions.validate, 'validate'),
          h(ExButton, { id: 'inner-trigger', onClick: actions.openInner }, () => '打开子弹窗')],
        }), h(ExModal, { modelValue: inner.value, 'onUpdate:modelValue': value => { inner.value = value; },
          title: '子弹窗', destroyOnClose: true, showFooter: false }, {
          default: () => [h('input', { id: 'inner-input', 'aria-label': '子弹窗字段' }), button('关闭子弹窗', actions.closeInner, 'close-inner')],
        })],
      }),
    ]),
  };
}
