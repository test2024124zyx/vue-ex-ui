# QRCode 二维码

用于生成二维码的组件。

<script setup>
import { ref } from 'vue'

const url = ref('https://github.com/vuejs/vue')
const gameUrl = ref('https://game.example.com/join?room=12345')
const playerProfile = ref('https://player.example.com/profile/player001')
const downloadLink = ref('https://download.example.com/game-installer')
const qrcodeRef = ref()

const handleDownload = () => {
  qrcodeRef.value?.download('my-qrcode.png')
}
</script>

## 基础用法

最简单的二维码用法。

::: raw
<div class="demo-container">
  <ExQRCode value="https://github.com/vuejs/vue" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExQRCode value="https://github.com/vuejs/vue" />
</template>
```

:::

## 不同尺寸

通过 `size` 属性可以设置二维码的大小。

::: raw
<div class="demo-container" style="display: flex; gap: 24px; align-items: center; flex-wrap: wrap;">
  <ExQRCode :value="url" :size="100" />
  <ExQRCode :value="url" :size="150" />
  <ExQRCode :value="url" :size="200" />
  <ExQRCode :value="url" :size="250" />
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ExQRCode
    :value="url"
    :size="100"
  />
  <ExQRCode
    :value="url"
    :size="150"
  />
  <ExQRCode
    :value="url"
    :size="200"
  />
  <ExQRCode
    :value="url"
    :size="250"
  />
</template>

<script setup>
import { ref } from 'vue';
const url = ref('https://github.com/vuejs/vue');
</script>
```

:::

## 不同类型

通过 `type` 属性可以设置不同的边框样式。

::: raw
<div class="demo-container" style="display: flex; gap: 24px; flex-wrap: wrap;">
  <div style="text-align: center;">
    <ExQRCode :value="url" type="default" />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Default</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode :value="url" type="primary" />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Primary</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode :value="url" type="success" />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Success</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode :value="url" type="warning" />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Warning</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode :value="url" type="danger" />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Danger</p>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const url = 'https://github.com/vuejs/vue';
</script>

<template>
  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      type="default"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Default</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      type="primary"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Primary</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      type="success"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Success</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      type="warning"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Warning</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      type="danger"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Danger</p>
  </div>
</template>
```

:::

## 自定义颜色

通过 `fgColor` 和 `bgColor` 属性可以自定义二维码的颜色。

::: raw
<div class="demo-container" style="display: flex; gap: 24px; flex-wrap: wrap;">
  <div style="text-align: center;">
    <ExQRCode 
      :value="url" 
      fg-color="#00f0ff"
      bg-color="#0a0a0a"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">霓虹蓝</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode 
      :value="url" 
      fg-color="#ff007f"
      bg-color="#0a0a0a"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">霓虹粉</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode 
      :value="url" 
      fg-color="#10b981"
      bg-color="#ffffff"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">绿色</p>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const url = 'https://github.com/vuejs/vue';
</script>

<template>
  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      fg-color="#00f0ff"
      bg-color="#0a0a0a"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">霓虹蓝</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      fg-color="#ff007f"
      bg-color="#0a0a0a"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">霓虹粉</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      fg-color="#10b981"
      bg-color="#ffffff"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">绿色</p>
  </div>
</template>
```

:::

## 带中心图标

通过 `icon` 插槽可以在二维码中心添加图标或 Logo。

::: raw
<div class="demo-container" style="display: flex; gap: 24px; flex-wrap: wrap;">
  <div style="text-align: center;">
    <ExQRCode :value="gameUrl" type="primary" :icon-size="50">
      <template #icon>
        <img src="https://api.iconify.design/ri/gamepad-line.svg" alt="游戏" style="width: 100%; height: 100%;" />
      </template>
    </ExQRCode>
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">游戏房间</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode :value="playerProfile" type="success" :icon-size="50">
      <template #icon>
        <img src="https://api.iconify.design/ri/user-line.svg" alt="玩家" style="width: 100%; height: 100%;" />
      </template>
    </ExQRCode>
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">玩家资料</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode :value="downloadLink" type="warning" :icon-size="50">
      <template #icon>
        <img src="https://api.iconify.design/ri/download-cloud-line.svg" alt="下载" style="width: 100%; height: 100%;" />
      </template>
    </ExQRCode>
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">下载游戏</p>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const gameUrl = 'https://game.example.com/join?room=12345';
const playerProfile = 'https://player.example.com/profile/player001';
const downloadLink = 'https://download.example.com/game-installer';
</script>

<template>
  <div style="text-align: center;">
    <ExQRCode
      :value="gameUrl"
      type="primary"
      :icon-size="50"
    >
      <template #icon>
        <img
          src="https://api.iconify.design/ri/gamepad-line.svg"
          alt="游戏"
          style="width: 100%; height: 100%;"
        />
      </template>
    </ExQRCode>
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">游戏房间</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode
      :value="playerProfile"
      type="success"
      :icon-size="50"
    >
      <template #icon>
        <img
          src="https://api.iconify.design/ri/user-line.svg"
          alt="玩家"
          style="width: 100%; height: 100%;"
        />
      </template>
    </ExQRCode>
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">玩家资料</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode
      :value="downloadLink"
      type="warning"
      :icon-size="50"
    >
      <template #icon>
        <img
          src="https://api.iconify.design/ri/download-cloud-line.svg"
          alt="下载"
          style="width: 100%; height: 100%;"
        />
      </template>
    </ExQRCode>
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">下载游戏</p>
  </div>
</template>
```

:::

## 错误纠正级别

通过 `level` 属性可以设置错误纠正级别。级别越高，容错能力越强，但二维码越复杂。

::: raw
<div class="demo-container" style="display: flex; gap: 24px; flex-wrap: wrap;">
  <div style="text-align: center;">
    <ExQRCode :value="url" level="L" />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">L (7%)</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode :value="url" level="M" />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">M (15%)</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode :value="url" level="Q" />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Q (25%)</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode :value="url" level="H" />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">H (30%)</p>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const url = 'https://github.com/vuejs/vue';
</script>

<template>
  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      level="L"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">L (7%)</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      level="M"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">M (15%)</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      level="Q"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">Q (25%)</p>
  </div>

  <div style="text-align: center;">
    <ExQRCode
      :value="url"
      level="H"
    />
    <p style="margin-top: 8px; color: var(--ex-color-text-secondary);">H (30%)</p>
  </div>
</template>
```

:::

## 无边框

设置 `bordered` 为 `false` 可以移除边框。

::: raw
<div class="demo-container">
  <ExQRCode :value="url" :bordered="false" />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const url = 'https://github.com/vuejs/vue';
</script>

<template>
  <ExQRCode
    :value="url"
    :bordered="false"
  />
</template>
```

:::

## 自定义圆角

通过 `border-radius` 属性可以自定义圆角大小。

::: raw
<div class="demo-container" style="display: flex; gap: 24px; flex-wrap: wrap;">
  <ExQRCode :value="url" :border-radius="0" />
  <ExQRCode :value="url" :border-radius="8" />
  <ExQRCode :value="url" :border-radius="16" />
  <ExQRCode :value="url" :border-radius="100" />
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const url = 'https://github.com/vuejs/vue';
</script>

<template>
  <ExQRCode
    :value="url"
    :border-radius="0"
  />
  <ExQRCode
    :value="url"
    :border-radius="8"
  />
  <ExQRCode
    :value="url"
    :border-radius="16"
  />
  <ExQRCode
    :value="url"
    :border-radius="100"
  />
</template>
```

:::

## 下载二维码

可以通过组件暴露的 `download` 方法下载二维码。

::: raw
<div class="demo-container">
  <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
    <ExQRCode ref="qrcodeRef" :value="url" type="primary" />
    <ExButton type="primary" @click="handleDownload">
      <template #prefix>
        <img src="https://api.iconify.design/ri/download-line.svg" alt="下载" width="16" height="16" />
      </template>
      下载二维码
    </ExButton>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
    <ExQRCode
      ref="qrcodeRef"
      :value="url"
      type="primary"
    />
    <ExButton
      type="primary"
      @click="handleDownload"
    >
      <template #prefix>
        <img
          src="https://api.iconify.design/ri/download-line.svg"
          alt="下载"
          width="16"
          height="16"
        />
      </template>
      下载二维码
    </ExButton>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const url = ref('https://github.com/vuejs/vue');
const qrcodeRef = ref();

const handleDownload = () => {
  qrcodeRef.value?.download('my-qrcode.png');
};
</script>
```

:::

## API

### QRCode Props

| 属性             | 说明                                | 类型                                                           | 默认值      |
| ---------------- | ----------------------------------- | -------------------------------------------------------------- | ----------- |
| `value`          | 二维码内容                          | `string`                                                       | -           |
| `size`           | 二维码大小（归一化到 32–2048 像素） | `number`                                                       | `200`       |
| `level`          | 错误纠正级别                        | `'L' \| 'M' \| 'Q' \| 'H'`                                     | `'M'`       |
| `bg-color`       | 背景颜色                            | `string`                                                       | `'#ffffff'` |
| `fg-color`       | 前景颜色                            | `string`                                                       | `'#000000'` |
| `include-margin` | 是否包含边距                        | `boolean`                                                      | `true`      |
| `bordered`       | 是否显示边框                        | `boolean`                                                      | `true`      |
| `border-radius`  | 边框圆角                            | `number`                                                       | `8`         |
| `icon-size`      | 中心图标大小                        | `number`                                                       | `40`        |
| `type`           | 二维码类型                          | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` |
| `error-text`     | 错误提示文本                        | `string`                                                       | `undefined` |
| `aria-label`     | 无障碍标签                          | `string`                                                       | `undefined` |

### QRCode Slots

| 插槽名 | 说明          |
| ------ | ------------- |
| `icon` | 中心图标/Logo |

### QRCode Methods

| 方法名       | 说明                       | 类型                                             |
| ------------ | -------------------------- | ------------------------------------------------ |
| `getElement` | 获取二维码DOM元素          | `() => HTMLDivElement \| null`                   |
| `download`   | 下载二维码                 | `(filename?: string) => void`                    |
| `toDataURL`  | 获取二维码数据URL          | `(type?: 'image/png' \| 'image/jpeg') => string` |
| `refresh`    | 刷新二维码，可等待生成完成 | `() => Promise<void>`                            |

### 错误纠正级别说明

| 级别 | 容错率 | 说明                               |
| ---- | ------ | ---------------------------------- |
| `L`  | 7%     | 低容错，适合内容简单的二维码       |
| `M`  | 15%    | 中等容错，默认级别                 |
| `Q`  | 25%    | 较高容错，适合需要添加图标的二维码 |
| `H`  | 30%    | 高容错，适合复杂环境或需要大图标   |

## 无障碍支持

- 使用 `role="img"` 标记
- 支持 `aria-label` 属性
- 提供错误状态提示

## 注意事项

1. 二维码内容越长，生成的二维码越复杂
2. 添加中心图标会降低扫描成功率，建议使用较高的错误纠正级别（Q 或 H）
3. 自定义颜色时，确保前景色和背景色有足够的对比度
4. 二维码大小建议不小于 100px，以确保扫描成功率

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
