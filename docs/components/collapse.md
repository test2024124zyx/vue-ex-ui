# Collapse 折叠面板

通过折叠面板收纳内容区域。

<script setup>
import { ref } from 'vue'

const activeNames1 = ref(['1'])
const activeNames2 = ref(['1'])
const activeNames3 = ref('1')
const activeNames4 = ref(['1'])
const activeNames5 = ref(['1'])
const activeNames6 = ref(['1'])
</script>

## 基础用法

可同时展开多个面板，面板之间不影响。

<div class="demo-container">
  <ExCollapse v-model="activeNames1">
    <ExCollapseItem name="1" title="一致性 Consistency">
      <div>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；</div>
      <div>在界面中一致：所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。</div>
    </ExCollapseItem>
    <ExCollapseItem name="2" title="反馈 Feedback">
      <div>控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；</div>
      <div>页面反馈：操作后，通过页面元素的变化清晰地展现当前状态。</div>
    </ExCollapseItem>
    <ExCollapseItem name="3" title="效率 Efficiency">
      <div>简化流程：设计简洁直观的操作流程；</div>
      <div>清晰明确：语言表达清晰且表意明确，让用户快速理解进而作出决策；</div>
      <div>帮助用户识别：界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。</div>
    </ExCollapseItem>
    <ExCollapseItem name="4" title="可控 Controllability">
      <div>用户决策：根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；</div>
      <div>结果可控：用户可以自由的进行操作，包括撤销、回退和终止当前操作等。</div>
    </ExCollapseItem>
  </ExCollapse>
</div>

```vue
<template>
  <ExCollapse v-model="activeNames">
    <ExCollapseItem name="1" title="一致性 Consistency">
      <div>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；</div>
      <div>
        在界面中一致：所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。
      </div>
    </ExCollapseItem>
    <ExCollapseItem name="2" title="反馈 Feedback">
      <div>控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；</div>
      <div>页面反馈：操作后，通过页面元素的变化清晰地展现当前状态。</div>
    </ExCollapseItem>
    <ExCollapseItem name="3" title="效率 Efficiency">
      <div>简化流程：设计简洁直观的操作流程；</div>
      <div>清晰明确：语言表达清晰且表意明确，让用户快速理解进而作出决策；</div>
      <div>帮助用户识别：界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。</div>
    </ExCollapseItem>
    <ExCollapseItem name="4" title="可控 Controllability">
      <div>用户决策：根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；</div>
      <div>结果可控：用户可以自由的进行操作，包括撤销、回退和终止当前操作等。</div>
    </ExCollapseItem>
  </ExCollapse>
</template>

<script setup>
import { ref } from 'vue';
const activeNames = ref(['1']);
</script>
```

## 手风琴模式

通过 `accordion` 属性来设置是否以手风琴模式显示。手风琴模式下，一次只能展开一个面板。

<div class="demo-container">
  <ExCollapse v-model="activeNames3" accordion>
    <ExCollapseItem name="1" title="一致性 Consistency">
      <div>与现实生活一致：与现实生活的流程、逻辑保持一致，遵循用户习惯的语言和概念；</div>
      <div>在界面中一致：所有的元素和结构需保持一致，比如：设计样式、图标和文本、元素的位置等。</div>
    </ExCollapseItem>
    <ExCollapseItem name="2" title="反馈 Feedback">
      <div>控制反馈：通过界面样式和交互动效让用户可以清晰的感知自己的操作；</div>
      <div>页面反馈：操作后，通过页面元素的变化清晰地展现当前状态。</div>
    </ExCollapseItem>
    <ExCollapseItem name="3" title="效率 Efficiency">
      <div>简化流程：设计简洁直观的操作流程；</div>
      <div>清晰明确：语言表达清晰且表意明确，让用户快速理解进而作出决策；</div>
      <div>帮助用户识别：界面简单直白，让用户快速识别而非回忆，减少用户记忆负担。</div>
    </ExCollapseItem>
    <ExCollapseItem name="4" title="可控 Controllability">
      <div>用户决策：根据场景可给予用户操作建议或安全提示，但不能代替用户进行决策；</div>
      <div>结果可控：用户可以自由的进行操作，包括撤销、回退和终止当前操作等。</div>
    </ExCollapseItem>
  </ExCollapse>
</div>

```vue
<template>
  <ExCollapse v-model="activeNames" accordion>
    <ExCollapseItem name="1" title="一致性 Consistency">
      <!-- 内容 -->
    </ExCollapseItem>
    <ExCollapseItem name="2" title="反馈 Feedback">
      <!-- 内容 -->
    </ExCollapseItem>
    <ExCollapseItem name="3" title="效率 Efficiency">
      <!-- 内容 -->
    </ExCollapseItem>
    <ExCollapseItem name="4" title="可控 Controllability">
      <!-- 内容 -->
    </ExCollapseItem>
  </ExCollapse>
</template>

<script setup>
import { ref } from 'vue';
const activeNames = ref('1');
</script>
```

## 自定义标题

通过 `title` 插槽可以自定义面板标题内容。

<div class="demo-container">
  <ExCollapse v-model="activeNames2">
    <ExCollapseItem name="1">
      <template #title>
        <span style="color: var(--ex-color-neon-blue-500); font-weight: 600;">
          🎮 游戏设置
        </span>
      </template>
      <div>画质：超高</div>
      <div>帧率：144 FPS</div>
      <div>分辨率：2560x1440</div>
    </ExCollapseItem>
    <ExCollapseItem name="2">
      <template #title>
        <span style="color: var(--ex-color-neon-pink-500); font-weight: 600;">
          🔊 音频设置
        </span>
      </template>
      <div>主音量：80%</div>
      <div>音效音量：70%</div>
      <div>背景音乐：60%</div>
    </ExCollapseItem>
    <ExCollapseItem name="3">
      <template #title>
        <span style="color: var(--ex-color-success); font-weight: 600;">
          ⌨️ 键位设置
        </span>
      </template>
      <div>移动：WASD</div>
      <div>跳跃：Space</div>
      <div>射击：鼠标左键</div>
    </ExCollapseItem>
  </ExCollapse>
</div>

```vue
<template>
  <ExCollapse v-model="activeNames">
    <ExCollapseItem name="1">
      <template #title>
        <span style="color: var(--ex-color-neon-blue-500);">🎮 游戏设置</span>
      </template>
      <div>画质：超高</div>
      <div>帧率：144 FPS</div>
    </ExCollapseItem>
  </ExCollapse>
</template>
```

## 额外内容

通过 `extra` 插槽可以在面板标题右侧添加额外内容。

<div class="demo-container">
  <ExCollapse v-model="activeNames4">
    <ExCollapseItem name="1" title="基础信息">
      <template #extra>
        <ExBadge :count="5" type="primary" />
      </template>
      <div>用户名：Player001</div>
      <div>等级：Lv.50</div>
      <div>经验值：12,580 / 15,000</div>
    </ExCollapseItem>
    <ExCollapseItem name="2" title="战绩统计">
      <template #extra>
        <span style="color: var(--ex-color-success); font-size: 12px;">胜率 68%</span>
      </template>
      <div>总场次：1,250</div>
      <div>胜利：850</div>
      <div>失败：400</div>
    </ExCollapseItem>
    <ExCollapseItem name="3" title="成就系统">
      <template #extra>
        <span style="color: var(--ex-color-warning); font-size: 12px;">85/120</span>
      </template>
      <div>已解锁成就：85 个</div>
      <div>总成就数：120 个</div>
      <div>完成度：70.8%</div>
    </ExCollapseItem>
  </ExCollapse>
</div>

```vue
<template>
  <ExCollapse v-model="activeNames">
    <ExCollapseItem name="1" title="基础信息">
      <template #extra>
        <ExBadge :count="5" type="primary" />
      </template>
      <div>用户名：Player001</div>
      <div>等级：Lv.50</div>
    </ExCollapseItem>
  </ExCollapse>
</template>
```

## 无边框

设置 `bordered` 为 `false` 可以渲染无边框的折叠面板。

<div class="demo-container">
  <ExCollapse v-model="activeNames5" :bordered="false">
    <ExCollapseItem name="1" title="武器装备">
      <div>主武器：AK-47</div>
      <div>副武器：Desert Eagle</div>
      <div>近战武器：战术刀</div>
    </ExCollapseItem>
    <ExCollapseItem name="2" title="防具装备">
      <div>头盔：三级头</div>
      <div>护甲：三级甲</div>
      <div>背包：三级包</div>
    </ExCollapseItem>
    <ExCollapseItem name="3" title="消耗品">
      <div>医疗包 x5</div>
      <div>能量饮料 x3</div>
      <div>绷带 x10</div>
    </ExCollapseItem>
  </ExCollapse>
</div>

```vue
<template>
  <ExCollapse v-model="activeNames" :bordered="false">
    <ExCollapseItem name="1" title="武器装备">
      <!-- 内容 -->
    </ExCollapseItem>
    <ExCollapseItem name="2" title="防具装备">
      <!-- 内容 -->
    </ExCollapseItem>
  </ExCollapse>
</template>
```

## 图标位置

通过 `expand-icon-position` 属性可以设置展开图标的位置。

<div class="demo-container">
  <ExCollapse v-model="activeNames6" expand-icon-position="right">
    <ExCollapseItem name="1" title="角色属性">
      <div>力量：85</div>
      <div>敏捷：92</div>
      <div>智力：78</div>
      <div>体质：88</div>
    </ExCollapseItem>
    <ExCollapseItem name="2" title="技能列表">
      <div>主动技能：5 个</div>
      <div>被动技能：3 个</div>
      <div>终极技能：1 个</div>
    </ExCollapseItem>
    <ExCollapseItem name="3" title="天赋树">
      <div>已分配点数：45</div>
      <div>可用点数：5</div>
      <div>总点数：50</div>
    </ExCollapseItem>
  </ExCollapse>
</div>

```vue
<template>
  <ExCollapse v-model="activeNames" expand-icon-position="right">
    <ExCollapseItem name="1" title="角色属性">
      <!-- 内容 -->
    </ExCollapseItem>
  </ExCollapse>
</template>
```

## 禁用状态

通过 `disabled` 属性可以禁用整个折叠面板或单个面板项。

<div class="demo-container">
  <ExCollapse v-model="activeNames1">
    <ExCollapseItem name="1" title="可用功能">
      <div>这是一个正常的面板，可以展开和收起。</div>
    </ExCollapseItem>
    <ExCollapseItem name="2" title="禁用功能" disabled>
      <div>这个面板被禁用了，无法展开。</div>
    </ExCollapseItem>
    <ExCollapseItem name="3" title="可用功能">
      <div>这是另一个正常的面板。</div>
    </ExCollapseItem>
  </ExCollapse>
</div>

```vue
<template>
  <ExCollapse v-model="activeNames">
    <ExCollapseItem name="1" title="可用功能">
      <div>正常面板</div>
    </ExCollapseItem>
    <ExCollapseItem name="2" title="禁用功能" disabled>
      <div>禁用面板</div>
    </ExCollapseItem>
  </ExCollapse>
</template>
```

## API

### Collapse Props

| 属性                      | 说明               | 类型                                       | 默认值      |
| ------------------------- | ------------------ | ------------------------------------------ | ----------- |
| `model-value` / `v-model` | 当前激活的面板     | `string \| number \| (string \| number)[]` | `[]`        |
| `accordion`               | 是否开启手风琴模式 | `boolean`                                  | `false`     |
| `bordered`                | 是否显示边框       | `boolean`                                  | `true`      |
| `disabled`                | 是否禁用所有面板   | `boolean`                                  | `false`     |
| `expand-icon-position`    | 展开图标位置       | `'left' \| 'right'`                        | `'left'`    |
| `aria-label`              | 无障碍标签         | `string`                                   | `undefined` |

### Collapse Events

| 事件名               | 说明               | 类型                                                              |
| -------------------- | ------------------ | ----------------------------------------------------------------- |
| `update:model-value` | 激活面板改变时触发 | `(value: string \| number \| (string \| number)[]) => void`       |
| `change`             | 激活面板改变时触发 | `(activeNames: string \| number \| (string \| number)[]) => void` |

### Collapse Methods

| 方法名           | 说明                | 类型                                                        |
| ---------------- | ------------------- | ----------------------------------------------------------- |
| `getElement`     | 获取折叠面板DOM元素 | `() => HTMLDivElement \| null`                              |
| `setActiveNames` | 设置激活的面板      | `(names: string \| number \| (string \| number)[]) => void` |

### CollapseItem Props

| 属性         | 说明         | 类型               | 默认值      |
| ------------ | ------------ | ------------------ | ----------- |
| `name`       | 唯一标识符   | `string \| number` | -           |
| `title`      | 面板标题     | `string`           | `undefined` |
| `disabled`   | 是否禁用     | `boolean`          | `false`     |
| `show-arrow` | 是否显示箭头 | `boolean`          | `true`      |
| `aria-label` | 无障碍标签   | `string`           | `undefined` |

### CollapseItem Slots

| 插槽名    | 说明                   |
| --------- | ---------------------- |
| `default` | 面板内容               |
| `title`   | 面板标题               |
| `extra`   | 面板标题右侧的额外内容 |

### CollapseItem Methods

| 方法名       | 说明                  | 类型                           |
| ------------ | --------------------- | ------------------------------ |
| `getElement` | 获取面板项DOM元素     | `() => HTMLDivElement \| null` |
| `toggle`     | 切换面板展开/收起状态 | `() => void`                   |

## 无障碍支持

- 支持键盘导航：
  - `Enter` / `Space` 展开/收起面板
  - `Tab` 切换焦点
- 完整的 ARIA 属性支持
- 支持屏幕阅读器

## 主题定制

折叠面板跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，无需单独配置。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
