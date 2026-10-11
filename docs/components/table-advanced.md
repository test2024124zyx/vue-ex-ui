# Table 高级能力

[基础表格与原有 API](./table)继续兼容。以下能力均按需启用，数据和列配置始终由父级持有。

<script setup>
import { ref } from 'vue'

const projectColumns = [
  { key: 'name', title: '项目与任务', width: 260, sortable: true },
  { key: 'owner', title: '负责人', width: 140 },
  { key: 'status', title: '状态', width: 140 },
]
const projects = [
  { key: 'design', name: '设计系统', owner: '林晓', status: '进行中', description: '统一设计令牌、组件状态与辅助语义。', children: [
    { key: 'tokens', name: '主题令牌', owner: '林晓', status: '已完成', description: '深浅主题均已核验。' },
    { key: 'a11y', name: '键盘交互', owner: '陈宇', status: '进行中', description: '覆盖展开、排序、编辑与列调整。' },
  ] },
  { key: 'delivery', name: '交付准备', owner: '赵宁', status: '待开始', description: '验证包入口、类型与按需加载。', children: [
    { key: 'package', name: '包消费验证', owner: '赵宁', status: '待开始', description: '使用独立消费项目验证发布产物。' },
  ] },
  { key: 'release', name: '发布回归', owner: '陈宇', status: '待开始', description: '执行支持的浏览器和响应式回归。' },
]
const expanded = ref(['design'])
const details = ref([])
const selected = ref([])

const memberColumns = [
  { key: 'name', title: '成员', width: 180, fixed: 'left', editable: true, resizable: true },
  { key: 'profile', title: '资料', children: [
    { key: 'age', title: '年龄', width: 140, editable: true, editor: 'number', sortable: true },
    { key: 'role', title: '职责', width: 200, editable: true, editor: 'select', editorOptions: [
      { label: '设计', value: '设计' }, { label: '开发', value: '开发' }, { label: '测试', value: '测试' },
    ] },
  ] },
]
const members = ref([
  { key: 'lin', name: '林晓', age: 28, role: '设计' },
  { key: 'chen', name: '陈宇', age: 30, role: '开发' },
  { key: 'zhao', name: '赵宁', age: 26, role: '测试' },
])
function validateMember(draft) {
  const errors = {}
  if (!String(draft.name ?? '').trim()) errors.name = '请输入成员姓名'
  if (!Number.isFinite(draft.age) || draft.age < 18 || draft.age > 100) errors.age = '年龄需在 18 至 100 之间'
  return errors
}

const cardLayout = ref(false)
const mergedColumns = [
  { key: 'batch', title: '批次', width: 160 },
  { key: 'name', title: '交付项', width: 240 },
  { key: 'status', title: '状态', width: 160 },
]
const batchSize = 3
const batchCount = 30
const mergedRows = Array.from({ length: batchSize * batchCount }, (_, index) => ({
  key: index, batch: `批次 ${Math.floor(index / batchSize) + 1}`, name: `交付项 ${index + 1}`, status: index % 2 ? '已完成' : '进行中',
}))
function mergeBatch({ rowIndex, columnIndex }) {
  if (columnIndex === 0 && rowIndex % batchSize === 0) return [batchSize, 1]
}
</script>

## 树形、详情和分页

`tree` 显式开启树形记录。`expandedRowKeys` 管理树节点，`detailExpandedRowKeys` 管理详情，两者可以同时使用。树表的分页总数按根记录计，展开后代与父节点在同一页。

::: raw
<div class="vp-raw demo-container">
  <ExTable v-model:expanded-row-keys="expanded" v-model:detail-expanded-row-keys="details" v-model:selected-row-keys="selected" :columns="projectColumns" :data="projects" tree selectable :pagination="{ pageSize: 2, showTotal: true }">
    <template #expanded-row="{ record }"><p class="detail-copy">{{ record.description }}</p></template>
  </ExTable>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const expanded = ref(['design']);
const details = ref([]);
const selected = ref([]);
const projectColumns = [
  { key: 'name', title: '项目与任务', width: 260, sortable: true },
  { key: 'owner', title: '负责人', width: 140 },
  { key: 'status', title: '状态', width: 140 },
];
const projects = [
  {
    key: 'design',
    name: '设计系统',
    owner: '林晓',
    status: '进行中',
    description: '统一设计令牌、组件状态与辅助语义。',
    children: [
      {
        key: 'tokens',
        name: '主题令牌',
        owner: '林晓',
        status: '已完成',
        description: '深浅主题均已核验。',
      },
      {
        key: 'a11y',
        name: '键盘交互',
        owner: '陈宇',
        status: '进行中',
        description: '覆盖展开、排序、编辑与列调整。',
      },
    ],
  },
  {
    key: 'delivery',
    name: '交付准备',
    owner: '赵宁',
    status: '待开始',
    description: '验证包入口、类型与按需加载。',
    children: [
      {
        key: 'package',
        name: '包消费验证',
        owner: '赵宁',
        status: '待开始',
        description: '使用独立消费项目验证发布产物。',
      },
    ],
  },
  {
    key: 'release',
    name: '发布回归',
    owner: '陈宇',
    status: '待开始',
    description: '执行支持的浏览器和响应式回归。',
  },
];
</script>

<template>
  <ExTable
    v-model:expanded-row-keys="expanded"
    v-model:detail-expanded-row-keys="details"
    v-model:selected-row-keys="selected"
    :columns="projectColumns"
    :data="projects"
    tree
    selectable
    :pagination="{ pageSize: 2, showTotal: true }"
  >
    <template #expanded-row="{ record }">
      <p class="detail-copy">{{ record.description }}</p>
    </template>
  </ExTable>
</template>
```

:::

本地排序只在同级记录之间执行；过滤命中子记录时保留通向它的祖先。全选作用于当前页展开后可见的可选数据行，保留其他页面已有的选中键，不执行父子级联。

## 行级草稿、保存和列调整

点击编辑后，组件创建独立行草稿。取消和 Escape 丢弃草稿；保存先执行 `validateEdit`，再执行可选的 `saveEdit`。成功后发送 `update:data` 请求父级回写。示例使用 `v-model:data` 接收结果，原对象不会被组件直接改写。

表头两侧按钮及拖拽手柄调整同组、同固定区域内的列顺序。列宽分隔线支持指针拖动、方向键、Home 和 End；Escape 取消正在进行的指针调整。

::: raw
<div class="vp-raw demo-container">
  <ExTable v-model:data="members" :columns="memberColumns" editable resizable-columns reorderable-columns :validate-edit="validateMember" bordered />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const memberColumns = [
  { key: 'name', title: '成员', width: 180, fixed: 'left', editable: true, resizable: true },
  {
    key: 'profile',
    title: '资料',
    children: [
      { key: 'age', title: '年龄', width: 140, editable: true, editor: 'number', sortable: true },
      {
        key: 'role',
        title: '职责',
        width: 200,
        editable: true,
        editor: 'select',
        editorOptions: [
          { label: '设计', value: '设计' },
          { label: '开发', value: '开发' },
          { label: '测试', value: '测试' },
        ],
      },
    ],
  },
];
const members = ref([
  { key: 'lin', name: '林晓', age: 28, role: '设计' },
  { key: 'chen', name: '陈宇', age: 30, role: '开发' },
  { key: 'zhao', name: '赵宁', age: 26, role: '测试' },
]);
function validateMember(draft) {
  const errors = {};
  if (!String(draft.name ?? '').trim()) errors.name = '请输入成员姓名';
  if (!Number.isFinite(draft.age) || draft.age < 18 || draft.age > 100)
    errors.age = '年龄需在 18 至 100 之间';
  return errors;
}
</script>

<template>
  <ExTable
    v-model:data="members"
    :columns="memberColumns"
    editable
    resizable-columns
    reorderable-columns
    :validate-edit="validateMember"
    bordered
  />
</template>
```

:::

`validateEdit(draft, context)` 返回字段名到错误消息的对象，`$row` 表示整行错误。`saveEdit(draft, context)` 可返回服务端规范化记录。两者都收到 `context.signal`；取消、删除记录和卸载会使当前事务失效。保存过程中不重复提交，旧事务的迟到结果不会覆盖后来的编辑。

编辑期间父级替换或删除记录，会取消该行的旧编辑事务；父级原地修改同一记录时，组件拒绝旧草稿提交、报告冲突并保留草稿供检查，不会覆盖新的业务数据。原地修改冲突发生后应取消当前编辑，再基于最新记录重新编辑；校验或持久化失败时也保留草稿和错误信息。

自定义控件使用 `edit-{key}` 插槽，参数为 `{ record, index, column, draft, value, update, errors, saving }`。通过 `update(value)` 更新该字段，不应直接改写 `record`。未配置 `column.editable` 的列不可编辑。

## 合并单元格与虚拟滚动

`spanMethod` 接收当前逻辑数据行和叶列的位置，返回 `[rowspan, colspan]` 或 `{ rowspan, colspan }`。覆盖格自动省略，无需再次返回 `[0, 0]`。跨虚拟窗口的区域会完整渲染锚点及覆盖行，虚拟滚动仍保持启用。

::: raw
<div class="vp-raw demo-container">
  <div class="demo-toolbar"><ExSwitch v-model="cardLayout" aria-label="卡片完整字段视图" /><span>卡片完整字段视图</span></div>
  <ExTable :columns="mergedColumns" :data="mergedRows" :span-method="mergeBatch" :layout="cardLayout ? 'card' : 'table'" virtual :row-height="48" :virtual-height="288" :virtual-buffer="2" bordered />
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const cardLayout = ref(false);
const mergedColumns = [
  { key: 'batch', title: '批次', width: 160 },
  { key: 'name', title: '交付项', width: 240 },
  { key: 'status', title: '状态', width: 160 },
];
const batchSize = 3;
const batchCount = 30;
const mergedRows = Array.from({ length: batchSize * batchCount }, (_, index) => ({
  key: index,
  batch: `批次 ${Math.floor(index / batchSize) + 1}`,
  name: `交付项 ${index + 1}`,
  status: index % 2 ? '已完成' : '进行中',
}));
function mergeBatch({ rowIndex, columnIndex }) {
  if (columnIndex === 0 && rowIndex % batchSize === 0) return [batchSize, 1];
}
</script>

<template>
  <div class="demo-toolbar">
    <ExSwitch
      v-model="cardLayout"
      aria-label="卡片完整字段视图"
    />
    <span>卡片完整字段视图</span>
  </div>
  <ExTable
    :columns="mergedColumns"
    :data="mergedRows"
    :span-method="mergeBatch"
    :layout="cardLayout ? 'card' : 'table'"
    virtual
    :row-height="48"
    :virtual-height="288"
    :virtual-buffer="2"
    bordered
  />
</template>
```

:::

跨度必须为正整数，不能超出当前页、覆盖已有跨度、跨越左固定/普通/右固定列分区，也不能跨越已展开的详情行。无效请求恢复为普通单元格并发出 `span-error`，消息包含位置和原因。排序、过滤、分页或列重排后会重新计算跨度，业务回调应基于当前 `record` 和显示顺序判断分组。

合并区域中的任意行开始编辑时，该区域暂时恢复普通单元格，并通过 `editing-boundary` 原因通知；这样所有待编辑字段都能访问。退出编辑后，组件重新应用合并规则。

## 受控状态与组合规则

- 展开键、详情键、列宽、列顺序显式传入后，仅发送更新请求，显示父级确认后的值。`default*` 仅用于初始化非受控状态。
- `pagination.current` 与 `pagination.pageSize` 分别受控；未提供的字段使用内部状态。`pagination-change` 和 `update:pagination` 返回 `{ current, pageSize, total }`。
- 本地分页在过滤与同级排序后切根记录。远程分页传 `remote-pagination` 和服务端 `total`，组件不再切分传入数据；排序是否远程由原有 `remote-sort` 独立控制。
- 普通虚拟数据行继续使用固定 `row-height`。详情行自动测量；编辑表格和卡片布局自动测量数据行高度。展开、收起、缩短数据和尺寸变化均重算窗口，保留有效滚动位置。
- 合并仅用于 `layout="table"`。`layout="card"` 始终为每条记录展示完整字段，不执行 `spanMethod`；虚拟滚动继续启用并测量卡片高度。切回表格布局后重新应用合并规则。
- 树记录、可编辑记录应提供稳定、唯一的 `row-key`，跨页状态依赖该键。无业务键的普通平面数据继续使用原始索引兼容旧行为。
- `immutable` 仍为显式选择：父级更新字段应替换记录。编辑成功返回新数组、目标记录及受影响的祖先链，其余记录引用保持不变。
- 列重排只在同一表头分组和固定列区域内发生。叶列不会被移出原有分组，也不会改变固定方向。

## 新增 API

### 表格属性

| 属性                                      | 类型                                                            | 默认值 / 说明                           |
| ----------------------------------------- | --------------------------------------------------------------- | --------------------------------------- |
| `tree`                                    | `boolean`                                                       | `false`，启用树形记录                   |
| `children-key`                            | `string`                                                        | `'children'`                            |
| `tree-indent`                             | `number`                                                        | `20`，层级缩进像素                      |
| `expanded-row-keys`                       | `(string \| number)[]`                                          | 受控树展开状态                          |
| `default-expanded-row-keys`               | `(string \| number)[]`                                          | 初始树展开键                            |
| `default-expand-all-rows`                 | `boolean`                                                       | 初始化展开现有树节点                    |
| `detail-expanded-row-keys`                | `(string \| number)[]`                                          | 受控详情展开状态                        |
| `default-detail-expanded-row-keys`        | `(string \| number)[]`                                          | 初始详情展开键                          |
| `row-expandable`                          | `(record, sourceIndex) => boolean`                              | 限制详情展开                            |
| `expanded-row-height`                     | `number`                                                        | `120`，详情实测前的估计高度             |
| `pagination`                              | `false \| TablePaginationConfig`                                | 不传时关闭；支持 Pagination 的显示配置  |
| `remote-pagination`                       | `boolean`                                                       | `false`                                 |
| `span-method`                             | `(context) => [number, number] \| TableCellSpan \| undefined`   | 当前显示顺序的跨度                      |
| `editable`                                | `boolean`                                                       | `false`，开启行操作列                   |
| `is-row-editable`                         | `(record, sourceIndex) => boolean`                              | 限制可编辑记录                          |
| `validate-edit`                           | `(draft, context) => errors \| Promise<errors>`                 | 字段校验，空对象表示通过                |
| `save-edit`                               | `(draft, context) => record \| void \| Promise<record \| void>` | 异步持久化                              |
| `resizable-columns`                       | `boolean`                                                       | `false`，允许调整叶列宽度               |
| `reorderable-columns`                     | `boolean`                                                       | `false`，允许调整叶列顺序               |
| `column-widths` / `default-column-widths` | `Record<string, number>`                                        | 受控宽度 / 初始宽度，单位像素           |
| `column-order` / `default-column-order`   | `string[]`                                                      | 受控顺序 / 初始顺序                     |
| `immutable`                               | `boolean`                                                       | `false`，启用按不可变记录缓存格式化结果 |

### 列属性

| 属性                        | 类型                                            | 说明                                      |
| --------------------------- | ----------------------------------------------- | ----------------------------------------- |
| `editable`                  | `boolean \| ((record, sourceIndex) => boolean)` | 该列是否可编辑                            |
| `editor`                    | `'text' \| 'number' \| 'checkbox' \| 'select'`  | 内置编辑器，默认文本                      |
| `editorOptions`             | `SelectOptions`                                 | 下拉编辑器选项                            |
| `resizable` / `reorderable` | `boolean`                                       | 覆盖表级列交互开关                        |
| `maxWidth`                  | `number`                                        | 最大调整宽度；`minWidth` 继续作为最小宽度 |
| `sorter`                    | `(a, b) => number`                              | 比较完整记录；远程排序时不执行            |

### 事件、插槽与方法

| 名称                                                    | 参数 / 行为                                                       |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| `update:expandedRowKeys` / `expand-change`              | `keys` / `(keys, record, expanded)`                               |
| `update:detailExpandedRowKeys` / `detail-expand-change` | `keys` / `(keys, record, expanded)`                               |
| `update:pagination` / `pagination-change`               | `{ current, pageSize, total }`                                    |
| `span-error`                                            | `TableSpanError[]`，位置及非法跨度原因                            |
| `update:data`                                           | 保存成功后请求父级接收的新数组                                    |
| `edit-start` / `edit-cancel`                            | `(key, record)` / `key`                                           |
| `edit-save` / `edit-error`                              | `{ key, record, original }` / `(error, key)`                      |
| `update:columnWidths` / `column-resize`                 | `widths` / `(columnKey, width)`                                   |
| `update:columnOrder` / `column-order-change`            | `keys`                                                            |
| 插槽 `expanded-row`                                     | `{ record, index }`                                               |
| 插槽 `edit-{key}`                                       | `{ record, index, column, draft, value, update, errors, saving }` |
| `toggleRowExpansion(record, expanded?)`                 | 请求树展开 / 收起                                                 |
| `toggleDetailExpansion(record, expanded?)`              | 请求详情展开 / 收起                                               |
| `startRowEdit(record, sourceIndex?)`                    | 开始行编辑，返回是否成功                                          |
| `setEditValue(record, sourceIndex, column, value)`      | 更新草稿字段，返回是否成功                                        |
| `saveRowEdit(record, sourceIndex?)`                     | 返回 `Promise<boolean>`                                           |
| `cancelRowEdit(record, sourceIndex?)`                   | 丢弃草稿并中止当前事务                                            |
| `getEditState(record, sourceIndex?)`                    | 获取草稿、错误和保存状态                                          |
| `resizeColumn(key, width)`                              | 请求列宽变更，返回是否成功                                        |
| `moveColumn(key, target, 'before' \| 'after')`          | 请求同组、同固定区域内重排                                        |
| `moveColumnByOffset(key, -1 \| 1)`                      | 请求与相邻列交换位置                                              |
| `cancelResize()`                                        | 取消当前指针调整                                                  |

<style scoped>
.demo-container {
  margin-block: var(--ex-spacing-4);
  padding: var(--ex-spacing-4);
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}
.detail-copy { margin: 0; color: var(--ex-color-text-secondary); }
.demo-toolbar {
  display: flex;
  align-items: center;
  gap: var(--ex-spacing-3);
  margin-bottom: var(--ex-spacing-4);
}
</style>
