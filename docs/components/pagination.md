# Pagination 分页

当数据量过多时，使用分页分解数据。

<script setup>
import { ref } from 'vue'

const current1 = ref(1)
const current2 = ref(1)
const current3 = ref(1)
const current4 = ref(1)
const current5 = ref(1)
const current6 = ref(1)
const pageSize = ref(10)

const handleChange = (page, pageSize) => {
  console.log('Page changed:', page, pageSize)
}
</script>

## 基础用法

基础的分页用法。

<div class="demo-container">
  <ExPagination
    v-model:current="current1"
    :total="100"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const current = ref(1);
</script>

<template>
  <ExPagination v-model:current="current" :total="100" />
</template>
```

## 更多页码

当页数较多时，会自动折叠显示。

<div class="demo-container">
  <ExPagination
    v-model:current="current2"
    :total="500"
    :page-size="10"
  />
</div>

```vue
<template>
  <ExPagination v-model:current="current" :total="500" :page-size="10" />
</template>
```

## 改变每页显示条数

可以改变每页显示的条数。

<div class="demo-container">
  <ExPagination
    v-model:current="current3"
    v-model:page-size="pageSize"
    :total="500"
    show-size-changer
    :page-size-options="[10, 20, 30, 50, 100]"
    @change="handleChange"
  />
</div>

```vue
<script setup>
import { ref } from 'vue';

const current = ref(1);
const pageSize = ref(10);

const handleChange = (page, pageSize) => {
  console.log('Page changed:', page, pageSize);
};
</script>

<template>
  <ExPagination
    v-model:current="current"
    v-model:page-size="pageSize"
    :total="500"
    show-size-changer
    :page-size-options="[10, 20, 30, 50, 100]"
    @change="handleChange"
  />
</template>
```

## 快速跳转

可以快速跳转到指定页码。

<div class="demo-container">
  <ExPagination
    v-model:current="current4"
    :total="500"
    show-quick-jumper
  />
</div>

```vue
<template>
  <ExPagination v-model:current="current" :total="500" show-quick-jumper />
</template>
```

## 完整功能

包含所有功能的分页组件。

<div class="demo-container">
  <ExPagination
    v-model:current="current5"
    v-model:page-size="pageSize"
    :total="500"
    show-size-changer
    show-quick-jumper
    :page-size-options="[10, 20, 30, 50, 100]"
    @change="handleChange"
  />
</div>

```vue
<template>
  <ExPagination
    v-model:current="current"
    v-model:page-size="pageSize"
    :total="500"
    show-size-changer
    show-quick-jumper
    :page-size-options="[10, 20, 30, 50, 100]"
    @change="handleChange"
  />
</template>
```

## 简洁模式

简洁的分页模式，适合空间有限的场景。

<div class="demo-container">
  <ExPagination
    v-model:current="current6"
    :total="100"
    simple
  />
</div>

```vue
<template>
  <ExPagination v-model:current="current" :total="100" simple />
</template>
```

## 不同尺寸

提供三种尺寸的分页组件。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <ExPagination
    :current="1"
    :total="100"
    size="small"
  />
  <ExPagination
    :current="1"
    :total="100"
    size="medium"
  />
  <ExPagination
    :current="1"
    :total="100"
    size="large"
  />
</div>

```vue
<template>
  <ExPagination :current="1" :total="100" size="small" />

  <ExPagination :current="1" :total="100" size="medium" />

  <ExPagination :current="1" :total="100" size="large" />
</template>
```

## 对齐方式

可以设置分页组件的对齐方式。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <ExPagination
    :current="1"
    :total="100"
    align="left"
  />
  <ExPagination
    :current="1"
    :total="100"
    align="center"
  />
  <ExPagination
    :current="1"
    :total="100"
    align="right"
  />
</div>

```vue
<template>
  <ExPagination :current="1" :total="100" align="left" />

  <ExPagination :current="1" :total="100" align="center" />

  <ExPagination :current="1" :total="100" align="right" />
</template>
```

## 自定义总数显示

可以自定义总数的显示文本。

<div class="demo-container">
  <ExPagination
    :current="1"
    :total="500"
    :total-text="(total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条数据`"
  />
</div>

```vue
<template>
  <ExPagination
    :current="1"
    :total="500"
    :total-text="(total, range) => `显示 ${range[0]}-${range[1]} 条，共 ${total} 条数据`"
  />
</template>
```

## 禁用状态

禁用分页组件。

<div class="demo-container">
  <ExPagination
    :current="1"
    :total="100"
    disabled
  />
</div>

```vue
<template>
  <ExPagination :current="1" :total="100" disabled />
</template>
```

## 隐藏单页

当只有一页时，可以隐藏分页组件。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <p style="margin: 0 0 12px; color: var(--ex-color-text-secondary);">总数 5 条（单页，隐藏）：</p>
    <ExPagination
      :current="1"
      :total="5"
      :page-size="10"
      hide-on-single-page
    />
  </div>
  <div>
    <p style="margin: 0 0 12px; color: var(--ex-color-text-secondary);">总数 15 条（多页，显示）：</p>
    <ExPagination
      :current="1"
      :total="15"
      :page-size="10"
      hide-on-single-page
    />
  </div>
</div>

```vue
<template>
  <ExPagination :current="1" :total="5" :page-size="10" hide-on-single-page />
</template>
```

## 赛博朋克主题示例

展示赛博朋克风格的分页组件应用场景。

<div class="demo-container" style="background: linear-gradient(135deg, rgba(0, 240, 255, 0.05), rgba(255, 0, 127, 0.05)); padding: 32px;">
  <div style="margin-bottom: 24px;">
    <h3 style="margin: 0 0 16px; color: var(--ex-color-neon-blue-500); font-family: var(--ex-font-primary); text-transform: uppercase;">
      玩家排行榜
    </h3>
    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
      <div v-for="i in 10" :key="i" style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: var(--ex-color-bg-secondary); border: 1px solid var(--ex-color-border-primary); border-radius: var(--ex-radius-base);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 20px;">{{ i <= 3 ? ['🥇', '🥈', '🥉'][i-1] : `#${i}` }}</span>
          <span style="color: var(--ex-color-text-primary); font-weight: 600;">Player{{ String(i).padStart(3, '0') }}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 16px;">
          <span style="color: var(--ex-color-text-secondary); font-size: 14px;">等级 {{ 50 - i }}</span>
          <span style="color: var(--ex-color-neon-blue-500); font-weight: bold; font-size: 18px;">{{ 10000 - i * 100 }}</span>
        </div>
      </div>
    </div>
  </div>
  <ExPagination
    :current="1"
    :total="1000"
    :page-size="10"
    show-size-changer
    show-quick-jumper
    size="large"
    align="center"
    :total-text="(total, range) => `显示第 ${range[0]}-${range[1]} 名玩家，共 ${total} 名`"
  />
</div>

```vue
<template>
  <div>
    <h3>玩家排行榜</h3>
    <div class="player-list">
      <!-- 玩家列表 -->
    </div>
    <ExPagination
      :current="1"
      :total="1000"
      :page-size="10"
      show-size-changer
      show-quick-jumper
      size="large"
      align="center"
      :total-text="(total, range) => `显示第 ${range[0]}-${range[1]} 名玩家，共 ${total} 名`"
    />
  </div>
</template>
```

## API

### Pagination Props

| 属性                              | 说明                       | 类型                                                 | 默认值                  |
| --------------------------------- | -------------------------- | ---------------------------------------------------- | ----------------------- |
| `current` / `v-model:current`     | 当前页码                   | `number`                                             | `1`                     |
| `page-size` / `v-model:page-size` | 每页条数                   | `number`                                             | `10`                    |
| `total`                           | 数据总数                   | `number`                                             | —                       |
| `page-size-options`               | 每页条数选项               | `number[]`                                           | `[10, 20, 30, 50, 100]` |
| `show-size-changer`               | 是否显示每页条数选择器     | `boolean`                                            | `false`                 |
| `show-quick-jumper`               | 是否显示快速跳转           | `boolean`                                            | `false`                 |
| `show-total`                      | 是否显示总数               | `boolean`                                            | `true`                  |
| `total-text`                      | 总数文本模板函数           | `(total: number, range: [number, number]) => string` | —                       |
| `disabled`                        | 是否禁用                   | `boolean`                                            | `false`                 |
| `simple`                          | 是否简洁模式               | `boolean`                                            | `false`                 |
| `size`                            | 尺寸                       | `'small' \| 'medium' \| 'large'`                     | `'medium'`              |
| `align`                           | 对齐方式                   | `'left' \| 'center' \| 'right'`                      | `'left'`                |
| `show-pages`                      | 显示的页码按钮数量（奇数） | `number`                                             | `7`                     |
| `hide-on-single-page`             | 是否隐藏单页               | `boolean`                                            | `false`                 |
| `aria-label`                      | 无障碍标签                 | `string`                                             | —                       |

### Pagination Events

| 事件名             | 说明                     | 类型                                          |
| ------------------ | ------------------------ | --------------------------------------------- |
| `update:current`   | 页码改变时触发           | `(current: number) => void`                   |
| `update:page-size` | 每页条数改变时触发       | `(pageSize: number) => void`                  |
| `change`           | 页码或每页条数改变时触发 | `(current: number, pageSize: number) => void` |

### Pagination Methods

| 方法名       | 说明            | 类型                           |
| ------------ | --------------- | ------------------------------ |
| `getElement` | 获取分页DOM元素 | `() => HTMLDivElement \| null` |
| `goToPage`   | 跳转到指定页    | `(page: number) => void`       |
| `prev`       | 上一页          | `() => void`                   |
| `next`       | 下一页          | `() => void`                   |

## 无障碍支持

- 使用语义化的 HTML 标签和 ARIA 属性
- 完整的键盘导航支持
- 支持屏幕阅读器
- 当前页面使用 `aria-current="page"` 标识
- 所有按钮都有明确的 `aria-label`
- 支持减少动画偏好设置
- 触摸设备上增大触摸目标

## 主题定制

分页组件直接使用全局主题令牌（如 `--ex-color-bg-secondary`、`--ex-color-border-primary`、`--ex-color-primary` 等），会自动跟随全局主题变化。组件本身**未提供** `--ex-pagination-*` 这类专属 CSS 变量，设置它们不会生效。如需深度定制，请覆盖全局令牌，或通过 `class` / `style` 透传样式。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
