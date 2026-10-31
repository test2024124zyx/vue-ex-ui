# Steps 步骤条

引导用户按照流程完成任务的导航条，赛博朋克主题风格。

<script setup>
import { ref } from 'vue'

const current = ref(1)
const current2 = ref(0)
const current3 = ref(2)

const next = () => {
  if (current2.value < 2) {
    current2.value++
  }
}

const prev = () => {
  if (current2.value > 0) {
    current2.value--
  }
}
</script>

## 基础用法

简单的步骤条，展示游戏任务进度。

::: raw
<div class="demo-container">
  <ExSteps :current="1">
    <ExStep title="选择模式" description="选择你的游戏模式" />
    <ExStep title="创建角色" description="自定义你的游戏角色" />
    <ExStep title="开始游戏" description="进入游戏世界" />
  </ExSteps>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSteps :current="1">
    <ExStep
      title="选择模式"
      description="选择你的游戏模式"
    />
    <ExStep
      title="创建角色"
      description="自定义你的游戏角色"
    />
    <ExStep
      title="开始游戏"
      description="进入游戏世界"
    />
  </ExSteps>
</template>
```

:::

## 带图标的步骤条

通过插槽可以自定义图标，展示更丰富的视觉效果。

::: raw
<div class="demo-container">
  <ExSteps :current="1">
    <ExStep title="登录">
      <template #icon>
        <img src="https://api.iconify.design/ri/user-line.svg" alt="用户" width="20" height="20" />
      </template>
    </ExStep>
    <ExStep title="验证">
      <template #icon>
        <img src="https://api.iconify.design/ri/shield-check-line.svg" alt="验证" width="20" height="20" />
      </template>
    </ExStep>
    <ExStep title="完成">
      <template #icon>
        <img src="https://api.iconify.design/ri/check-line.svg" alt="完成" width="20" height="20" />
      </template>
    </ExStep>
  </ExSteps>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSteps :current="1">
    <ExStep title="登录">
      <template #icon>
        <img
          src="https://api.iconify.design/ri/user-line.svg"
          alt="用户"
          width="20"
          height="20"
        />
      </template>
    </ExStep>
    <ExStep title="验证">
      <template #icon>
        <img
          src="https://api.iconify.design/ri/shield-check-line.svg"
          alt="验证"
          width="20"
          height="20"
        />
      </template>
    </ExStep>
    <ExStep title="完成">
      <template #icon>
        <img
          src="https://api.iconify.design/ri/check-line.svg"
          alt="完成"
          width="20"
          height="20"
        />
      </template>
    </ExStep>
  </ExSteps>
</template>
```

:::

## 垂直步骤条

垂直方向的步骤条，适合侧边栏展示。连线从图标底部延伸到下一个步骤。

::: raw
<div class="demo-container">
  <ExSteps :current="1" direction="vertical">
    <ExStep title="任务一" description="完成新手教程，学习基础操作" />
    <ExStep title="任务二" description="达到10级，解锁更多功能" />
    <ExStep title="任务三" description="解锁新地图，探索更多区域" />
    <ExStep title="任务四" description="完成主线任务，获得奖励" />
  </ExSteps>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSteps
    :current="1"
    direction="vertical"
  >
    <ExStep
      title="任务一"
      description="完成新手教程，学习基础操作"
    />
    <ExStep
      title="任务二"
      description="达到10级，解锁更多功能"
    />
    <ExStep
      title="任务三"
      description="解锁新地图，探索更多区域"
    />
    <ExStep
      title="任务四"
      description="完成主线任务，获得奖励"
    />
  </ExSteps>
</template>
```

:::

## 步骤状态

可以通过 `status` 属性设置当前步骤的状态。

::: raw
<div class="demo-container">
  <ExSteps :current="1" status="error">
    <ExStep title="已完成" description="这一步已经完成" />
    <ExStep title="出错了" description="这一步出现了错误" />
    <ExStep title="待进行" description="这一步还未开始" />
  </ExSteps>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSteps
    :current="1"
    status="error"
  >
    <ExStep
      title="已完成"
      description="这一步已经完成"
    />
    <ExStep
      title="出错了"
      description="这一步出现了错误"
    />
    <ExStep
      title="待进行"
      description="这一步还未开始"
    />
  </ExSteps>
</template>
```

:::

## 可点击的步骤条

设置 `clickable` 属性后，步骤可以点击切换。

::: raw
<div class="demo-container">
  <ExSteps :current="current2" clickable @change="current2 = $event">
    <ExStep title="步骤一" description="选择游戏模式" />
    <ExStep title="步骤二" description="创建角色" />
    <ExStep title="步骤三" description="开始游戏" />
  </ExSteps>
  <div style="margin-top: 24px; display: flex; gap: 12px;">
    <ExButton @click="prev" :disabled="current2 === 0">上一步</ExButton>
    <ExButton type="primary" @click="next" :disabled="current2 === 2">下一步</ExButton>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSteps
    :current="current2"
    clickable
    @change="current2 = $event"
  >
    <ExStep
      title="步骤一"
      description="选择游戏模式"
    />
    <ExStep
      title="步骤二"
      description="创建角色"
    />
    <ExStep
      title="步骤三"
      description="开始游戏"
    />
  </ExSteps>
  <div style="margin-top: 24px; display: flex; gap: 12px;">
    <ExButton
      @click="prev"
      :disabled="current2 === 0"
    >
      上一步
    </ExButton>
    <ExButton
      type="primary"
      @click="next"
      :disabled="current2 === 2"
    >
      下一步
    </ExButton>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const current2 = ref(0);

const next = () => {
  if (current2.value < 2) current2.value++;
};

const prev = () => {
  if (current2.value > 0) current2.value--;
};
</script>
```

:::

## 不同尺寸

提供三种尺寸：small、medium、large。

::: raw
<div class="demo-container">
  <ExSteps :current="1" size="small" style="margin-bottom: 24px;">
    <ExStep title="步骤一" />
    <ExStep title="步骤二" />
    <ExStep title="步骤三" />
  </ExSteps>

  <ExSteps :current="1" size="medium" style="margin-bottom: 24px;">
    <ExStep title="步骤一" />
    <ExStep title="步骤二" />
    <ExStep title="步骤三" />
  </ExSteps>

  <ExSteps :current="1" size="large">
    <ExStep title="步骤一" />
    <ExStep title="步骤二" />
    <ExStep title="步骤三" />
  </ExSteps>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSteps
    :current="1"
    size="small"
    style="margin-bottom: 24px;"
  >
    <ExStep title="步骤一" />
    <ExStep title="步骤二" />
    <ExStep title="步骤三" />
  </ExSteps>

  <ExSteps
    :current="1"
    size="medium"
    style="margin-bottom: 24px;"
  >
    <ExStep title="步骤一" />
    <ExStep title="步骤二" />
    <ExStep title="步骤三" />
  </ExSteps>

  <ExSteps
    :current="1"
    size="large"
  >
    <ExStep title="步骤一" />
    <ExStep title="步骤二" />
    <ExStep title="步骤三" />
  </ExSteps>
</template>
```

:::

## 进度点模式

使用进度点模式，显示小圆点而不是大图标，更简洁的视觉效果。

::: raw
<div class="demo-container">
  <ExSteps :current="current3" progress-dot>
    <ExStep title="账号注册" description="创建游戏账号" />
    <ExStep title="角色创建" description="自定义角色外观" />
    <ExStep title="新手教程" description="学习基础操作" />
    <ExStep title="开始游戏" description="进入游戏世界" />
  </ExSteps>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';

const current3 = ref(2);
</script>

<template>
  <ExSteps
    :current="current3"
    progress-dot
  >
    <ExStep
      title="账号注册"
      description="创建游戏账号"
    />
    <ExStep
      title="角色创建"
      description="自定义角色外观"
    />
    <ExStep
      title="新手教程"
      description="学习基础操作"
    />
    <ExStep
      title="开始游戏"
      description="进入游戏世界"
    />
  </ExSteps>
</template>
```

:::

## 垂直进度点模式

进度点模式也支持垂直方向。

::: raw
<div class="demo-container">
  <ExSteps :current="1" direction="vertical" progress-dot>
    <ExStep title="步骤一" description="完成第一步" />
    <ExStep title="步骤二" description="完成第二步" />
    <ExStep title="步骤三" description="完成第三步" />
  </ExSteps>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSteps
    :current="1"
    direction="vertical"
    progress-dot
  >
    <ExStep
      title="步骤一"
      description="完成第一步"
    />
    <ExStep
      title="步骤二"
      description="完成第二步"
    />
    <ExStep
      title="步骤三"
      description="完成第三步"
    />
  </ExSteps>
</template>
```

:::

## 自定义颜色

可以自定义步骤的图标颜色、标题颜色和连接线颜色。

::: raw
<div class="demo-container">
  <ExSteps :current="1">
    <ExStep 
      title="自定义紫色" 
      description="自定义图标和标题颜色"
      icon-color="#9333ea"
      title-color="#9333ea"
      line-color="#9333ea"
    />
    <ExStep 
      title="自定义橙色" 
      description="自定义图标和标题颜色"
      icon-color="#f97316"
      title-color="#f97316"
      line-color="#f97316"
    />
    <ExStep 
      title="自定义粉色" 
      description="自定义图标和标题颜色"
      icon-color="#ec4899"
      title-color="#ec4899"
    />
  </ExSteps>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSteps :current="1">
    <ExStep
      title="自定义紫色"
      description="自定义图标和标题颜色"
      icon-color="#9333ea"
      title-color="#9333ea"
      line-color="#9333ea"
    />
    <ExStep
      title="自定义橙色"
      description="自定义图标和标题颜色"
      icon-color="#f97316"
      title-color="#f97316"
      line-color="#f97316"
    />
    <ExStep
      title="自定义粉色"
      description="自定义图标和标题颜色"
      icon-color="#ec4899"
      title-color="#ec4899"
    />
  </ExSteps>
</template>
```

:::

## 带子标题

可以为每个步骤添加子标题。

::: raw
<div class="demo-container">
  <ExSteps :current="1">
    <ExStep 
      title="账号注册" 
      subtitle="创建你的游戏账号"
      description="填写基本信息完成注册" 
    />
    <ExStep 
      title="角色创建" 
      subtitle="自定义你的角色"
      description="选择职业、外观和技能" 
    />
    <ExStep 
      title="进入游戏" 
      subtitle="开始你的冒险"
      description="探索广阔的游戏世界" 
    />
  </ExSteps>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExSteps :current="1">
    <ExStep
      title="账号注册"
      subtitle="创建你的游戏账号"
      description="填写基本信息完成注册"
    />
    <ExStep
      title="角色创建"
      subtitle="自定义你的角色"
      description="选择职业、外观和技能"
    />
    <ExStep
      title="进入游戏"
      subtitle="开始你的冒险"
      description="探索广阔的游戏世界"
    />
  </ExSteps>
</template>
```

:::

## API

省略 `size` 时继承最近的 `ExConfigProvider`；未配置全局尺寸时使用下表默认值。步骤导航的辅助技术名称跟随全局语言配置。

### Steps Props

| 属性         | 说明                | 类型                                       | 默认值             |
| ------------ | ------------------- | ------------------------------------------ | ------------------ |
| current      | 当前步骤（从0开始） | number                                     | 0                  |
| status       | 当前步骤的状态      | 'wait' \| 'process' \| 'finish' \| 'error' | 'process'          |
| direction    | 步骤条方向          | 'horizontal' \| 'vertical'                 | 'horizontal'       |
| size         | 步骤条大小          | 'small' \| 'medium' \| 'large'             | 'medium'           |
| progress-dot | 是否使用进度点模式  | boolean                                    | false              |
| clickable    | 步骤是否可点击      | boolean                                    | false              |
| aria-label   | 无障碍标签          | string                                     | 'Steps navigation' |

### Steps Events

| 事件名 | 说明           | 类型                    |
| ------ | -------------- | ----------------------- |
| change | 点击步骤时触发 | (index: number) => void |

### Steps Methods

| 方法名     | 说明                | 参数            |
| ---------- | ------------------- | --------------- |
| getElement | 获取步骤条 DOM 元素 | -               |
| goTo       | 跳转到指定步骤      | (index: number) |
| next       | 下一步              | -               |
| prev       | 上一步              | -               |

### Step Props

| 属性        | 说明                                  | 类型                                       | 默认值 |
| ----------- | ------------------------------------- | ------------------------------------------ | ------ |
| title       | 标题                                  | string                                     | -      |
| description | 描述                                  | string                                     | -      |
| subtitle    | 子标题                                | string                                     | -      |
| status      | 步骤状态（会覆盖父组件的status）      | 'wait' \| 'process' \| 'finish' \| 'error' | -      |
| disabled    | 是否禁用                              | boolean                                    | false  |
| clickable   | 是否可点击（会覆盖父组件的clickable） | boolean                                    | -      |
| icon-color  | 自定义图标颜色                        | string                                     | -      |
| title-color | 自定义标题颜色                        | string                                     | -      |
| line-color  | 自定义连接线颜色                      | string                                     | -      |

### Step Slots

| 插槽名      | 说明         |
| ----------- | ------------ |
| icon        | 自定义图标   |
| title       | 自定义标题   |
| subtitle    | 自定义子标题 |
| description | 自定义描述   |

### Step Methods

| 方法名     | 说明              | 参数 |
| ---------- | ----------------- | ---- |
| getElement | 获取步骤 DOM 元素 | -    |
| getIndex   | 获取步骤索引      | -    |

## 无障碍支持

- 使用 `role="navigation"` 标识导航区域
- 使用 `aria-current="step"` 标识当前步骤
- 使用 `aria-disabled` 标识禁用状态
- 支持键盘导航（Enter 和 Space 键）
- 支持屏幕阅读器
- 支持 `prefers-reduced-motion` 减少动画

## 主题定制

可以通过 CSS 变量自定义步骤条样式：

```css
:root {
  --ex-color-neon-blue-500: #00f0ff;
  --ex-color-success: #10b981;
  --ex-color-error: #ef4444;
  --ex-color-border-secondary: #374151;
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
