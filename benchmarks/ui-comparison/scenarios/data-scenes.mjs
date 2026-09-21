import { h, reactive, ref, shallowRef } from 'vue';
import { ExCheckbox } from '../../../dist/es/components/checkbox/index.js';
import { ExRadio } from '../../../dist/es/components/radio/index.js';
import { ExSwitch } from '../../../dist/es/components/switch/index.js';
import { ExTable } from '../../../dist/es/components/table/index.js';
import { ExSelect } from '../../../dist/es/components/select/index.js';

// 扩展场景的规模单独声明，避免改变上一轮四方基准的固定工作负载。
export const DATA_SCALES = { controls: 1500, table: 50000, groups: 100, groupSize: 100, height: 480, rowHeight: 48 };

export function denseControls() {
  const data = reactive(Array.from({ length: DATA_SCALES.controls }, (_, id) => ({ id, checked: false, on: false })));
  const selected = ref(-1);
  return {
    state: () => ({ selected: selected.value, checks: data.filter(row => row.checked).length, switches: data.filter(row => row.on).length }),
    actions: {
      toggleAll: () => { for (const row of data) { row.checked = !row.checked; row.on = !row.on; } },
    },
    render: () => h('section', { class: 'scroll-box', 'data-scroll': '' }, data.map(row => h('div', {
      key: row.id, class: 'control-row', 'data-row': row.id,
    }, [
      h('span', `配置 ${row.id}`),
      h(ExCheckbox, { modelValue: row.checked, 'onUpdate:modelValue': value => { row.checked = value; }, 'aria-label': `勾选 ${row.id}` }),
      h(ExRadio, { modelValue: selected.value, value: row.id, name: 'dense', 'onUpdate:modelValue': value => { selected.value = value; }, label: `选项 ${row.id}` }),
      h(ExSwitch, { modelValue: row.on, 'onUpdate:modelValue': value => { row.on = value; }, ariaLabel: `开关 ${row.id}` }),
    ]))),
  };
}

export function virtualTable() {
  const data = ref(Array.from({ length: DATA_SCALES.table }, (_, id) => ({
    id, name: `订单 ${String(id).padStart(5, '0')}`, amount: id + 100, count: id % 5,
  })));
  const original = data.value;
  const selected = ref([]);
  const suffix = ref('元');
  let renderCalls = 0;
  const columns = reactive([
    { key: 'id', title: '编号', width: 100, fixed: 'left' },
    { key: 'business', title: '业务数据', children: [
      { key: 'name', title: '订单', width: 300 },
      { key: 'amount', title: '金额', width: 200, ellipsis: true, render: value => { renderCalls++; return `${value}${suffix.value}`; } },
      { key: 'count', title: '数量', width: 100 },
    ] },
  ]);
  return {
    state: () => ({ total: data.value.length, renderCalls, selected: [...selected.value], first: data.value[0]?.id }),
    actions: {
      resetCalls: () => { renderCalls = 0; },
      updateFirst: () => { data.value[0].amount += 1; },
      updateOffscreen: () => { data.value.at(-1).amount += 1; },
      reverse: () => { data.value.reverse(); },
      shrink: () => { data.value = original.slice(0, 2); },
      restore: () => { data.value = original; },
      changeSuffix: () => { suffix.value = '分'; },
      resizeColumn: () => { columns[0].width = 180; },
    },
    render: () => h(ExTable, { data: data.value, columns, rowKey: 'id', selectable: true,
      selectedRowKeys: selected.value, 'onUpdate:selectedRowKeys': value => { selected.value = value; },
      virtual: true, virtualHeight: DATA_SCALES.height, rowHeight: DATA_SCALES.rowHeight }),
  };
}

export function groupedSelect() {
  const groups = Array.from({ length: DATA_SCALES.groups }, (_, group) => ({ key: group, label: `分组 ${group}`,
    options: Array.from({ length: DATA_SCALES.groupSize }, (_, item) => {
      const value = group * DATA_SCALES.groupSize + item;
      return { value, label: `候选 ${String(value).padStart(5, '0')}` };
    }),
  }));
  const options = shallowRef(groups);
  const selected = ref([]);
  const remote = ref(false);
  const collapse = ref(true);
  const selectRef = ref();
  return {
    state: () => ({ selected: [...selected.value], remote: remote.value, collapsed: collapse.value }),
    actions: {
      open: () => selectRef.value.showDropdown(),
      close: () => selectRef.value.hideDropdown(),
      selectMany: () => { selected.value = Array.from({ length: 1000 }, (_, index) => index); },
      expandTags: () => { collapse.value = false; },
      clear: () => { selected.value = []; },
      remoteFirst: () => { remote.value = true; options.value = groups[0].options; selected.value = [1, 2]; },
      remoteNext: () => { options.value = groups[1].options; },
      rename: () => { options.value = groups.map(group => ({ ...group, options: group.options.map(option => ({ ...option, label: `更新 ${option.value}` })) })); },
    },
    render: () => h(ExSelect, { ref: selectRef, style: { width: '600px' }, modelValue: selected.value,
      'onUpdate:modelValue': value => { selected.value = value; }, options: options.value, multiple: true,
      searchable: true, virtual: true, remote: remote.value, collapseTags: collapse.value, remoteDebounce: 0 }),
  };
}
