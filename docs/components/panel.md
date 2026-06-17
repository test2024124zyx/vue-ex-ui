# Panel 面板

通用的内容容器组件，用于展示信息。

<script setup>
import { ref } from 'vue'
</script>

## 基础用法

最基础的面板用法。

<div class="demo-container">
  <ExPanel title="基础面板">
    <p>这是一个基础的面板组件，用于展示内容。</p>
    <p>面板可以包含任意内容，如文本、图片、表单等。</p>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel title="基础面板">
    <p>这是一个基础的面板组件，用于展示内容。</p>
    <p>面板可以包含任意内容，如文本、图片、表单等。</p>
  </ExPanel>
</template>
```

## 带副标题

通过 `subtitle` 属性可以添加副标题。

<div class="demo-container">
  <ExPanel 
    title="玩家信息" 
    subtitle="Player Information"
  >
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
      <div>
        <strong>用户名：</strong>Player001
      </div>
      <div>
        <strong>等级：</strong>Lv.50
      </div>
      <div>
        <strong>经验值：</strong>12,580 / 15,000
      </div>
      <div>
        <strong>战斗力：</strong>8,520
      </div>
    </div>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel 
    title="玩家信息" 
    subtitle="Player Information"
  >
    <div>用户名：Player001</div>
    <div>等级：Lv.50</div>
  </ExPanel>
</template>
```

## 带图标

通过 `icon` 插槽可以添加图标。

<div class="demo-container">
  <ExPanel title="游戏设置">
    <template #icon>
      <img src="https://api.iconify.design/ri/settings-3-line.svg" alt="设置" width="24" height="24" />
    </template>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; justify-content: space-between;">
        <span>画质：</span>
        <span style="color: var(--ex-color-neon-blue-500);">超高</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>帧率：</span>
        <span style="color: var(--ex-color-neon-blue-500);">144 FPS</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>分辨率：</span>
        <span style="color: var(--ex-color-neon-blue-500);">2560x1440</span>
      </div>
    </div>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel title="游戏设置">
    <template #icon>
      <img src="https://api.iconify.design/ri/settings-3-line.svg" alt="设置" width="24" height="24" />
    </template>
    <div>画质：超高</div>
    <div>帧率：144 FPS</div>
  </ExPanel>
</template>
```

## 不同类型

通过 `type` 属性可以设置不同的面板类型。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
  <ExPanel title="默认面板" type="default">
    <p>这是一个默认类型的面板。</p>
  </ExPanel>
  
  <ExPanel title="主要面板" type="primary">
    <p>这是一个主要类型的面板。</p>
  </ExPanel>
  
  <ExPanel title="成功面板" type="success">
    <p>这是一个成功类型的面板。</p>
  </ExPanel>
  
  <ExPanel title="警告面板" type="warning">
    <p>这是一个警告类型的面板。</p>
  </ExPanel>
  
  <ExPanel title="危险面板" type="danger">
    <p>这是一个危险类型的面板。</p>
  </ExPanel>
  
  <ExPanel title="信息面板" type="info">
    <p>这是一个信息类型的面板。</p>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel title="默认面板" type="default">
    <p>这是一个默认类型的面板。</p>
  </ExPanel>
  
  <ExPanel title="主要面板" type="primary">
    <p>这是一个主要类型的面板。</p>
  </ExPanel>
  
  <ExPanel title="成功面板" type="success">
    <p>这是一个成功类型的面板。</p>
  </ExPanel>
</template>
```

## 不同尺寸

通过 `size` 属性可以设置不同的面板尺寸。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 16px;">
  <ExPanel title="小尺寸面板" size="small">
    <p>这是一个小尺寸的面板，内边距较小。</p>
  </ExPanel>
  
  <ExPanel title="中等尺寸面板" size="medium">
    <p>这是一个中等尺寸的面板，默认尺寸。</p>
  </ExPanel>
  
  <ExPanel title="大尺寸面板" size="large">
    <p>这是一个大尺寸的面板，内边距较大。</p>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel title="小尺寸面板" size="small">
    <p>小尺寸面板</p>
  </ExPanel>
  
  <ExPanel title="中等尺寸面板" size="medium">
    <p>中等尺寸面板</p>
  </ExPanel>
  
  <ExPanel title="大尺寸面板" size="large">
    <p>大尺寸面板</p>
  </ExPanel>
</template>
```

## 阴影效果

通过 `shadow` 属性可以设置不同的阴影效果。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
  <ExPanel title="无阴影" shadow="none">
    <p>shadow="none"</p>
  </ExPanel>
  
  <ExPanel title="小阴影" shadow="sm">
    <p>shadow="sm"</p>
  </ExPanel>
  
  <ExPanel title="基础阴影" shadow="base">
    <p>shadow="base"</p>
  </ExPanel>
  
  <ExPanel title="中等阴影" shadow="md">
    <p>shadow="md"</p>
  </ExPanel>
  
  <ExPanel title="大阴影" shadow="lg">
    <p>shadow="lg"</p>
  </ExPanel>
  
  <ExPanel title="超大阴影" shadow="xl">
    <p>shadow="xl"</p>
  </ExPanel>
  
  <ExPanel title="霓虹阴影" shadow="neon">
    <p>shadow="neon"</p>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel title="无阴影" shadow="none">
    <p>无阴影效果</p>
  </ExPanel>
  
  <ExPanel title="霓虹阴影" shadow="neon">
    <p>霓虹发光效果</p>
  </ExPanel>
</template>
```

## 可悬停

设置 `hoverable` 属性可以让面板在悬停时有提升效果。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
  <ExPanel 
    title="战绩卡片" 
    type="primary"
    hoverable
  >
    <template #icon>
      <img src="https://api.iconify.design/ri/trophy-line.svg" alt="奖杯" width="24" height="24" />
    </template>
    <div style="text-align: center;">
      <div style="font-size: 32px; font-weight: bold; color: var(--ex-color-neon-blue-500); margin-bottom: 8px;">
        850
      </div>
      <div style="color: var(--ex-color-text-secondary);">
        总胜场
      </div>
    </div>
  </ExPanel>
  
  <ExPanel 
    title="成就系统" 
    type="success"
    hoverable
  >
    <template #icon>
      <img src="https://api.iconify.design/ri/medal-line.svg" alt="奖牌" width="24" height="24" />
    </template>
    <div style="text-align: center;">
      <div style="font-size: 32px; font-weight: bold; color: var(--ex-color-success); margin-bottom: 8px;">
        85/120
      </div>
      <div style="color: var(--ex-color-text-secondary);">
        已解锁
      </div>
    </div>
  </ExPanel>
  
  <ExPanel 
    title="在线时长" 
    type="warning"
    hoverable
  >
    <template #icon>
      <img src="https://api.iconify.design/ri/time-line.svg" alt="时间" width="24" height="24" />
    </template>
    <div style="text-align: center;">
      <div style="font-size: 32px; font-weight: bold; color: var(--ex-color-warning); margin-bottom: 8px;">
        1,250h
      </div>
      <div style="color: var(--ex-color-text-secondary);">
        游戏时长
      </div>
    </div>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel 
    title="战绩卡片" 
    type="primary"
    hoverable
  >
    <template #icon>
      <img src="https://api.iconify.design/ri/trophy-line.svg" alt="奖杯" width="24" height="24" />
    </template>
    <div>总胜场：850</div>
  </ExPanel>
</template>
```

## 额外内容

通过 `extra` 插槽可以在头部右侧添加额外内容。

<div class="demo-container">
  <ExPanel title="任务列表">
    <template #extra>
      <ExButton type="primary" size="small">查看全部</ExButton>
    </template>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>每日签到</span>
        <ExBadge :count="1" type="success" />
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>完成5场对战</span>
        <ExBadge :count="3" type="primary" />
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span>获得10次击杀</span>
        <ExBadge :count="5" type="warning" />
      </div>
    </div>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel title="任务列表">
    <template #extra>
      <ExButton type="primary" size="small">查看全部</ExButton>
    </template>
    <div>任务内容...</div>
  </ExPanel>
</template>
```

## 底部内容

通过 `footer` 插槽可以添加底部内容。

<div class="demo-container">
  <ExPanel 
    title="确认操作" 
    type="warning"
  >
    <template #icon>
      <img src="https://api.iconify.design/ri/alert-line.svg" alt="警告" width="24" height="24" />
    </template>
    <p>您确定要执行此操作吗？此操作不可撤销。</p>
    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <ExButton>取消</ExButton>
        <ExButton type="primary">确认</ExButton>
      </div>
    </template>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel title="确认操作" type="warning">
    <template #icon>
      <img src="https://api.iconify.design/ri/alert-line.svg" alt="警告" width="24" height="24" />
    </template>
    <p>您确定要执行此操作吗？</p>
    <template #footer>
      <div style="display: flex; justify-content: flex-end; gap: 12px;">
        <ExButton>取消</ExButton>
        <ExButton type="primary">确认</ExButton>
      </div>
    </template>
  </ExPanel>
</template>
```

## 无边框

设置 `bordered` 为 `false` 可以渲染无边框的面板。

<div class="demo-container">
  <ExPanel 
    title="无边框面板" 
    :bordered="false"
  >
    <p>这是一个无边框的面板，适合嵌入到其他容器中使用。</p>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel 
    title="无边框面板" 
    :bordered="false"
  >
    <p>无边框面板内容</p>
  </ExPanel>
</template>
```

## 自定义样式

可以通过 `headerStyle`、`bodyStyle`、`footerStyle` 属性自定义各部分样式。

<div class="demo-container">
  <ExPanel 
    title="自定义样式面板"
    :header-style="{ background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 127, 0.2))' }"
    :body-style="{ background: 'rgba(0, 0, 0, 0.3)' }"
  >
    <p>这是一个自定义样式的面板。</p>
    <p>头部和内容区域都应用了自定义样式。</p>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel 
    title="自定义样式面板"
    :header-style="{ 
      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 127, 0.2))' 
    }"
    :body-style="{ 
      background: 'rgba(0, 0, 0, 0.3)' 
    }"
  >
    <p>自定义样式内容</p>
  </ExPanel>
</template>
```

## 加载状态

通过 `loading` 属性可以显示加载状态。

<div class="demo-container">
  <ExPanel 
    title="加载中的面板" 
    loading
  >
    <p>这个面板正在加载中...</p>
    <p>内容会被遮罩层覆盖。</p>
  </ExPanel>
</div>

```vue
<template>
  <ExPanel 
    title="加载中的面板" 
    :loading="true"
  >
    <p>加载中...</p>
  </ExPanel>
</template>
```

## API

### Panel Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `title` | 面板标题 | `string` | `undefined` |
| `subtitle` | 面板副标题 | `string` | `undefined` |
| `type` | 面板类型 | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` |
| `size` | 面板尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| `bordered` | 是否显示边框 | `boolean` | `true` |
| `hoverable` | 是否可悬停 | `boolean` | `false` |
| `shadow` | 阴影效果 | `'none' \| 'base' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'neon'` | `'base'` |
| `loading` | 是否加载中 | `boolean` | `false` |
| `header-style` | 头部样式 | `string \| Record<string, string \| number>` | `undefined` |
| `body-style` | 内容样式 | `string \| Record<string, string \| number>` | `undefined` |
| `footer-style` | 底部样式 | `string \| Record<string, string \| number>` | `undefined` |
| `aria-label` | 无障碍标签 | `string` | `undefined` |

### Panel Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 面板内容 |
| `title` | 自定义标题 |
| `subtitle` | 自定义副标题 |
| `icon` | 自定义图标 |
| `extra` | 头部右侧的额外内容 |
| `footer` | 底部内容 |

### Panel Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `getElement` | 获取面板DOM元素 | `() => HTMLDivElement \| null` |

## 无障碍支持

- 使用语义化的 HTML 标签
- 完整的 ARIA 属性支持
- 支持屏幕阅读器

## 主题定制

面板跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，无需单独配置。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
