# Card 卡片

通用的卡片容器组件，用于展示游戏内容、玩家信息、战绩统计等。

<script setup>
import { ref } from 'vue'

const loading = ref(false)

const handleCardClick = () => {
  console.log('Card clicked')
}

const handleAction = (action) => {
  console.log('Action:', action)
}
</script>

## 基础用法

最基础的卡片用法。

<div class="demo-container">
  <ExCard>
    <h3 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">游戏卡片</h3>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">这是一个基础的卡片组件，用于展示游戏相关内容。卡片可以包含任意内容，如文本、图片、按钮等。</p>
  </ExCard>
</div>

```vue
<template>
  <ExCard>
    <h3>游戏卡片</h3>
    <p>这是一个基础的卡片组件，用于展示游戏相关内容。</p>
  </ExCard>
</template>
```

## 带封面图

通过 `cover` 属性可以添加封面图片，适合展示游戏截图、角色立绘等。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
  <ExCard 
    cover="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop"
    hoverable
  >
    <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">战术射击</h3>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">5v5 竞技对战，策略制胜</p>
  </ExCard>
  <ExCard 
    cover="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop"
    hoverable
  >
    <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">赛车竞速</h3>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">极速狂飙，挑战极限</p>
  </ExCard>
  <ExCard 
    cover="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=200&fit=crop"
    hoverable
  >
    <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">角色扮演</h3>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">开放世界，自由探索</p>
  </ExCard>
</div>

```vue
<template>
  <ExCard
    cover="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop"
    hoverable
  >
    <h3>战术射击</h3>
    <p>5v5 竞技对战，策略制胜</p>
  </ExCard>
</template>
```

## 不同类型

通过 `type` 属性可以设置不同的卡片类型，每种类型都有独特的边框和头部样式。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
  <ExCard type="default">
    <h4 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">默认卡片</h4>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">默认样式的卡片</p>
  </ExCard>
  <ExCard type="primary">
    <h4 style="margin: 0 0 8px; color: var(--ex-color-neon-blue-500);">主要卡片</h4>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">霓虹蓝主题</p>
  </ExCard>
  <ExCard type="success">
    <h4 style="margin: 0 0 8px; color: var(--ex-color-success);">成功卡片</h4>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">成功状态提示</p>
  </ExCard>
  <ExCard type="warning">
    <h4 style="margin: 0 0 8px; color: var(--ex-color-warning);">警告卡片</h4>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">警告状态提示</p>
  </ExCard>  
  <ExCard type="danger">
    <h4 style="margin: 0 0 8px; color: var(--ex-color-danger);">危险卡片</h4>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">危险状态提示</p>
  </ExCard>
  <ExCard type="info">
    <h4 style="margin: 0 0 8px; color: var(--ex-color-info);">信息卡片</h4>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">信息状态提示</p>
  </ExCard>
</div>

```vue
<template>
  <ExCard type="primary">
    <h4>主要卡片</h4>
    <p>霓虹蓝主题</p>
  </ExCard>
</template>
```

## 可悬停效果

设置 `hoverable` 属性可以让卡片在悬停时有提升和发光效果，适合可点击的卡片。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
  <ExCard 
    type="primary"
    hoverable
    cover="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=150&fit=crop"
  >
    <div style="text-align: center;">
      <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">战绩统计</h3>
      <div style="font-size: 36px; font-weight: bold; color: var(--ex-color-neon-blue-500); margin: 16px 0;">
        850
      </div>
      <p style="margin: 0; color: var(--ex-color-text-secondary);">总胜场</p>
    </div>
  </ExCard>
  <ExCard 
    type="success"
    hoverable
    cover="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=150&fit=crop"
  >
    <div style="text-align: center;">
      <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">成就系统</h3>
      <div style="font-size: 36px; font-weight: bold; color: var(--ex-color-success); margin: 16px 0;">
        85/120
      </div>
      <p style="margin: 0; color: var(--ex-color-text-secondary);">已解锁</p>
    </div>
  </ExCard>
  <ExCard 
    type="warning"
    hoverable
    cover="https://images.unsplash.com/photo-1614294148960-9aa740632a87?w=400&h=150&fit=crop"
  >
    <div style="text-align: center;">
      <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">在线时长</h3>
      <div style="font-size: 36px; font-weight: bold; color: var(--ex-color-warning); margin: 16px 0;">
        1,250h
      </div>
      <p style="margin: 0; color: var(--ex-color-text-secondary);">游戏时长</p>
    </div>
  </ExCard>
</div>

```vue
<template>
  <ExCard
    type="primary"
    hoverable
    cover="https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=150&fit=crop"
  >
    <div style="text-align: center;">
      <h3>战绩统计</h3>
      <div style="font-size: 36px; font-weight: bold;">850</div>
      <p>总胜场</p>
    </div>
  </ExCard>
</template>
```

## 带操作按钮

通过 `actions` 插槽可以添加操作按钮，自动显示在卡片底部。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
  <ExCard 
    type="primary"
    cover="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=180&fit=crop"
  >
    <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">战术大师</h3>
    <p style="margin: 0 0 12px; color: var(--ex-color-text-secondary);">5v5 竞技对战游戏</p>
    <div style="display: flex; gap: 12px; margin-bottom: 12px;">
      <ExBadge :count="999" type="primary" />
      <ExBadge :count="50" type="success" />
    </div>
    <template #actions>
      <ExButton size="small" @click="() => handleAction('view')">查看</ExButton>
      <ExButton type="primary" size="small" @click="() => handleAction('play')">开始游戏</ExButton>
    </template>
  </ExCard>
  <ExCard 
    type="success"
    cover="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=180&fit=crop"
  >
    <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">极速狂飙</h3>
    <p style="margin: 0 0 12px; color: var(--ex-color-text-secondary);">竞速类赛车游戏</p>
    <div style="display: flex; gap: 12px; margin-bottom: 12px;">
      <ExBadge :count="666" type="warning" />
      <ExBadge :count="30" type="info" />
    </div>
    <template #actions>
      <ExButton size="small" @click="() => handleAction('view')">查看</ExButton>
      <ExButton type="success" size="small" @click="() => handleAction('play')">开始游戏</ExButton>
    </template>
  </ExCard>
</div>

```vue
<template>
  <ExCard
    type="primary"
    cover="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=180&fit=crop"
  >
    <h3>战术大师</h3>
    <p>5v5 竞技对战游戏</p>
    <template #actions>
      <ExButton size="small">查看</ExButton>
      <ExButton type="primary" size="small">开始游戏</ExButton>
    </template>
  </ExCard>
</template>
```

## 带头部和底部

通过 `header` 和 `footer` 插槽可以添加头部和底部内容。

<div class="demo-container">
  <ExCard type="primary">
    <template #header>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3 style="margin: 0; color: var(--ex-color-text-primary);">玩家排行榜</h3>
        <ExBadge :count="10" type="danger" />
      </div>
    </template>
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
        <span style="color: var(--ex-color-text-primary);">🥇 Player001</span>
        <span style="color: var(--ex-color-neon-blue-500); font-weight: bold;">9,850</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
        <span style="color: var(--ex-color-text-primary);">🥈 Player002</span>
        <span style="color: var(--ex-color-neon-blue-500); font-weight: bold;">9,520</span>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
        <span style="color: var(--ex-color-text-primary);">🥉 Player003</span>
        <span style="color: var(--ex-color-neon-blue-500); font-weight: bold;">9,180</span>
      </div>
    </div>
    <template #footer>
      <div style="text-align: center;">
        <ExButton type="primary" size="small">查看完整排行榜</ExButton>
      </div>
    </template>
  </ExCard>
</div>

```vue
<template>
  <ExCard type="primary">
    <template #header>
      <h3>玩家排行榜</h3>
    </template>

    <div>排行榜内容...</div>

    <template #footer>
      <ExButton type="primary" size="small">查看完整排行榜</ExButton>
    </template>
  </ExCard>
</template>
```

## 不同尺寸

通过 `size` 属性可以设置不同的卡片尺寸。

<div class="demo-container" style="display: flex; flex-direction: column; gap: 16px;">
  <ExCard size="small">
    <h4 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">小尺寸卡片</h4>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">内边距较小，适合紧凑布局</p>
  </ExCard>
  <ExCard size="medium">
    <h4 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">中等尺寸卡片</h4>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">默认尺寸，适合大多数场景</p>
  </ExCard>
  <ExCard size="large">
    <h4 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">大尺寸卡片</h4>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">内边距较大，适合重要内容展示</p>
  </ExCard>
</div>

```vue
<template>
  <ExCard size="small">
    <h4>小尺寸卡片</h4>
    <p>内边距较小</p>
  </ExCard>

  <ExCard size="medium">
    <h4>中等尺寸卡片</h4>
    <p>默认尺寸</p>
  </ExCard>

  <ExCard size="large">
    <h4>大尺寸卡片</h4>
    <p>内边距较大</p>
  </ExCard>
</template>
```

## 阴影效果

通过 `shadow` 属性可以设置不同的阴影效果，包括霓虹发光效果。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
  <ExCard shadow="none">
    <p style="margin: 0; text-align: center; color: var(--ex-color-text-secondary);">无阴影</p>
  </ExCard>
  <ExCard shadow="sm">
    <p style="margin: 0; text-align: center; color: var(--ex-color-text-secondary);">小阴影</p>
  </ExCard>
  <ExCard shadow="base">
    <p style="margin: 0; text-align: center; color: var(--ex-color-text-secondary);">基础阴影</p>
  </ExCard>
  <ExCard shadow="md">
    <p style="margin: 0; text-align: center; color: var(--ex-color-text-secondary);">中等阴影</p>
  </ExCard>
  <ExCard shadow="lg">
    <p style="margin: 0; text-align: center; color: var(--ex-color-text-secondary);">大阴影</p>
  </ExCard>
  <ExCard shadow="xl">
    <p style="margin: 0; text-align: center; color: var(--ex-color-text-secondary);">超大阴影</p>
  </ExCard>
  <ExCard shadow="neon">
    <p style="margin: 0; text-align: center; color: var(--ex-color-neon-blue-500);">霓虹发光</p>
  </ExCard>
</div>

```vue
<template>
  <ExCard shadow="neon">
    <p>霓虹发光效果</p>
  </ExCard>
</template>
```

## 游戏卡片示例

展示完整的游戏主题卡片设计，包含封面、标签、统计数据和操作按钮。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px;">
  <ExCard 
    type="primary"
    hoverable
    shadow="neon"
    cover="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop"
  >
    <template #header>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3 style="margin: 0; color: var(--ex-color-text-primary);">战术大师</h3>
        <ExBadge count="HOT" type="danger" />
      </div>
    </template>
    <div style="margin-bottom: 12px;">
      <p style="margin: 0 0 12px; color: var(--ex-color-text-secondary);">5v5 竞技对战，策略制胜。团队协作，精准射击，成为战场上的传奇。</p>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <ExTag type="primary" size="small">FPS</ExTag>
        <ExTag type="success" size="small">竞技</ExTag>
        <ExTag type="warning" size="small">团队</ExTag>
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
      <div style="text-align: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
        <div style="font-size: 20px; font-weight: bold; color: var(--ex-color-neon-blue-500);">4.8</div>
        <div style="font-size: 12px; color: var(--ex-color-text-tertiary); margin-top: 4px;">评分</div>
      </div>
      <div style="text-align: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
        <div style="font-size: 20px; font-weight: bold; color: var(--ex-color-neon-blue-500);">1.2M</div>
        <div style="font-size: 12px; color: var(--ex-color-text-tertiary); margin-top: 4px;">玩家</div>
      </div>
      <div style="text-align: center; padding: 12px; background: var(--ex-color-bg-tertiary); border-radius: var(--ex-radius-base);">
        <div style="font-size: 20px; font-weight: bold; color: var(--ex-color-neon-blue-500);">50GB</div>
        <div style="font-size: 12px; color: var(--ex-color-text-tertiary); margin-top: 4px;">大小</div>
      </div>
    </div>
    <template #actions>
      <ExButton size="small">
        <template #prefix>
          <img src="https://api.iconify.design/ri/heart-line.svg" alt="收藏" width="16" height="16" />
        </template>
        收藏
      </ExButton>
      <ExButton type="primary" size="small">
        <template #prefix>
          <img src="https://api.iconify.design/ri/play-line.svg" alt="开始" width="16" height="16" />
        </template>
        开始游戏
      </ExButton>
    </template>
  </ExCard>
</div>

```vue
<template>
  <ExCard
    type="primary"
    hoverable
    shadow="neon"
    cover="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop"
  >
    <template #header>
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <h3>战术大师</h3>
        <ExBadge count="HOT" type="danger" />
      </div>
    </template>

    <p>5v5 竞技对战，策略制胜</p>

    <template #actions>
      <ExButton size="small">收藏</ExButton>
      <ExButton type="primary" size="small">开始游戏</ExButton>
    </template>
  </ExCard>
</template>
```

## 无边框

设置 `bordered` 为 `false` 可以渲染无边框的卡片。

<div class="demo-container">
  <ExCard :bordered="false">
    <h3 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">无边框卡片</h3>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">这是一个无边框的卡片，适合嵌入到其他容器中使用，或者需要更简洁的视觉效果时使用。</p>
  </ExCard>
</div>

```vue
<template>
  <ExCard :bordered="false">
    <h3>无边框卡片</h3>
    <p>无边框卡片内容</p>
  </ExCard>
</template>
```

## 加载状态

通过 `loading` 属性可以显示加载状态，带有霓虹发光的加载动画。

<div class="demo-container">
  <ExCard 
    type="primary"
    :loading="loading"
    cover="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=180&fit=crop"
  >
    <template #header>
      <h3 style="margin: 0; color: var(--ex-color-text-primary);">加载中的卡片</h3>
    </template>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">这个卡片正在加载中，内容会被遮罩层覆盖，并显示加载动画。</p>
    <template #actions>
      <ExButton size="small" @click="loading = !loading">
        {{ loading ? '停止加载' : '开始加载' }}
      </ExButton>
    </template>
  </ExCard>
</div>

```vue
<script setup>
import { ref } from 'vue';

const loading = ref(false);
</script>

<template>
  <ExCard
    type="primary"
    :loading="loading"
    cover="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=180&fit=crop"
  >
    <template #header>
      <h3>加载中的卡片</h3>
    </template>

    <p>卡片内容...</p>

    <template #actions>
      <ExButton size="small" @click="loading = !loading">
        {{ loading ? '停止加载' : '开始加载' }}
      </ExButton>
    </template>
  </ExCard>
</template>
```

## 自定义封面高度

通过 `cover-height` 属性可以自定义封面图片的高度。

<div class="demo-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
  <ExCard 
    cover="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
    :cover-height="300"
    hoverable
  >
    <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">高封面</h3>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">封面高度 300px</p>
  </ExCard>
  <ExCard 
    cover="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=150&fit=crop"
    :cover-height="150"
    hoverable
  >
    <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">矮封面</h3>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">封面高度 150px</p>
  </ExCard>
</div>

```vue
<template>
  <ExCard
    cover="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop"
    :cover-height="300"
    hoverable
  >
    <h3>高封面</h3>
    <p>封面高度 300px</p>
  </ExCard>
</template>
```

## 自定义样式

可以通过 `header-style`、`body-style`、`footer-style` 属性自定义各部分样式。

<div class="demo-container">
  <ExCard 
    type="primary"
    :header-style="{ 
      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 127, 0.2))',
      borderBottom: '2px solid var(--ex-color-neon-blue-500)'
    }"
    :body-style="{ 
      background: 'rgba(0, 0, 0, 0.3)',
      padding: '24px'
    }"
  >
    <template #header>
      <h3 style="margin: 0; color: var(--ex-color-text-primary);">自定义样式卡片</h3>
    </template>
    <p style="margin: 0; color: var(--ex-color-text-secondary);">这是一个自定义样式的卡片，头部和内容区域都应用了自定义样式。</p>
  </ExCard>
</div>

```vue
<template>
  <ExCard
    type="primary"
    :header-style="{
      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 127, 0.2))',
    }"
    :body-style="{
      background: 'rgba(0, 0, 0, 0.3)',
    }"
  >
    <template #header>
      <h3>自定义样式卡片</h3>
    </template>
    <p>自定义样式内容</p>
  </ExCard>
</template>
```

## API

### Card Props

| 属性           | 说明         | 类型                                                                     | 默认值      |
| -------------- | ------------ | ------------------------------------------------------------------------ | ----------- |
| `type`         | 卡片类型     | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'default'` |
| `size`         | 卡片尺寸     | `'small' \| 'medium' \| 'large'`                                         | `'medium'`  |
| `shadow`       | 阴影效果     | `'none' \| 'sm' \| 'base' \| 'md' \| 'lg' \| 'xl' \| 'neon'`             | `'base'`    |
| `bordered`     | 是否显示边框 | `boolean`                                                                | `true`      |
| `hoverable`    | 是否可悬停   | `boolean`                                                                | `false`     |
| `loading`      | 是否加载中   | `boolean`                                                                | `false`     |
| `cover`        | 封面图片 URL | `string`                                                                 | `undefined` |
| `cover-height` | 封面图片高度 | `string \| number`                                                       | `200`       |
| `header-style` | 头部样式     | `string \| Record<string, string \| number>`                             | `undefined` |
| `body-style`   | 内容样式     | `string \| Record<string, string \| number>`                             | `undefined` |
| `footer-style` | 底部样式     | `string \| Record<string, string \| number>`                             | `undefined` |
| `aria-label`   | 无障碍标签   | `string`                                                                 | `undefined` |

### Card Events

| 事件名  | 说明           | 类型                          |
| ------- | -------------- | ----------------------------- |
| `click` | 点击卡片时触发 | `(event: MouseEvent) => void` |

### Card Slots

| 插槽名    | 说明                             |
| --------- | -------------------------------- |
| `default` | 卡片内容                         |
| `cover`   | 自定义封面                       |
| `header`  | 头部内容                         |
| `footer`  | 底部内容                         |
| `actions` | 操作按钮（会自动放在 footer 中） |

### Card Methods

| 方法名       | 说明            | 类型                           |
| ------------ | --------------- | ------------------------------ |
| `getElement` | 获取卡片DOM元素 | `() => HTMLDivElement \| null` |

## 无障碍支持

- 可通过 `aria-label` 为卡片提供无障碍标签
- 尊重用户的「减少动画」(`prefers-reduced-motion`) 偏好
- 注意：Card 默认是内容容器，`click` 事件只是便捷能力。若把整张卡片作为「可点击操作项」，请自行为其补充 `role="button"`、`tabindex="0"` 与键盘事件，或在卡片内放置真正的 `ExButton`/链接来承载交互。

## 主题定制

可以通过 CSS 变量自定义卡片样式：

```css
:root {
  --ex-card-bg: var(--ex-color-bg-secondary);
  --ex-card-header-bg: var(--ex-color-bg-elevated);
  --ex-card-border-color: var(--ex-color-border-primary);
  --ex-card-shadow: var(--ex-shadow-base);
  --ex-card-radius: var(--ex-radius-lg);
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
