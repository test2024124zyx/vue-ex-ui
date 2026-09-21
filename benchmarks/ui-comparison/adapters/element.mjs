import { h } from 'vue';
import { ElButton, ElCheckbox, ElConfigProvider, ElDialog, ElForm, ElFormItem, ElInput, ElSelectV2, ElTable, ElTableColumn, ElTableV2, ElTag } from 'element-plus';
import 'element-plus/es/components/button/style/css';
import 'element-plus/es/components/checkbox/style/css';
import 'element-plus/es/components/dialog/style/css';
import 'element-plus/es/components/form/style/css';
import 'element-plus/es/components/input/style/css';
import 'element-plus/es/components/select-v2/style/css';
import 'element-plus/es/components/table/style/css';
import 'element-plus/es/components/table-v2/style/css';
import 'element-plus/es/components/tag/style/css';
import { CONFIG } from '../workload.mjs';

// 普通表格与官方 Table V2 分开测量，V2 的功能差异记录在结果中。
const cache = new WeakMap();
export default {
  name: 'Element Plus',
  virtualSupported: true,
  provider: (_, children) => h(ElConfigProvider, {}, { default: children }),
  button: (text, onClick, attrs = {}) => h(ElButton, { onClick, ...attrs }, () => text),
  tag: text => h(ElTag, {}, () => text),
  checkbox: (modelValue, update) => h(ElCheckbox, { modelValue, 'onUpdate:modelValue': update, 'aria-label': '选择订单' }),
  input: (modelValue, update, attrs = {}) => h(ElInput, { modelValue, 'onUpdate:modelValue': update, ...attrs }),
  select: (modelValue, update, options) => h(ElSelectV2, { modelValue, 'onUpdate:modelValue': update, options, filterable: true, placeholder: '选择客户' }),
  table(data, columns, virtual) {
    if (virtual) {
      if (!cache.has(columns)) cache.set(columns, columns.map(column => ({ ...column, dataKey: column.key, cellRenderer: ({ rowData }) => column.render(rowData) })));
      return h(ElTableV2, { data, columns: cache.get(columns), rowKey: 'id', width: CONFIG.tableWidth,
        height: CONFIG.viewportHeight, rowHeight: CONFIG.rowHeight });
    }
    return h(ElTable, { data, rowKey: 'id', height: CONFIG.viewportHeight }, {
      default: () => columns.map(column => h(ElTableColumn, { key: column.key, prop: column.key, label: column.title, width: column.width }, {
        default: ({ row }) => column.render(row),
      })),
    });
  },
  modal: (modelValue, update, children) => h(ElDialog, { modelValue, 'onUpdate:modelValue': update, title: '编辑订单资料', width: 960,
    destroyOnClose: true, appendToBody: true }, { default: children }),
  form: (ref, model, rules, children) => h(ElForm, { ref, model, rules, labelPosition: 'top', scrollToError: false }, { default: children }),
  formItem: (prop, label, children) => h(ElFormItem, { key: prop, prop, label }, { default: children }),
  async validate(form) { try { await form.validate(); return true; } catch { return false; } },
};
