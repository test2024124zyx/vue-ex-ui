# Drawer 抽屉

屏幕边缘滑出的浮层面板，用于展示详细信息或进行复杂操作。带有霓虹发光效果的赛博朋克主题抽屉组件。

<script setup>
import { ref } from 'vue'

const visible1 = ref(false)
const visible2 = ref(false)
const visible3 = ref(false)
const visible4 = ref(false)
const visibleLeft = ref(false)
const visibleRight = ref(false)
const visibleTop = ref(false)
const visibleBottom = ref(false)
const visibleSmall = ref(false)
const visibleMedium = ref(false)
const visibleLarge = ref(false)
const visibleCustom = ref(false)
const visibleFooter = ref(false)
const visibleNoMask = ref(false)
const visibleNoClose = ref(false)
const visibleDestroy = ref(false)
const visibleGame = ref(false)

const handleOk = () => {
  console.log('确认')
  visibleFooter.value = false
}

const handleCancel = () => {
  console.log('取消')
}
</script>

## 基础用法

最简单的用法，通过 `v-model` 控制抽屉的显示和隐藏。

<div class="demo-container">
  <ExButton type="primary" @click="visible1 = true">打开抽屉</ExButton>
  <ExDrawer v-model="visible1" title="基础抽屉">
    <p>这是抽屉的内容</p>
    <p>可以放置任何内容</p>
  </ExDrawer>
</div>

```vue
<script setup>
import { ref } from 'vue';

const visible = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="visible = true"
  >
    打开抽屉
  </ExButton>
  <ExDrawer
    v-model="visible"
    title="基础抽屉"
  >
    <p>这是抽屉的内容</p>
    <p>可以放置任何内容</p>
  </ExDrawer>
</template>
```

## 不同方向

通过 `placement` 属性可以设置抽屉从不同方向滑出。

<div class="demo-container">
  <ExButton @click="visibleLeft = true">从左侧打开</ExButton>
  <ExButton @click="visibleRight = true">从右侧打开</ExButton>
  <ExButton @click="visibleTop = true">从顶部打开</ExButton>
  <ExButton @click="visibleBottom = true">从底部打开</ExButton>
  <ExDrawer v-model="visibleLeft" title="左侧抽屉" placement="left">
    <p>从左侧滑出的抽屉</p>
  </ExDrawer>
  <ExDrawer v-model="visibleRight" title="右侧抽屉" placement="right">
    <p>从右侧滑出的抽屉</p>
  </ExDrawer>
  <ExDrawer v-model="visibleTop" title="顶部抽屉" placement="top">
    <p>从顶部滑出的抽屉</p>
  </ExDrawer>
  <ExDrawer v-model="visibleBottom" title="底部抽屉" placement="bottom">
    <p>从底部滑出的抽屉</p>
  </ExDrawer>
</div>

```vue
<script setup>
import { ref } from 'vue';

const visibleLeft = ref(false);
const visibleRight = ref(false);
const visibleTop = ref(false);
const visibleBottom = ref(false);
</script>

<template>
  <ExButton @click="visibleLeft = true">从左侧打开</ExButton>
  <ExButton @click="visibleRight = true">从右侧打开</ExButton>
  <ExButton @click="visibleTop = true">从顶部打开</ExButton>
  <ExButton @click="visibleBottom = true">从底部打开</ExButton>

  <ExDrawer
    v-model="visibleLeft"
    title="左侧抽屉"
    placement="left"
  >
    <p>从左侧滑出的抽屉</p>
  </ExDrawer>

  <ExDrawer
    v-model="visibleRight"
    title="右侧抽屉"
    placement="right"
  >
    <p>从右侧滑出的抽屉</p>
  </ExDrawer>

  <ExDrawer
    v-model="visibleTop"
    title="顶部抽屉"
    placement="top"
  >
    <p>从顶部滑出的抽屉</p>
  </ExDrawer>

  <ExDrawer
    v-model="visibleBottom"
    title="底部抽屉"
    placement="bottom"
  >
    <p>从底部滑出的抽屉</p>
  </ExDrawer>
</template>
```

## 不同尺寸

通过 `size` 属性可以设置抽屉的尺寸，支持预设尺寸和自定义尺寸。

<div class="demo-container">
  <ExButton @click="visibleSmall = true">小尺寸</ExButton>
  <ExButton @click="visibleMedium = true">中等尺寸</ExButton>
  <ExButton @click="visibleLarge = true">大尺寸</ExButton>
  <ExButton @click="visibleCustom = true">自定义尺寸</ExButton>
  <ExDrawer v-model="visibleSmall" title="小尺寸抽屉" size="small">
    <p>宽度 300px</p>
  </ExDrawer>
  <ExDrawer v-model="visibleMedium" title="中等尺寸抽屉" size="medium">
    <p>宽度 500px（默认）</p>
  </ExDrawer>
  <ExDrawer v-model="visibleLarge" title="大尺寸抽屉" size="large">
    <p>宽度 800px</p>
  </ExDrawer>
  <ExDrawer v-model="visibleCustom" title="自定义尺寸抽屉" :size="600">
    <p>自定义宽度 600px</p>
  </ExDrawer>
</div>

```vue
<script setup>
import { ref } from 'vue';

const visibleSmall = ref(false);
const visibleMedium = ref(false);
const visibleLarge = ref(false);
const visibleCustom = ref(false);
</script>

<template>
  <ExButton @click="visibleSmall = true">小尺寸</ExButton>
  <ExButton @click="visibleMedium = true">中等尺寸</ExButton>
  <ExButton @click="visibleLarge = true">大尺寸</ExButton>
  <ExButton @click="visibleCustom = true">自定义尺寸</ExButton>

  <ExDrawer
    v-model="visibleSmall"
    title="小尺寸抽屉"
    size="small"
  >
    <p>宽度 300px</p>
  </ExDrawer>

  <ExDrawer
    v-model="visibleMedium"
    title="中等尺寸抽屉"
    size="medium"
  >
    <p>宽度 500px（默认）</p>
  </ExDrawer>

  <ExDrawer
    v-model="visibleLarge"
    title="大尺寸抽屉"
    size="large"
  >
    <p>宽度 800px</p>
  </ExDrawer>

  <ExDrawer
    v-model="visibleCustom"
    title="自定义尺寸抽屉"
    :size="600"
  >
    <p>自定义宽度 600px</p>
  </ExDrawer>
</template>
```

## 带底部操作栏

通过 `show-footer` 属性可以显示底部操作栏。

<div class="demo-container">
  <ExButton type="primary" @click="visibleFooter = true">打开抽屉</ExButton>
  <ExDrawer 
    v-model="visibleFooter" 
    title="带底部操作栏的抽屉"
    show-footer
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <p>这是抽屉的内容</p>
    <p>点击确定或取消按钮</p>
  </ExDrawer>
</div>

```vue
<script setup>
import { ref } from 'vue';

const visible = ref(false);

const handleOk = () => {
  console.log('确认');
  visible.value = false;
};

const handleCancel = () => {
  console.log('取消');
};
</script>

<template>
  <ExButton
    type="primary"
    @click="visible = true"
  >
    打开抽屉
  </ExButton>
  <ExDrawer
    v-model="visible"
    title="带底部操作栏的抽屉"
    show-footer
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <p>这是抽屉的内容</p>
  </ExDrawer>
</template>
```

## 无遮罩层

通过 `mask` 属性可以控制是否显示遮罩层。

<div class="demo-container">
  <ExButton @click="visibleNoMask = true">打开无遮罩抽屉</ExButton>
  <ExDrawer v-model="visibleNoMask" title="无遮罩层抽屉" :mask="false">
    <p>没有遮罩层的抽屉</p>
  </ExDrawer>
</div>

```vue
<script setup>
import { ref } from 'vue';

const visible = ref(false);
</script>

<template>
  <ExButton @click="visible = true">打开无遮罩抽屉</ExButton>
  <ExDrawer
    v-model="visible"
    title="无遮罩层抽屉"
    :mask="false"
  >
    <p>没有遮罩层的抽屉</p>
  </ExDrawer>
</template>
```

## 禁止点击遮罩关闭

通过 `mask-closable` 属性可以控制点击遮罩层是否关闭抽屉。

<div class="demo-container">
  <ExButton @click="visibleNoClose = true">打开抽屉</ExButton>
  <ExDrawer v-model="visibleNoClose" title="禁止点击遮罩关闭" :mask-closable="false">
    <p>点击遮罩层不会关闭抽屉</p>
    <p>只能通过关闭按钮关闭</p>
  </ExDrawer>
</div>

```vue
<script setup>
import { ref } from 'vue';

const visible = ref(false);
</script>

<template>
  <ExButton @click="visible = true">打开抽屉</ExButton>
  <ExDrawer
    v-model="visible"
    title="禁止点击遮罩关闭"
    :mask-closable="false"
  >
    <p>点击遮罩层不会关闭抽屉</p>
  </ExDrawer>
</template>
```

## 销毁子元素

通过 `destroy-on-close` 属性可以在关闭时销毁子元素。

<div class="demo-container">
  <ExButton @click="visibleDestroy = true">打开抽屉</ExButton>
  <ExDrawer v-model="visibleDestroy" title="销毁子元素" destroy-on-close>
    <p>关闭时会销毁这些内容</p>
    <p>{{ new Date().toLocaleTimeString() }}</p>
  </ExDrawer>
</div>

```vue
<script setup>
import { ref } from 'vue';

const visible = ref(false);
</script>

<template>
  <ExButton @click="visible = true">打开抽屉</ExButton>
  <ExDrawer
    v-model="visible"
    title="销毁子元素"
    destroy-on-close
  >
    <p>关闭时会销毁这些内容</p>
    <p>{{ new Date().toLocaleTimeString() }}</p>
  </ExDrawer>
</template>
```

## 主题示例

抽屉应用。

<div class="demo-container">
  <ExButton type="primary" @click="visibleGame = true">
    <template #prefix>
      <img src="https://api.iconify.design/ri/user-settings-line.svg" alt="设置" width="16" height="16" />
    </template>
    角色设置
  </ExButton>
  <ExDrawer 
    v-model="visibleGame" 
    title="🎮 角色设置"
    size="large"
    show-footer
  >
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <h3 style="margin: 0 0 12px; color: var(--ex-color-primary);">基础属性</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
              <img src="https://api.iconify.design/ri/heart-fill.svg" alt="生命值" width="16" height="16" style="vertical-align: middle; margin-right: 4px; filter: drop-shadow(0 0 4px #ef4444);" />
              生命值
            </div>
            <ExProgress :percentage="85" color="#ef4444" :stroke-width="16" text-inside striped striped-flow />
          </div>
          <div>
            <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
              <img src="https://api.iconify.design/ri/flashlight-fill.svg" alt="能量值" width="16" height="16" style="vertical-align: middle; margin-right: 4px; filter: drop-shadow(0 0 4px #3b82f6);" />
              能量值
            </div>
            <ExProgress :percentage="60" color="#3b82f6" :stroke-width="16" text-inside striped striped-flow />
          </div>
          <div>
            <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">
              <img src="https://api.iconify.design/ri/shield-fill.svg" alt="护盾值" width="16" height="16" style="vertical-align: middle; margin-right: 4px; filter: drop-shadow(0 0 4px #10b981);" />
              护盾值
            </div>
            <ExProgress :percentage="40" color="#10b981" :stroke-width="16" text-inside striped striped-flow />
          </div>
        </div>
      </div>
      <div>
        <h3 style="margin: 0 0 12px; color: var(--ex-color-primary);">技能配置</h3>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
          <ExCard hoverable style="text-align: center; padding: 16px;">
            <img src="https://api.iconify.design/ri/sword-line.svg" alt="技能1" width="32" height="32" style="filter: drop-shadow(0 0 6px var(--ex-color-primary));" />
            <div style="margin-top: 8px; font-size: 12px;">攻击</div>
          </ExCard>
          <ExCard hoverable style="text-align: center; padding: 16px;">
            <img src="https://api.iconify.design/ri/shield-line.svg" alt="技能2" width="32" height="32" style="filter: drop-shadow(0 0 6px var(--ex-color-success));" />
            <div style="margin-top: 8px; font-size: 12px;">防御</div>
          </ExCard>
          <ExCard hoverable style="text-align: center; padding: 16px;">
            <img src="https://api.iconify.design/ri/flashlight-line.svg" alt="技能3" width="32" height="32" style="filter: drop-shadow(0 0 6px var(--ex-color-warning));" />
            <div style="margin-top: 8px; font-size: 12px;">技能</div>
          </ExCard>
          <ExCard hoverable style="text-align: center; padding: 16px;">
            <img src="https://api.iconify.design/ri/magic-line.svg" alt="技能4" width="32" height="32" style="filter: drop-shadow(0 0 6px var(--ex-color-danger));" />
            <div style="margin-top: 8px; font-size: 12px;">终极</div>
          </ExCard>
        </div>
      </div>
      <div>
        <h3 style="margin: 0 0 12px; color: var(--ex-color-primary);">装备栏</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <ExCard hoverable>
            <div style="padding: 12px; text-align: center;">
              <img src="https://api.iconify.design/ri/t-shirt-line.svg" alt="装备" width="24" height="24" style="filter: drop-shadow(0 0 4px var(--ex-color-primary));" />
              <div style="margin-top: 8px; font-size: 12px;">战甲</div>
            </div>
          </ExCard>
          <ExCard hoverable>
            <div style="padding: 12px; text-align: center;">
              <img src="https://api.iconify.design/ri/knife-line.svg" alt="装备" width="24" height="24" style="filter: drop-shadow(0 0 4px var(--ex-color-primary));" />
              <div style="margin-top: 8px; font-size: 12px;">武器</div>
            </div>
          </ExCard>
          <ExCard hoverable>
            <div style="padding: 12px; text-align: center;">
              <img src="https://api.iconify.design/ri/footprint-line.svg" alt="装备" width="24" height="24" style="filter: drop-shadow(0 0 4px var(--ex-color-primary));" />
              <div style="margin-top: 8px; font-size: 12px;">鞋子</div>
            </div>
          </ExCard>
        </div>
      </div>
    </div>
  </ExDrawer>
</div>

```vue
<script setup>
import { ref } from 'vue';

const visible = ref(false);
</script>

<template>
  <ExButton
    type="primary"
    @click="visible = true"
  >
    角色设置
  </ExButton>

  <ExDrawer
    v-model="visible"
    title="🎮 角色设置"
    size="large"
    show-footer
  >
    <!-- 角色设置内容 -->
  </ExDrawer>
</template>
```

## API

### Drawer Props

| 参数                    | 说明                     | 类型                                                                  | 默认值      |
| ----------------------- | ------------------------ | --------------------------------------------------------------------- | ----------- |
| `v-model`               | 是否显示抽屉             | `boolean`                                                             | `false`     |
| `title`                 | 抽屉标题                 | `string`                                                              | —           |
| `placement`             | 抽屉位置                 | `'left' \| 'right' \| 'top' \| 'bottom'`                              | `'right'`   |
| `size`                  | 抽屉尺寸                 | `'small' \| 'medium' \| 'large' \| 'extra-large' \| string \| number` | `'medium'`  |
| `closable`              | 是否显示关闭按钮         | `boolean`                                                             | `true`      |
| `mask`                  | 是否显示遮罩层           | `boolean`                                                             | `true`      |
| `mask-closable`         | 点击遮罩层是否关闭       | `boolean`                                                             | `true`      |
| `close-on-press-escape` | 按下 Escape 是否请求关闭 | `boolean`                                                             | `true`      |
| `destroy-on-close`      | 是否在关闭时销毁子元素   | `boolean`                                                             | `false`     |
| `show-footer`           | 是否显示底部操作栏       | `boolean`                                                             | `false`     |
| `ok-text`               | 确认按钮文字             | `string`                                                              | `'确定'`    |
| `cancel-text`           | 取消按钮文字             | `string`                                                              | `'取消'`    |
| `ok-type`               | 确认按钮类型             | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'`           | `'primary'` |
| `ok-loading`            | 确认按钮是否加载中       | `boolean`                                                             | `false`     |
| `ok-disabled`           | 是否禁用确认按钮         | `boolean`                                                             | `false`     |
| `cancel-disabled`       | 是否禁用取消按钮         | `boolean`                                                             | `false`     |
| `custom-class`          | 自定义类名               | `string`                                                              | —           |
| `custom-style`          | 自定义样式               | `string \| Record<string, string \| number>`                          | —           |
| `z-index`               | 层级                     | `number`                                                              | 全局层级    |
| `lock-scroll`           | 模态状态下是否锁定滚动   | `boolean`                                                             | `true`      |
| `before-open`           | 打开前的回调             | `() => boolean \| Promise<boolean>`                                   | —           |
| `before-close`          | 关闭前的回调             | `() => boolean \| Promise<boolean>`                                   | —           |
| `aria-label`            | 无障碍标签               | `string`                                                              | —           |

### Drawer Events

| 事件名               | 说明                                 | 类型                                                 |
| -------------------- | ------------------------------------ | ---------------------------------------------------- |
| `update:model-value` | 显示状态变化时触发（配合 `v-model`） | `(value: boolean) => void`                           |
| `open`               | 打开时触发                           | `() => void`                                         |
| `opened`             | 打开动画结束后触发                   | `() => void`                                         |
| `close`              | 关闭时触发                           | `() => void`                                         |
| `closed`             | 关闭动画结束后触发                   | `() => void`                                         |
| `guard-error`        | 打开或关闭守卫发生异常               | `(error: unknown, phase: 'open' \| 'close') => void` |
| `ok`                 | 点击确认按钮时触发                   | `() => void`                                         |
| `cancel`             | 点击取消按钮时触发                   | `() => void`                                         |

### Drawer Slots

| 插槽名    | 说明       |
| --------- | ---------- |
| `default` | 抽屉内容   |
| `title`   | 自定义标题 |
| `header`  | 自定义头部 |
| `footer`  | 自定义底部 |

### Drawer Methods

| 方法名       | 说明                   | 类型                           |
| ------------ | ---------------------- | ------------------------------ |
| `open`       | 打开抽屉               | `() => void`                   |
| `close`      | 经关闭守卫请求关闭抽屉 | `() => Promise<boolean>`       |
| `getElement` | 获取抽屉DOM元素        | `() => HTMLDivElement \| null` |

## 无障碍支持

- 使用 `role="dialog"`；仅有遮罩时声明 `aria-modal="true"`
- 支持通过 `close-on-press-escape` 独立配置 Escape 关闭
- 完整的 ARIA 属性支持
- 支持屏幕阅读器
- 自动锁定和恢复页面滚动

## 受控 / 非受控

Drawer 通过 `v-model`（`modelValue`）受控：

```vue
<template>
  <ExButton @click="open = true">打开抽屉</ExButton>
  <ExDrawer
    v-model="open"
    title="详情"
    placement="right"
  >
    内容
  </ExDrawer>
</template>

<script setup>
import { ref } from 'vue';
const open = ref(false);
</script>
```

- **拦截关闭**：`before-close` 返回 `false` 阻止关闭，且不会造成 `modelValue` 与内部状态脱钩（关闭请求统一经守卫处理）。
- **拦截打开**：`before-open` 返回 `false` 阻止打开并回写 `modelValue`，适合打开前做权限/数据校验。

## 常见问题

**Q：打开后键盘 Tab 会跑到背景内容吗？**
不会。抽屉打开后自动聚焦首个可聚焦元素，Tab/Shift+Tab 锁定在抽屉内，关闭后焦点归还触发元素。

**Q：`before-close` 返回 false 后抽屉再也关不掉？**
不会（这是早期版本的缺陷，现已修复）。守卫仅在「请求关闭」时执行，`modelValue` 始终是唯一事实来源。

**Q：移动端抽屉怎么做？**
窄屏建议 `placement="bottom"` 并用百分比尺寸，如 `size="60%"`，更贴合移动端交互习惯。

**Q：如何做无遮罩的常驻侧栏？**
设置 `:mask="false"`；此时 `aria-modal` 也会相应变为非模态。

## 最佳实践

- **详情查看 / 侧边表单**优先用 Drawer，主区域上下文不被完全遮挡。
- **尺寸**用预设（`small/medium/large`）或百分比/像素自定义，避免在小屏溢出。
- **底部操作栏**用 `show-footer` + `ok-loading` 表达提交加载态。
- 始终提供 `title` 或 `aria-label` 以满足无障碍。

## 主题定制

Drawer 不定义独立的组件级变量，而是消费 ExUI 全局设计令牌。定制方式：

- **单个实例**：用 `custom-class` / `custom-style` 定制。
- **全局**：覆盖所消费的全局令牌：

```css
:root {
  --ex-color-bg-elevated: #11151c; /* 抽屉背景 */
  --ex-color-border-primary: #1f2a37; /* 边框 */
  --ex-shadow-2xl: 0 20px 60px rgba(0, 0, 0, 0.6); /* 抽屉投影 */
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
