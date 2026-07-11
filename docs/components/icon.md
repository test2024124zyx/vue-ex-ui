# Icon 图标

统一渲染内置 SVG、自定义 SVG、图片或字体图标。未提供有效来源时不生成替代图形。

<script setup>
const featuredIcons = [
  'search-line',
  'check-line',
  'close-line',
  'delete-bin-line',
  'calendar-line',
  'star-line',
  'heart-fill',
  'settings-line'
]
</script>

## 内置图标

内置注册表无网络依赖，图形使用 `currentColor` 着色。

<div class="demo-container icon-list">
  <span v-for="name in featuredIcons" :key="name" class="icon-item">
    <ExIcon :icon="name" :size="24" />
    <code>{{ name }}</code>
  </span>
</div>

```vue
<ExIcon icon="search-line" />
<ExIcon icon="check-line" :size="20" color="var(--ex-color-success)" />
<ExIcon icon="star-line" size="1.5rem" />
```

未知的 `icon` 不会回退成其他图形；如果同时提供 `src` 或 `name`，组件会继续使用后续有效来源。

## 自定义 SVG

默认插槽优先于其他来源。空白或注释插槽不会遮蔽后续来源。

```vue
<ExIcon aria-label="完成">
  <svg viewBox="0 0 24 24">
    <path fill="currentColor" d="M5 12l4 4L19 6" />
  </svg>
</ExIcon>
```

## 图片与单色着色

`src` 渲染图片；同时设置 `color` 时改用 CSS mask，适合单色 SVG 或透明位图。

```vue
<ExIcon src="/brand-mark.png" alt="品牌标志" :size="32" />
<ExIcon src="/icons/home.svg" alt="首页" color="#29abe2" :size="24" />
```

## 字体图标

项目加载相应字体样式后，可通过 `name` 和 `prefix` 生成字体类名。

```vue
<ExIcon name="star" prefix="fas" />
<ExIcon name="icon-home" />
```

名称和前缀必须是单个有效 CSS 类名；包含空白的异常值不会被拼接。

## 旋转

静态角度与持续旋转作用在独立图形层，不会被按钮的 hover/active 变换覆盖。

```vue
<ExIcon icon="arrow-up-line" :rotate="90" />
<ExIcon icon="refresh-line" :rotate="45" spin />
```

系统启用“减少动态效果”时，`spin` 动画会停止并保留静态角度。

## 交互图标

`clickable` 将根元素渲染为 `type="button"` 的原生按钮，并提供至少 44 × 44 像素的命中区域；图形仍保持 `size` 指定的尺寸。

```vue
<ExIcon icon="search-line" clickable aria-label="搜索" @click="openSearch" />

<ExIcon icon="delete-bin-line" clickable disabled aria-label="删除" />
```

交互图标应显式提供 `aria-label` 或 `alt`。缺少名称时，内置图标名或字体图标名仅作为最后兜底。

## API

### Props

| 属性           | 说明                                     | 类型               | 默认值       |
| -------------- | ---------------------------------------- | ------------------ | ------------ |
| `icon`         | 内置 SVG 注册名                          | `string`           | —            |
| `name`         | 字体图标类名                             | `string`           | —            |
| `prefix`       | 字体图标前缀                             | `string`           | —            |
| `src`          | 图片地址                                 | `string`           | —            |
| `alt`          | 图片或交互图标的可访问文本               | `string`           | —            |
| `aria-label`   | 根元素的显式无障碍名称                   | `string`           | —            |
| `size`         | 非负像素数值或 CSS 长度                  | `number \| string` | `16`         |
| `color`        | 图标颜色；图片来源会切换为单色 mask      | `string`           | 继承文本颜色 |
| `rotate`       | 静态旋转角度                             | `number`           | `0`          |
| `spin`         | 持续旋转                                 | `boolean`          | `false`      |
| `clickable`    | 渲染为原生按钮                           | `boolean`          | `false`      |
| `disabled`     | 禁用交互按钮                             | `boolean`          | `false`      |
| `custom-class` | 兼容性附加类名，新代码可直接使用 `class` | `string`           | —            |

图形来源优先级为：有效默认插槽、已注册 `icon`、`src`、有效字体类名。没有有效来源时，根元素保留尺寸但内容为空。

### Events

| 事件    | 说明                       | 类型                          |
| ------- | -------------------------- | ----------------------------- |
| `click` | 仅交互按钮被原生激活时触发 | `(event: MouseEvent) => void` |

### Slots

| 插槽      | 说明                       |
| --------- | -------------------------- |
| `default` | 自定义图形内容，通常为 SVG |

### 注册表导出

```ts
import { ICONS, getBuiltinIcon, isBuiltinIcon, type BuiltinIconName } from 'vue-ex-ui';
```

| 导出             | 类型                                        | 说明                                    |
| ---------------- | ------------------------------------------- | --------------------------------------- |
| `ICONS`          | `Readonly<Record<BuiltinIconName, string>>` | 冻结的内置 SVG 注册表                   |
| `isBuiltinIcon`  | `(name: string) => name is BuiltinIconName` | 判断自身注册键                          |
| `getBuiltinIcon` | `(name: string) => string`                  | 获取静态 SVG 内容，未知名称返回空字符串 |

## 无障碍

- 无名称的非交互图标默认从无障碍树隐藏。
- 带 `aria-label` 或 `alt` 的非交互图标使用 `role="img"`。
- 交互图标使用原生按钮语义，支持 `Enter`、`Space` 和原生禁用行为。
- 内部 SVG、图片和字体节点始终隐藏，避免重复朗读。

<style scoped>
.demo-container {
  padding: 24px;
  margin: 16px 0;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
}

.icon-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.icon-item {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.icon-item code {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
