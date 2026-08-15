# 按需加载

ExUI 支持两种导入方式：全局导入和按需导入。按需导入可以有效减少打包体积，推荐在生产环境使用。

## 全局导入

全局导入会引入所有组件和样式，适合快速开发和原型设计。

```typescript
// main.ts
import { createApp } from 'vue';
import ExUI from 'vue-ex-ui';
import 'vue-ex-ui/style.css';
import App from './App.vue';

const app = createApp(App);
app.use(ExUI);
app.mount('#app');
```

**优点：**

- 使用简单，一次性引入所有组件
- 适合快速开发和原型设计

**缺点：**

- 会包含全部组件代码与完整样式
- 包含未使用的组件代码

## 按需导入（推荐）

按需导入只引入使用的组件，可以有效减少打包体积。

### 方式一：从主包按需导入

这是最简单的按需导入方式，从主包中导入需要的组件。

```typescript
// 在组件文件中
import { ExButton, ExInput, message } from 'vue-ex-ui';
import 'vue-ex-ui/style.css'; // 仍需引入全部样式

export default {
  components: {
    ExButton,
    ExInput,
  },
  methods: {
    handleClick() {
      message.success('操作成功！');
    },
  },
};
```

**使用 Composition API：**

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { ExButton, ExInput, message } from 'vue-ex-ui';
import 'vue-ex-ui/style.css';

const value = ref('');
const handleClick = () => {
  message.success('操作成功！');
};
</script>

<template>
  <div>
    <ExInput
      v-model="value"
      placeholder="请输入"
    />
    <ExButton
      type="primary"
      @click="handleClick"
    >
      提交
    </ExButton>
  </div>
</template>
```

**优点：**

- 代码简洁，易于使用
- 现代打包工具（Vite、Webpack 5）会自动进行 Tree Shaking
- 只打包使用的组件代码

**缺点：**

- 仍需引入全部样式文件（`style.css`）。若想连样式也按需，见下方 **方式三**。

::: tip 关于样式
从主包 `vue-ex-ui` 导入时，JS 会被 Tree Shaking，但样式仍是整包 `style.css`。
如果希望样式也按需加载，请使用 **方式三：组件级按需**（`vue-ex-ui/es/components/*`），
每个组件会自动只加载自己的 CSS。
:::

### 方式二：使用 unplugin-vue-components（自动按需导入）

使用 `unplugin-vue-components` 插件可以实现自动按需导入，无需手动 import。

**1. 安装插件：**

::: code-group

```bash [npm]
npm install -D unplugin-vue-components
```

```bash [yarn]
yarn add -D unplugin-vue-components
```

```bash [pnpm]
pnpm add -D unplugin-vue-components
```

:::

**2. 配置 Vite：**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [
        // ExUI 组件解析器
        componentName => {
          if (componentName.startsWith('Ex')) {
            return {
              name: componentName,
              from: 'vue-ex-ui',
            };
          }
        },
      ],
    }),
  ],
});
```

**3. 直接在模板中使用，无需 import：**

```vue
<script setup lang="ts">
// 无需 import，直接使用
const handleClick = () => {
  console.log('clicked');
};
</script>

<template>
  <div>
    <!-- 组件会自动按需导入 -->
    <ExButton
      type="primary"
      @click="handleClick"
    >
      点击我
    </ExButton>
    <ExInput placeholder="请输入" />
  </div>
</template>
```

**注意：** 配合方式二默认仍需引入整包样式 `vue-ex-ui/style.css`；若要样式也按需，
把解析器的 `from` 指向 `vue-ex-ui/es/components/<kebab-名称>` 并开启 `sideEffects`
即可自动连带该组件 CSS（见方式三）。

```typescript
import 'vue-ex-ui/style.css';
```

### 方式三：组件级按需（JS + CSS 双重按需，生产推荐）

ExUI 额外提供了**保留目录结构的 ESM 产物**（`vue-ex-ui/es/*`）。每个组件的 JS 会
自动 `import` 自己的 scoped CSS，因此「导入一个组件 = 只加载该组件的样式」，无需手动
引入 `style.css`。

只需在应用入口**引入一次全局基础样式**（设计令牌、主题、reset 等组件样式所依赖的
全局 CSS 变量来源）：

```typescript
// main.ts —— 仅需一次
import 'vue-ex-ui/base.css';
```

随后在任意位置按组件导入，CSS 会自动按需加载：

```vue
<script setup lang="ts">
// 只会打包 button / input 两个组件的 JS 与 CSS
import { ExButton } from 'vue-ex-ui/es/components/button';
import { ExInput } from 'vue-ex-ui/es/components/input';
</script>

<template>
  <ExInput placeholder="请输入" />
  <ExButton type="primary">提交</ExButton>
</template>
```

类型同样按子路径提供，`import type { ExButtonProps } from 'vue-ex-ui/es/components/button'`
可正常获得类型提示。

::: tip 配合 unplugin-vue-components 自动按需（含 CSS）

```typescript
Components({
  resolvers: [
    name => {
      if (name.startsWith('Ex')) {
        // ExButton -> button, ExDateTimePicker -> datetime-picker
        const dir = name
          .slice(2)
          .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
          .toLowerCase();
        return { name, from: `vue-ex-ui/es/components/${dir}`, sideEffects: [] };
      }
    },
  ],
});
```

仍需在入口引入一次 `vue-ex-ui/base.css`。少数子组件（如 `ExCheckboxGroup` 属于
`checkbox`、`ExFormItem` 属于 `form`）目录名与组件名不同，可在解析器中做名称映射，
或直接采用上面的手动按需导入。
:::

### 体积对比（示意）

| 导入方式                         | JS                   | CSS                               |
| -------------------------------- | -------------------- | --------------------------------- |
| 全局 `app.use(ExUI)`             | 全量                 | 全量 `style.css`                  |
| 方式一/二（主包）                | 按需（Tree Shaking） | 全量 `style.css`                  |
| **方式三（`/es/components/*`）** | **按需**             | **按需（base.css + 各组件 CSS）** |

## 导入工具函数和 Composables

ExUI 还提供了工具函数和组合式 API，也支持按需导入。

### 导入工具函数

```typescript
import { debounce, throttle, generateId } from 'vue-ex-ui';
```

### 导入 Composables

```typescript
// 主题相关
import { useTheme, setTheme } from 'vue-ex-ui';
```

### 导入国际化

```typescript
// 语言包与切换函数均从主入口导出
import { zhCN, enUS, setLocale, createLocaleProvider } from 'vue-ex-ui';

// 全局切换语言
setLocale('zh-CN');
```

```vue
<template>
  <!-- ConfigProvider 的 locale 接收语言代码字符串 -->
  <ExConfigProvider locale="zh-CN">
    <App />
  </ExConfigProvider>
</template>
```

## 打包体积对比

| 导入方式               | JS 体积                      | CSS 体积                | 适用场景             |
| ---------------------- | ---------------------------- | ----------------------- | -------------------- |
| 全局导入（app.use）    | 全量                         | 全量                    | 快速开发、原型设计   |
| 按需导入（方式一）     | 仅用到的组件（Tree Shaking） | 全量 `style.css`        | 生产环境             |
| 自动按需导入（方式二） | 同方式一                     | 全量 `style.css`        | 追求开发体验         |
| 组件级按需（方式三）   | 仅用到的组件                 | `base.css` + 各组件 CSS | 生产环境（体积最优） |

## 最佳实践

### 开发环境

使用全局导入或自动按需导入，提高开发效率：

```typescript
// main.ts
import ExUI from 'vue-ex-ui';
import 'vue-ex-ui/style.css';

app.use(ExUI);
```

### 生产环境

使用按需导入，减小打包体积：

```typescript
// 只导入使用的组件
import { ExButton, ExInput, ExTable } from 'vue-ex-ui';
import 'vue-ex-ui/style.css';
```

### TypeScript 支持

所有导入方式都完全支持 TypeScript：

```typescript
import type { ExButtonProps, MessageOptions } from 'vue-ex-ui';
import { ExButton, message } from 'vue-ex-ui';

const buttonProps: ExButtonProps = {
  type: 'primary',
  size: 'large',
};

const messageOptions: MessageOptions = {
  content: '操作成功',
  type: 'success',
  duration: 3000,
};

message(messageOptions);
```

## 常见问题

### Q: 为什么按需导入后打包体积还是很大？

A: 请确保：

1. 使用的是现代打包工具（Vite 或 Webpack 5+）
2. 打包工具已启用 Tree Shaking
3. `package.json` 中 `sideEffects` 设置正确
4. 检查是否意外引入了全部样式

### Q: 如何只引入需要的样式？

A: 使用 **方式三（组件级按需）**：入口引入一次 `vue-ex-ui/base.css`，再从
`vue-ex-ui/es/components/<名称>` 导入组件，组件 CSS 会自动按需加载，无需引入整包
`style.css`。

### Q: unplugin-vue-components 不工作？

A: 请确保：

1. 插件版本兼容
2. 配置正确
3. 重启开发服务器
4. 检查组件名称是否以 `Ex` 开头

## 下一步

- 查看 [快速开始](./quickstart) 了解基础用法
- 查看 [主题定制](./theming) 学习如何定制主题
- 查看 [组件文档](/components/) 了解所有可用组件
