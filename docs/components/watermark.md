<script setup lang="ts">
import { ref } from 'vue';

const logoWatermark =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="56" viewBox="0 0 160 56"%3E%3Crect width="160" height="56" rx="8" fill="%2329abe2"/%3E%3Ctext x="80" y="35" text-anchor="middle" font-family="monospace" font-size="18" font-weight="700" fill="%230b0f14"%3EEX // UI%3C/text%3E%3C/svg%3E';
const dynamicText = ref('BUILD // 001');
const watermarkRef = ref<{ refresh: () => Promise<void>; toDataURL: () => string } | null>(null);

const updateDynamicText = () => {
  const current = Number(dynamicText.value.split('//')[1]?.trim() ?? 0);
  dynamicText.value = `BUILD // ${String(current + 1).padStart(3, '0')}`;
};

const exportDynamicWatermark = () => {
  const dataUrl = watermarkRef.value?.toDataURL();
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'ex-watermark.png';
  link.click();
};
</script>

# Watermark 水印

在页面或指定容器上叠加文本或图片标记，用于版权归属、文档状态和敏感信息追踪。水印是辅助识别手段，不等同于数字版权管理或访问控制。

## 基础用法

容器模式不会阻断插槽内容的点击、选择和键盘交互。默认颜色与字体从当前 Ex UI 主题继承，亮色和霓虹暗色主题都能保持合适的视觉权重。

::: raw

<div class="watermark-demo">
  <ex-watermark :full-page="false" text="INTERNAL // EX UI">
    <div class="watermark-demo__content">
      <strong>受保护的业务内容</strong>
      <span>覆盖层默认不参与鼠标与辅助技术交互。</span>
    </div>
  </ex-watermark>
</div>
:::

::: details 查看示例代码

```vue
<div class="watermark-demo">
  <ex-watermark :full-page="false" text="INTERNAL // EX UI">
    <div class="watermark-demo__content">
      <strong>受保护的业务内容</strong>
      <span>覆盖层默认不参与鼠标与辅助技术交互。</span>
    </div>
  </ex-watermark>
</div>
```

:::

## 多行与排版

字符串数组会按 `lineHeight` 居中排版。未显式提供 `color` 和 `fontFamily` 时，Canvas 会读取覆盖层的主题计算样式；也可以通过属性设置字重、字形和对齐方式。

::: raw

<div class="watermark-demo watermark-demo--tall">
  <ex-watermark
    :full-page="false"
    :text="['CONFIDENTIAL', '研发环境 // 2026']"
    :font-size="15"
    :line-height="24"
    :font-weight="700"
    font-style="italic"
    color="#29abe2"
  >
    <div class="watermark-demo__content">
      <strong>多行水印</strong>
      <span>内容尺寸会自动测量，旋转后不会被瓦片边界裁切。</span>
    </div>
  </ex-watermark>
</div>
:::

::: details 查看示例代码

```vue
<div class="watermark-demo watermark-demo--tall">
  <ex-watermark
    :full-page="false"
    :text="['CONFIDENTIAL', '研发环境 // 2026']"
    :font-size="15"
    :line-height="24"
    :font-weight="700"
    font-style="italic"
    color="#29abe2"
  >
    <div class="watermark-demo__content">
      <strong>多行水印</strong>
      <span>内容尺寸会自动测量，旋转后不会被瓦片边界裁切。</span>
    </div>
  </ex-watermark>
</div>
```

:::

## 平铺布局

`gapX`、`gapY` 表示旋转后水印包围盒之间的净间距，不再充当 Canvas 尺寸。默认错位排列可降低规则条带感；需要严格网格时关闭 `staggered`。

::: raw

<div class="watermark-demo-grid">
  <div class="watermark-demo watermark-demo--compact">
    <ex-watermark :full-page="false" text="STAGGERED" :gap-x="36" :gap-y="28">
      <div class="watermark-demo__content"><strong>错位平铺</strong></div>
    </ex-watermark>
  </div>
  <div class="watermark-demo watermark-demo--compact">
    <ex-watermark
      :full-page="false"
      text="ALIGNED"
      :gap-x="36"
      :gap-y="28"
      :staggered="false"
      :angle="0"
    >
      <div class="watermark-demo__content"><strong>对齐平铺</strong></div>
    </ex-watermark>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<div class="watermark-demo-grid">
  <div class="watermark-demo watermark-demo--compact">
    <ex-watermark :full-page="false" text="STAGGERED" :gap-x="36" :gap-y="28">
      <div class="watermark-demo__content"><strong>错位平铺</strong></div>
    </ex-watermark>
  </div>
  <div class="watermark-demo watermark-demo--compact">
    <ex-watermark
      :full-page="false"
      text="ALIGNED"
      :gap-x="36"
      :gap-y="28"
      :staggered="false"
      :angle="0"
    >
      <div class="watermark-demo__content"><strong>对齐平铺</strong></div>
    </ex-watermark>
  </div>
</div>
```

:::

## 图片与失败回退

图片默认以匿名跨域语义和 `referrerPolicy="no-referrer"` 拉取，避免 Canvas 导出被跨域资源污染。远程源图最多读取 64 MiB，解码尺寸受 3200 万像素和 32768 像素单边上限保护；超限或加载失败时组件会触发 `error`，随后回退到 `text` 水印。建议提供 2 倍或 3 倍源图，并同时提供回退文字。

::: raw

<div class="watermark-demo-grid">
  <div class="watermark-demo watermark-demo--compact">
    <ex-watermark
      :full-page="false"
      type="image"
      text="EX UI"
      :image-src="logoWatermark"
      :image-width="80"
      :image-height="28"
      :gap-x="48"
      :gap-y="32"
    >
      <div class="watermark-demo__content"><strong>图片水印</strong></div>
    </ex-watermark>
  </div>
  <div class="watermark-demo watermark-demo--compact">
    <ex-watermark
      :full-page="false"
      type="image"
      image-src="/missing-watermark-image.png"
      text="IMAGE FALLBACK"
      :gap-x="42"
      :gap-y="30"
    >
      <div class="watermark-demo__content"><strong>失败后回退文本</strong></div>
    </ex-watermark>
  </div>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
const logoWatermark =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="56" viewBox="0 0 160 56"%3E%3Crect width="160" height="56" rx="8" fill="%2329abe2"/%3E%3Ctext x="80" y="35" text-anchor="middle" font-family="monospace" font-size="18" font-weight="700" fill="%230b0f14"%3EEX // UI%3C/text%3E%3C/svg%3E';
</script>

<template>
  <div class="watermark-demo-grid">
    <div class="watermark-demo watermark-demo--compact">
      <ex-watermark
        :full-page="false"
        type="image"
        text="EX UI"
        :image-src="logoWatermark"
        :image-width="80"
        :image-height="28"
        :gap-x="48"
        :gap-y="32"
      >
        <div class="watermark-demo__content"><strong>图片水印</strong></div>
      </ex-watermark>
    </div>
    <div class="watermark-demo watermark-demo--compact">
      <ex-watermark
        :full-page="false"
        type="image"
        image-src="/missing-watermark-image.png"
        text="IMAGE FALLBACK"
        :gap-x="42"
        :gap-y="30"
      >
        <div class="watermark-demo__content"><strong>失败后回退文本</strong></div>
      </ex-watermark>
    </div>
  </div>
</template>
```

:::

## 程序化控制

属性变化会自动触发重绘；`refresh()` 适用于宿主字体或外部主题样式发生变化但属性未变的场景。`toDataURL()` 返回当前已提交的最新瓦片，异步图片绘制不会让旧请求覆盖新请求。

::: raw

<div class="watermark-demo">
  <ex-watermark
    ref="watermarkRef"
    :full-page="false"
    :text="dynamicText"
  >
    <div class="watermark-demo__content">
      <strong>{{ dynamicText }}</strong>
      <div class="watermark-demo__actions">
        <ex-button
          size="small"
          @click="updateDynamicText"
        >
          更新文本
        </ex-button>
        <ex-button
          size="small"
          type="secondary"
          @click="exportDynamicWatermark"
        >
          导出瓦片
        </ex-button>
      </div>
    </div>
  </ex-watermark>
</div>
:::

::: details 查看示例代码

```vue
<script setup lang="ts">
import { ref } from 'vue';

const dynamicText = ref('BUILD // 001');
const watermarkRef = ref<{
  refresh: () => Promise<void>;
  toDataURL: () => string;
} | null>(null);

const updateDynamicText = () => {
  const current = Number(dynamicText.value.split('//')[1]?.trim() ?? 0);
  dynamicText.value = `BUILD // ${String(current + 1).padStart(3, '0')}`;
};

const exportDynamicWatermark = () => {
  const dataUrl = watermarkRef.value?.toDataURL();
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = 'ex-watermark.png';
  link.click();
};
</script>

<template>
  <div class="watermark-demo">
    <ex-watermark
      ref="watermarkRef"
      :full-page="false"
      :text="dynamicText"
    >
      <div class="watermark-demo__content">
        <strong>{{ dynamicText }}</strong>
        <div class="watermark-demo__actions">
          <ex-button
            size="small"
            @click="updateDynamicText"
          >
            更新文本
          </ex-button>
          <ex-button
            size="small"
            type="secondary"
            @click="exportDynamicWatermark"
          >
            导出瓦片
          </ex-button>
        </div>
      </div>
    </ex-watermark>
  </div>
</template>
```

:::

## 防篡改

启用后会保护覆盖层的节点、类名、隐藏状态与行内样式，并在覆盖层被删除时触发 `remove`。组件只监听自身容器；开启保护时容器会使用 `overflow: hidden`，防止通过压缩容器暴露未加水印内容。

::: raw

<div class="watermark-demo">
  <ex-watermark :full-page="false" text="PROTECTED // EX UI" :anti-tamper="true">
    <div class="watermark-demo__content">
      <strong>防篡改模式</strong>
      <span>在开发者工具中删除或隐藏覆盖层后，组件会恢复它。</span>
    </div>
  </ex-watermark>
</div>
:::

::: details 查看示例代码

```vue
<div class="watermark-demo">
  <ex-watermark :full-page="false" text="PROTECTED // EX UI" :anti-tamper="true">
    <div class="watermark-demo__content">
      <strong>防篡改模式</strong>
      <span>在开发者工具中删除或隐藏覆盖层后，组件会恢复它。</span>
    </div>
  </ex-watermark>
</div>
```

:::

::: warning 安全边界
DOM 防篡改只能提高删除水印的成本，无法阻止截屏、重新绘制页面或拥有执行权限的攻击者。敏感数据仍应由鉴权、审计和最小权限策略保护。
:::

## 全屏与响应式

`fullPage` 默认为 `true`，覆盖层使用 `position: fixed`。在组件文档或嵌套卡片中通常应显式设置 `:full-page="false"`。`responsive` 开启时会监听窗口尺寸变化并按 `throttleMs` 节流重绘；运行时切换这两个属性会自动重绑监听器。高分屏倍率最多按 4 倍渲染，瓦片同时受 3200 万像素和 32768 像素单边上限保护。切换图片来源会中止旧加载；错误事件不会回显可能带签名参数的完整地址。

::: raw

<div class="watermark-demo watermark-demo--responsive">
  <ex-watermark
    :full-page="false"
    text="RESPONSIVE // EX UI"
    :responsive="true"
    :dpr-aware="true"
    :throttle-ms="160"
  >
    <div class="watermark-demo__content">
      <strong>响应式容器水印</strong>
      <span>调整浏览器宽度时，水印会按节流间隔重新绘制。</span>
    </div>
  </ex-watermark>
</div>
:::

::: details 查看示例代码

```vue
<div class="watermark-demo watermark-demo--responsive">
  <ex-watermark
    :full-page="false"
    text="RESPONSIVE // EX UI"
    :responsive="true"
    :dpr-aware="true"
    :throttle-ms="160"
  >
    <div class="watermark-demo__content">
      <strong>响应式容器水印</strong>
      <span>调整浏览器宽度时，水印会按节流间隔重新绘制。</span>
    </div>
  </ex-watermark>
</div>
```

:::

如需覆盖整个页面，移除示例中的 `:full-page="false"` 即可。全屏模式会真实覆盖当前视口，因此文档演示使用容器模式，避免干扰其他示例。

## API

### Props

<!-- prettier-ignore -->
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 水印内容类型 | `'text' \| 'image'` | `'text'` |
| fullPage | 是否使用固定定位覆盖视口 | `boolean` | `true` |
| repeat | 是否重复平铺 | `boolean` | `true` |
| staggered | 重复时是否错位排列 | `boolean` | `true` |
| angle | 顺时针旋转角度（度） | `number` | `-30` |
| gapX | 旋转包围盒之间的水平净间距（px） | `number` | `120` |
| gapY | 旋转包围盒之间的垂直净间距（px） | `number` | `120` |
| offsetX | 背景图案水平偏移（px），支持负数向左移动 | `number` | `0` |
| offsetY | 背景图案垂直偏移（px），支持负数向上移动 | `number` | `0` |
| zIndex | 覆盖层级；未传时继承 ConfigProvider 的 watermark 语义层 | `number` | `1000` |
| opacity | 覆盖层透明度，运行时限制在 0–1 | `number` | `0.3` |
| pointerEvents | 覆盖层鼠标事件策略 | `'none' \| 'auto'` | `'none'` |
| selectable | 覆盖层 `user-select` 策略；Canvas 图案本身不是可选文本 | `boolean` | `false` |

### 内容与文字

<!-- prettier-ignore -->
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| text | 文本或多行文本；空字符串使用国际化默认值，也作为图片失败回退 | `string \| string[]` | `''` |
| width | 水印内容宽度；文本缺省时自动测量 | `number` | — |
| height | 水印内容高度；文本缺省时自动测量 | `number` | — |
| fontFamily | Canvas 字体族；缺省时读取主题计算样式 | `string` | `''` |
| fontSize | 字体大小（px） | `number` | `14` |
| fontWeight | 字重 | `'normal' \| 'bold' \| number` | `'normal'` |
| fontStyle | 字形 | `'normal' \| 'italic' \| 'oblique'` | `'normal'` |
| textAlign | 文本对齐方式 | `'left' \| 'center' \| 'right'` | `'center'` |
| color | Canvas 填充色；缺省时读取主题计算样式 | `string` | `''` |
| lineHeight | 多行基线间距（px） | `number` | `20` |

### 图片

<!-- prettier-ignore -->
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| imageSrc | 图片地址 | `string` | `''` |
| imageWidth | 图片内容宽度（px），低于 `width` 优先级 | `number` | `120` |
| imageHeight | 图片内容高度（px），低于 `height` 优先级 | `number` | `64` |
| crossOrigin | 图片跨域凭据模式 | `'anonymous' \| 'use-credentials'` | `'anonymous'` |

### 运行时

<!-- prettier-ignore -->
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| responsive | 窗口变化时自动重绘 | `boolean` | `true` |
| dprAware | 根据设备像素比生成高清 Canvas | `boolean` | `true` |
| throttleMs | resize 重绘节流间隔（ms） | `number` | `100` |
| antiTamper | 保护覆盖层 DOM 和关键容器样式 | `boolean` | `false` |

### Events

<!-- prettier-ignore -->
| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| error | 图片加载、Canvas 创建或导出失败时触发 | `(error: Error)` |
| remove | 防篡改模式检测到覆盖层被移除时触发 | `()` |

### Slots

<!-- prettier-ignore -->
| 名称 | 说明 |
| --- | --- |
| default | 被水印覆盖的业务内容 |

### Expose

<!-- prettier-ignore -->
| 方法 | 说明 | 返回值 |
| --- | --- | --- |
| refresh() | 重新测量并绘制水印；异步图片只提交最新请求 | `Promise<void>` |
| toDataURL() | 返回当前已提交瓦片的 PNG data URL | `string` |

<style scoped>
.watermark-demo {
  min-height: 180px;
  overflow: hidden;
  border: 1px solid var(--ex-color-border-primary);
  background: var(--ex-color-bg-secondary);
}

.watermark-demo--tall {
  min-height: 220px;
}

.watermark-demo--compact {
  min-height: 160px;
}

.watermark-demo__content {
  min-height: inherit;
  padding: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--ex-color-text-primary);
  text-align: center;
}

.watermark-demo__content span {
  color: var(--ex-color-text-secondary);
}

.watermark-demo__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
}

.watermark-demo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 720px) {
  .watermark-demo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
