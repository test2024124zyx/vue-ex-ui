# Collapse 折叠面板

用于分组展示可展开内容，支持多选与手风琴模式。

<script setup>
import { ref } from 'vue'

const activeNames = ref(['profile'])
const activeName = ref('profile')
</script>

## 基础用法

::: raw

<div class="demo-container">
  <ExCollapse v-model="activeNames" aria-label="账户设置">
    <ExCollapseItem name="profile" title="个人资料">
      修改头像、昵称和联系方式。
    </ExCollapseItem>
    <ExCollapseItem name="security" title="安全设置">
      管理密码和登录验证方式。
    </ExCollapseItem>
    <ExCollapseItem name="notice" title="通知设置">
      选择需要接收的通知类型。
    </ExCollapseItem>
  </ExCollapse>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const activeNames = ref(['profile']);
</script>

<template>
  <div class="demo-container">
    <ExCollapse
      v-model="activeNames"
      aria-label="账户设置"
    >
      <ExCollapseItem
        name="profile"
        title="个人资料"
      >
        修改头像、昵称和联系方式。
      </ExCollapseItem>
      <ExCollapseItem
        name="security"
        title="安全设置"
      >
        管理密码和登录验证方式。
      </ExCollapseItem>
      <ExCollapseItem
        name="notice"
        title="通知设置"
      >
        选择需要接收的通知类型。
      </ExCollapseItem>
    </ExCollapse>
  </div>
</template>
```

:::

## 手风琴模式

手风琴模式一次只展开一项；全部关闭时绑定值为 `null`。

::: raw

<div class="demo-container">
  <ExCollapse v-model="activeName" accordion>
    <ExCollapseItem name="profile" title="个人资料">个人资料内容</ExCollapseItem>
    <ExCollapseItem name="security" title="安全设置">安全设置内容</ExCollapseItem>
  </ExCollapse>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const activeName = ref('profile');
</script>

<template>
  <div class="demo-container">
    <ExCollapse
      v-model="activeName"
      accordion
    >
      <ExCollapseItem
        name="profile"
        title="个人资料"
      >
        个人资料内容
      </ExCollapseItem>
      <ExCollapseItem
        name="security"
        title="安全设置"
      >
        安全设置内容
      </ExCollapseItem>
    </ExCollapse>
  </div>
</template>
```

:::

## 标题与额外操作

`extra` 插槽位于折叠按钮之外，可安全放置按钮或链接。

::: raw

<div class="demo-container">
  <ExCollapse v-model="activeNames">
    <ExCollapseItem name="notice">
      <template #title>通知设置</template>
      <template #extra>
        <ExButton size="small" text>管理</ExButton>
      </template>
      通知设置内容。
    </ExCollapseItem>
  </ExCollapse>
</div>

:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const activeNames = ref(['profile']);
</script>

<template>
  <div class="demo-container">
    <ExCollapse v-model="activeNames">
      <ExCollapseItem name="notice">
        <template #title>通知设置</template>
        <template #extra>
          <ExButton
            size="small"
            text
          >
            管理
          </ExButton>
        </template>
        通知设置内容。
      </ExCollapseItem>
    </ExCollapse>
  </div>
</template>
```

:::

## 禁用与无边框

```vue
<ExCollapse v-model="activeNames" :bordered="false">
  <ExCollapseItem name="enabled" title="可用面板">内容</ExCollapseItem>
  <ExCollapseItem name="disabled" title="禁用面板" disabled>内容</ExCollapseItem>
</ExCollapse>
```

## API

### Collapse Props

| 属性                      | 说明                     | 类型                                               | 默认值   |
| ------------------------- | ------------------------ | -------------------------------------------------- | -------- |
| `model-value` / `v-model` | 当前激活项               | `string \| number \| (string \| number)[] \| null` | `[]`     |
| `accordion`               | 是否限制为同时展开一项   | `boolean`                                          | `false`  |
| `bordered`                | 是否显示容器边框         | `boolean`                                          | `true`   |
| `disabled`                | 是否禁用全部折叠项       | `boolean`                                          | `false`  |
| `expand-icon-position`    | 展开图标位置             | `'left' \| 'right'`                                | `'left'` |
| `aria-label`              | 折叠面板分组的无障碍名称 | `string`                                           | —        |

### Collapse Events

| 事件名               | 说明             | 类型                                  |
| -------------------- | ---------------- | ------------------------------------- |
| `update:model-value` | 激活项变化       | `(value: CollapseActiveName) => void` |
| `change`             | 一次面板切换完成 | `(value: CollapseActiveName) => void` |

### Collapse Methods

| 方法名           | 说明               | 类型                                  |
| ---------------- | ------------------ | ------------------------------------- |
| `getElement`     | 获取根元素         | `() => HTMLDivElement \| null`        |
| `setActiveNames` | 规范化并设置激活项 | `(names: CollapseActiveName) => void` |

### CollapseItem Props

| 属性         | 说明                 | 类型               | 默认值  |
| ------------ | -------------------- | ------------------ | ------- |
| `name`       | 同一容器内唯一的标识 | `string \| number` | —       |
| `title`      | 面板标题             | `string`           | —       |
| `disabled`   | 是否禁用当前项       | `boolean`          | `false` |
| `show-arrow` | 是否显示展开图标     | `boolean`          | `true`  |
| `aria-label` | 切换按钮的无障碍名称 | `string`           | —       |

### CollapseItem Slots

| 插槽名    | 说明                   |
| --------- | ---------------------- |
| `default` | 面板内容               |
| `title`   | 面板标题               |
| `extra`   | 标题行右侧的独立操作区 |

### CollapseItem Methods

| 方法名       | 说明                   | 类型                           |
| ------------ | ---------------------- | ------------------------------ |
| `getElement` | 获取折叠项根元素       | `() => HTMLDivElement \| null` |
| `toggle`     | 在未禁用时切换展开状态 | `() => void`                   |

<style scoped>
.demo-container {
  padding: 24px;
  margin: 16px 0;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}
</style>
