# Anchor 锚点

<script setup>
import { ref } from 'vue'

const activeAnchor = ref('#basic')

const handleChange = (href) => {
  console.log('锚点变化:', href)
}

const handleClick = (href) => {
  console.log('点击锚点:', href)
}
</script>

用于跳转到页面指定位置。

## 基础用法

最简单的用法。

::: raw

<div class="demo-container">
  <div style="display: flex; gap: 24px;">
    <ExAnchor @change="handleChange" @click="handleClick">
      <ExAnchorLink href="#basic" title="基础用法" />
      <ExAnchorLink href="#fixed" title="固定位置" />
      <ExAnchorLink href="#api" title="API" />
    </ExAnchor>
    <div style="flex: 1;">
      <h3 id="basic">基础用法</h3>
      <p>这是基础用法的内容区域。锚点组件会自动跟踪当前滚动位置，并高亮对应的锚点链接。</p>
      <div style="height: 300px; background: var(--ex-color-bg-tertiary); padding: 16px; border-radius: var(--ex-radius-base);">
        内容区域
      </div>
      <h3 id="fixed" style="margin-top: 32px;">固定位置</h3>
      <p>锚点可以固定在页面侧边，方便用户快速导航。</p>
      <div style="height: 300px; background: var(--ex-color-bg-tertiary); padding: 16px; border-radius: var(--ex-radius-base);">
        内容区域
      </div>
      <h3 id="api" style="margin-top: 32px;">API</h3>
      <p>查看完整的API文档。</p>
      <div style="height: 300px; background: var(--ex-color-bg-tertiary); padding: 16px; border-radius: var(--ex-radius-base);">
        内容区域
      </div>
    </div>
  </div>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <div style="display: flex; gap: 24px;">
      <ExAnchor
        @change="handleChange"
        @click="handleClick"
      >
        <ExAnchorLink
          href="#basic"
          title="基础用法"
        />
        <ExAnchorLink
          href="#fixed"
          title="固定位置"
        />
        <ExAnchorLink
          href="#api"
          title="API"
        />
      </ExAnchor>
      <div style="flex: 1;">
        <h3 id="basic">基础用法</h3>
        <p>这是基础用法的内容区域。锚点组件会自动跟踪当前滚动位置，并高亮对应的锚点链接。</p>
        <div
          style="height: 300px; background: var(--ex-color-bg-tertiary); padding: 16px; border-radius: var(--ex-radius-base);"
        >
          内容区域
        </div>
        <h3
          id="fixed"
          style="margin-top: 32px;"
        >
          固定位置
        </h3>
        <p>锚点可以固定在页面侧边，方便用户快速导航。</p>
        <div
          style="height: 300px; background: var(--ex-color-bg-tertiary); padding: 16px; border-radius: var(--ex-radius-base);"
        >
          内容区域
        </div>
        <h3
          id="api"
          style="margin-top: 32px;"
        >
          API
        </h3>
        <p>查看完整的API文档。</p>
        <div
          style="height: 300px; background: var(--ex-color-bg-tertiary); padding: 16px; border-radius: var(--ex-radius-base);"
        >
          内容区域
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const handleChange = href => {
  console.log('锚点变化:', href);
};

const handleClick = href => {
  console.log('点击锚点:', href);
};
</script>
```

:::

## 嵌套锚点

锚点支持嵌套。

::: raw

<div class="demo-container">
  <ExAnchor>
    <ExAnchorLink href="#components" title="组件">
      <ExAnchorLink href="#basic-components" title="基础组件" />
      <ExAnchorLink href="#form-components" title="表单组件" />
    </ExAnchorLink>
    <ExAnchorLink href="#guide" title="指南">
      <ExAnchorLink href="#installation" title="安装" />
      <ExAnchorLink href="#usage" title="使用" />
    </ExAnchorLink>
  </ExAnchor>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExAnchor>
      <ExAnchorLink
        href="#components"
        title="组件"
      >
        <ExAnchorLink
          href="#basic-components"
          title="基础组件"
        />
        <ExAnchorLink
          href="#form-components"
          title="表单组件"
        />
      </ExAnchorLink>
      <ExAnchorLink
        href="#guide"
        title="指南"
      >
        <ExAnchorLink
          href="#installation"
          title="安装"
        />
        <ExAnchorLink
          href="#usage"
          title="使用"
        />
      </ExAnchorLink>
    </ExAnchor>
  </div>
</template>
```

:::

## 自定义偏移量

设置锚点滚动偏移量。

::: raw

<div class="demo-container">
  <ExAnchor :offset-top="100" :target-offset="50">
    <ExAnchorLink href="#section1" title="第一节" />
    <ExAnchorLink href="#section2" title="第二节" />
    <ExAnchorLink href="#section3" title="第三节" />
  </ExAnchor>
</div>

:::

::: details 查看示例代码

```vue
<template>
  <div class="demo-container">
    <ExAnchor
      :offset-top="100"
      :target-offset="50"
    >
      <ExAnchorLink
        href="#section1"
        title="第一节"
      />
      <ExAnchorLink
        href="#section2"
        title="第二节"
      />
      <ExAnchorLink
        href="#section3"
        title="第三节"
      />
    </ExAnchor>
  </div>
</template>
```

:::

## API

### Anchor Props

| 属性          | 说明                             | 类型                        | 默认值         |
| ------------- | -------------------------------- | --------------------------- | -------------- |
| offset-top    | 距离窗口顶部达到指定偏移量后触发 | number                      | 0              |
| bounds        | 锚点区域边界                     | number                      | 5              |
| target-offset | 设置锚点滚动偏移量               | number                      | -              |
| container     | 指定滚动的容器                   | () => HTMLElement \| Window | () => window   |
| aria-label    | 导航地标的无障碍名称             | string                      | 内置本地化文案 |

### Anchor Events

| 事件名 | 说明           | 类型                                     |
| ------ | -------------- | ---------------------------------------- |
| click  | 点击锚点时触发 | (href: string, item: AnchorItem) => void |
| change | 锚点改变时触发 | (href: string) => void                   |

### Anchor Methods

| 方法名         | 说明           | 类型                   |
| -------------- | -------------- | ---------------------- |
| scrollToAnchor | 滚动到指定锚点 | (href: string) => void |

### AnchorLink Props

| 属性  | 说明     | 类型   | 默认值 |
| ----- | -------- | ------ | ------ |
| href  | 锚点链接 | string | -      |
| title | 锚点标题 | string | -      |

### AnchorLink Events

| 事件名 | 说明           | 类型                   |
| ------ | -------------- | ---------------------- |
| click  | 点击锚点时触发 | (href: string) => void |

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
