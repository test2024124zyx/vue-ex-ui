import { h } from 'vue';
import {
  NButton,
  NCheckbox,
  NConfigProvider,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSelect,
  NTag,
} from 'naive-ui';
import { CONFIG } from '../workload.mjs';

// Naive UI 使用自身的运行时样式注入，相关成本包含在页面指标中。
const cache = new WeakMap();
export default {
  name: 'Naive UI',
  virtualSupported: true,
  provider: (_, children) => h(NConfigProvider, {}, { default: children }),
  button: (text, onClick, attrs = {}) => h(NButton, { onClick, ...attrs }, () => text),
  tag: text => h(NTag, {}, () => text),
  checkbox: (checked, update) =>
    h(NCheckbox, { checked, 'onUpdate:checked': update, 'aria-label': '选择订单' }),
  input: (value, update, attrs = {}) => h(NInput, { value, 'onUpdate:value': update, ...attrs }),
  select: (value, update, options) =>
    h(NSelect, {
      value,
      'onUpdate:value': update,
      options,
      filterable: true,
      virtualScroll: true,
      placeholder: '选择客户',
    }),
  table(data, columns, virtual) {
    if (!cache.has(columns))
      cache.set(
        columns,
        columns.map(column => ({ ...column }))
      );
    return h(NDataTable, {
      data,
      columns: cache.get(columns),
      rowKey: row => row.id,
      maxHeight: CONFIG.viewportHeight,
      virtualScroll: virtual,
      minRowHeight: CONFIG.rowHeight,
      pagination: false,
    });
  },
  modal: (show, update, children) =>
    h(
      NModal,
      {
        show,
        'onUpdate:show': update,
        title: '编辑订单资料',
        preset: 'card',
        style: { width: '960px' },
        contentStyle: { maxHeight: '650px', overflow: 'auto' },
        displayDirective: 'if',
      },
      { default: children }
    ),
  form: (ref, model, rules, children) =>
    h(NForm, { ref, model, rules, labelPlacement: 'top' }, { default: children }),
  formItem: (path, label, children) =>
    h(NFormItem, { key: path, path, label }, { default: children }),
  async validate(form) {
    try {
      await form.validate();
      return true;
    } catch {
      return false;
    }
  },
};
