# Breadcrumb 面包屑

显示当前页面在系统层级结构中的位置，并能向上返回。赛博朋克风格的面包屑导航组件。

<script setup>
import { ref } from 'vue'

const items1 = [
  { label: '首页', path: '/' },
  { label: '产品中心', path: '/products' },
  { label: '电子设备', path: '/products/electronics' },
  { label: '智能手机' }
]

const items2 = [
  { label: '首页', path: '/' },
  { label: '用户管理', path: '/users' },
  { label: '用户详情' }
]

const items3 = [
  { label: '首页', path: '/' },
  { label: '文档', path: '/docs' },
  { label: '组件', path: '/docs/components' },
  { label: '导航', path: '/docs/components/navigation' },
  { label: '面包屑', path: '/docs/components/navigation/breadcrumb' },
  { label: '示例' }
]

const items4 = [
  { label: '首页', path: '/' },
  { label: '设置', path: '/settings' },
  { label: '账户设置', path: '/settings/account', disabled: true },
  { label: '个人信息' }
]

const handleClick = (item, index) => {
  console.log('点击面包屑:', item, '索引:', index)
}
</script>

## 基础用法

基础的面包屑导航。

::: raw

<div class="demo-container">
  <ExBreadcrumb :items="items1" @click="handleClick" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExBreadcrumb
      :items="items1"
      @click="handleClick"
    />
  </div>
</template>

<script setup>
const items1 = [
  { label: '首页', path: '/' },
  { label: '产品中心', path: '/products' },
  { label: '电子设备', path: '/products/electronics' },
  { label: '智能手机' },
];

const handleClick = (item, index) => {
  console.log('点击面包屑:', item, '索引:', index);
};
</script>
```

:::

## 带图标

通过 `icon` 插槽为面包屑项添加图标。

::: raw

<div class="demo-container">
  <ExBreadcrumb :items="items2" @click="handleClick">
    <template #icon="{ item, index }">
      <img
        v-if="index === 0"
        src="https://api.iconify.design/ri/home-line.svg"
        alt=""
        width="16"
        height="16"
      />
      <img
        v-else-if="index === 1"
        src="https://api.iconify.design/ri/user-line.svg"
        alt=""
        width="16"
        height="16"
      />
      <img
        v-else
        src="https://api.iconify.design/ri/file-user-line.svg"
        alt=""
        width="16"
        height="16"
      />
    </template>
  </ExBreadcrumb>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExBreadcrumb
      :items="items2"
      @click="handleClick"
    >
      <template #icon="{ item, index }">
        <img
          v-if="index === 0"
          src="https://api.iconify.design/ri/home-line.svg"
          alt=""
          width="16"
          height="16"
        />
        <img
          v-else-if="index === 1"
          src="https://api.iconify.design/ri/user-line.svg"
          alt=""
          width="16"
          height="16"
        />
        <img
          v-else
          src="https://api.iconify.design/ri/file-user-line.svg"
          alt=""
          width="16"
          height="16"
        />
      </template>
    </ExBreadcrumb>
  </div>
</template>

<script setup>
const items2 = [
  { label: '首页', path: '/' },
  { label: '用户管理', path: '/users' },
  { label: '用户详情' },
];

const handleClick = (item, index) => {
  console.log('点击面包屑:', item, '索引:', index);
};
</script>
```

:::

## 自定义分隔符

使用 `separator` 属性自定义分隔符。

::: raw

<div class="demo-container vertical">
  <ExBreadcrumb :items="items1" separator=">" />
  <ExBreadcrumb :items="items1" separator="-" />
  <ExBreadcrumb :items="items1" separator="·" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container vertical">
    <ExBreadcrumb
      :items="items1"
      separator=">"
    />
    <ExBreadcrumb
      :items="items1"
      separator="-"
    />
    <ExBreadcrumb
      :items="items1"
      separator="·"
    />
  </div>
</template>

<script setup>
const items1 = [
  { label: '首页', path: '/' },
  { label: '产品中心', path: '/products' },
  { label: '电子设备', path: '/products/electronics' },
  { label: '智能手机' },
];
</script>
```

:::

## 图标分隔符

使用 `separator` 插槽设置图标分隔符。

::: raw

<div class="demo-container vertical">
  <ExBreadcrumb :items="items1">
    <template #separator>
      <ExIcon src="https://api.iconify.design/ri/arrow-right-s-line.svg" alt="" color="#ffffff" />
    </template>
  </ExBreadcrumb>
  <ExBreadcrumb :items="items1">
    <template #separator>
      <ExIcon src="https://api.iconify.design/ri/arrow-right-line.svg" alt="" color="#ffffff" />
    </template>
  </ExBreadcrumb>
  <ExBreadcrumb :items="items1">
    <template #separator>
      <ExIcon src="https://api.iconify.design/ri/arrow-right-double-line.svg" alt="" color="#ffffff" />
    </template>
  </ExBreadcrumb>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container vertical">
    <ExBreadcrumb :items="items1">
      <template #separator>
        <ExIcon
          src="https://api.iconify.design/ri/arrow-right-s-line.svg"
          alt=""
          color="#ffffff"
        />
      </template>
    </ExBreadcrumb>
    <ExBreadcrumb :items="items1">
      <template #separator>
        <ExIcon
          src="https://api.iconify.design/ri/arrow-right-line.svg"
          alt=""
          color="#ffffff"
        />
      </template>
    </ExBreadcrumb>
    <ExBreadcrumb :items="items1">
      <template #separator>
        <ExIcon
          src="https://api.iconify.design/ri/arrow-right-double-line.svg"
          alt=""
          color="#ffffff"
        />
      </template>
    </ExBreadcrumb>
  </div>
</template>

<script setup>
const items1 = [
  { label: '首页', path: '/' },
  { label: '产品中心', path: '/products' },
  { label: '电子设备', path: '/products/electronics' },
  { label: '智能手机' },
];
</script>
```

:::

## 最大显示项数

当面包屑项过多时，可以通过 `max-items` 属性限制显示数量，中间部分会显示省略号。

::: raw

<div class="demo-container vertical">
  <div class="demo-item">
    <p class="demo-description">显示全部（6项）</p>
    <ExBreadcrumb :items="items3" />
  </div>

  <div class="demo-item">
    <p class="demo-description">最多显示 4 项</p>
    <ExBreadcrumb :items="items3" :max-items="4" />
  </div>

  <div class="demo-item">
    <p class="demo-description">最多显示 3 项</p>
    <ExBreadcrumb :items="items3" :max-items="3" />
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container vertical">
    <div class="demo-item">
      <p class="demo-description">显示全部（6项）</p>
      <ExBreadcrumb :items="items3" />
    </div>

    <div class="demo-item">
      <p class="demo-description">最多显示 4 项</p>
      <ExBreadcrumb
        :items="items3"
        :max-items="4"
      />
    </div>

    <div class="demo-item">
      <p class="demo-description">最多显示 3 项</p>
      <ExBreadcrumb
        :items="items3"
        :max-items="3"
      />
    </div>
  </div>
</template>

<script setup>
const items3 = [
  { label: '首页', path: '/' },
  { label: '文档', path: '/docs' },
  { label: '组件', path: '/docs/components' },
  { label: '导航', path: '/docs/components/navigation' },
  { label: '面包屑', path: '/docs/components/navigation/breadcrumb' },
  { label: '示例' },
];
</script>
```

:::

## 禁用状态

通过 `disabled` 属性禁用某个面包屑项。

::: raw

<div class="demo-container">
  <ExBreadcrumb :items="items4" @click="handleClick" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExBreadcrumb
      :items="items4"
      @click="handleClick"
    />
  </div>
</template>

<script setup>
const items4 = [
  { label: '首页', path: '/' },
  { label: '设置', path: '/settings' },
  { label: '账户设置', path: '/settings/account', disabled: true },
  { label: '个人信息' },
];

const handleClick = (item, index) => {
  console.log('点击面包屑:', item, '索引:', index);
};
</script>
```

:::

## 不同尺寸

提供三种尺寸：`small`、`medium`（默认）、`large`。

::: raw

<div class="demo-container vertical">
  <div class="demo-item">
    <p class="demo-description">小尺寸</p>
    <ExBreadcrumb :items="items1" size="small" />
  </div>

  <div class="demo-item">
    <p class="demo-description">中等尺寸（默认）</p>
    <ExBreadcrumb :items="items1" size="medium" />
  </div>

  <div class="demo-item">
    <p class="demo-description">大尺寸</p>
    <ExBreadcrumb :items="items1" size="large" />
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container vertical">
    <div class="demo-item">
      <p class="demo-description">小尺寸</p>
      <ExBreadcrumb
        :items="items1"
        size="small"
      />
    </div>

    <div class="demo-item">
      <p class="demo-description">中等尺寸（默认）</p>
      <ExBreadcrumb
        :items="items1"
        size="medium"
      />
    </div>

    <div class="demo-item">
      <p class="demo-description">大尺寸</p>
      <ExBreadcrumb
        :items="items1"
        size="large"
      />
    </div>
  </div>
</template>

<script setup>
const items1 = [
  { label: '首页', path: '/' },
  { label: '产品中心', path: '/products' },
  { label: '电子设备', path: '/products/electronics' },
  { label: '智能手机' },
];
</script>
```

:::

## 禁用点击

通过 `clickable` 属性禁用所有面包屑项的点击功能。

::: raw

<div class="demo-container">
  <ExBreadcrumb :items="items1" :clickable="false" />
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExBreadcrumb
      :items="items1"
      :clickable="false"
    />
  </div>
</template>

<script setup>
const items1 = [
  { label: '首页', path: '/' },
  { label: '产品中心', path: '/products' },
  { label: '电子设备', path: '/products/electronics' },
  { label: '智能手机' },
];
</script>
```

:::

## API

省略 `size` 时继承最近的 `ExConfigProvider`；未配置全局尺寸时使用下表默认值。显式设置的尺寸优先。

### Breadcrumb Props

| 属性      | 说明         | 类型                             | 默认值     |
| --------- | ------------ | -------------------------------- | ---------- |
| items     | 面包屑数据   | `BreadcrumbItem[]`               | `[]`       |
| separator | 分隔符       | `string`                         | `'/'`      |
| max-items | 最大显示项数 | `number`                         | -          |
| size      | 尺寸         | `'small' \| 'medium' \| 'large'` | `'medium'` |
| clickable | 是否可点击   | `boolean`                        | `true`     |

### BreadcrumbItem 类型

| 属性     | 说明           | 类型                      | 必填 |
| -------- | -------------- | ------------------------- | ---- |
| label    | 面包屑项的文本 | `string`                  | 是   |
| path     | 面包屑项的路径 | `string`                  | 否   |
| disabled | 是否禁用       | `boolean`                 | 否   |
| data     | 自定义数据     | `Record<string, unknown>` | 否   |

### Breadcrumb Events

| 事件名 | 说明               | 回调参数                                |
| ------ | ------------------ | --------------------------------------- |
| click  | 点击面包屑项时触发 | `(item: BreadcrumbItem, index: number)` |

### Breadcrumb Slots

| 插槽名    | 说明         | 参数                                      |
| --------- | ------------ | ----------------------------------------- |
| icon      | 自定义图标   | `{ item: BreadcrumbItem, index: number }` |
| separator | 自定义分隔符 | -                                         |

## 特性

- 🌃 赛博朋克主题设计，带有霓虹发光效果
- 🎨 支持自定义分隔符和图标分隔符（通过插槽）
- 📏 三种尺寸可选
- 🔢 支持最大显示项数限制
- 🎯 支持图标显示（通过插槽）
- ♿ 完整的无障碍支持
- 🎭 支持禁用状态
- 📱 响应式设计

## 无障碍

- 使用 `<nav>` 标签包裹，提供 `role="navigation"` 和 `aria-label`
- 最后一项使用 `aria-current="page"` 标识当前页面
- 分隔符使用 `aria-hidden="true"` 隐藏
- 可点击项使用 `<a>` 标签，支持键盘导航和屏幕阅读器

## 最佳实践

1. **路径设置**: 为可点击的面包屑项设置 `path` 属性
2. **图标使用**: 使用 `icon` 插槽可以提高识别度，特别是在系统导航中
3. **项数限制**: 当层级较深时，使用 `max-items` 限制显示数量
4. **分隔符选择**: 根据设计风格选择合适的分隔符或使用 `separator` 插槽自定义
5. **尺寸选择**: 根据页面布局选择合适的尺寸

## 注意事项

- 最后一项默认不可点击，表示当前页面
- 禁用的项不会触发点击事件
- 当设置 `max-items` 时，会保留第一项和最后几项，中间显示省略号
- 图标和分隔符都通过插槽自定义，提供最大灵活性

<style scoped>
.demo-container {
  padding: 16px;
  background: var(--ex-color-bg-secondary);
  border-radius: var(--ex-radius-base);
  margin: 16px 0;
}

.demo-container.vertical {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.demo-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.demo-description {
  margin: 0;
  font-size: 14px;
  color: var(--ex-color-text-secondary);
}
</style>
