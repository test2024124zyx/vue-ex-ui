# FileDownload 文件下载

在浏览器中触发链接下载，或通过 Fetch / XHR 获取文件并报告读取进度。

## Link 传输

`link` 只负责创建并点击下载链接。浏览器接管后组件会触发 `trigger`，不会把未知的磁盘保存结果报告为 `success`。

```vue
<template>
  <ExFileDownload
    url="/downloads/manual.pdf"
    filename="manual.pdf"
    transport="link"
    @trigger="handleTrigger"
  />
</template>
```

## Fetch 与进度

Fetch 和 XHR 会在响应读取完成后创建 Blob 下载。服务端未提供 `Content-Length` 时，`percent` 与 `total` 为 `null`，组件只显示已读取字节。

```vue
<script setup lang="ts">
import type { ExFileDownloadProgress } from 'vue-ex-ui';

const handleProgress = (progress: ExFileDownloadProgress) => {
  console.log(progress.loaded, progress.total, progress.percent);
};
</script>

<template>
  <ExFileDownload
    url="/api/exports/report"
    transport="fetch"
    :headers="{ Authorization: 'Bearer token' }"
    with-credentials
    @progress="handleProgress"
  />
</template>
```

显式 `filename` 的优先级高于响应的 `Content-Disposition` 和 URL 路径文件名。

## 取消请求

`cancel()` 只会在存在活动 Fetch / XHR 请求时返回 `true` 并触发 `cancel`。Link 已由浏览器接管，不能取消。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import type { ExFileDownloadExposed } from 'vue-ex-ui';

const downloader = ref<ExFileDownloadExposed | null>(null);

const cancelDownload = () => {
  downloader.value?.cancel();
};
</script>

<template>
  <ExFileDownload
    ref="downloader"
    url="/api/exports/large-file"
    transport="xhr"
  />
  <ExButton @click="cancelDownload">取消下载</ExButton>
</template>
```

## 自定义触发器和进度

默认插槽替换触发器，`progress` 插槽只替换活动请求的进度视图。

```vue
<template>
  <ExFileDownload
    url="/api/exports/archive"
    transport="fetch"
  >
    <template #default="{ download, cancel, status, disabled }">
      <ExButton
        :disabled="disabled"
        @click="download"
      >
        {{ status === 'downloading' ? '正在获取' : '获取文件' }}
      </ExButton>
      <ExButton
        v-if="status === 'downloading'"
        @click="cancel"
      >
        取消
      </ExButton>
    </template>

    <template #progress="{ progress }">
      <output>已读取 {{ progress.loaded }} 字节</output>
    </template>
  </ExFileDownload>
</template>
```

## API

### Props

| 参数             | 说明                             | 类型                         | 默认值      |
| ---------------- | -------------------------------- | ---------------------------- | ----------- |
| url              | HTTP、HTTPS、Blob 或相对下载地址 | `string`                     | 必填        |
| filename         | 建议文件名                       | `string`                     | 响应或 URL  |
| transport        | 下载传输方式                     | `'link' \| 'fetch' \| 'xhr'` | `'link'`    |
| show-progress    | 活动 Fetch / XHR 是否显示进度    | `boolean`                    | `true`      |
| headers          | Fetch / XHR 请求头               | `Record<string, string>`     | -           |
| with-credentials | Fetch 使用 include，XHR 携带凭证 | `boolean`                    | `false`     |
| button-text      | 固定按钮文案                     | `string`                     | 按状态翻译  |
| button-type      | 默认按钮类型                     | `ButtonType`                 | `'primary'` |
| button-size      | 默认按钮尺寸                     | `ButtonSize`                 | `'medium'`  |
| disabled         | 是否禁用                         | `boolean`                    | `false`     |

### Events

| 事件名   | 说明                                       | 类型                                           |
| -------- | ------------------------------------------ | ---------------------------------------------- |
| start    | 有效下载开始处理                           | `(transport: ExFileDownloadTransport) => void` |
| progress | Fetch / XHR 已读取数据                     | `(progress: ExFileDownloadProgress) => void`   |
| trigger  | Link 已交给浏览器；不表示文件保存成功      | `(url: string, filename: string) => void`      |
| success  | Fetch / XHR 响应读取完成并已创建 Blob 下载 | `(blob: Blob, filename: string) => void`       |
| error    | 输入、协议、HTTP、网络或浏览器能力错误     | `(error: ExFileDownloadError) => void`         |
| cancel   | 活动 Fetch / XHR 已被调用方取消            | `() => void`                                   |

### Slots

| 名称     | 说明           | 作用域参数                             |
| -------- | -------------- | -------------------------------------- |
| default  | 自定义触发器   | `ExFileDownloadSlotProps`              |
| progress | 自定义进度视图 | `{ progress: ExFileDownloadProgress }` |

### Exposes

| 方法名     | 说明                           | 类型                                  |
| ---------- | ------------------------------ | ------------------------------------- |
| download   | 下载并返回所有路径的可判别结果 | `() => Promise<ExFileDownloadResult>` |
| cancel     | 是否实际取消了活动请求         | `() => boolean`                       |
| getElement | 获取根元素                     | `() => HTMLDivElement \| null`        |

`download()` 不会用空 Blob 模拟 Link 成功，也不会因业务失败产生未处理 Promise rejection。调用方可通过 `outcome` 区分 `triggered`、`success`、`cancelled`、`ignored` 和 `error`。

## 安全与无障碍

- 下载地址拒绝 `javascript:`、`data:` 与 `file:` 协议。
- 文件名会移除路径、控制字符和跨平台保留字符。
- 默认触发器使用原生按钮语义；进度条提供确定或不确定的 ARIA 进度状态。
- Fetch / XHR 仍受浏览器同源策略和服务端 CORS 配置约束。
