import { h } from 'vue';
import { ExButton } from '../../../dist/es/components/button/index.js';
import { ExCheckbox } from '../../../dist/es/components/checkbox/index.js';
import { ExConfigProvider } from '../../../dist/es/components/config-provider/index.js';
import { ExForm, ExFormItem } from '../../../dist/es/components/form/index.js';
import { ExInput } from '../../../dist/es/components/input/index.js';
import { ExModal } from '../../../dist/es/components/modal/index.js';
import { ExSelect } from '../../../dist/es/components/select/index.js';
import { ExTable } from '../../../dist/es/components/table/index.js';
import { ExTag } from '../../../dist/es/components/tag/index.js';
import '../../../dist/es/assets/style-base.css';
import { CONFIG } from '../workload.mjs';

// 列定义保持稳定，避免基准自身制造额外的列重建开销。
const cache = new WeakMap();
// 模式显式进入基准 URL；默认测量继续沿用可变数据兼容路径。
const immutable = new URLSearchParams(location.search).get('immutable') === '1';
export default {
  name: 'Ex UI',
  virtualSupported: true,
  provider: (theme, children) =>
    h(ExConfigProvider, { theme, locale: 'zh-CN' }, { default: children }),
  button: (text, onClick, attrs = {}) => h(ExButton, { onClick, ...attrs }, () => text),
  tag: text => h(ExTag, {}, () => text),
  checkbox: (modelValue, update) =>
    h(ExCheckbox, { modelValue, 'onUpdate:modelValue': update, 'aria-label': '选择订单' }),
  input: (modelValue, update, attrs = {}) =>
    h(ExInput, { modelValue, 'onUpdate:modelValue': update, ...attrs }),
  select: (modelValue, update, options) =>
    h(ExSelect, {
      modelValue,
      'onUpdate:modelValue': update,
      options,
      searchable: true,
      virtual: true,
      placeholder: '选择客户',
    }),
  table(data, columns, virtual) {
    if (!cache.has(columns))
      cache.set(
        columns,
        columns.map(column => ({ ...column, render: (_, row) => column.render(row) }))
      );
    return h(ExTable, {
      data,
      columns: cache.get(columns),
      rowKey: 'id',
      maxHeight: CONFIG.viewportHeight,
      virtual,
      immutable,
      virtualHeight: CONFIG.viewportHeight,
      rowHeight: CONFIG.rowHeight,
    });
  },
  modal: (modelValue, update, children) =>
    h(
      ExModal,
      {
        modelValue,
        'onUpdate:modelValue': update,
        title: '编辑订单资料',
        width: 960,
        destroyOnClose: true,
        showFooter: false,
        bodyStyle: { maxHeight: '650px', overflow: 'auto' },
      },
      { default: children }
    ),
  form: (ref, model, rules, children) =>
    h(
      ExForm,
      { ref, model, rules, layout: 'vertical', scrollToError: false, focusToError: false },
      { default: children }
    ),
  formItem: (prop, label, children) =>
    h(ExFormItem, { key: prop, prop, label }, { default: children }),
  validate: async form => (await form.validate()).valid,
};
