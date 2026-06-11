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
  <ExFileDownload
    url="https://example.com/file.pdf"
    filename="document.pdf"
    method="link"
  />
  
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
import { ref } from 'vue'

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
])
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| url | 下载URL | string | - |
| filename | 文件名 | string | - |
| method | 下载方式 | 'link' \| 'fetch' \| 'xhr' | 'link' |
| show-progress | 是否显示进度 | boolean | true |
| auto-download | 是否自动下载 | boolean | false |
| button-text | 按钮文本 | string | '下载' |
| button-type | 按钮类型 | ButtonType | 'primary' |
| button-size | 按钮尺寸 | ButtonSize | 'medium' |
| headers | 请求头 | Record<string, string> | - |
| with-credentials | 是否携带cookie | boolean | false |

### Events

| 事件名 | 说明 | 类型 |
| --- | --- | --- |
| start | 开始下载时触发 | () => void |
| progress | 下载进度更新时触发 | (percent: number) => void |
| success | 下载成功时触发 | (blob: Blob) => void |
| error | 下载失败时触发 | (error: Error) => void |

### Methods

| 方法名 | 说明 | 类型 |
| --- | --- | --- |
| download | 手动触发下载 | () => void |
| abort | 取消下载 | () => void |

## 无障碍支持

- 完整的键盘导航支持
- ARIA 属性标注
- 屏幕阅读器友好

## 主题定制

```css
:root {
  --ex-download-button-bg: var(--ex-color-primary);
  --ex-download-progress-color: var(--ex-color-neon-blue-500);
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
