# FileDownload 文件下载

支持多种下载方式，显示下载进度的文件下载组件。

<script setup>
import { ref } from 'vue'
</script>

## 基础用法

使用 `link` 方法进行简单的文件下载。

<div class="demo-container">
  <ExSpace>
    <ExFileDownload
      url="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920"
      filename="game-screenshot.jpg"
      method="link"
      button-text="下载游戏截图"
    />
    <ExFileDownload
      url="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920"
      filename="racing-game.jpg"
      method="link"
      button-text="下载赛车图片"
      button-type="success"
    />
  </ExSpace>
</div>

```vue
<template>
  <ExFileDownload
    url="https://example.com/file.pdf"
    filename="document.pdf"
    method="link"
    button-text="下载文件"
  />
</template>
```

## 显示下载进度

使用 `xhr` 或 `fetch` 方法可以显示下载进度。

<div class="demo-container">
  <ExFileDownload
    url="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=3840"
    filename="large-image.jpg"
    method="xhr"
    :show-progress="true"
    button-text="下载大图（显示进度）"
  />
</div>

```vue
<template>
  <ExFileDownload
    url="https://example.com/large-file.zip"
    filename="game-assets.zip"
    method="xhr"
    :show-progress="true"
  />
</template>
```

## 不同下载方式

支持三种下载方式：`link`、`fetch`、`xhr`。

<div class="demo-container">
  <ExSpace direction="vertical" :size="12">
    <div>
      <div style="color: var(--ex-color-text-secondary); font-size: 14px; margin-bottom: 8px;">
        Link 方式（简单快速，无进度）
      </div>
      <ExFileDownload
        url="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
        filename="image-link.jpg"
        method="link"
        button-text="Link 下载"
        button-size="small"
      />
    </div>
    <div>
      <div style="color: var(--ex-color-text-secondary); font-size: 14px; margin-bottom: 8px;">
        Fetch 方式（支持进度，现代浏览器）
      </div>
      <ExFileDownload
        url="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800"
        filename="image-fetch.jpg"
        method="fetch"
        :show-progress="true"
        button-text="Fetch 下载"
        button-size="small"
        button-type="success"
      />
    </div>
    <div>
      <div style="color: var(--ex-color-text-secondary); font-size: 14px; margin-bottom: 8px;">
        XHR 方式（支持进度，兼容性好）
      </div>
      <ExFileDownload
        url="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800"
        filename="image-xhr.jpg"
        method="xhr"
        :show-progress="true"
        button-text="XHR 下载"
        button-size="small"
        button-type="warning"
      />
    </div>
  </ExSpace>
</div>

```vue
<template>
  <!-- Link 方式 -->
  <ExFileDownload url="https://example.com/file.pdf" filename="document.pdf" method="link" />

  <!-- Fetch 方式 -->
  <ExFileDownload
    url="https://example.com/file.zip"
    filename="archive.zip"
    method="fetch"
    :show-progress="true"
  />

  <!-- XHR 方式 -->
  <ExFileDownload
    url="https://example.com/file.zip"
    filename="archive.zip"
    method="xhr"
    :show-progress="true"
  />
</template>
```

## 自动下载

设置 `auto-download` 为 `true` 可以在组件挂载时自动开始下载。

> 下方演示为避免打开页面即触发下载，特意设置了 `:auto-download="false"`，请点击按钮体验；实际使用时按需改为 `true`。

<div class="demo-container">
  <ExFileDownload
    url="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
    filename="auto-download.jpg"
    method="link"
    :auto-download="false"
    button-text="点击下载"
  />
</div>

```vue
<template>
  <ExFileDownload
    url="https://example.com/file.pdf"
    filename="document.pdf"
    method="link"
    :auto-download="true"
  />
</template>
```

## 自定义按钮

可以自定义下载按钮的样式和内容。

<div class="demo-container">
  <ExSpace>
    <ExFileDownload
      url="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920"
      filename="custom-button.jpg"
      method="link"
      button-text="自定义按钮"
      button-type="primary"
      button-size="large"
    />
    <ExFileDownload
      url="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920"
      filename="custom-button-2.jpg"
      method="link"
      button-type="danger"
      button-size="small"
      button-text="小按钮"
    />
  </ExSpace>
</div>

```vue
<template>
  <ExFileDownload
    url="https://example.com/file.pdf"
    filename="document.pdf"
    method="link"
    button-text="立即下载"
    button-type="primary"
    button-size="large"
  />
</template>
```

## 游戏资源下载示例

展示游戏资源包的下载列表。

<div class="demo-container">
  <ExSpace direction="vertical" :size="16">
    <ExCard hoverable>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="https://api.iconify.design/ri/folder-zip-line.svg" alt="压缩包" width="32" height="32" style="filter: brightness(0) saturate(100%) invert(70%) sepia(10%) saturate(500%) hue-rotate(180deg);">
          <div>
            <div style="font-weight: 600; color: var(--ex-color-text-primary);">角色资源包</div>
            <div style="font-size: 12px; color: var(--ex-color-text-secondary); margin-top: 4px;">包含所有角色模型和贴图 (125 MB)</div>
          </div>
        </div>
        <ExFileDownload
          url="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1920"
          filename="characters.zip"
          method="link"
          button-text="下载"
          button-size="small"
        />
      </div>
    </ExCard>
    <ExCard hoverable>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="https://api.iconify.design/ri/music-line.svg" alt="音频" width="32" height="32" style="filter: brightness(0) saturate(100%) invert(70%) sepia(10%) saturate(500%) hue-rotate(180deg);">
          <div>
            <div style="font-weight: 600; color: var(--ex-color-text-primary);">音频资源包</div>
            <div style="font-size: 12px; color: var(--ex-color-text-secondary); margin-top: 4px;">背景音乐和音效文件 (85 MB)</div>
          </div>
        </div>
        <ExFileDownload
          url="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1920"
          filename="audio.zip"
          method="link"
          button-text="下载"
          button-size="small"
          button-type="success"
        />
      </div>
    </ExCard>
    <ExCard hoverable>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="https://api.iconify.design/ri/map-line.svg" alt="地图" width="32" height="32" style="filter: brightness(0) saturate(100%) invert(70%) sepia(10%) saturate(500%) hue-rotate(180deg);">
          <div>
            <div style="font-weight: 600; color: var(--ex-color-text-primary);">地图资源包</div>
            <div style="font-size: 12px; color: var(--ex-color-text-secondary); margin-top: 4px;">所有游戏地图和场景 (256 MB)</div>
          </div>
        </div>
        <ExFileDownload
          url="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1920"
          filename="maps.zip"
          method="link"
          button-text="下载"
          button-size="small"
          button-type="warning"
        />
      </div>
    </ExCard>
  </ExSpace>
</div>

```vue
<template>
  <ExSpace direction="vertical">
    <ExCard v-for="pack in resourcePacks" :key="pack.id" hoverable>
      <div class="resource-pack">
        <div class="resource-pack__info">
          <h4>{{ pack.name }}</h4>
          <p>{{ pack.description }} ({{ pack.size }})</p>
        </div>
        <ExFileDownload
          :url="pack.url"
          :filename="pack.filename"
          method="link"
          button-size="small"
        />
      </div>
    </ExCard>
  </ExSpace>
</template>

<script setup>
import { ref } from 'vue';

const resourcePacks = ref([
  {
    id: 1,
    name: '角色资源包',
    description: '包含所有角色模型和贴图',
    size: '125 MB',
    url: '/downloads/characters.zip',
    filename: 'characters.zip',
  },
  // ...
]);
</script>
```

## API

### Props

| 属性             | 说明           | 类型                       | 默认值    |
| ---------------- | -------------- | -------------------------- | --------- |
| url              | 下载URL        | string                     | -         |
| filename         | 文件名         | string                     | -         |
| method           | 下载方式       | 'link' \| 'fetch' \| 'xhr' | 'link'    |
| show-progress    | 是否显示进度   | boolean                    | true      |
| auto-download    | 是否自动下载   | boolean                    | false     |
| button-text      | 按钮文本       | string                     | '下载'    |
| button-type      | 按钮类型       | ButtonType                 | 'primary' |
| button-size      | 按钮尺寸       | ButtonSize                 | 'medium'  |
| headers          | 请求头         | Record<string, string>     | -         |
| with-credentials | 是否携带cookie | boolean                    | false     |

### Events

| 事件名   | 说明                                              | 类型                                                       |
| -------- | ------------------------------------------------- | ---------------------------------------------------------- |
| start    | 开始下载时触发                                    | `() => void`                                               |
| progress | 下载进度更新时触发（仅 `fetch` / `xhr` 方式）     | `(percent: number, loaded: number, total: number) => void` |
| success  | 下载成功时触发（`link` 方式会立即以空 Blob 触发） | `(blob: Blob) => void`                                     |
| error    | 下载失败时触发                                    | `(error: Error) => void`                                   |
| pause    | 暂停下载时触发                                    | `() => void`                                               |
| resume   | 恢复下载时触发                                    | `() => void`                                               |
| cancel   | 取消下载时触发                                    | `() => void`                                               |

### Slots

| 插槽名  | 说明                                 | 作用域参数                                                          |
| ------- | ------------------------------------ | ------------------------------------------------------------------- |
| default | 自定义触发器（替换默认按钮与进度条） | `{ download: () => void, status: DownloadStatus, percent: number }` |

使用默认插槽完全自定义触发器：

```vue
<ExFileDownload url="https://example.com/file.zip" filename="file.zip" method="xhr">
  <template #default="{ download, status, percent }">
    <button :disabled="status === 'downloading'" @click="download">
      {{ status === 'downloading' ? `下载中 ${percent}%` : '下载' }}
    </button>
  </template>
</ExFileDownload>
```

### Methods

通过模板 ref 调用：

| 方法名     | 说明                                 | 类型                           |
| ---------- | ------------------------------------ | ------------------------------ |
| download   | 手动触发下载                         | `() => void`                   |
| pause      | 暂停下载（`fetch` / `xhr` 方式）     | `() => void`                   |
| resume     | 恢复下载（从头重新下载，非断点续传） | `() => void`                   |
| cancel     | 取消下载                             | `() => void`                   |
| getElement | 获取组件根 DOM 元素                  | `() => HTMLDivElement \| null` |

::: warning 关于暂停 / 恢复
组件不支持 HTTP Range 断点续传，`resume()` 会从头重新发起下载。`pause` / `cancel` 仅对 `fetch`、`xhr` 方式有效，`link` 方式由浏览器接管，无法中止。
:::

## 无障碍支持

- 默认触发器使用 `ExButton`，原生支持键盘聚焦与 Enter / Space 触发。
- 下载过程中按钮进入 `loading` 与 `disabled` 状态，避免重复触发。

## 主题定制

文件下载跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，按钮样式可通过 `button-type` / `button-size` 调整，或使用默认插槽完全自定义。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}
</style>
