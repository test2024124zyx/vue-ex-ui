# ConfigProvider 全局配置

为组件提供统一的主题、语言、尺寸与浮层层级。ConfigProvider 使用 Vue 的
provide/inject 机制隔离子树配置；默认包装器使用 `display: contents`，不会额外占满父容器
或改变 Flex/Grid 子项关系。

<script setup>
import { ref } from 'vue'
const themelist = ['neon-blue', 'light']
const current_theme = ref(0)
const current_size = ref(0)
const sizelist = ['small','medium','large']
const theme = ref('neon-blue')
const locale = ref('zh-CN')
const size = ref('medium')
const neonEffect = ref(true)
const animation = ref(true)
const customTheme = ref('neon-blue')
const customSize = ref('medium')
const checked = ref('')
const selected = ref('')
const value2 = ref('')
const numericCode = ref()
const changetheme = () => {
  current_theme.value = (current_theme.value + 1) % themelist.length
  theme.value = themelist[current_theme.value]
}
const changesize = () => {
  current_size.value = (current_size.value + 1) % sizelist.length
  size.value = sizelist[current_size.value]
}
</script>

## 基础用法

在应用的最外层使用 ConfigProvider 包裹，所有子组件都会继承配置。

::: raw
<div class="demo-container">
<ExPanel>
<template #extra>
  <ExButton type="primary" size="small" @click="changetheme()">切换皮肤</ExButton>
  <ExButton type="primary" size="small" @click="changesize()">切换大小</ExButton>
</template>
<ExConfigProvider :theme="theme" :size="size">
    <ex-typography :text="theme"></ex-typography>
    <ex-typography :text="size"></ex-typography>
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      <ExButton type="primary">主要按钮</ExButton><ExRate v-model="current_theme"/><ExAvatar src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=72&h=72&fit=crop&crop=face" />
      <ExInput/><ExSelect/><ExCheckbox v-model="checked">同意用户协议</ExCheckbox> <ExRadio v-model="selected" value="1">选项 1</ExRadio><ExSwitch v-model="value2" /><ex-tag type="success">标签二</ex-tag><ExBadge :count="1">
    <ExAvatar shape="square" src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" />
  </ExBadge>
    </div><ExProgress :percentage="50" />
    <ExButton type="primary" size="large">主要按钮(自定义设置为大按钮)</ExButton>
    <ex-verification-code v-model="numericCode" input-mode="numeric" />
  </ExConfigProvider>
</ExPanel>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExConfigProvider
    theme="neon-blue"
    locale="zh-CN"
    size="medium"
  >
    <ExButton type="primary">主要按钮</ExButton>
    <ExButton type="success">成功按钮</ExButton>
    <ExButton type="warning">警告按钮</ExButton>
  </ExConfigProvider>
  <ExConfigProvider
    theme="light"
    size="small"
  >
    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
      <ExButton type="primary">主要按钮</ExButton>
      <ExButton type="success">成功按钮</ExButton>
      <ExButton type="warning">警告按钮</ExButton>
      <ExButton type="danger">危险按钮</ExButton>
    </div>
  </ExConfigProvider>
</template>
```

:::

::: tip 提示
ConfigProvider 会自动将配置传递给所有子组件，无需手动传递 props。
:::

## 国际化（i18n）

ExUI 默认提供轻量中英文翻译。需要 App 级语言状态或自定义文案时，安装
`createLocaleProvider()`；每个 App 的 composer 相互隔离。

### App 级语言插件

```ts
import { createApp } from 'vue';
import App from './App.vue';
import { createLocaleProvider } from 'vue-ex-ui';

const app = createApp(App);

const i18nProvider = createLocaleProvider({
  locale: 'zh-CN', // 或 'en-US'
  messages: {
    // 可选：合并/覆盖默认文案
    // menu: { search: '查找菜单' }
  },
});

app.use(i18nProvider);
app.mount('#app');
```

未安装可选的 `vue-i18n` 时，上述插件自动保留轻量实现；安装后只会在当前 App 内创建 ExUI
私有的增强翻译器，不会异步调用 `app.use()`，也不会覆盖另一个 App 或模块级 `setLocale()`
状态。它不向宿主暴露 vue-i18n 注入；宿主仍须自行 `app.use(i18n)`，并将同一个响应式语言状态
传给 vue-i18n 与 `ExConfigProvider.locale`。

### 编程式服务继承配置

完整安装 ExUI 或单独安装服务组件后，`app.config.globalProperties` 上的 `$message`、
`$notification`、`$loadingBar` 都是当前 App 独享的实例。组件 `setup()` 内需要继承最近的
ConfigProvider（包括主题、语言、z-index）时，使用对应 hook：

```ts
import {
  useLoadingBarService,
  useLoadingService,
  useMessageService,
  useNotificationService,
} from 'vue-ex-ui';

const message = useMessageService();
const notification = useNotificationService();
const loading = useLoadingService();
const loadingBar = useLoadingBarService();
```

这些 hook 在同一 ConfigProvider 内复用服务，并在 Provider 卸载时清理 DOM 与计时器。
直接导入的 `message` / `notification` / `loadingBar` 是 setup 外使用的模块级便捷单例，不会
猜测某个 App 的上下文。

### 组件中使用

```ts
// ExUI API（未安装 vue-i18n 时自动使用内置翻译）
import { useI18n as useExI18n, useLocale } from 'vue-ex-ui';
const exI18n = useExI18n();
const { t: translateMenu, locale } = useLocale('menu');

// 宿主 API 仅在应用入口已自行 app.use(i18n) 后可用
import { useI18n as useHostI18n } from 'vue-i18n';
const hostI18n = useHostI18n();
```

---

## 主题切换

通过 `theme` 属性可以切换不同的主题风格。点击按钮查看不同主题效果。

::: raw
<div class="demo-container">
  <div style="margin-bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap;">
    <ExButton 
      size="small"
      :type="theme === 'neon-blue' ? 'primary' : 'secondary'"
      @click="theme = 'neon-blue'"
    >
      霓虹蓝
    </ExButton>
    <ExButton 
      size="small"
      :type="theme === 'light' ? 'primary' : 'secondary'"
      @click="theme = 'light'"
    >
      明亮
    </ExButton>
  </div>
  <ExConfigProvider :theme="theme">
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <ExCard type="primary" style="padding: 20px;">
        <h3 style="margin: 0 0 12px; color: var(--ex-color-text-primary);">当前主题：{{ theme }}</h3>
        <p style="margin: 0 0 12px; color: var(--ex-color-text-secondary);">这是一个示例卡片，展示当前主题效果。主题会影响所有子组件的颜色、阴影和视觉效果。</p>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <ExButton type="primary" size="small">主要</ExButton>
          <ExButton type="success" size="small">成功</ExButton>
          <ExButton type="warning" size="small">警告</ExButton>
          <ExButton type="danger" size="small">危险</ExButton>
        </div>
      </ExCard>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <ExBadge :count="5" type="primary">
          <ExButton>消息</ExButton>
        </ExBadge>
        <ExBadge :count="10" type="danger">
          <ExButton>通知</ExButton>
        </ExBadge>
        <ExTag type="primary">标签</ExTag>
        <ExTag type="success">成功</ExTag>
      </div>
    </div>
  </ExConfigProvider>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const theme = ref('neon-blue');
</script>

<template>
  <ExConfigProvider :theme="theme">
    <ExCard type="primary">
      <h3>当前主题：{{ theme }}</h3>
      <p>这是一个示例卡片</p>
    </ExCard>
  </ExConfigProvider>
</template>
```

:::

## 语言切换

通过 `locale` 属性可以切换界面语言。

::: raw
<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <ExButton 
      :type="locale === 'zh-CN' ? 'primary' : 'secondary'"
      @click="locale = 'zh-CN'"
    >
      中文
    </ExButton>
    <ExButton 
      :type="locale === 'en-US' ? 'primary' : 'secondary'"
      @click="locale = 'en-US'"
    >
      English
    </ExButton>
  </div>

  <ExConfigProvider :locale="locale">
    <ExEmpty />
  </ExConfigProvider>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const locale = ref('zh-CN');
</script>

<template>
  <ExConfigProvider :locale="locale">
    <ExEmpty />
  </ExConfigProvider>
</template>
```

:::

## 全局尺寸

通过 `size` 属性可以设置所有组件的默认尺寸。点击按钮查看不同尺寸效果。

::: raw
<div class="demo-container">
  <div style="margin-bottom: 16px; display: flex; gap: 8px;">
    <ExButton 
      size="small"
      :type="customSize === 'small' ? 'primary' : 'secondary'"
      @click="customSize = 'small'"
    >
      小尺寸
    </ExButton>
    <ExButton 
      size="small"
      :type="customSize === 'medium' ? 'primary' : 'secondary'"
      @click="customSize = 'medium'"
    >
      中等尺寸
    </ExButton>
    <ExButton 
      size="small"
      :type="customSize === 'large' ? 'primary' : 'secondary'"
      @click="customSize = 'large'"
    >
      大尺寸
    </ExButton>
  </div>

  <ExConfigProvider :size="customSize">
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <span style="color: var(--ex-color-text-secondary); min-width: 80px;">按钮组件：</span>
        <ExButton type="primary">主要按钮</ExButton>
        <ExButton type="success">成功按钮</ExButton>
        <ExButton type="warning">警告按钮</ExButton>
      </div>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <span style="color: var(--ex-color-text-secondary); min-width: 80px;">输入框：</span>
        <ExInput placeholder="请输入内容" style="width: 200px;" />
      </div>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <span style="color: var(--ex-color-text-secondary); min-width: 80px;">标签：</span>
        <ExTag type="primary">标签 {{ customSize }}</ExTag>
        <ExTag type="success">成功</ExTag>
        <ExTag type="warning">警告</ExTag>
      </div>
    </div>
  </ExConfigProvider>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const size = ref('medium');
</script>

<template>
  <ExConfigProvider :size="size">
    <ExButton type="primary">按钮</ExButton>
    <ExButton type="success">按钮</ExButton>
  </ExConfigProvider>
</template>
```

:::

## 霓虹效果控制

通过 `neon-effect` 属性可以全局控制霓虹发光效果。禁用后，所有组件的发光效果都会消失。

::: raw
<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <ExButton 
      size="small"
      :type="neonEffect ? 'primary' : 'secondary'"
      @click="neonEffect = !neonEffect"
    >
      {{ neonEffect ? '✨ 霓虹效果：开启' : '🌑 霓虹效果：关闭' }}
    </ExButton>
  </div>
  <ExConfigProvider :neon-effect="neonEffect">
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <ExButton type="primary">主要按钮</ExButton>
        <ExButton type="success">成功按钮</ExButton>
        <ExButton type="warning">警告按钮</ExButton>
      </div>
      <ExCard type="primary" style="padding: 20px;">
        <h4 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">霓虹卡片</h4>
        <p style="margin: 0; color: var(--ex-color-text-secondary);">
          {{ neonEffect ? '霓虹效果已启用，卡片边缘有发光效果' : '霓虹效果已禁用，卡片无发光效果' }}
        </p>
      </ExCard>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <ExBadge :count="99" type="primary">
          <ExButton>消息</ExButton>
        </ExBadge>
        <ExBadge :count="5" type="danger">
          <ExButton>通知</ExButton>
        </ExBadge>
      </div>
    </div>
  </ExConfigProvider>
</div>
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const neonEffect = ref(true);
</script>

<template>
  <ExConfigProvider :neon-effect="neonEffect">
    <ExButton type="primary">主要按钮</ExButton>
    <ExCard type="primary">霓虹卡片</ExCard>
  </ExConfigProvider>
</template>
```

:::

## 动画控制

通过 `animation` 属性可以全局控制动画效果。禁用后，所有过渡和动画都会被移除。

::: raw
<div class="demo-container">
  <div style="margin-bottom: 16px;">
    <ExButton 
      size="small"
      :type="animation ? 'primary' : 'secondary'"
      @click="animation = !animation"
    >
      {{ animation ? '🎬 动画：开启' : '⏸️ 动画：关闭' }}
    </ExButton>
  </div>
  <ExConfigProvider :animation="animation">
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <ExButton type="primary">悬停我</ExButton>
        <ExButton type="success">悬停我</ExButton>
        <ExButton type="warning">悬停我</ExButton>
      </div>
      <ExCard hoverable type="primary" style="padding: 20px;">
        <h4 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">悬停卡片</h4>
        <p style="margin: 0; color: var(--ex-color-text-secondary);">
          {{ animation ? '鼠标悬停时会有平滑的动画效果' : '鼠标悬停时没有动画效果' }}
        </p>
      </ExCard>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <ExTag type="primary" closable>可关闭标签</ExTag>
        <ExTag type="success" closable>可关闭标签</ExTag>
        <ExTag type="warning" closable>可关闭标签</ExTag>
      </div>
    </div>
  </ExConfigProvider>
</div>
:::

::: tip 无障碍支持
ConfigProvider 会自动尊重用户的 `prefers-reduced-motion` 设置。如果用户在系统中启用了"减少动画"选项，动画会自动禁用。
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const animation = ref(true);
</script>

<template>
  <ExConfigProvider :animation="animation">
    <ExButton type="primary">悬停我</ExButton>
    <ExCard hoverable>悬停卡片</ExCard>
  </ExConfigProvider>
</template>
```

:::

## 自定义 z-index

通过 `z-index` 属性可以自定义组件的 z-index 基础值。

::: raw
<div class="demo-container">
  <ExConfigProvider :z-index="2000">
    <ExButton type="primary">z-index 基础值为 2000</ExButton>
  </ExConfigProvider>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExConfigProvider :z-index="2000">
    <ExButton type="primary">z-index 基础值为 2000</ExButton>
  </ExConfigProvider>
</template>
```

:::

## 综合演示

一个完整的示例，展示如何组合使用多个配置选项。

::: raw
<div class="demo-container">
  <ExConfigProvider 
    :theme="customTheme" 
    :size="customSize"
    :neon-effect="neonEffect"
    :animation="animation"
    locale="zh-CN"
  >
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <!-- 控制面板 -->
      <ExCard type="primary" style="padding: 20px;">
        <h4 style="margin: 0 0 16px; color: var(--ex-color-text-primary);">🎛️ 配置控制面板</h4>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">主题：</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <ExButton 
                size="small"
                :type="customTheme === 'neon-blue' ? 'primary' : 'secondary'"
                @click="customTheme = 'neon-blue'"
              >
                霓虹蓝
              </ExButton>
              <ExButton 
                size="small"
                :type="customTheme === 'light' ? 'primary' : 'secondary'"
                @click="customTheme = 'light'"
              >
                赛博亮色
              </ExButton>
            </div>
          </div>
          <div>
            <div style="margin-bottom: 8px; color: var(--ex-color-text-secondary); font-size: 14px;">尺寸：</div>
            <div style="display: flex; gap: 8px;">
              <ExButton 
                size="small"
                :type="customSize === 'small' ? 'primary' : 'secondary'"
                @click="customSize = 'small'"
              >
                小
              </ExButton>
              <ExButton 
                size="small"
                :type="customSize === 'medium' ? 'primary' : 'secondary'"
                @click="customSize = 'medium'"
              >
                中
              </ExButton>
              <ExButton 
                size="small"
                :type="customSize === 'large' ? 'primary' : 'secondary'"
                @click="customSize = 'large'"
              >
                大
              </ExButton>
            </div>
          </div>
          <div style="display: flex; gap: 16px; flex-wrap: wrap;">
            <ExButton 
              size="small"
              :type="neonEffect ? 'success' : 'secondary'"
              @click="neonEffect = !neonEffect"
            >
              {{ neonEffect ? '✨ 霓虹效果' : '🌑 霓虹效果' }}
            </ExButton>
            <ExButton 
              size="small"
              :type="animation ? 'success' : 'secondary'"
              @click="animation = !animation"
            >
              {{ animation ? '🎬 动画' : '⏸️ 动画' }}
            </ExButton>
          </div>
        </div>
      </ExCard>
      <!-- 效果展示 -->
      <ExCard style="padding: 20px;">
        <h4 style="margin: 0 0 16px; color: var(--ex-color-text-primary);">📱 效果预览</h4>
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <ExButton type="primary">主要</ExButton>
            <ExButton type="success">成功</ExButton>
            <ExButton type="warning">警告</ExButton>
            <ExButton type="danger">危险</ExButton>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <ExBadge :count="5" type="primary">
              <ExButton>消息</ExButton>
            </ExBadge>
            <ExBadge :count="99" type="danger">
              <ExButton>通知</ExButton>
            </ExBadge>
            <ExTag type="primary">标签</ExTag>
            <ExTag type="success">成功</ExTag>
          </div>
          <ExInput placeholder="输入框示例" style="max-width: 300px;" />
        </div>
      </ExCard>
    </div>
  </ExConfigProvider>
</div>
:::

::: tip 实时预览
上面的演示是完全交互式的，你可以实时调整配置并查看效果。所有配置都会立即应用到子组件。
:::

::: details 查看示例代码

```vue
<script setup>
import { ref } from 'vue';

const customTheme = ref('neon-blue');
const customSize = ref('medium');
const neonEffect = ref(true);
const animation = ref(true);
</script>

<template>
  <ExConfigProvider
    :theme="customTheme"
    :size="customSize"
    :neon-effect="neonEffect"
    :animation="animation"
    locale="zh-CN"
  >
    <ExCard type="primary">配置控制面板</ExCard>
    <ExCard>效果预览</ExCard>
  </ExConfigProvider>
</template>
```

:::

## 嵌套使用

ConfigProvider 支持嵌套使用，内层配置会覆盖外层配置。

::: raw
<div class="demo-container">
  <ExConfigProvider theme="neon-blue" size="medium">
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div style="padding: 16px; background: rgba(0, 240, 255, 0.1); border-radius: 8px;">
        <div style="margin-bottom: 12px; color: var(--ex-color-text-secondary); font-size: 14px;">
          外层配置：霓虹蓝主题 + 中等尺寸
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <ExButton type="primary">外层按钮</ExButton>
          <ExTag type="primary">外层标签</ExTag>
        </div>
      </div>
      <ExConfigProvider theme="light" size="small">
        <div style="padding: 16px; background: rgba(22, 104, 220, 0.1); border-radius: 8px;">
          <div style="margin-bottom: 12px; color: var(--ex-color-text-secondary); font-size: 14px;">
            内层配置：赛博亮色主题 + 小尺寸（覆盖外层）
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <ExButton type="primary">内层按钮</ExButton>
            <ExTag type="primary">内层标签</ExTag>
          </div>
        </div>
      </ExConfigProvider>
    </div>
  </ExConfigProvider>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExConfigProvider
    theme="neon-blue"
    size="medium"
  >
    <ExButton type="primary">外层配置</ExButton>

    <ExConfigProvider
      theme="light"
      size="small"
    >
      <ExButton type="primary">内层配置覆盖</ExButton>
    </ExConfigProvider>
  </ExConfigProvider>
</template>
```

:::

## 实际应用场景

一个完整的游戏应用示例，展示如何在实际项目中使用 ConfigProvider。

::: raw
<div class="demo-container">
  <ExConfigProvider theme="neon-blue" locale="zh-CN" size="medium">
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <!-- 游戏头部 -->
      <ExCard type="primary" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="margin: 0 0 8px; color: var(--ex-color-text-primary);">🎮 游戏大厅</h3>
            <p style="margin: 0; color: var(--ex-color-text-secondary); font-size: 14px;">欢迎回来，玩家！</p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <ExBadge :count="5" type="danger">
              <ExButton type="primary" size="small">消息</ExButton>
            </ExBadge>
            <ExBadge :count="3" type="warning">
              <ExButton type="success" size="small">任务</ExButton>
            </ExBadge>
          </div>
        </div>
      </ExCard>
      <!-- 游戏统计 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
        <ExCard hoverable style="padding: 16px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: var(--ex-color-neon-blue-500); margin-bottom: 8px;">
            1,250
          </div>
          <div style="color: var(--ex-color-text-secondary); font-size: 14px;">总胜场</div>
        </ExCard>
        <ExCard hoverable style="padding: 16px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: var(--ex-color-success); margin-bottom: 8px;">
            85%
          </div>
          <div style="color: var(--ex-color-text-secondary); font-size: 14px;">胜率</div>
        </ExCard>
        <ExCard hoverable style="padding: 16px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: var(--ex-color-warning); margin-bottom: 8px;">
            Lv.50
          </div>
          <div style="color: var(--ex-color-text-secondary); font-size: 14px;">等级</div>
        </ExCard>
      </div>
      <!-- 快速操作 -->
      <ExCard style="padding: 20px;">
        <h4 style="margin: 0 0 16px; color: var(--ex-color-text-primary);">快速操作</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <ExButton type="primary">开始游戏</ExButton>
          <ExButton type="success">匹配对战</ExButton>
          <ExButton type="warning">训练模式</ExButton>
          <ExButton>设置</ExButton>
        </div>
      </ExCard>
    </div>
  </ExConfigProvider>
</div>
:::

::: tip 应用场景
这个示例展示了如何在应用中使用 ConfigProvider 来统一管理主题、尺寸等配置。所有组件都会自动继承这些配置，无需手动传递 props。
:::

::: details 查看示例代码

```vue
<template>
  <ExConfigProvider
    theme="neon-blue"
    locale="zh-CN"
    size="medium"
  >
    <ExCard type="primary">游戏大厅</ExCard>
    <ExCard hoverable>统计信息</ExCard>
    <ExButton type="primary">开始游戏</ExButton>
  </ExConfigProvider>
</template>
```

:::

## 组合式 API

ConfigProvider 提供了一系列组合式 API，方便在组件中使用配置。

```vue
<script setup>
import {
  useConfig,
  useConfigTheme,
  useGlobalSize,
  useComponentSize,
  useNeonEffect,
  useAnimation,
  useZIndex,
} from 'vue-ex-ui';

// 获取完整配置
const config = useConfig();

// 获取主题
const theme = useConfigTheme();

// 获取全局尺寸
const globalSize = useGlobalSize();

// 获取组件尺寸（支持组件级别覆盖）
const componentSize = useComponentSize(props.size);

// 获取霓虹效果开关
const neonEffect = useNeonEffect();

// 获取动画开关
const animation = useAnimation();

// 获取 z-index
const zIndex = useZIndex(10); // 基础值 + 10
</script>
```

## API

### ConfigProvider Props

| 属性          | 说明             | 类型                             | 默认值        |
| ------------- | ---------------- | -------------------------------- | ------------- |
| `theme`       | 赛博朋克主题     | `'neon-blue' \| 'light'`         | `'neon-blue'` |
| `locale`      | 语言             | `'zh-CN' \| 'en-US'`             | `'en-US'`     |
| `size`        | 全局组件尺寸     | `'small' \| 'medium' \| 'large'` | `'medium'`    |
| `neon-effect` | 是否启用霓虹效果 | `boolean`                        | `true`        |
| `animation`   | 是否启用动画     | `boolean`                        | `true`        |
| `z-index`     | z-index 基础值   | `number`                         | `1000`        |

### ConfigProvider Slots

| 插槽名    | 说明           |
| --------- | -------------- |
| `default` | 配置作用的内容 |

### Composables

#### useConfig()

获取完整的配置上下文。

```typescript
function useConfig(): ConfigContext;
```

#### useConfigTheme()

获取当前主题。

```typescript
function useConfigTheme(): ComputedRef<Theme>;
```

#### useLocale()

获取当前语言。

```typescript
function useLocale(): ComputedRef<SupportedLocale>;
```

#### useGlobalSize()

获取全局尺寸。

```typescript
function useGlobalSize(): ComputedRef<ComponentSize>;
```

#### useComponentSize(componentSize?)

获取组件尺寸（支持组件级别覆盖）。

```typescript
function useComponentSize(
  componentSize?: Ref<ComponentSize | undefined> | ComponentSize
): ComputedRef<ComponentSize>;
```

#### useNeonEffect()

获取霓虹效果开关。

```typescript
function useNeonEffect(): ComputedRef<boolean>;
```

#### useAnimation()

获取动画开关。

```typescript
function useAnimation(): ComputedRef<boolean>;
```

#### useZIndex(offset?)

获取 z-index 值。

```typescript
function useZIndex(offset?: number): ComputedRef<number>;
```

## 最佳实践

### 1. 应用级配置

在应用的根组件使用 ConfigProvider：

```vue
<!-- App.vue -->
<template>
  <ExConfigProvider
    theme="neon-blue"
    locale="zh-CN"
    :neon-effect="true"
    :animation="true"
  >
    <RouterView />
  </ExConfigProvider>
</template>
```

### 2. 局部配置覆盖

在特定区域使用不同配置：

```vue
<template>
  <ExConfigProvider theme="neon-blue">
    <!-- 大部分内容使用霓虹蓝主题 -->
    <div class="main-content">
      <ExButton type="primary">主要按钮</ExButton>
    </div>

    <!-- 特定区域使用赛博亮色主题 -->
    <ExConfigProvider theme="light">
      <div class="special-section">
        <ExButton type="primary">特殊按钮</ExButton>
      </div>
    </ExConfigProvider>
  </ExConfigProvider>
</template>
```

### 3. 响应式主题切换

```vue
<script setup>
import { ref, watch } from 'vue';

const theme = ref('neon-blue');

// 保存主题到 localStorage
watch(theme, newTheme => {
  localStorage.setItem('theme', newTheme);
});

// 从 localStorage 恢复主题
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  theme.value = savedTheme;
}
</script>

<template>
  <ExConfigProvider :theme="theme">
    <div class="theme-switcher">
      <ExButton @click="theme = 'neon-blue'">霓虹蓝</ExButton>
      <ExButton @click="theme = 'light'">赛博亮色</ExButton>
    </div>

    <RouterView />
  </ExConfigProvider>
</template>
```

### 4. 无障碍支持

ConfigProvider 会自动处理无障碍相关的配置：

- 尊重用户的 `prefers-reduced-motion` 设置
- 尊重用户的 `prefers-color-scheme` 设置
- 尊重用户的 `prefers-contrast` 设置

```vue
<template>
  <ExConfigProvider
    :animation="!prefersReducedMotion"
    :theme="prefersDarkMode ? 'neon-blue' : 'light'"
  >
    <App />
  </ExConfigProvider>
</template>
```

## 主题定制

ConfigProvider 支持通过 CSS 变量进行主题定制：

```css
/* 自定义霓虹蓝主题 */
[data-theme='neon-blue'] {
  --ex-color-primary: #00f0ff;
  --ex-color-secondary: #ff007f;
  --ex-color-bg-primary: #0a0a0a;
}

/* 自定义赛博亮色主题 */
[data-theme='light'] {
  --ex-color-primary: #1668dc;
  --ex-color-secondary: #08979c;
  --ex-color-bg-primary: #f4f7fb;
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
