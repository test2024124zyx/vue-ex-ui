# ExUI 基础组件使用指南

> 基于 vue3 赛博朋克主题风格的 Vue3 组件库

## 🎮 设计理念

ExUI 采用霓虹蓝紫双色主题，营造沉浸式氛围：

- **主色调**: 霓虹蓝 (#00f0ff) + 霓虹粉 (#ff007f)
- **背景色**: 深黑 (#0a0a0a) + 渐变背景
- **特效**: 发光效果、渐变动画、流畅过渡

---

## 📦 组件总览

### 1. ExTypography - 文本组件

用于展示各种文本内容，支持多种变体和样式。

#### 基础用法

```vue
<template>
  <ex-typography
    variant="heading"
    size="xl"
  >
    游戏标题
  </ex-typography>

  <ex-typography
    variant="body"
    color="text-secondary"
  >
    这是一段描述文本
  </ex-typography>
</template>
```

#### Props

| 属性     | 类型                                                                     | 默认值           | 说明         |
| -------- | ------------------------------------------------------------------------ | ---------------- | ------------ |
| variant  | `'display' \| 'heading' \| 'title' \| 'body' \| 'caption' \| 'overline'` | `'body'`         | 文本变体     |
| size     | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl' \| '4xl'`        | `'md'`           | 文本大小     |
| color    | `string`                                                                 | `'text-primary'` | 文本颜色     |
| gradient | `boolean`                                                                | `false`          | 渐变文字效果 |
| glow     | `boolean`                                                                | `false`          | 发光效果     |
| truncate | `boolean`                                                                | `false`          | 单行截断     |
| maxLines | `number`                                                                 | `1`              | 多行截断行数 |

#### 示例

```vue
<!-- 渐变标题 -->
<ex-typography variant="display" :gradient="true" :glow="true">
  CLUTCH ZONE
</ex-typography>

<!-- 多行截断 -->
<ex-typography :truncate="true" :max-lines="3">
  这是一段很长的文本内容...
</ex-typography>
```

---

### 2. ExEllipsis - 文本省略组件

支持多行文本截断和展开/收起功能。

#### 基础用法

```vue
<template>
  <ex-ellipsis
    :lines="3"
    :expandable="true"
    :tooltip="true"
  >
    这是一段很长的游戏介绍文本，当内容超过3行时会自动截断，
    并显示展开按钮。用户可以点击按钮查看完整内容。
  </ex-ellipsis>
</template>
```

#### Props

| 属性       | 类型      | 默认值  | 说明            |
| ---------- | --------- | ------- | --------------- |
| lines      | `number`  | `1`     | 显示行数        |
| expandable | `boolean` | `false` | 是否可展开      |
| tooltip    | `boolean` | `false` | 是否显示tooltip |
| ariaLabel  | `string`  | -       | 无障碍标签      |

#### 特性

- ✅ 霓虹蓝紫渐变按钮
- ✅ 发光效果动画
- ✅ 展开/收起图标旋转
- ✅ 移动端触摸优化

---

### 3. ExIcon - 图标组件

支持 SVG、字体图标、图片图标多种类型。

#### 基础用法

```vue
<template>
  <!-- SVG 图标 -->
  <ex-icon>
    <svg>...</svg>
  </ex-icon>

  <!-- 字体图标 -->
  <ex-icon
    name="ri:home-line"
    prefix="ri"
  />

  <!-- 图片图标 -->
  <ex-icon src="/path/to/icon.png" />

  <!-- 可点击图标 -->
  <ex-icon
    :clickable="true"
    :size="24"
    color="#00f0ff"
    @click="handleClick"
  />
</template>
```

#### Props

| 属性      | 类型               | 默认值  | 说明         |
| --------- | ------------------ | ------- | ------------ |
| name      | `string`           | -       | 字体图标名称 |
| prefix    | `string`           | -       | 字体图标前缀 |
| src       | `string`           | -       | 图片路径     |
| size      | `number \| string` | `16`    | 图标大小     |
| color     | `string`           | -       | 图标颜色     |
| clickable | `boolean`          | `false` | 是否可点击   |
| disabled  | `boolean`          | `false` | 是否禁用     |
| spin      | `boolean`          | `false` | 旋转动画     |
| rotate    | `number`           | `0`     | 旋转角度     |

---

### 4. ExButton - 按钮组件

赛博朋克风格按钮，支持多种类型和尺寸。

#### 基础用法

```vue
<template>
  <!-- 主要按钮 -->
  <ex-button
    type="primary"
    size="large"
  >
    开始游戏
  </ex-button>

  <!-- 带图标按钮 -->
  <ex-button type="success">
    <template #prefix>
      <ex-icon name="ri:play-fill" />
    </template>
    播放
  </ex-button>

  <!-- 圆形按钮 -->
  <ex-button
    shape="circle"
    type="primary"
    ariaLabel="添加"
  >
    <template #prefix>
      <ex-icon icon="add-line" />
    </template>
  </ex-button>

  <!-- 加载状态 -->
  <ex-button
    :loading="true"
    type="primary"
  >
    加载中...
  </ex-button>
</template>
```

#### Props

| 属性       | 类型                                                                                                                              | 默认值       | 说明                                       |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------ |
| type       | `'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger' \| 'error' \| 'info' \| 'text' \| 'link' \| 'ghost'` | `'default'`  | 按钮类型                                   |
| size       | `'small' \| 'medium' \| 'large'`                                                                                                  | 继承全局尺寸 | 按钮大小                                   |
| shape      | `'default' \| 'round' \| 'circle'`                                                                                                | `'default'`  | 按钮形状                                   |
| plain      | `boolean`                                                                                                                         | `false`      | 朴素按钮                                   |
| glow       | `boolean`                                                                                                                         | 按变体策略   | 是否启用强调发光（显式传值可覆盖默认策略） |
| disabled   | `boolean`                                                                                                                         | `false`      | 禁用状态                                   |
| loading    | `boolean`                                                                                                                         | `false`      | 加载状态                                   |
| block      | `boolean`                                                                                                                         | `false`      | 块级按钮                                   |
| nativeType | `'button' \| 'submit' \| 'reset'`                                                                                                 | `'button'`   | 原生按钮类型                               |
| autofocus  | `boolean`                                                                                                                         | `false`      | 是否自动聚焦                               |
| ariaLabel  | `string`                                                                                                                          | —            | 无障碍名称                                 |

#### 特性

- ✅ 主题 token 驱动的填充、描边和文本变体
- ✅ 可选发光与悬停流光反馈
- ✅ loading、disabled 和原生表单行为
- ✅ 触控尺寸与无障碍命名支持

---

### 5. ExBadge - 徽标组件

用于显示数字或状态标记。

#### 基础用法

```vue
<template>
  <!-- 数字徽标 -->
  <ex-badge :count="99">
    <ex-icon name="ri:notification-line" />
  </ex-badge>

  <!-- 状态点 -->
  <ex-badge
    :dot="true"
    type="danger"
  >
    <ex-avatar src="/avatar.jpg" />
  </ex-badge>

  <!-- 状态徽标 -->
  <ex-badge
    status="success"
    text="在线"
  />
</template>
```

#### Props

| 属性          | 类型                                                        | 默认值      | 说明         |
| ------------- | ----------------------------------------------------------- | ----------- | ------------ |
| count         | `number \| string`                                          | -           | 显示数字     |
| type          | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'` | 徽标类型     |
| size          | `'small' \| 'medium' \| 'large'`                            | `'medium'`  | 徽标大小     |
| dot           | `boolean`                                                   | `false`     | 显示为点     |
| status        | `'success' \| 'warning' \| 'error' \| 'default'`            | -           | 状态类型     |
| text          | `string`                                                    | -           | 状态文本     |
| overflowCount | `number`                                                    | `99`        | 最大显示数字 |
| showZero      | `boolean`                                                   | `false`     | 显示0        |

---

### 6. ExImage - 图片组件

支持懒加载、预览、错误处理的图片组件。

#### 基础用法

```vue
<template>
  <!-- 基础图片 -->
  <ex-image
    src="/path/to/image.jpg"
    alt="游戏截图"
    :width="300"
    :height="200"
    fit="cover"
  />

  <!-- 懒加载 + 预览 -->
  <ex-image
    src="/path/to/image.jpg"
    alt="游戏角色"
    :lazy="true"
    :preview="true"
    @preview="handlePreview"
  >
    <template #placeholder>
      <ex-loading />
    </template>
    <template #error>
      <div>加载失败</div>
    </template>
  </ex-image>

  <!-- 圆形图片 -->
  <ex-image
    src="/avatar.jpg"
    alt="用户头像"
    :width="100"
    :height="100"
    radius="50%"
  />
</template>
```

#### Props

| 属性    | 类型                                                       | 默认值    | 说明     |
| ------- | ---------------------------------------------------------- | --------- | -------- |
| src     | `string`                                                   | -         | 图片地址 |
| alt     | `string`                                                   | -         | 图片描述 |
| width   | `number \| string`                                         | -         | 图片宽度 |
| height  | `number \| string`                                         | -         | 图片高度 |
| fit     | `'fill' \| 'contain' \| 'cover' \| 'none' \| 'scale-down'` | `'cover'` | 填充模式 |
| lazy    | `boolean`                                                  | `true`    | 懒加载   |
| preview | `boolean`                                                  | `false`   | 预览模式 |
| radius  | `string`                                                   | -         | 圆角大小 |

#### 特性

- ✅ 霓虹边框渐变
- ✅ 加载动画 + 发光
- ✅ 错误状态提示
- ✅ hover 缩放效果

---

### 7. ExLink - 链接组件

支持多种类型和样式的链接组件。

#### 基础用法

```vue
<template>
  <!-- 基础链接 -->
  <ex-link href="https://example.com">访问官网</ex-link>

  <!-- 带图标链接 -->
  <ex-link
    type="primary"
    size="large"
  >
    <template #prefix>
      <ex-icon name="ri:link" />
    </template>
    游戏链接
  </ex-link>

  <!-- 外部链接 -->
  <ex-link
    href="https://external.com"
    target="_blank"
    :show-external-icon="true"
  >
    外部链接
  </ex-link>

  <!-- 站内链接使用解析后的原生地址 -->
  <ex-link href="/game/detail">游戏详情</ex-link>

  <!-- 无 href 时是不会提交表单的动作按钮 -->
  <ex-link
    type="primary"
    @click="openGame"
  >
    打开游戏
  </ex-link>
</template>
```

#### Props

| 属性             | 类型                                                                     | 默认值      | 说明             |
| ---------------- | ------------------------------------------------------------------------ | ----------- | ---------------- |
| type             | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` | 链接类型         |
| size             | `'small' \| 'medium' \| 'large'`                                         | `'medium'`  | 链接大小         |
| href             | `string`                                                                 | -           | 链接地址         |
| target           | `string`                                                                 | -           | 打开方式         |
| disabled         | `boolean`                                                                | `false`     | 禁用状态         |
| underline        | `boolean`                                                                | `true`      | 下划线           |
| showExternalIcon | `boolean`                                                                | `true`      | 显示外部链接图标 |

#### 特性

- ✅ 霓虹文字发光
- ✅ 下划线动画
- ✅ 外部链接图标
- ✅ 完整的类型系统

---

### 8. ExAvatar - 头像组件

支持图片、图标、文字多种模式的头像组件。

#### 基础用法

```vue
<template>
  <!-- 图片头像 -->
  <ex-avatar
    src="/avatar.jpg"
    alt="用户头像"
  />

  <!-- 文字头像 -->
  <ex-avatar
    text="张三"
    size="large"
  />

  <!-- 图标头像 -->
  <ex-avatar>
    <template #icon>
      <ex-icon name="ri:user-line" />
    </template>
  </ex-avatar>

  <!-- 自定义颜色 -->
  <ex-avatar
    text="VIP"
    background-color="#ff007f"
    text-color="#ffffff"
  />
</template>
```

#### Props

| 属性            | 类型                                       | 默认值     | 说明     |
| --------------- | ------------------------------------------ | ---------- | -------- |
| src             | `string`                                   | -          | 图片地址 |
| text            | `string`                                   | -          | 文字内容 |
| size            | `'small' \| 'medium' \| 'large' \| number` | `'medium'` | 头像大小 |
| shape           | `'circle' \| 'square'`                     | `'circle'` | 头像形状 |
| backgroundColor | `string`                                   | -          | 背景颜色 |
| textColor       | `string`                                   | -          | 文字颜色 |
| gap             | `number`                                   | `4`        | 文字间距 |

---

### 9. ExDivider - 分割线组件

支持水平/垂直、实线/虚线的分割线组件。

#### 基础用法

```vue
<template>
  <!-- 基础分割线 -->
  <ex-divider />

  <!-- 带文字分割线 -->
  <ex-divider orientation="center">游戏分类</ex-divider>

  <!-- 左对齐 -->
  <ex-divider orientation="left">热门游戏</ex-divider>

  <!-- 虚线 -->
  <ex-divider :dashed="true" />

  <!-- 垂直分割线 -->
  <ex-divider type="vertical" />
</template>
```

#### Props

| 属性        | 类型                                        | 默认值         | 说明       |
| ----------- | ------------------------------------------- | -------------- | ---------- |
| type        | `'horizontal' \| 'vertical'`                | `'horizontal'` | 分割线类型 |
| orientation | `'left' \| 'center' \| 'right'`             | `'center'`     | 文字对齐   |
| dashed      | `boolean`                                   | `false`        | 虚线样式   |
| size        | `'small' \| 'default' \| 'large' \| number` | `'default'`    | 分割线粗细 |
| plain       | `boolean`                                   | `false`        | 朴素样式   |
| margin      | `number \| string`                          | -              | 外边距     |
| color       | `string`                                    | -              | 分割线颜色 |

#### 特性

- ✅ 渐变分割线
- ✅ 霓虹发光效果 (hover)
- ✅ 文字发光动画
- ✅ 支持虚线样式

---

### 10. ExWatermark - 水印组件

用于页面内容保护的水印组件。

#### 基础用法

```vue
<template>
  <ex-watermark
    text="ExUI"
    :font-size="16"
    :opacity="0.15"
    :rotate="-22"
    :gap-x="100"
    :gap-y="100"
  >
    <div class="content">
      <!-- 需要添加水印的内容 -->
    </div>
  </ex-watermark>
</template>
```

#### Props

| 属性       | 类型      | 默认值               | 说明     |
| ---------- | --------- | -------------------- | -------- |
| text       | `string`  | `'EX-UI'`            | 水印文字 |
| fontSize   | `number`  | `16`                 | 字体大小 |
| fontFamily | `string`  | -                    | 字体     |
| fontColor  | `string`  | `'rgba(0,0,0,0.15)'` | 字体颜色 |
| opacity    | `number`  | `0.15`               | 透明度   |
| rotate     | `number`  | `-22`                | 旋转角度 |
| gapX       | `number`  | `100`                | 水平间距 |
| gapY       | `number`  | `100`                | 垂直间距 |
| offsetX    | `number`  | `0`                  | 水平偏移 |
| offsetY    | `number`  | `0`                  | 垂直偏移 |
| fullPage   | `boolean` | `false`              | 全屏水印 |

---

## 🎨 主题定制

### 颜色变量

```scss
:root {
  // 主色调
  --ex-color-neon-blue-500: #00f0ff;
  --ex-color-neon-pink-500: #ff007f;

  // 背景色
  --ex-color-bg-primary: #0a0a0a;
  --ex-color-bg-secondary: #1a1a1a;
  --ex-color-bg-tertiary: #2a2a2a;

  // 文本色
  --ex-color-text-primary: #ffffff;
  --ex-color-text-secondary: #e6f0ff;
  --ex-color-text-tertiary: #b3c7d9;
}
```

### 自定义主题

```vue
<template>
  <div class="custom-theme">
    <ex-button type="primary">自定义主题按钮</ex-button>
  </div>
</template>

<style scoped>
.custom-theme {
  --ex-color-neon-blue-500: #00ffaa;
  --ex-color-neon-pink-500: #ff00aa;
}
</style>
```

---

## 📱 响应式设计

所有组件都支持移动端优化：

- ✅ 44px 最小触摸区域
- ✅ 自适应字体大小
- ✅ 触摸友好的交互
- ✅ 响应式布局

```vue
<!-- 移动端自动优化 -->
<ex-button size="medium">
  <!-- 默认保留至少 44px 触控高度 -->
  按钮
</ex-button>
```

---

## ♿ 无障碍支持

所有组件都遵循 WCAG 2.1 标准：

- ✅ 完整的 ARIA 属性
- ✅ 键盘导航支持
- ✅ 屏幕阅读器友好
- ✅ 高对比度模式支持

```vue
<!-- 自动添加 ARIA 属性 -->
<ex-button aria-label="开始游戏">
  开始
</ex-button>
```

---

## 🌍 国际化

所有组件都支持多语言：

```typescript
import { setLocale } from 'vue-ex-ui';

// 切换语言
setLocale('zh-CN'); // 中文
setLocale('en-US'); // 英文
```

---

## 🎯 最佳实践

### 1. 组件组合

```vue
<template>
  <ex-card>
    <ex-space
      direction="vertical"
      :size="16"
    >
      <ex-typography variant="heading">游戏标题</ex-typography>

      <ex-divider />

      <ex-image
        src="/game.jpg"
        alt="游戏封面"
        :preview="true"
      />

      <ex-ellipsis
        :lines="3"
        :expandable="true"
      >
        游戏介绍文本...
      </ex-ellipsis>

      <ex-button
        type="primary"
        block
      >
        立即购买
      </ex-button>
    </ex-space>
  </ex-card>
</template>
```

### 2. 性能优化

```vue
<!-- 使用懒加载 -->
<ex-image :lazy="true" src="/large-image.jpg" />

<!-- 避免不必要的渲染 -->
<ex-badge v-if="count > 0" :count="count">
  <ex-icon name="notification" />
</ex-badge>
```

### 3. 样式定制

```vue
<template>
  <ex-button
    type="primary"
    class="custom-button"
    :style="{ width: '200px' }"
  >
    自定义按钮
  </ex-button>
</template>

<style scoped>
.custom-button {
  /* 覆盖对应尺寸（默认 medium）的高度与内边距令牌 */
  --ex-button-height-md: 56px;
  --ex-button-padding-x-md: 24px;
}
</style>
```

---

## 🔗 相关链接

- [组件列表](./index.md)
- [设计原则](../design/index.md)
- [主题使用指南](../guide/theme-usage.md)
- [快速开始](../guide/quickstart.md)

---

**享受使用 ExUI 构建页面的乐趣！** 🎮✨
