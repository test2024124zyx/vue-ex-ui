# Popover 气泡卡片

点击/鼠标移入元素，弹出气泡式的卡片浮层。带有霓虹发光效果的赛博朋克主题气泡卡片组件。

<script setup>
import { ref } from 'vue'

const visible = ref(false)
</script>

## 基础用法

最简单的用法，鼠标点击时显示气泡卡片。

<div class="demo-container">
  <ExPopover content="这是一段内容" title="标题">
    <ExButton>点击显示</ExButton>
  </ExPopover>
</div>

```vue
<template>
  <ExPopover content="这是一段内容" title="标题">
    <ExButton>点击显示</ExButton>
  </ExPopover>
</template>
```

## 不同位置

通过 `placement` 属性可以设置气泡卡片的显示位置，支持 12 个方向。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div style="display: flex; justify-content: center; gap: 12px;">
    <ExPopover content="Top Start 内容" title="Top Start" placement="top-start">
      <ExButton>上左</ExButton>
    </ExPopover>
    <ExPopover content="Top 内容" title="Top" placement="top">
      <ExButton>上边</ExButton>
    </ExPopover>
    <ExPopover content="Top End 内容" title="Top End" placement="top-end">
      <ExButton>上右</ExButton>
    </ExPopover>
  </div>
  <div style="display: flex; justify-content: space-between;">
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ExPopover content="Left Start 内容" title="Left Start" placement="left-start">
        <ExButton>左上</ExButton>
      </ExPopover>
      <ExPopover content="Left 内容" title="Left" placement="left">
        <ExButton>左边</ExButton>
      </ExPopover>
      <ExPopover content="Left End 内容" title="Left End" placement="left-end">
        <ExButton>左下</ExButton>
      </ExPopover>
    </div>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <ExPopover content="Right Start 内容" title="Right Start" placement="right-start">
        <ExButton>右上</ExButton>
      </ExPopover>
      <ExPopover content="Right 内容" title="Right" placement="right">
        <ExButton>右边</ExButton>
      </ExPopover>
      <ExPopover content="Right End 内容" title="Right End" placement="right-end">
        <ExButton>右下</ExButton>
      </ExPopover>
    </div>
  </div>
  <div style="display: flex; justify-content: center; gap: 12px;">
    <ExPopover content="Bottom Start 内容" title="Bottom Start" placement="bottom-start">
      <ExButton>下左</ExButton>
    </ExPopover>
    <ExPopover content="Bottom 内容" title="Bottom" placement="bottom">
      <ExButton>下边</ExButton>
    </ExPopover>
    <ExPopover content="Bottom End 内容" title="Bottom End" placement="bottom-end">
      <ExButton>下右</ExButton>
    </ExPopover>
  </div>
</div>

```vue
<template>
  <ExPopover content="Top 内容" title="Top" placement="top">
    <ExButton>上边</ExButton>
  </ExPopover>

  <ExPopover content="Bottom 内容" title="Bottom" placement="bottom">
    <ExButton>下边</ExButton>
  </ExPopover>
</template>
```

## 触发方式

通过 `trigger` 属性可以设置不同的触发方式。

<div class="demo-container">
  <ExPopover content="鼠标悬停触发" title="Hover" trigger="hover">
    <ExButton>悬停触发</ExButton>
  </ExPopover>
  <ExPopover content="点击触发" title="Click" trigger="click">
    <ExButton>点击触发</ExButton>
  </ExPopover>
  <ExPopover content="聚焦触发" title="Focus" trigger="focus">
    <ExButton>聚焦触发</ExButton>
  </ExPopover>
</div>

```vue
<template>
  <ExPopover content="鼠标悬停触发" title="Hover" trigger="hover">
    <ExButton>悬停触发</ExButton>
  </ExPopover>

  <ExPopover content="点击触发" title="Click" trigger="click">
    <ExButton>点击触发</ExButton>
  </ExPopover>

  <ExPopover content="聚焦触发" title="Focus" trigger="focus">
    <ExButton>聚焦触发</ExButton>
  </ExPopover>
</template>
```

## 自定义内容

通过插槽可以自定义气泡卡片的内容。

<div class="demo-container">
  <ExPopover>
    <template #title>
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="https://api.iconify.design/ri/information-line.svg" alt="信息" width="16" height="16" style="filter: drop-shadow(0 0 4px var(--ex-color-primary));" />
        <span>自定义标题</span>
      </div>
    </template>
    <template #content>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <p style="margin: 0;">这是自定义的内容区域</p>
        <div style="display: flex; gap: 8px;">
          <ExButton size="small" type="primary">确定</ExButton>
          <ExButton size="small">取消</ExButton>
        </div>
      </div>
    </template>
    <ExButton type="primary">自定义内容</ExButton>
  </ExPopover>
</div>

```vue
<template>
  <ExPopover>
    <template #title>
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="icon.svg" alt="图标" width="16" height="16" />
        <span>自定义标题</span>
      </div>
    </template>
    <template #content>
      <div>
        <p>这是自定义的内容区域</p>
        <div>
          <ExButton size="small" type="primary">确定</ExButton>
          <ExButton size="small">取消</ExButton>
        </div>
      </div>
    </template>
    <ExButton type="primary">自定义内容</ExButton>
  </ExPopover>
</template>
```

## 自定义宽度

通过 `width` 属性可以设置气泡卡片的宽度。

<div class="demo-container">
  <ExPopover content="默认宽度的气泡卡片" title="默认宽度">
    <ExButton>默认宽度</ExButton>
  </ExPopover>
  <ExPopover :width="300" content="自定义宽度 300px 的气泡卡片" title="300px">
    <ExButton>宽度 300px</ExButton>
  </ExPopover>
  <ExPopover width="400px" content="自定义宽度 400px 的气泡卡片" title="400px">
    <ExButton>宽度 400px</ExButton>
  </ExPopover>
</div>

```vue
<template>
  <ExPopover content="默认宽度的气泡卡片" title="默认宽度">
    <ExButton>默认宽度</ExButton>
  </ExPopover>

  <ExPopover :width="300" content="自定义宽度 300px 的气泡卡片" title="300px">
    <ExButton>宽度 300px</ExButton>
  </ExPopover>
</template>
```

## 手动控制

通过 `v-model` 可以手动控制气泡卡片的显示和隐藏。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start;">
  <div style="display: flex; gap: 12px;">
    <ExButton @click="visible = true">显示</ExButton>
    <ExButton @click="visible = false">隐藏</ExButton>
  </div>
  <ExPopover content="手动控制的气泡卡片" title="手动控制" v-model="visible" trigger="manual">
    <ExButton>目标元素</ExButton>
  </ExPopover>
</div>

```vue
<script setup>
import { ref } from 'vue';

const visible = ref(false);
</script>

<template>
  <ExButton @click="visible = true">显示</ExButton>
  <ExButton @click="visible = false">隐藏</ExButton>

  <ExPopover content="手动控制的气泡卡片" title="手动控制" v-model="visible" trigger="manual">
    <ExButton>目标元素</ExButton>
  </ExPopover>
</template>
```

## 赛博朋克主题示例

展示赛博朋克场景中的气泡卡片应用。

<div class="demo-container" style="display: flex; gap: 12px; flex-wrap: wrap;">
  <ExPopover placement="top" :width="280">
    <template #title>
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="https://api.iconify.design/ri/user-line.svg" alt="玩家" width="16" height="16" style="filter: drop-shadow(0 0 4px var(--ex-color-primary));" />
        <span>玩家信息</span>
      </div>
    </template>
    <template #content>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <ExAvatar size="large">P1</ExAvatar>
          <div>
            <div style="font-weight: bold; color: var(--ex-color-primary);">Player001</div>
            <div style="font-size: 12px; color: var(--ex-color-text-tertiary);">等级 50 • 战士</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px; font-size: 12px;">
          <ExBadge :count="850" type="primary">
            <span style="padding: 4px 8px; background: var(--ex-color-bg-tertiary); border-radius: 4px;">胜场</span>
          </ExBadge>
          <ExBadge :count="120" type="success">
            <span style="padding: 4px 8px; background: var(--ex-color-bg-tertiary); border-radius: 4px;">成就</span>
          </ExBadge>
        </div>
      </div>
    </template>
    <ExButton type="primary">
      <template #prefix>
        <img src="https://api.iconify.design/ri/user-line.svg" alt="玩家" width="16" height="16" />
      </template>
      玩家信息
    </ExButton>
  </ExPopover>
  <ExPopover placement="top" :width="300">
    <template #title>
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="https://api.iconify.design/ri/trophy-line.svg" alt="成就" width="16" height="16" style="filter: drop-shadow(0 0 4px var(--ex-color-warning));" />
        <span>最新成就</span>
      </div>
    </template>
    <template #content>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="padding: 8px; background: var(--ex-color-bg-tertiary); border-radius: 4px; border-left: 3px solid var(--ex-color-warning);">
          <div style="font-weight: bold; color: var(--ex-color-warning);">🏆 战场老兵</div>
          <div style="font-size: 12px; margin-top: 4px;">完成 100 场对战</div>
        </div>
        <div style="padding: 8px; background: var(--ex-color-bg-tertiary); border-radius: 4px; border-left: 3px solid var(--ex-color-success);">
          <div style="font-weight: bold; color: var(--ex-color-success);">⭐ 连胜大师</div>
          <div style="font-size: 12px; margin-top: 4px;">达成 10 连胜</div>
        </div>
      </div>
    </template>
    <ExButton type="warning">
      <template #prefix>
        <img src="https://api.iconify.design/ri/trophy-line.svg" alt="成就" width="16" height="16" />
      </template>
      成就系统
    </ExButton>
  </ExPopover>
</div>

```vue
<template>
  <ExPopover placement="top" :width="280">
    <template #title>
      <div style="display: flex; align-items: center; gap: 8px;">
        <img src="icon.svg" alt="玩家" width="16" height="16" />
        <span>玩家信息</span>
      </div>
    </template>
    <template #content>
      <div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <ExAvatar size="large">P1</ExAvatar>
          <div>
            <div>Player001</div>
            <div>等级 50 • 战士</div>
          </div>
        </div>
      </div>
    </template>
    <ExButton type="primary">玩家信息</ExButton>
  </ExPopover>
</template>
```

## API

### Popover Props

| 参数           | 说明             | 类型                                                                                                                                                                 | 默认值              |
| -------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `title`        | 标题             | `string`                                                                                                                                                             | —                   |
| `content`      | 内容             | `string`                                                                                                                                                             | —                   |
| `placement`    | 出现位置         | `'top' \| 'top-start' \| 'top-end' \| 'bottom' \| 'bottom-start' \| 'bottom-end' \| 'left' \| 'left-start' \| 'left-end' \| 'right' \| 'right-start' \| 'right-end'` | `'top'`             |
| `trigger`      | 触发方式         | `'hover' \| 'click' \| 'focus' \| 'manual'`                                                                                                                          | `'click'`           |
| `show-arrow`   | 是否显示箭头     | `boolean`                                                                                                                                                            | `true`              |
| `disabled`     | 是否禁用         | `boolean`                                                                                                                                                            | `false`             |
| `offset`       | 偏移量（像素）   | `number`                                                                                                                                                             | `12`                |
| `width`        | 宽度             | `string \| number`                                                                                                                                                   | `'auto'`            |
| `transition`   | 过渡动画名称     | `string`                                                                                                                                                             | `'ex-popover-fade'` |
| `open-delay`   | 延迟显示（毫秒） | `number`                                                                                                                                                             | `0`                 |
| `close-delay`  | 延迟隐藏（毫秒） | `number`                                                                                                                                                             | `200`               |
| `custom-class` | 自定义类名       | `string`                                                                                                                                                             | —                   |
| `z-index`      | 层级             | `number`                                                                                                                                                             | `2000`              |
| `v-model`      | 手动控制显示     | `boolean`                                                                                                                                                            | —                   |
| `aria-label`   | 无障碍标签       | `string`                                                                                                                                                             | —                   |

### Popover Events

| 事件名               | 说明                                 | 类型                       |
| -------------------- | ------------------------------------ | -------------------------- |
| `update:model-value` | 显示状态变化时触发（配合 `v-model`） | `(value: boolean) => void` |
| `show`               | 显示时触发                           | `() => void`               |
| `hide`               | 隐藏时触发                           | `() => void`               |

### Popover Slots

| 插槽名    | 说明       |
| --------- | ---------- |
| `default` | 触发元素   |
| `title`   | 自定义标题 |
| `content` | 自定义内容 |

### Popover Methods

| 方法名           | 说明         | 类型         |
| ---------------- | ------------ | ------------ |
| `show`           | 显示气泡卡片 | `() => void` |
| `hide`           | 隐藏气泡卡片 | `() => void` |
| `updatePosition` | 更新位置     | `() => void` |

## 与 Tooltip 的区别

- **Tooltip**：轻量级，用于简短的文字提示，默认悬停触发
- **Popover**：功能更丰富，可以承载复杂内容（如表单、列表等），默认点击触发

## 无障碍支持

- 使用 `role="dialog"` 标记气泡卡片
- 完整的 ARIA 属性支持
- 支持键盘导航
- 支持屏幕阅读器
- 点击外部自动关闭

## 受控 / 非受控

默认由 `trigger`（click / hover / focus）非受控地控制显隐，也支持 `v-model` 手动控制：

```vue
<template>
  <ExPopover v-model="open" title="标题" content="内容">
    <ExButton>点我</ExButton>
  </ExPopover>
</template>

<script setup>
import { ref } from 'vue';
const open = ref(false);
</script>
```

## 常见问题

**Q：`trigger="focus"` 不生效？**
已修复。组件监听会冒泡的 `focusin/focusout`，聚焦插槽内可聚焦元素即触发。

**Q：气泡会超出屏幕吗？**
内置主轴翻转 + 视口夹取，空间不足时自动翻到对侧并收拢到可视区域内。

**Q：点击气泡内部会关闭吗？**
不会。仅点击触发器外部（`click` 触发时）才关闭，气泡内部交互不受影响。

**Q：和 Tooltip 怎么选？**
简短文字提示用 [Tooltip](/components/tooltip)；需要标题、富文本或可交互内容用 Popover。

## 最佳实践

- **承载可交互内容**（菜单、表单、说明卡片）是 Popover 的主场；纯文字提示用 Tooltip。
- **默认点击触发**更符合"展开面板"语义；hover 触发适合预览类内容。
- 用 `width` 约束内容宽度，避免长文本撑满屏幕。
- 触发元素保持可聚焦，以支持键盘与读屏。

## 主题定制

Popover 不定义独立的组件级变量，而是消费 ExUI 全局设计令牌。定制方式：

- **单个实例**：用 `custom-class` / `custom-style` 定制。
- **全局**：覆盖其消费的全局令牌：

```css
:root {
  --ex-color-bg-elevated: #11151c; /* 气泡背景 */
  --ex-color-border-primary: #1f2a37; /* 边框 */
  --ex-shadow-xl: 0 12px 32px rgba(0, 0, 0, 0.55); /* 投影 */
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
</style>
