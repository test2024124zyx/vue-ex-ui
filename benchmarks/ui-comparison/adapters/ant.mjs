import { h } from 'vue';
import { Button, Checkbox, ConfigProvider, Form, Input, Modal, Select, Table, Tag } from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import { CONFIG } from '../workload.mjs';

// 当前 Ant Design Vue Table 没有与另外三方相同的原生虚拟表格接口。
const cache = new WeakMap();
export default {
  name: 'Ant Design Vue',
  virtualSupported: false,
  provider: (_, children) => h(ConfigProvider, {}, { default: children }),
  button: (text, onClick, attrs = {}) => h(Button, { onClick, ...attrs }, () => text),
  tag: text => h(Tag, {}, () => text),
  checkbox: (checked, update) => h(Checkbox, { checked, 'onUpdate:checked': update, 'aria-label': '选择订单' }),
  input: (value, update, attrs = {}) => h(Input, { value, 'onUpdate:value': update, ...attrs }),
  select: (value, update, options) => h(Select, { value, 'onUpdate:value': update, options, showSearch: true, virtual: true,
    optionFilterProp: 'label', placeholder: '选择客户', style: { width: '100%' } }),
  table(data, columns, virtual) {
    if (virtual) throw new Error('当前发行版不支持本基准要求的原生虚拟表格');
    if (!cache.has(columns)) cache.set(columns, columns.map(column => ({ ...column, dataIndex: column.key,
      customRender: ({ record }) => column.render(record) })));
    return h(Table, { dataSource: data, columns: cache.get(columns), rowKey: 'id', pagination: false, scroll: { y: CONFIG.viewportHeight } });
  },
  modal: (open, update, children) => h(Modal, { open, 'onUpdate:open': update, onCancel: () => update(false), title: '编辑订单资料',
    width: 960, destroyOnClose: true, footer: null, bodyStyle: { maxHeight: '650px', overflow: 'auto' } }, { default: children }),
  form: (ref, model, rules, children) => h(Form, { ref, model, rules, layout: 'vertical', scrollToFirstError: false }, { default: children }),
  formItem: (name, label, children) => h(Form.Item, { key: name, name, label }, { default: children }),
  async validate(form) { try { await form.validate(); return true; } catch { return false; } },
};
