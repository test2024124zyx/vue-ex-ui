# Empty 空状态

空状态时的占位提示组件，用于展示无数据、搜索无结果等场景。

<script setup>
import { ref } from 'vue'

const loading = ref(false)

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

## 基础用法

最简单的空状态展示。

<div class="demo-container">
  <ExEmpty />
</div>

```vue
<template>
  <ExEmpty />
</template>
```

## 自定义描述

通过 `description` 属性可以自定义描述文字。

<div class="demo-container">
  <ExEmpty description="暂无游戏数据" />
</div>

```vue
<template>
  <ExEmpty description="暂无游戏数据" />
</template>
```

## 自定义图片

通过 `image` 属性可以自定义图片。

<div class="demo-container">
  <ExEmpty 
    image="https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=200&h=200&fit=crop"
    description="暂无战绩记录"
  />
</div>

```vue
<template>
  <ExEmpty 
    image="https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=200&h=200&fit=crop"
    description="暂无战绩记录"
  />
</template>
```

## 不同尺寸

通过 `image-size` 属性可以设置不同的图片尺寸。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-secondary);">小尺寸</h4>
    <ExEmpty image-size="small" description="暂无数据" />
  </div>
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-secondary);">中等尺寸（默认）</h4>
    <ExEmpty image-size="medium" description="暂无数据" />
  </div>
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-secondary);">大尺寸</h4>
    <ExEmpty image-size="large" description="暂无数据" />
  </div>
</div>

```vue
<template>
  <ExEmpty image-size="small" description="暂无数据" />
  <ExEmpty image-size="medium" description="暂无数据" />
  <ExEmpty image-size="large" description="暂无数据" />
</template>
```

## 自定义尺寸

`image-size` 也可以设置为数字，单位为 px。

<div class="demo-container">
  <ExEmpty :image-size="200" description="自定义尺寸 200px" />
</div>

```vue
<template>
  <ExEmpty :image-size="200" description="自定义尺寸 200px" />
</template>
```

## 带操作按钮

通过默认插槽可以添加操作按钮。

<div class="demo-container">
  <ExEmpty description="暂无游戏记录">
    <ExButton type="primary">
      <template #prefix>
        <img src="https://api.iconify.design/ri/add-line.svg" alt="添加" width="16" height="16" />
      </template>
      开始游戏
    </ExButton>
  </ExEmpty>
</div>

```vue
<template>
  <ExEmpty description="暂无游戏记录">
    <ExButton type="primary">
      <template #prefix>
        <img src="https://api.iconify.design/ri/add-line.svg" alt="添加" width="16" height="16" />
      </template>
      开始游戏
    </ExButton>
  </ExEmpty>
</template>
```

## 多个操作按钮

可以添加多个操作按钮。

<div class="demo-container">
  <ExEmpty description="搜索无结果">
    <ExSpace>
      <ExButton @click="handleRefresh" :loading="loading">
        <template #prefix>
          <img src="https://api.iconify.design/ri/refresh-line.svg" alt="刷新" width="16" height="16" />
        </template>
        刷新
      </ExButton>
      <ExButton type="primary">
        <template #prefix>
          <img src="https://api.iconify.design/ri/search-line.svg" alt="搜索" width="16" height="16" />
        </template>
        重新搜索
      </ExButton>
    </ExSpace>
  </ExEmpty>
</div>

```vue
<script setup>
import { ref } from 'vue'

const loading = ref(false)

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <ExEmpty description="搜索无结果">
    <ExSpace>
      <ExButton @click="handleRefresh" :loading="loading">
        <template #prefix>
          <img src="https://api.iconify.design/ri/refresh-line.svg" alt="刷新" width="16" height="16" />
        </template>
        刷新
      </ExButton>
      <ExButton type="primary">
        <template #prefix>
          <img src="https://api.iconify.design/ri/search-line.svg" alt="搜索" width="16" height="16" />
        </template>
        重新搜索
      </ExButton>
    </ExSpace>
  </ExEmpty>
</template>
```

## 自定义图片插槽

通过 `image` 插槽可以完全自定义图片内容。

<div class="demo-container">
  <ExEmpty description="暂无收藏">
    <template #image>
      <div style="font-size: 80px; opacity: 0.6;">🎮</div>
    </template>
    <ExButton type="primary">去收藏游戏</ExButton>
  </ExEmpty>
</div>

```vue
<template>
  <ExEmpty description="暂无收藏">
    <template #image>
      <div style="font-size: 80px; opacity: 0.6;">🎮</div>
    </template>
    <ExButton type="primary">去收藏游戏</ExButton>
  </ExEmpty>
</template>
```

## 自定义描述插槽

通过 `description` 插槽可以自定义描述内容。

<div class="demo-container">
  <ExEmpty>
    <template #description>
      <div style="color: var(--ex-color-text-secondary);">
        <p style="margin: 0 0 8px;">暂无战绩数据</p>
        <p style="margin: 0; font-size: 14px; opacity: 0.8;">快去开始你的第一场游戏吧！</p>
      </div>
    </template>
    <ExButton type="primary" size="large">
      <template #prefix>
        <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="游戏" width="18" height="18" />
      </template>
      开始游戏
    </ExButton>
  </ExEmpty>
</div>

```vue
<template>
  <ExEmpty>
    <template #description>
      <div style="color: var(--ex-color-text-secondary);">
        <p style="margin: 0 0 8px;">暂无战绩数据</p>
        <p style="margin: 0; font-size: 14px; opacity: 0.8;">快去开始你的第一场游戏吧！</p>
      </div>
    </template>
    <ExButton type="primary" size="large">
      <template #prefix>
        <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="游戏" width="18" height="18" />
      </template>
      开始游戏
    </ExButton>
  </ExEmpty>
</template>
```

## 赛博朋克主题示例

展示游戏主题风格的空状态。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
  <ExCard type="primary">
    <ExEmpty 
      image-size="small"
      description="暂无好友在线"
    >
      <ExButton type="primary" size="small">
        <template #prefix>
          <img src="https://api.iconify.design/ri/user-add-line.svg" alt="添加" width="16" height="16" />
        </template>
        添加好友
      </ExButton>
    </ExEmpty>
  </ExCard>

  <ExCard type="success">
    <ExEmpty 
      image-size="small"
      description="暂无成就解锁"
    >
      <ExButton type="success" size="small">
        <template #prefix>
          <img src="https://api.iconify.design/ri/trophy-line.svg" alt="成就" width="16" height="16" />
        </template>
        查看成就
      </ExButton>
    </ExEmpty>
  </ExCard>

  <ExCard type="warning">
    <ExEmpty 
      image-size="small"
      description="暂无消息通知"
    >
      <ExButton type="warning" size="small">
        <template #prefix>
          <img src="https://api.iconify.design/ri/notification-line.svg" alt="通知" width="16" height="16" />
        </template>
        查看全部
      </ExButton>
    </ExEmpty>
  </ExCard>
</div>

```vue
<template>
  <ExCard type="primary">
    <ExEmpty 
      image-size="small"
      description="暂无好友在线"
    >
      <ExButton type="primary" size="small">
        <template #prefix>
          <img src="https://api.iconify.design/ri/user-add-line.svg" alt="添加" width="16" height="16" />
        </template>
        添加好友
      </ExButton>
    </ExEmpty>
  </ExCard>
</template>
```

## 不显示图片

设置 `:show-image="false"` 可以不显示图片。

<div class="demo-container">
  <ExEmpty 
    :show-image="false"
    description="暂无数据"
  >
    <ExButton type="primary">刷新</ExButton>
  </ExEmpty>
</div>

```vue
<template>
  <ExEmpty 
    :show-image="false"
    description="暂无数据"
  >
    <ExButton type="primary">刷新</ExButton>
  </ExEmpty>
</template>
```

## 在表格中使用

Empty 组件常用于表格无数据时的展示。

<div class="demo-container">
  <ExCard>
    <template #header>
      <h3 style="margin: 0; color: var(--ex-color-text-primary);">玩家排行榜</h3>
    </template>
    <ExEmpty 
      image-size="small"
      description="暂无排行数据"
    >
      <ExButton type="primary" size="small">
        <template #prefix>
          <img src="https://api.iconify.design/ri/refresh-line.svg" alt="刷新" width="16" height="16" />
        </template>
        刷新数据
      </ExButton>
    </ExEmpty>
  </ExCard>
</div>

```vue
<template>
  <ExCard>
    <template #header>
      <h3>玩家排行榜</h3>
    </template>
    <ExEmpty 
      image-size="small"
      description="暂无排行数据"
    >
      <ExButton type="primary" size="small">
        <template #prefix>
          <img src="https://api.iconify.design/ri/refresh-line.svg" alt="刷新" width="16" height="16" />
        </template>
        刷新数据
      </ExButton>
    </ExEmpty>
  </ExCard>
</template>
```

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `image` | 图片地址 | `string` | - |
| `image-size` | 图片尺寸 | `'small' \| 'medium' \| 'large' \| number` | `'medium'` |
| `description` | 描述文字 | `string` | `'暂无数据'` |
| `show-image` | 是否显示图片 | `boolean` | `true` |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| `image` | 自定义图片内容 |
| `description` | 自定义描述内容 |
| `default` | 自定义操作按钮 |

## 无障碍支持

- 使用语义化的 HTML 结构
- 图片包含 alt 属性
- 支持屏幕阅读器
- 支持键盘导航（操作按钮）

## 主题定制

可以通过 CSS 变量自定义 Empty 组件样式：

```css
:root {
  --ex-empty-bg: var(--ex-color-bg-secondary);
  --ex-empty-text-color: var(--ex-color-text-secondary);
  --ex-empty-image-opacity: 0.8;
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
