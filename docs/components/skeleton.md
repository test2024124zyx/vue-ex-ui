# Skeleton 骨架屏

在需要等待加载内容的位置提供一个占位图形组合，提升用户体验。

<script setup>
import { ref } from 'vue'

const loading = ref(true)
const loading2 = ref(true)
const loading3 = ref(true)

const toggleLoading = () => {
  loading.value = !loading.value
}

const toggleLoading2 = () => {
  loading2.value = !loading2.value
}

const toggleLoading3 = () => {
  loading3.value = !loading3.value
}
</script>

## 基础用法

最简单的占位效果。

::: raw
<div class="demo-container">
  <ExSkeleton />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSkeleton />
</template>
```

:::

## 复杂组合

更复杂的组合，包含头像、标题和段落。

::: raw
<div class="demo-container">
  <ExSkeleton avatar :title="true" :rows="4" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSkeleton
    avatar
    :title="true"
    :rows="4"
  />
</template>
```

:::

## 动画效果

通过 `animation` 属性可以设置不同的动画效果。

::: raw
<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">脉冲动画（默认）</h4>
    <ExSkeleton animation="pulse" avatar :title="true" :rows="3" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">波浪动画</h4>
    <ExSkeleton animation="wave" avatar :title="true" :rows="3" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">无动画</h4>
    <ExSkeleton animation="none" avatar :title="true" :rows="3" />
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">脉冲动画（默认）</h4>
    <ExSkeleton
      animation="pulse"
      avatar
      :title="true"
      :rows="3"
    />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">波浪动画</h4>
    <ExSkeleton
      animation="wave"
      avatar
      :title="true"
      :rows="3"
    />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">无动画</h4>
    <ExSkeleton
      animation="none"
      avatar
      :title="true"
      :rows="3"
    />
  </div>
</template>
```

:::

## 不同变体

通过 `variant` 属性可以使用预设的骨架屏样式。

::: raw
<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">文本</h4>
    <ExSkeleton variant="text" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">头像</h4>
    <ExSkeleton variant="avatar" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">标题</h4>
    <ExSkeleton variant="title" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">段落</h4>
    <ExSkeleton variant="paragraph" :rows="4" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">图片</h4>
    <ExSkeleton variant="image" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">按钮</h4>
    <ExSkeleton variant="button" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">卡片</h4>
    <ExSkeleton variant="card" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">文章</h4>
    <ExSkeleton variant="article" :rows="5" />
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">文本</h4>
    <ExSkeleton variant="text" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">头像</h4>
    <ExSkeleton variant="avatar" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">标题</h4>
    <ExSkeleton variant="title" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">段落</h4>
    <ExSkeleton
      variant="paragraph"
      :rows="4"
    />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">图片</h4>
    <ExSkeleton variant="image" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">按钮</h4>
    <ExSkeleton variant="button" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">卡片</h4>
    <ExSkeleton variant="card" />
  </div>

  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">文章</h4>
    <ExSkeleton
      variant="article"
      :rows="5"
    />
  </div>
</template>
```

:::

## 显示真实内容

通过 `loading` 属性控制是否显示骨架屏。

::: raw
<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <ExButton type="primary" @click="toggleLoading">
      {{ loading ? '显示内容' : '显示骨架屏' }}
    </ExButton>
  </div>

  <ExSkeleton :loading="loading" avatar :title="true" :rows="3">
    <template #content>
      <ExPanel type="primary">
        <template #icon>
          <img src="https://api.iconify.design/ri/user-line.svg" alt="用户" width="24" height="24" />
        </template>
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <ExAvatar size="large" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
          <div>
            <h3 style="margin: 0 0 8px 0; color: var(--ex-color-text-primary);">玩家信息</h3>
            <p style="margin: 0; color: var(--ex-color-text-secondary);">这是加载完成后显示的真实内容</p>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div>
            <strong style="color: var(--ex-color-text-primary);">用户名：</strong>
            <span style="color: var(--ex-color-neon-blue-500);">Player001</span>
          </div>
          <div>
            <strong style="color: var(--ex-color-text-primary);">等级：</strong>
            <span style="color: var(--ex-color-neon-blue-500);">Lv.50</span>
          </div>
          <div>
            <strong style="color: var(--ex-color-text-primary);">经验值：</strong>
            <span style="color: var(--ex-color-neon-blue-500);">12,580 / 15,000</span>
          </div>
          <div>
            <strong style="color: var(--ex-color-text-primary);">战斗力：</strong>
            <span style="color: var(--ex-color-neon-blue-500);">8,520</span>
          </div>
        </div>
      </ExPanel>
    </template>
  </ExSkeleton>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const loading = ref(true);

const toggleLoading = () => {
  loading.value = !loading.value;
};
</script>

<template>
  <div style="margin-bottom: 16px;">
    <ExButton
      type="primary"
      @click="toggleLoading"
    >
      {{ loading ? '显示内容' : '显示骨架屏' }}
    </ExButton>
  </div>

  <ExSkeleton
    :loading="loading"
    avatar
    :title="true"
    :rows="3"
  >
    <template #content>
      <ExPanel type="primary">
        <template #icon>
          <img
            src="https://api.iconify.design/ri/user-line.svg"
            alt="用户"
            width="24"
            height="24"
          />
        </template>
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <ExAvatar
            size="large"
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
          />
          <div>
            <h3 style="margin: 0 0 8px 0; color: var(--ex-color-text-primary);">玩家信息</h3>
            <p style="margin: 0; color: var(--ex-color-text-secondary);">
              这是加载完成后显示的真实内容
            </p>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          <div>
            <strong style="color: var(--ex-color-text-primary);">用户名：</strong>
            <span style="color: var(--ex-color-neon-blue-500);">Player001</span>
          </div>
          <div>
            <strong style="color: var(--ex-color-text-primary);">等级：</strong>
            <span style="color: var(--ex-color-neon-blue-500);">Lv.50</span>
          </div>
          <div>
            <strong style="color: var(--ex-color-text-primary);">经验值：</strong>
            <span style="color: var(--ex-color-neon-blue-500);">12,580 / 15,000</span>
          </div>
          <div>
            <strong style="color: var(--ex-color-text-primary);">战斗力：</strong>
            <span style="color: var(--ex-color-neon-blue-500);">8,520</span>
          </div>
        </div>
      </ExPanel>
    </template>
  </ExSkeleton>
</template>
```

:::

## 列表骨架屏

使用 `count` 属性可以渲染多个骨架屏，适合列表场景。

::: raw
<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <ExButton type="primary" @click="toggleLoading2">
      {{ loading2 ? '显示列表' : '显示骨架屏' }}
    </ExButton>
  </div>
  <ExSkeleton :loading="loading2" avatar :title="true" :rows="2" :count="3">
    <template #content>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <ExPanel
          v-for="i in 3"
          :key="i"
          type="primary"
          hoverable
        >
          <div style="display: flex; align-items: center; gap: 16px;">
            <ExAvatar :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=Player${i}`" />
            <div style="flex: 1;">
              <h4 style="margin: 0 0 8px 0; color: var(--ex-color-text-primary);">玩家 {{ i }}</h4>
              <p style="margin: 0; color: var(--ex-color-text-secondary);">等级 {{ 40 + i * 5 }} | 战斗力 {{ 8000 + i * 500 }}</p>
            </div>
            <ExBadge :count="i" type="success" />
          </div>
        </ExPanel>
      </div>
    </template>
  </ExSkeleton>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const loading2 = ref(true);

const toggleLoading2 = () => {
  loading2.value = !loading2.value;
};
</script>

<template>
  <div style="margin-bottom: 16px;">
    <ExButton
      type="primary"
      @click="toggleLoading2"
    >
      {{ loading2 ? '显示列表' : '显示骨架屏' }}
    </ExButton>
  </div>
  <ExSkeleton
    :loading="loading2"
    avatar
    :title="true"
    :rows="2"
    :count="3"
  >
    <template #content>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <ExPanel
          v-for="i in 3"
          :key="i"
          type="primary"
          hoverable
        >
          <div style="display: flex; align-items: center; gap: 16px;">
            <ExAvatar :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=Player${i}`" />
            <div style="flex: 1;">
              <h4 style="margin: 0 0 8px 0; color: var(--ex-color-text-primary);">玩家 {{ i }}</h4>
              <p style="margin: 0; color: var(--ex-color-text-secondary);">
                等级 {{ 40 + i * 5 }} | 战斗力 {{ 8000 + i * 500 }}
              </p>
            </div>
            <ExBadge
              :count="i"
              type="success"
            />
          </div>
        </ExPanel>
      </div>
    </template>
  </ExSkeleton>
</template>
```

:::

## 自定义尺寸

通过 `width` 和 `height` 属性可以自定义骨架屏的尺寸。

::: raw
<div class="demo-container" style="display: flex; flex-direction: column; gap: 16px;">
  <ExSkeleton variant="text" width="200px" />
  <ExSkeleton variant="text" width="50%" />
  <ExSkeleton variant="image" width="100%" height="150px" />
  <ExSkeleton variant="button" width="120px" height="40px" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSkeleton
    variant="text"
    width="200px"
  />
  <ExSkeleton
    variant="text"
    width="50%"
  />
  <ExSkeleton
    variant="image"
    width="100%"
    height="150px"
  />
  <ExSkeleton
    variant="button"
    width="120px"
    height="40px"
  />
</template>
```

:::

## 自定义段落宽度

通过 `rowsWidth` 属性可以自定义每行的宽度。

::: raw
<div class="demo-container">
  <ExSkeleton
    :title="true"
    :rows="4"
    :rows-width="['100%', '90%', '80%', '60%']"
  />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSkeleton
    :title="true"
    :rows="4"
    :rows-width="['100%', '90%', '80%', '60%']"
  />
</template>
```

:::

## 头像形状

通过 `avatarShape` 属性可以设置头像的形状。

::: raw
<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">圆形头像</h4>
    <ExSkeleton avatar avatar-shape="circle" :title="true" :rows="2" />
  </div>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">方形头像</h4>
    <ExSkeleton avatar avatar-shape="square" :title="true" :rows="2" />
  </div>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">圆角头像</h4>
    <ExSkeleton avatar avatar-shape="rounded" :title="true" :rows="2" />
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">圆形头像</h4>
    <ExSkeleton
      avatar
      avatar-shape="circle"
      :title="true"
      :rows="2"
    />
  </div>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">方形头像</h4>
    <ExSkeleton
      avatar
      avatar-shape="square"
      :title="true"
      :rows="2"
    />
  </div>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">圆角头像</h4>
    <ExSkeleton
      avatar
      avatar-shape="rounded"
      :title="true"
      :rows="2"
    />
  </div>
</template>
```

:::

## 不同尺寸

通过 `size` 属性可以设置骨架屏的尺寸。

::: raw
<div class="demo-container" style="display: flex; flex-direction: column; gap: 24px;">
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">小尺寸</h4>
    <ExSkeleton size="small" avatar :title="true" :rows="3" />
  </div>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">默认尺寸</h4>
    <ExSkeleton size="default" avatar :title="true" :rows="3" />
  </div>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">大尺寸</h4>
    <ExSkeleton size="large" avatar :title="true" :rows="3" />
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">小尺寸</h4>
    <ExSkeleton
      size="small"
      avatar
      :title="true"
      :rows="3"
    />
  </div>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">默认尺寸</h4>
    <ExSkeleton
      size="default"
      avatar
      :title="true"
      :rows="3"
    />
  </div>
  <div>
    <h4 style="margin-bottom: 12px; color: var(--ex-color-text-primary);">大尺寸</h4>
    <ExSkeleton
      size="large"
      avatar
      :title="true"
      :rows="3"
    />
  </div>
</template>
```

:::

## 自定义骨架屏

使用默认插槽可以完全自定义骨架屏的内容。

::: raw
<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <ExButton type="primary" @click="toggleLoading3">
      {{ loading3 ? '显示内容' : '显示骨架屏' }}
    </ExButton>
  </div>

  <ExSkeleton :loading="loading3" variant="custom">
    <!-- 自定义骨架屏 -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
      <ExSkeleton variant="card" v-for="i in 3" :key="i" />
    </div>
    <!-- 真实内容 -->
    <template #content>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <ExPanel
          v-for="i in 3"
          :key="i"
          :type="['primary', 'success', 'warning'][i - 1]"
          hoverable
        >
          <template #icon>
            <img
              :src="`https://api.iconify.design/ri/${['trophy', 'medal', 'star'][i - 1]}-line.svg`"
              alt="图标"
              width="24"
              height="24"
            />
          </template>
          <div style="text-align: center;">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">
              {{ [850, 85, 1250][i - 1] }}{{ i === 2 ? '/120' : '' }}{{ i === 3 ? 'h' : '' }}
            </div>
            <div style="color: var(--ex-color-text-secondary);">
              {{ ['总胜场', '已解锁', '游戏时长'][i - 1] }}
            </div>
          </div>
        </ExPanel>
      </div>
    </template>
  </ExSkeleton>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const loading3 = ref(true);

const toggleLoading3 = () => {
  loading3.value = !loading3.value;
};
</script>

<template>
  <div style="margin-bottom: 16px;">
    <ExButton
      type="primary"
      @click="toggleLoading3"
    >
      {{ loading3 ? '显示内容' : '显示骨架屏' }}
    </ExButton>
  </div>

  <ExSkeleton
    :loading="loading3"
    variant="custom"
  >
    <!-- 自定义骨架屏 -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
      <ExSkeleton
        variant="card"
        v-for="i in 3"
        :key="i"
      />
    </div>
    <!-- 真实内容 -->
    <template #content>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        <ExPanel
          v-for="i in 3"
          :key="i"
          :type="['primary', 'success', 'warning'][i - 1]"
          hoverable
        >
          <template #icon>
            <img
              :src="`https://api.iconify.design/ri/${['trophy', 'medal', 'star'][i - 1]}-line.svg`"
              alt="图标"
              width="24"
              height="24"
            />
          </template>
          <div style="text-align: center;">
            <div style="font-size: 32px; font-weight: bold; margin-bottom: 8px;">
              {{ [850, 85, 1250][i - 1] }}{{ i === 2 ? '/120' : '' }}{{ i === 3 ? 'h' : '' }}
            </div>
            <div style="color: var(--ex-color-text-secondary);">
              {{ ['总胜场', '已解锁', '游戏时长'][i - 1] }}
            </div>
          </div>
        </ExPanel>
      </div>
    </template>
  </ExSkeleton>
</template>
```

:::

## API

### Skeleton Props

| 属性           | 说明             | 类型                                                                                                                          | 默认值      |
| -------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `loading`      | 是否显示加载状态 | `boolean`                                                                                                                     | `true`      |
| `animation`    | 动画类型         | `'pulse' \| 'wave' \| 'none'`                                                                                                 | `'pulse'`   |
| `shape`        | 形状             | `'circle' \| 'square' \| 'rounded'`                                                                                           | `'rounded'` |
| `size`         | 尺寸             | `'small' \| 'default' \| 'large'`                                                                                             | `'default'` |
| `variant`      | 变体类型         | `'text' \| 'avatar' \| 'title' \| 'paragraph' \| 'image' \| 'button' \| 'card' \| 'list' \| 'table' \| 'article' \| 'custom'` | `'text'`    |
| `active`       | 是否激活动画     | `boolean`                                                                                                                     | `true`      |
| `width`        | 宽度             | `string \| number`                                                                                                            | `undefined` |
| `height`       | 高度             | `string \| number`                                                                                                            | `undefined` |
| `count`        | 重复次数         | `number`                                                                                                                      | `1`         |
| `avatar`       | 是否显示头像     | `boolean`                                                                                                                     | `false`     |
| `avatar-shape` | 头像形状         | `'circle' \| 'square' \| 'rounded'`                                                                                           | `'circle'`  |
| `avatar-size`  | 头像尺寸         | `string \| number`                                                                                                            | `undefined` |
| `title`        | 是否显示标题     | `boolean`                                                                                                                     | `false`     |
| `title-width`  | 标题宽度         | `string \| number`                                                                                                            | `undefined` |
| `rows`         | 段落行数         | `number`                                                                                                                      | `3`         |
| `rows-width`   | 段落宽度         | `(string \| number)[] \| string`                                                                                              | `undefined` |

### Skeleton Slots

| 插槽名    | 说明                                    |
| --------- | --------------------------------------- |
| `default` | 自定义骨架屏内容（variant="custom" 时） |
| `content` | 加载完成后显示的真实内容                |

### Skeleton Methods

| 方法名       | 说明              | 类型                           |
| ------------ | ----------------- | ------------------------------ |
| `getElement` | 获取骨架屏DOM元素 | `() => HTMLDivElement \| null` |

## 无障碍支持

- 使用 `role="status"` 标识加载状态
- 使用 `aria-label` 提供加载提示
- 使用 `aria-live="polite"` 通知屏幕阅读器
- 使用 `aria-busy="true"` 标识忙碌状态
- 支持 `prefers-reduced-motion` 减少动画

## 主题定制

骨架屏跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，无需单独配置。

## 常见问题

**Q：`loading` 和 `active` 有什么区别？**
`loading` 控制显示骨架屏还是真实内容（`true` 显示骨架、`false` 显示 `#content` 插槽或默认插槽）；`active` 控制骨架块是否播放动画。

**Q：骨架结构怎么和真实内容对齐？**
用 `variant="custom"` + 默认插槽自由拼装骨架块，使其布局贴近真实内容，切换时不跳动。

**Q：列表场景如何渲染多块骨架？**
用 `count` 指定重复块数量，或在 `v-for` 中渲染多个骨架屏。

**Q：会影响无障碍吗？**
不会。骨架屏带 `role="status"`、`aria-busy="true"` 与 `aria-live="polite"`，并支持 `prefers-reduced-motion` 自动减弱动画。

## 最佳实践

- **骨架结构贴近真实布局**（行数、头像、标题宽度），让加载到内容的过渡更平滑、减少跳动。
- **用 `loading` 直接包裹内容**：`<ExSkeleton :loading="loading"><RealContent/></ExSkeleton>`，数据就绪后自动切换。
- **首屏 / 慢接口**才用骨架屏；极快的请求直接显示内容，避免骨架一闪而过。
- 列表用 `count` 控制占位条数，与预计返回条数大致一致。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}

h4 {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
