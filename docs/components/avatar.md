# Avatar 头像

支持图片、图标、文字和头像组。头像默认是展示内容；需要点击交互时显式设置 `clickable`，组件会切换为原生 `button` 语义。

<script setup>
const avatarImage = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#8b5cf6"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>
    <rect width="160" height="160" fill="url(#g)"/>
    <circle cx="80" cy="62" r="30" fill="white" opacity=".9"/>
    <path d="M28 148c5-34 25-51 52-51s47 17 52 51" fill="white" opacity=".9"/>
  </svg>
`)}`
</script>

## 头像类型

图标始终在头像容器中水平、垂直居中。文字头像只展示第一个完整字形。

::: raw

<div class="vp-raw demo-container avatar-row">
  <div class="avatar-example">
    <ex-avatar :src="avatarImage" alt="客户经理头像" :size="56" />
    <span>图片</span>
  </div>
  <div class="avatar-example">
    <ex-avatar :size="56" aria-label="用户图标头像">
      <template #icon><ex-icon icon="user-line" :size="26" /></template>
    </ex-avatar>
    <span>图标</span>
  </div>
  <div class="avatar-example">
    <ex-avatar text="王小明" :size="56" background-color="#2563eb" text-color="#fff" />
    <span>文字“王”</span>
  </div>
  <div class="avatar-example">
    <ex-avatar text="👩‍💻开发者" :size="56" background-color="#7c3aed" text-color="#fff" />
    <span>完整表情</span>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<ex-avatar :src="avatarImage" alt="客户经理头像" :size="56" />
<ex-avatar :size="56" aria-label="用户图标头像">
  <template #icon><ex-icon icon="user-line" :size="26" /></template>
</ex-avatar>
<ex-avatar text="王小明" :size="56" background-color="#2563eb" text-color="#fff" />
<ex-avatar text="👩‍💻开发者" :size="56" background-color="#7c3aed" text-color="#fff" />
```

:::

## 尺寸与形状

::: raw

<div class="vp-raw demo-container avatar-row avatar-row--center">
  <ex-avatar text="小" size="small" />
  <ex-avatar text="中" size="medium" />
  <ex-avatar text="大" size="large" />
  <ex-avatar text="64" :size="64" />
  <ex-avatar text="方" shape="square" :size="56" />
</div>
:::

::: details 查看示例代码

```vue
<ex-avatar text="小" size="small" />
<ex-avatar text="中" size="medium" />
<ex-avatar text="大" size="large" />
<ex-avatar text="64" :size="64" />
<ex-avatar text="方" shape="square" :size="56" />
```

:::

## 加载失败

失败状态提供可点击的重试按钮，也可通过 `error` 插槽替换内容。

::: raw

<div class="vp-raw demo-container avatar-row">
  <ex-avatar src="data:image/png;base64,invalid-avatar" alt="加载失败头像" :size="56">
    <template #error><ex-icon icon="refresh-line" :size="22" /></template>
  </ex-avatar>
</div>
:::

::: details 查看示例代码

```vue
<ex-avatar src="data:image/png;base64,invalid-avatar" alt="加载失败头像" :size="56">
  <template #error><ex-icon icon="refresh-line" :size="22" /></template>
</ex-avatar>
```

:::

## 头像组

::: raw

<div class="vp-raw demo-container">
  <ex-avatar-group
    :max-count="4"
    :size="44"
    spacing="-10px"
    aria-label="项目成员"
  >
    <ex-avatar text="林" background-color="#2563eb" text-color="#fff" />
    <ex-avatar text="周" background-color="#7c3aed" text-color="#fff" />
    <ex-avatar text="陈" background-color="#0891b2" text-color="#fff" />
    <ex-avatar text="许" background-color="#059669" text-color="#fff" />
    <ex-avatar text="顾" background-color="#d97706" text-color="#fff" />
    <ex-avatar text="宋" background-color="#dc2626" text-color="#fff" />
  </ex-avatar-group>
</div>
:::

::: details 查看示例代码

```vue
<ex-avatar-group :max-count="4" :size="44" spacing="-10px" aria-label="项目成员">
  <ex-avatar text="林" background-color="#2563eb" text-color="#fff" />
  <ex-avatar text="周" background-color="#7c3aed" text-color="#fff" />
  <ex-avatar text="陈" background-color="#0891b2" text-color="#fff" />
  <ex-avatar text="许" background-color="#059669" text-color="#fff" />
  <ex-avatar text="顾" background-color="#d97706" text-color="#fff" />
  <ex-avatar text="宋" background-color="#dc2626" text-color="#fff" />
</ex-avatar-group>
```

:::

`spacing` 表示相邻头像之间的实际间距，负值表示头像重叠；头像组会使用 `role="group"` 和可配置的无障碍名称。

## Avatar API

### Props

| 参数              | 说明                                          | 类型                                 | 默认值           |
| ----------------- | --------------------------------------------- | ------------------------------------ | ---------------- |
| `size`            | 预设尺寸或像素值                              | `small \| medium \| large \| number` | 继承全局尺寸     |
| `shape`           | 形状                                          | `circle \| square`                   | `circle`         |
| `clickable`       | 是否启用点击交互；启用后根节点为原生 `button` | `boolean`                            | `false`          |
| `src`             | 图片地址                                      | `string`                             | —                |
| `srcset`          | 原生图片候选集                                | `string`                             | —                |
| `sizes`           | 响应式图片尺寸描述                            | `string`                             | —                |
| `alt`             | 图片替代文本；传入空字符串可标记为装饰图片    | `string`                             | 当前语言的“头像” |
| `loading`         | 图片加载策略                                  | `eager \| lazy`                      | `eager`          |
| `decoding`        | 图片解码策略                                  | `sync \| async \| auto`              | `async`          |
| `referrerPolicy`  | 图片引用策略                                  | `ReferrerPolicy`                     | —                |
| `text`            | 文字内容，仅展示首个完整字形                  | `string`                             | —                |
| `backgroundColor` | 背景色                                        | `string`                             | —                |
| `textColor`       | 文字颜色                                      | `string`                             | —                |
| `draggable`       | 图片是否可拖拽                                | `boolean`                            | `false`          |
| `crossOrigin`     | 图片跨域模式                                  | `anonymous \| use-credentials \| ''` | —                |
| `ariaLabel`       | 无障碍名称                                    | `string`                             | —                |
| `title`           | 原生提示文本                                  | `string`                             | —                |

### Events

| 事件名  | 参数                                                   |
| ------- | ------------------------------------------------------ |
| `load`  | `(event: Event)`                                       |
| `error` | `(event: Event)`                                       |
| `click` | `(event: MouseEvent)`；仅 `clickable` 为 `true` 时触发 |

### Slots

| 名称      | 说明             |
| --------- | ---------------- |
| `default` | 自定义内容       |
| `icon`    | 图标头像内容     |
| `error`   | 图片失败状态内容 |

### Exposes

| 方法         | 类型                        |
| ------------ | --------------------------- |
| `getElement` | `() => HTMLElement \| null` |
| `reload`     | `() => void`                |

## AvatarGroup API

| 参数        | 说明                           | 类型                                            | 默认值             |
| ----------- | ------------------------------ | ----------------------------------------------- | ------------------ |
| `maxCount`  | 最大可见头像数                 | `number`                                        | 不限制             |
| `maxStyle`  | 溢出计数头像样式               | `Record<string, string \| number>`              | —                  |
| `ariaLabel` | 头像组无障碍名称               | `string`                                        | 当前语言的“头像组” |
| `size`      | 头像尺寸                       | `AvatarSize`                                    | 继承全局尺寸       |
| `shape`     | 头像形状                       | `circle \| square`                              | `circle`           |
| `spacing`   | 相邻头像实际间距；负值表示重叠 | `number \| string`                              | `8px`              |
| `class`     | 自定义 CSS 类名                | `string \| string[] \| Record<string, boolean>` | —                  |
| `style`     | 自定义内联样式                 | `string \| Record<string, string \| number>`    | —                  |

事件：`overflow-click(count)`。

AvatarGroup 支持 `default` 插槽传入头像，以及 `avatar` 插槽对每个可见头像进行包装或替换。

<style scoped>
.avatar-row {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
}

.avatar-row--center {
  align-items: center;
}

.avatar-example {
  display: grid;
  gap: 8px;
  justify-items: center;
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-sm);
}
</style>
