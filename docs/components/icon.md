# Icon 图标

通用图标组件，支持 SVG、字体图标、图片图标等多种形式，不依赖任何特定图标库。

<script setup>
const handleClick = () => {
  console.log('图标被点击了！')
}
</script>

## 基础用法

### 默认图标

不传入任何参数时，显示默认的星形图标：

<div class="demo-container">
  <ExIcon />
</div>

```vue
<template>
  <ExIcon />
</template>
```

### SVG 图标

通过插槽传入 SVG 内容：

<div class="demo-container">
  <ExIcon>
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  </ExIcon>
</div>

```vue
<template>
  <ExIcon>
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      />
    </svg>
  </ExIcon>
</template>
```

### 字体图标

支持 Font Awesome、Iconfont 等字体图标库：

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw==" crossorigin="anonymous" referrerpolicy="no-referrer" />

<div class="demo-container">
  <ExIcon name="play" prefix="fa" />
  <ExIcon name="pause" prefix="fa" />
  <ExIcon name="fire" prefix="fa"/>
</div>

```vue
<template>
  <!-- Font Awesome -->
  <ExIcon name="star" prefix="fas" />
  <ExIcon name="heart" prefix="far" />

  <!-- Iconfont -->
  <ExIcon name="icon-home" />
</template>
```

### 图片图标

使用图片作为图标：
<ExIcon src="https://images.unsplash.com/photo-1633409361618-c73427e4e206?q=80&w=1160&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Logo" />

```vue
<template>
  <ExIcon src="/logo.png" alt="Logo" />
</template>
```

### Iconify API 图标

使用 Iconify API 提供的在线图标，无需安装依赖：

<div class="demo-container">
  <ExIcon src="https://api.iconify.design/ri/home-line.svg" />
  <ExIcon src="https://api.iconify.design/ri/user-line.svg" />
  <ExIcon src="https://api.iconify.design/ri/settings-line.svg" />
  <ExIcon src="https://api.iconify.design/ri/search-line.svg" />
</div>

```vue
<template>
  <ExIcon src="https://api.iconify.design/ri/home-line.svg" />
  <ExIcon src="https://api.iconify.design/ri/user-line.svg" />
  <ExIcon src="https://api.iconify.design/ri/settings-line.svg" />
  <ExIcon src="https://api.iconify.design/ri/search-line.svg" />
</template>
```

### 图片图标着色

通过 `color` 属性可以对图片图标进行着色（使用 CSS mask 技术）：

<div class="demo-container">
  <ExIcon 
    src="https://api.iconify.design/ri/home-line.svg" 
    color="#29ABE2" 
    :size="24"
  />
  <ExIcon 
    src="https://api.iconify.design/ri/user-line.svg" 
    color="#ff6b6b" 
    :size="24"
  />
  <ExIcon 
    src="https://api.iconify.design/ri/heart-line.svg" 
    color="#4ecdc4" 
    :size="24"
  />
  <ExIcon 
    src="https://api.iconify.design/ri/star-line.svg" 
    color="#ffd93d" 
    :size="24"
  />
</div>

```vue
<template>
  <!-- 使用 color 属性对图片图标着色 -->
  <ExIcon src="https://api.iconify.design/ri/home-line.svg" color="#29ABE2" :size="24" />
  <ExIcon src="https://api.iconify.design/ri/user-line.svg" color="#ff6b6b" :size="24" />
  <ExIcon src="https://api.iconify.design/ri/heart-line.svg" color="#4ecdc4" :size="24" />
</template>
```

::: tip 提示
图片着色功能使用 CSS `mask` 属性实现，适用于单色图标。对于彩色图标，着色后会变成单色。
:::

## 图标大小

### 预设大小

<div class="demo-container">
  <ExIcon :size="12" />
  <ExIcon :size="16" />
  <ExIcon :size="20" />
  <ExIcon :size="24" />
  <ExIcon :size="32" />
</div>

```vue
<template>
  <ExIcon :size="12" />
  <ExIcon :size="16" />
  <ExIcon :size="20" />
  <ExIcon :size="24" />
  <ExIcon :size="32" />
</template>
```

### 自定义大小

<div class="demo-container">
  <ExIcon size="2rem" />
  <ExIcon size="48px" />
</div>

```vue
<template>
  <ExIcon size="2rem" />
  <ExIcon size="48px" />
</template>
```

## 图标颜色

<div class="demo-container">
  <ExIcon color="#29ABE2" />
  <ExIcon color="#ff6b6b" />
  <ExIcon color="#4ecdc4" />
  <ExIcon color="#45b7d1" />
</div>

```vue
<template>
  <ExIcon color="#29ABE2" />
  <ExIcon color="#ff6b6b" />
  <ExIcon color="#4ecdc4" />
  <ExIcon color="#45b7d1" />
</template>
```

## 图标旋转

### 静态旋转

<div class="demo-container">
  <ExIcon :rotate="45" />
  <ExIcon :rotate="90" />
  <ExIcon :rotate="180" />
</div>

```vue
<template>
  <ExIcon :rotate="45" />
  <ExIcon :rotate="90" />
  <ExIcon :rotate="180" />
</template>
```

### 旋转动画

<div class="demo-container">
  <ExIcon spin />
</div>

```vue
<template>
  <ExIcon spin />
</template>
```

## 可点击图标

<div class="demo-container">
  <ExIcon clickable @click="handleClick" />
  <ExIcon clickable disabled />
</div>

```vue
<template>
  <ExIcon clickable @click="handleClick" />

  <ExIcon clickable disabled />
</template>
```

## API

### Props

| 参数        | 说明                    | 类型               | 默认值   |
| ----------- | ----------------------- | ------------------ | -------- |
| name        | 图标名称（字体图标）    | `string`           | -        |
| prefix      | 图标前缀（如 fas, far） | `string`           | -        |
| src         | 图片路径（图片图标）    | `string`           | -        |
| alt         | 图片替代文本            | `string`           | `'icon'` |
| size        | 图标大小                | `number \| string` | `16`     |
| color       | 图标颜色                | `string`           | -        |
| rotate      | 旋转角度                | `number`           | `0`      |
| spin        | 是否旋转动画            | `boolean`          | `false`  |
| clickable   | 是否可点击              | `boolean`          | `false`  |
| disabled    | 是否禁用                | `boolean`          | `false`  |
| customClass | 自定义类名              | `string`           | -        |
| tag         | HTML 标签               | `string`           | `'span'` |

### Events

| 事件名 | 说明                           | 参数                  |
| ------ | ------------------------------ | --------------------- |
| click  | 点击事件（需要设置 clickable） | `(event: MouseEvent)` |

### Slots

| 插槽名  | 说明                         |
| ------- | ---------------------------- |
| default | 自定义图标内容（通常是 SVG） |

## 常用图标集合

以下是组件库中其他组件常用的32个图标示例：

<div class="demo-container">
  <!-- 基础操作图标 -->
  <div class="icon-group">
    <h4>基础操作</h4>
    <div class="icon-list">
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/add-line.svg" />
        <span>添加</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/subtract-line.svg" />
        <span>减少</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/edit-line.svg" />
        <span>编辑</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/delete-bin-line.svg" />
        <span>删除</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/save-line.svg" />
        <span>保存</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/close-line.svg" />
        <span>关闭</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/check-line.svg" />
        <span>确认</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/refresh-line.svg" />
        <span>刷新</span>
      </div>
    </div>
  </div>

  <!-- 导航图标 -->
  <div class="icon-group">
    <h4>导航</h4>
    <div class="icon-list">
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/arrow-left-line.svg" />
        <span>左箭头</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/arrow-right-line.svg" />
        <span>右箭头</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/arrow-up-line.svg" />
        <span>上箭头</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/arrow-down-line.svg" />
        <span>下箭头</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/menu-line.svg" />
        <span>菜单</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/more-line.svg" />
        <span>更多</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/external-link-line.svg" />
        <span>外链</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/download-line.svg" />
        <span>下载</span>
      </div>
    </div>
  </div>

  <!-- 状态图标 -->
  <div class="icon-group">
    <h4>状态</h4>
    <div class="icon-list">
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/information-line.svg" />
        <span>信息</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/error-warning-line.svg" />
        <span>警告</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/checkbox-circle-line.svg" />
        <span>成功</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/close-circle-line.svg" />
        <span>错误</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/loader-line.svg" />
        <span>加载</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/eye-line.svg" />
        <span>显示</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/eye-off-line.svg" />
        <span>隐藏</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/lock-line.svg" />
        <span>锁定</span>
      </div>
    </div>
  </div>

  <!-- 功能图标 -->
  <div class="icon-group">
    <h4>功能</h4>
    <div class="icon-list">
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/mail-line.svg" />
        <span>邮件</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/phone-line.svg" />
        <span>电话</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/calendar-line.svg" />
        <span>日历</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/time-line.svg" />
        <span>时间</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/file-line.svg" />
        <span>文件</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/folder-line.svg" />
        <span>文件夹</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/image-line.svg" />
        <span>图片</span>
      </div>
      <div class="icon-item">
        <ExIcon src="https://api.iconify.design/ri/heart-line.svg" />
        <span>收藏</span>
      </div>
    </div>
  </div>
</div>

<style scoped>
.icon-group {
  margin-bottom: 24px;
}

.icon-group h4 {
  margin: 0 0 12px 0;
  color: var(--vp-c-text-1);
  font-size: 16px;
  font-weight: 600;
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  transition: all 0.2s;
  background: rgb(243 66 210 / 29%);
}

.icon-item:hover {
  border-color: var(--vp-c-brand);
  background-color: var(--vp-c-brand);
}

.icon-item span {
  font-size: 12px;
  color: var(--vp-c-text-2);
  text-align: center;
}
</style>

## 使用建议

### 图标库集成

ExIcon 组件设计为通用图标容器，可以与任何图标库配合使用：

#### Font Awesome

```bash
npm install @fortawesome/fontawesome-free
```

```css
@import '@fortawesome/fontawesome-free/css/all.css';
```

```vue
<ExIcon name="star" prefix="fas" />
<ExIcon name="heart" prefix="far" />
<ExIcon name="github" prefix="fab" />
```

#### Iconify API（推荐）

无需安装任何依赖，直接使用 Iconify API：

```vue
<template>
  <!-- Heroicons 风格 -->
  <ExIcon src="https://api.iconify.design/heroicons/star.svg" />

  <!-- Lucide 风格 -->
  <ExIcon src="https://api.iconify.design/lucide/star.svg" />

  <!-- Remix Icon 风格 -->
  <ExIcon src="https://api.iconify.design/ri/star-line.svg" />
</template>
```

### 性能优化

1. **SVG 优化**：使用工具如 SVGO 优化 SVG 文件
2. **按需加载**：只引入需要的图标
3. **图标精灵**：对于大量小图标，考虑使用 SVG 精灵图

### 无障碍性

1. 为装饰性图标添加 `aria-hidden="true"`
2. 为功能性图标提供合适的 `aria-label`
3. 确保可点击图标有足够的点击区域（至少 44x44px）
