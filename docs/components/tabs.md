# Tabs 标签页

分隔内容上有关联但属于不同类别的数据集合，适合游戏设置、角色信息、装备管理等场景。

<script setup>
import { ref } from 'vue'

const activeTab = ref('overview')
const activeTab2 = ref('stats')
const activeTab3 = ref('weapons')
const activeTab4 = ref('settings')
const editableTabs = ref(['tab1', 'tab2', 'tab3'])
const editableTabsValue = ref('tab1')
const tabIndex = ref(3)

const handleTabAdd = () => {
  const newTabName = `tab${++tabIndex.value}`
  editableTabs.value.push(newTabName)
  editableTabsValue.value = newTabName
}

const handleTabRemove = (targetName) => {
  const tabs = editableTabs.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab
        }
      }
    })
  }
  editableTabsValue.value = activeName
  editableTabs.value = tabs.filter(tab => tab !== targetName)
}
</script>

## 基础用法

最基础的标签页用法，适合展示不同类别的游戏信息。

<div class="demo-container">
  <ExTabs v-model="activeTab">
    <ExTabPane name="overview" label="游戏概览">
      <h3 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">游戏概览</h3>
      <p style="margin: 0; color: var(--ex-color-text-secondary);">
        这里展示游戏的基本信息、最新动态和推荐内容。
      </p>
    </ExTabPane>
    <ExTabPane name="characters" label="角色">
      <h3 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">角色管理</h3>
      <p style="margin: 0; color: var(--ex-color-text-secondary);">
        查看和管理你的游戏角色，包括等级、技能和装备。
      </p>
    </ExTabPane>
    <ExTabPane name="achievements" label="成就">
      <h3 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">成就系统</h3>
      <p style="margin: 0; color: var(--ex-color-text-secondary);">
        查看已解锁的成就和进度，挑战更多成就获得奖励。
      </p>
    </ExTabPane>
  </ExTabs>
</div>

```vue
<script setup>
import { ref } from 'vue'

const activeTab = ref('overview')
</script>

<template>
  <ExTabs v-model="activeTab">
    <ExTabPane name="overview" label="游戏概览">
      <p>游戏概览内容</p>
    </ExTabPane>
    <ExTabPane name="characters" label="角色">
      <p>角色管理内容</p>
    </ExTabPane>
    <ExTabPane name="achievements" label="成就">
      <p>成就系统内容</p>
    </ExTabPane>
  </ExTabs>
</template>
```

## 卡片类型

使用 `type="card"` 可以渲染卡片风格的标签页。

<div class="demo-container">
  <ExTabs v-model="activeTab2" type="card">
    <ExTabPane name="stats" label="数据统计">
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <div style="text-align: center; padding: 16px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
          <div style="font-size: 24px; font-weight: bold; color: var(--ex-color-neon-blue-500);">850</div>
          <div style="font-size: 14px; color: var(--ex-color-text-tertiary); margin-top: 4px;">总胜场</div>
        </div>
        <div style="text-align: center; padding: 16px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
          <div style="font-size: 24px; font-weight: bold; color: var(--ex-color-success);">68%</div>
          <div style="font-size: 14px; color: var(--ex-color-text-tertiary); margin-top: 4px;">胜率</div>
        </div>
        <div style="text-align: center; padding: 16px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
          <div style="font-size: 24px; font-weight: bold; color: var(--ex-color-warning);">3.2</div>
          <div style="font-size: 14px; color: var(--ex-color-text-tertiary); margin-top: 4px;">KD比</div>
        </div>
      </div>
    </ExTabPane>
    <ExTabPane name="history" label="历史记录">
      <p style="margin: 0; color: var(--ex-color-text-secondary);">最近10场比赛记录</p>
    </ExTabPane>
    <ExTabPane name="ranking" label="排行榜">
      <p style="margin: 0; color: var(--ex-color-text-secondary);">全服排行榜</p>
    </ExTabPane>
  </ExTabs>
</div>

```vue
<template>
  <ExTabs v-model="activeTab" type="card">
    <ExTabPane name="stats" label="数据统计">
      <p>数据统计内容</p>
    </ExTabPane>
    <ExTabPane name="history" label="历史记录">
      <p>历史记录内容</p>
    </ExTabPane>
    <ExTabPane name="ranking" label="排行榜">
      <p>排行榜内容</p>
    </ExTabPane>
  </ExTabs>
</template>
```

## 按钮类型

使用 `type="button"` 可以渲染按钮风格的标签页，带有霓虹发光效果。

<div class="demo-container">
  <ExTabs v-model="activeTab3" type="button">
    <ExTabPane name="weapons" label="武器">
      <h3 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">武器库</h3>
      <p style="margin: 0; color: var(--ex-color-text-secondary);">
        查看和管理你的武器装备，升级武器提升战斗力。
      </p>
    </ExTabPane>
    <ExTabPane name="armor" label="护甲">
      <h3 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">护甲库</h3>
      <p style="margin: 0; color: var(--ex-color-text-secondary);">
        查看和管理你的护甲装备，提升防御能力。
      </p>
    </ExTabPane>
    <ExTabPane name="accessories" label="配件">
      <h3 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">配件库</h3>
      <p style="margin: 0; color: var(--ex-color-text-secondary);">
        查看和管理你的配件装备，获得特殊能力。
      </p>
    </ExTabPane>
  </ExTabs>
</div>

```vue
<template>
  <ExTabs v-model="activeTab" type="button">
    <ExTabPane name="weapons" label="武器">
      <p>武器库内容</p>
    </ExTabPane>
    <ExTabPane name="armor" label="护甲">
      <p>护甲库内容</p>
    </ExTabPane>
    <ExTabPane name="accessories" label="配件">
      <p>配件库内容</p>
    </ExTabPane>
  </ExTabs>
</template>
```

## 不同尺寸

通过 `size` 属性可以设置不同的标签页尺寸。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">小尺寸</h4>
    <ExTabs v-model="activeTab4" size="small">
      <ExTabPane name="settings" label="设置">
        <p style="margin: 0; color: var(--ex-color-text-secondary);">小尺寸标签页内容</p>
      </ExTabPane>
      <ExTabPane name="about" label="关于">
        <p style="margin: 0; color: var(--ex-color-text-secondary);">关于内容</p>
      </ExTabPane>
    </ExTabs>
  </div>
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">中等尺寸（默认）</h4>
    <ExTabs v-model="activeTab4" size="medium">
      <ExTabPane name="settings" label="设置">
        <p style="margin: 0; color: var(--ex-color-text-secondary);">中等尺寸标签页内容</p>
      </ExTabPane>
      <ExTabPane name="about" label="关于">
        <p style="margin: 0; color: var(--ex-color-text-secondary);">关于内容</p>
      </ExTabPane>
    </ExTabs>
  </div>
  <div>
    <h4 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">大尺寸</h4>
    <ExTabs v-model="activeTab4" size="large">
      <ExTabPane name="settings" label="设置">
        <p style="margin: 0; color: var(--ex-color-text-secondary);">大尺寸标签页内容</p>
      </ExTabPane>
      <ExTabPane name="about" label="关于">
        <p style="margin: 0; color: var(--ex-color-text-secondary);">关于内容</p>
      </ExTabPane>
    </ExTabs>
  </div>
</div>

```vue
<template>
  <ExTabs v-model="activeTab" size="small">
    <ExTabPane name="settings" label="设置">
      <p>小尺寸内容</p>
    </ExTabPane>
  </ExTabs>
  
  <ExTabs v-model="activeTab" size="large">
    <ExTabPane name="settings" label="设置">
      <p>大尺寸内容</p>
    </ExTabPane>
  </ExTabs>
</template>
```

## 带图标

通过具名插槽可以为标签页添加图标。

<div class="demo-container">
  <ExTabs v-model="activeTab">
    <template #icon-overview>
      <img src="https://api.iconify.design/ri/dashboard-line.svg" alt="概览" width="18" height="18" />
    </template>
    <template #icon-characters>
      <img src="https://api.iconify.design/ri/user-line.svg" alt="角色" width="18" height="18" />
    </template>
    <template #icon-achievements>
      <img src="https://api.iconify.design/ri/trophy-line.svg" alt="成就" width="18" height="18" />
    </template>
    <ExTabPane name="overview" label="概览">
      <p style="margin: 0; color: var(--ex-color-text-secondary);">游戏概览内容</p>
    </ExTabPane>
    <ExTabPane name="characters" label="角色">
      <p style="margin: 0; color: var(--ex-color-text-secondary);">角色管理内容</p>
    </ExTabPane>
    <ExTabPane name="achievements" label="成就">
      <p style="margin: 0; color: var(--ex-color-text-secondary);">成就系统内容</p>
    </ExTabPane>
  </ExTabs>
</div>

```vue
<template>
  <ExTabs v-model="activeTab">
    <template #icon-overview>
      <img src="https://api.iconify.design/ri/dashboard-line.svg" alt="概览" width="18" height="18" />
    </template>
    <template #icon-characters>
      <img src="https://api.iconify.design/ri/user-line.svg" alt="角色" width="18" height="18" />
    </template>
    
    <ExTabPane name="overview" label="概览">
      <p>概览内容</p>
    </ExTabPane>
    <ExTabPane name="characters" label="角色">
      <p>角色内容</p>
    </ExTabPane>
  </ExTabs>
</template>
```

## 禁用状态

通过 `disabled` 属性可以禁用某个标签页。

<div class="demo-container">
  <ExTabs v-model="activeTab">
    <ExTabPane name="overview" label="游戏概览">
      <p style="margin: 0; color: var(--ex-color-text-secondary);">游戏概览内容</p>
    </ExTabPane>
    <ExTabPane name="characters" label="角色" disabled>
      <p style="margin: 0; color: var(--ex-color-text-secondary);">角色管理内容（已禁用）</p>
    </ExTabPane>
    <ExTabPane name="achievements" label="成就">
      <p style="margin: 0; color: var(--ex-color-text-secondary);">成就系统内容</p>
    </ExTabPane>
  </ExTabs>
</div>

```vue
<template>
  <ExTabs v-model="activeTab">
    <ExTabPane name="overview" label="游戏概览">
      <p>游戏概览内容</p>
    </ExTabPane>
    <ExTabPane name="characters" label="角色" disabled>
      <p>角色管理内容（已禁用）</p>
    </ExTabPane>
    <ExTabPane name="achievements" label="成就">
      <p>成就系统内容</p>
    </ExTabPane>
  </ExTabs>
</template>
```

## 可关闭

通过 `closable` 属性可以让标签页可关闭。

<div class="demo-container">
  <ExTabs v-model="editableTabsValue" closable @tab-remove="handleTabRemove">
    <ExTabPane 
      v-for="item in editableTabs" 
      :key="item" 
      :name="item" 
      :label="`标签 ${item}`"
    >
      <p style="margin: 0; color: var(--ex-color-text-secondary);">
        这是 {{ item }} 的内容
      </p>
    </ExTabPane>
  </ExTabs>
</div>

```vue
<script setup>
import { ref } from 'vue'

const editableTabs = ref(['tab1', 'tab2', 'tab3'])
const editableTabsValue = ref('tab1')

const handleTabRemove = (targetName) => {
  const tabs = editableTabs.value
  let activeName = editableTabsValue.value
  if (activeName === targetName) {
    tabs.forEach((tab, index) => {
      if (tab === targetName) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activeName = nextTab
        }
      }
    })
  }
  editableTabsValue.value = activeName
  editableTabs.value = tabs.filter(tab => tab !== targetName)
}
</script>

<template>
  <ExTabs v-model="editableTabsValue" closable @tab-remove="handleTabRemove">
    <ExTabPane 
      v-for="item in editableTabs" 
      :key="item" 
      :name="item" 
      :label="`标签 ${item}`"
    >
      <p>这是 {{ item }} 的内容</p>
    </ExTabPane>
  </ExTabs>
</template>
```

## 可添加

通过 `addable` 属性可以让标签页可添加。

<div class="demo-container">
  <ExTabs v-model="editableTabsValue" addable @tab-add="handleTabAdd">
    <ExTabPane 
      v-for="item in editableTabs" 
      :key="item" 
      :name="item" 
      :label="`标签 ${item}`"
    >
      <p style="margin: 0; color: var(--ex-color-text-secondary);">
        这是 {{ item }} 的内容
      </p>
    </ExTabPane>
  </ExTabs>
</div>

```vue
<script setup>
import { ref } from 'vue'

const editableTabs = ref(['tab1', 'tab2', 'tab3'])
const editableTabsValue = ref('tab1')
const tabIndex = ref(3)

const handleTabAdd = () => {
  const newTabName = `tab${++tabIndex.value}`
  editableTabs.value.push(newTabName)
  editableTabsValue.value = newTabName
}
</script>

<template>
  <ExTabs v-model="editableTabsValue" addable @tab-add="handleTabAdd">
    <ExTabPane 
      v-for="item in editableTabs" 
      :key="item" 
      :name="item" 
      :label="`标签 ${item}`"
    >
      <p>这是 {{ item }} 的内容</p>
    </ExTabPane>
  </ExTabs>
</template>
```

## 设置示例

展示完整的设置界面，使用标签页组织不同类别的设置。

<div class="demo-container">
  <ExTabs v-model="activeTab4" type="card">
    <template #icon-settings>
      <img src="https://api.iconify.design/ri/settings-3-line.svg" alt="图形" width="18" height="18" />
    </template>
    <template #icon-audio>
      <img src="https://api.iconify.design/ri/volume-up-line.svg" alt="音频" width="18" height="18" />
    </template>
    <template #icon-controls>
      <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="控制" width="18" height="18" />
    </template>
    <template #icon-network>
      <img src="https://api.iconify.design/ri/wifi-line.svg" alt="网络" width="18" height="18" />
    </template>
    <ExTabPane name="settings" label="图形设置">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
          <span style="color: var(--ex-color-text-primary);">画质</span>
          <span style="color: var(--ex-color-neon-blue-500); font-weight: bold;">超高</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
          <span style="color: var(--ex-color-text-primary);">帧率限制</span>
          <span style="color: var(--ex-color-neon-blue-500); font-weight: bold;">144 FPS</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
          <span style="color: var(--ex-color-text-primary);">分辨率</span>
          <span style="color: var(--ex-color-neon-blue-500); font-weight: bold;">2560x1440</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
          <span style="color: var(--ex-color-text-primary);">垂直同步</span>
          <span style="color: var(--ex-color-success); font-weight: bold;">开启</span>
        </div>
      </div>
    </ExTabPane>
    <ExTabPane name="audio" label="音频设置">
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
          <span style="color: var(--ex-color-text-primary);">主音量</span>
          <span style="color: var(--ex-color-neon-blue-500); font-weight: bold;">80%</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
          <span style="color: var(--ex-color-text-primary);">音效音量</span>
          <span style="color: var(--ex-color-neon-blue-500); font-weight: bold;">70%</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
          <span style="color: var(--ex-color-text-primary);">背景音乐</span>
          <span style="color: var(--ex-color-neon-blue-500); font-weight: bold;">60%</span>
        </div>
      </div>
    </ExTabPane>
    <ExTabPane name="controls" label="控制设置">
      <p style="margin: 0; color: var(--ex-color-text-secondary);">
        键盘和鼠标控制设置，自定义按键绑定。
      </p>
    </ExTabPane>
    <ExTabPane name="network" label="网络设置">
      <p style="margin: 0; color: var(--ex-color-text-secondary);">
        网络连接设置，服务器选择和延迟优化。
      </p>
    </ExTabPane>
  </ExTabs>
</div>

```vue
<template>
  <ExTabs v-model="activeTab" type="card">
    <template #icon-settings>
      <img src="https://api.iconify.design/ri/settings-3-line.svg" alt="图形" width="18" height="18" />
    </template>
    
    <ExTabPane name="settings" label="图形设置">
      <div>图形设置内容</div>
    </ExTabPane>
    
    <ExTabPane name="audio" label="音频设置">
      <div>音频设置内容</div>
    </ExTabPane>
  </ExTabs>
</template>
```

## API

### Tabs Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `model-value / v-model` | 当前激活的标签页名称 | `string \| number` | `undefined` |
| `type` | 标签页类型 | `'line' \| 'card' \| 'button'` | `'line'` |
| `position` | 标签页位置 | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` |
| `size` | 标签页尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| `closable` | 是否可关闭 | `boolean` | `false` |
| `addable` | 是否可添加 | `boolean` | `false` |
| `editable` | 是否可编辑（可添加和关闭） | `boolean` | `false` |
| `animated` | 是否动画 | `boolean` | `true` |

### Tabs Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| `update:model-value` | 更新当前激活的标签页 | `(value: string \| number) => void` |
| `change` | 标签页切换事件 | `(name: string \| number) => void` |
| `tab-click` | 标签页点击事件 | `(name: string \| number, event: MouseEvent) => void` |
| `tab-remove` | 标签页关闭事件 | `(name: string \| number) => void` |
| `tab-add` | 标签页添加事件 | `() => void` |

### Tabs Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 标签页面板内容 |
| `icon-{name}` | 自定义标签页图标 |
| `label-{name}` | 自定义标签页标题 |

### Tabs Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `getElement` | 获取标签页DOM元素 | `() => HTMLDivElement \| null` |

### TabPane Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `name` | 标签页名称（唯一标识） | `string \| number` | - |
| `label` | 标签页标题 | `string` | `undefined` |
| `disabled` | 是否禁用 | `boolean` | `false` |
| `closable` | 是否可关闭 | `boolean` | `false` |
| `lazy` | 是否懒加载 | `boolean` | `false` |

### TabPane Slots

| 插槽名 | 说明 |
| --- | --- |
| `default` | 标签页面板内容 |

### TabPane Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| `getElement` | 获取面板DOM元素 | `() => HTMLDivElement \| null` |

## 无障碍支持

- 使用语义化的 HTML 标签
- 完整的 ARIA 属性支持
- 支持键盘导航（Enter、Space 键切换）
- 支持屏幕阅读器
- 支持减少动画偏好设置

## 主题定制

可以通过 CSS 变量自定义标签页样式：

```css
:root {
  --ex-tabs-nav-bg: transparent;
  --ex-tabs-tab-color: var(--ex-color-text-secondary);
  --ex-tabs-tab-active-color: var(--ex-color-neon-blue-500);
  --ex-tabs-indicator-bg: linear-gradient(90deg, var(--ex-color-neon-blue-500), var(--ex-color-neon-pink-500));
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
