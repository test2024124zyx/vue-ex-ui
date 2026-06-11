# Watermark 水印

在页面或容器内渲染文本或图片水印，用于版权保护、内容标识或敏感信息展示。组件支持丰富的自定义选项，包括文本样式、图片、布局、响应式适配以及程序化控制。

## 基础用法

最简单的用法，默认显示国际化配置的文本水印。
<ExWatermark :fullPage="false">
<div class="demo-container" style="height: 160px; background-color: #f5f7fa; position: relative;">
    
</div>
</ExWatermark>

```vue
<template>
  <!-- 全屏水印 -->
  <ExWatermark />
  
  <!-- 容器水印 -->
  <ExWatermark :fullPage="false" style="height: 200px;">
    <div>您的内容</div>
  </ExWatermark>
</template>
```

## 自定义文本

通过 `text` 属性自定义水印文本，支持字体、颜色、大小等样式设置。
<ExWatermark
      text="机密文档"
      color="#ff4d4f"
      :font-size="18"
      font-weight="bold"
      :fullPage="false">
<div class="demo-container" style="height: 160px; background-color: #f5f7fa; position: relative;">
</div>
</ExWatermark>

```vue
<template>
  <ExWatermark
    text="机密文档"
    color="#ff4d4f"
    :font-size="18"
    font-weight="bold"
    font-family="Microsoft YaHei"
  />
</template>
```

## 多行文本

支持传入字符串数组来显示多行水印文本，可以自定义行间距。

<ExWatermark
      :text="['机密文档', 'CONFIDENTIAL', '2024-11-06']"
      color="#1890ff"
      :font-size="14"
      font-weight="bold"
      :line-height="22"
      :fullPage="false">
<div class="demo-container" style="height: 200px; background-color: #f5f7fa; position: relative;">
</div>
</ExWatermark>

```vue
<template>
  <ExWatermark
    :text="['机密文档', 'CONFIDENTIAL', '2024-11-06']"
    color="#1890ff"
    :font-size="14"
    font-weight="bold"
    :line-height="22"
  />
</template>
```

<ExWatermark
      :text="['公司名称', 'Company Name', 'www.example.com']"
      color="#52c41a"
      :font-size="12"
      :line-height="18"
      :angle="-45"
      :gap-x="150"
      :gap-y="150"
      :fullPage="false">
<div class="demo-container" style="height: 200px; background-color: #f5f7fa; position: relative;">
</div>
</ExWatermark>

```vue
<template>
  <ExWatermark
    :text="['公司名称', 'Company Name', 'www.example.com']"
    color="#52c41a"
    :font-size="12"
    :line-height="18"
    :angle="-45"
  />
</template>
```

## 布局控制

精确控制水印的间距、角度和偏移位置。
 <ExWatermark
      text="DRAFT"
      :gap-x="100"
      :gap-y="80"
      :angle="45"
      :offset-x="10"
      :offset-y="10"
      :opacity="0.4"
      :fullPage="false">
<div class="demo-container" style="height: 160px; background-color: #f5f7fa; position: relative;">
</div>
</ExWatermark>


```vue
<template>
  <ExWatermark
    text="DRAFT"
    :gap-x="100"    <!-- 水平间距 -->
    :gap-y="80"     <!-- 垂直间距 -->
    :angle="45"     <!-- 旋转角度 -->
    :offset-x="10"  <!-- 水平偏移 -->
    :offset-y="10"  <!-- 垂直偏移 -->
    :opacity="0.4"  <!-- 透明度 -->
  />
</template>
```

## 图片水印

使用图片作为水印，支持 SVG、PNG、JPG 等格式。
<ExWatermark
      type="image"
      :image-width="80"
      :image-height="32"
      :gap-x="120"
      :gap-y="100"
      :fullPage="false"
      image-src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTg5MEZGIiByeD0iNCIvPgo8dGV4dCB4PSI1MCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJzeXN0ZW0tdWkiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TG9nbyA8L3RleHQ+Cjwvc3ZnPgo="
    >
<div class="demo-container" style="height: 160px; background-color: #f5f7fa; position: relative;">
</div>
</ExWatermark>

```vue
<template>
  <ExWatermark
    type="image"
    :image-width="80"
    :image-height="32"
    image-src="/path/to/logo.png"
    cross-origin="anonymous"
  />
</template>
```

## 容器模式

在指定容器内显示水印，适用于卡片、表格等局部区域。

<div style="height: 200px; border: 2px dashed #d9d9d9; border-radius: 6px; background-color: #fafafa;">
    <ExWatermark :fullPage="false" text="内部文档" :opacity="0.2">
      <div style="padding: 20px; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <h3 style="margin: 0 0 16px 0; color: #262626;">重要内容区域</h3>
        <p style="margin: 0; color: #595959; text-align: center;">
          这里是需要添加水印保护的内容区域。<br>
          水印会自动覆盖整个容器，不影响内容的正常显示和交互。
        </p>
      </div>
    </ExWatermark>
</div>

```vue
<template>
  <ExWatermark :fullPage="false" text="内部文档" style="height: 300px;">
    <div class="content">
      <h3>重要内容</h3>
      <p>这里是需要保护的内容...</p>
    </div>
  </ExWatermark>
</template>
```

## 响应式适配

水印支持响应式设计和高分屏适配，在不同设备上都能保持清晰显示。
<ExWatermark
      text="响应式水印"
      :responsive="true"
      :dpr-aware="true"
      :fullPage="false"
    >
<div class="demo-container" style="height: 160px; background-color: #f5f7fa; position: relative;">
    
</div>
</ExWatermark>

```vue
<template>
  <ExWatermark
    :responsive="true"    <!-- 窗口变化时自动重绘 -->
    :dpr-aware="true"     <!-- 高分屏适配 -->
    :throttle-ms="200"    <!-- 重绘节流间隔 -->
  />
</template>
```

## 交互控制

控制水印的交互行为，如鼠标事件穿透、文本选择等。
<ExWatermark
      text="可选择文本"
      :selectable="true"
      pointer-events="auto"
      :fullPage="false"
    >
<div class="demo-container" style="height: 160px; background-color: #f5f7fa; position: relative;">
</div>
</ExWatermark>

```vue
<template>
  <ExWatermark
    :selectable="true"        <!-- 允许选择水印文本 -->
    pointer-events="auto"     <!-- 允许鼠标交互 -->
    :z-index="999"           <!-- 控制层级 -->
  />
</template>
```

## 防篡改保护

启用防篡改保护后，组件会使用 MutationObserver 监听 DOM 变化，自动恢复被删除或隐藏的水印。

<ExWatermark
      :anti-tamper="true"
      text="受保护的水印"
      color="#ff4d4f"
      :font-size="16"
      font-weight="bold"
      :fullPage="false"
    >
<div class="demo-container" style="height: 160px; background-color: #f5f7fa; position: relative;">
  <div style="padding: 20px;">
    <p style="margin: 0 0 12px 0; color: #262626;">此水印启用了防篡改保护</p>
    <p style="margin: 0; color: #8c8c8c; font-size: 14px;">
      尝试通过浏览器开发者工具删除或隐藏水印，它会自动恢复
    </p>
  </div>
</div>
</ExWatermark>

```vue
<template>
  <ExWatermark
    :anti-tamper="true"
    text="受保护的水印"
  >
    <div class="content">
      此水印启用了防篡改保护，无法通过修改 DOM 删除
    </div>
  </ExWatermark>
</template>
```

::: warning 性能提示
防篡改保护会持续监听 DOM 变化，可能对性能有轻微影响。建议仅在需要高安全性的场景下启用。
:::

## 程序化控制

通过组件实例方法实现动态控制和数据导出。

<script setup>
import { ref } from 'vue';

const watermarkRef = ref(null);
const currentText = ref('初始文本');

const updateWatermark = () => {
  currentText.value = `更新时间: ${new Date().toLocaleTimeString()}`;
  // 手动刷新（通常不需要，props 变化会自动刷新）
  setTimeout(() => {
    watermarkRef.value?.refresh();
  }, 0);
};

const exportWatermark = () => {
  const dataUrl = watermarkRef.value?.toDataURL();
  if (dataUrl) {
    // 创建下载链接
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'watermark.png';
    link.click();
  }
};
</script>
  <ExWatermark 
    ref="watermarkRef" 
    :fullPage="false" 
    :text="currentText"
    color="#1890ff"
  >
<div class="demo-container" style="height: 160px; background-color: #f5f7fa; position: relative;">
 
</div>
</ExWatermark>

<div style="margin-top: 12px; display: flex; gap: 8px;">
  <ExButton @click="updateWatermark" >
    更新文本
  </ExButton>
  <ExButton @click="exportWatermark" >
    导出水印
  </ExButton>
</div>

```vue
<script setup>
import { ref } from 'vue';

const watermarkRef = ref(null);
const text = ref('初始文本');

const updateText = () => {
  text.value = `更新于 ${new Date().toLocaleTimeString()}`;
};

const exportWatermark = () => {
  const dataUrl = watermarkRef.value?.toDataURL();
  // 处理导出的 base64 数据...
};

const manualRefresh = () => {
  watermarkRef.value?.refresh();
};
</script>

<template>
  <ExWatermark ref="watermarkRef" :text="text" />
  <button @click="updateText">更新文本</button>
  <button @click="exportWatermark">导出水印</button>
</template>
```

## 多种样式组合

展示不同样式组合的效果。


<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;">
  <ExWatermark 
        :fullPage="false" 
        text="CONFIDENTIAL" 
        color="rgba(255,255,255,0.3)"
        :font-size="16"
        font-weight="bold"
        :angle="0"
        :gap-x="150"
        :gap-y="60"
      >
  <div style="height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; border-radius: 8px;">
    
  </div>
  </ExWatermark>
  <ExWatermark 
        :fullPage="false" 
        text="SAMPLE"
        color="#ff7875"
        :font-size="20"
        font-weight="bold"
        :angle="-45"
        :gap-x="80"
        :gap-y="80"
        :opacity="0.6"
      >
  <div style="height: 120px; background: #f0f2f5; position: relative; border-radius: 8px;">
  </div>
  </ExWatermark>
</div>

## API 参考

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| type | 水印类型 | `'text' \| 'image'` | `'text'` |
| fullPage | 是否全屏显示 | `boolean` | `true` |
| repeat | 是否重复平铺 | `boolean` | `true` |
| angle | 旋转角度（度） | `number` | `-30` |
| gapX | 水平间距（px） | `number` | `120` |
| gapY | 垂直间距（px） | `number` | `120` |
| offsetX | 水平偏移（px） | `number` | `0` |
| offsetY | 垂直偏移（px） | `number` | `0` |
| zIndex | CSS z-index | `number` | `900` |
| opacity | 透明度 (0-1) | `number` | `0.3` |
| pointerEvents | CSS pointer-events | `'none' \| 'auto'` | `'none'` |
| selectable | 文本是否可选中 | `boolean` | `false` |

#### 文本相关

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| text | 文本内容，支持字符串或字符串数组（多行） | `string \| string[]` | `''` |
| fontFamily | 字体族 | `string` | `'system-ui'` |
| fontSize | 字体大小（px） | `number` | `14` |
| fontWeight | 字重 | `'normal' \| 'bold' \| number` | `'normal'` |
| color | 文本颜色 | `string` | `'rgba(0,0,0,0.8)'` |
| lineHeight | 多行文本的行间距（px） | `number` | `20` |

#### 图片相关

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| imageSrc | 图片地址 | `string` | `''` |
| imageWidth | 图片宽度（px） | `number` | `120` |
| imageHeight | 图片高度（px） | `number` | `64` |
| crossOrigin | 图片跨域设置 | `'anonymous' \| 'use-credentials'` | `undefined` |

#### 高级配置

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| responsive | 窗口变化时自动重绘 | `boolean` | `true` |
| dprAware | 高分屏适配 | `boolean` | `true` |
| throttleMs | 重绘节流间隔（ms） | `number` | `100` |
| antiTamper | 启用防篡改保护 | `boolean` | `false` |

### Slots

| 名称 | 说明 |
| --- | --- |
| default | 容器模式下的内容区域 |

### 方法

通过 `ref` 获取组件实例后可调用以下方法：

| 方法名 | 说明 | 返回值 |
| --- | --- | --- |
| refresh() | 手动重绘水印 | `void` |
| toDataURL() | 获取水印图案的 base64 数据 | `string` |

### 样式变量

可通过 CSS 变量自定义样式：

```css
:root {
  --wm-z-index: 900;
  --wm-pointer-events: none;
  --wm-user-select: none;
}
```

## 最佳实践

### 1. 性能优化

```vue
<template>
  <!-- 对于静态水印，可以关闭响应式 -->
  <ExWatermark 
    :responsive="false" 
    :throttle-ms="200"
  />
</template>
```

### 2. 安全考虑

```vue
<template>
  <!-- 使用较低的透明度、禁用交互并启用防篡改保护 -->
  <ExWatermark 
    :opacity="0.1"
    pointer-events="none"
    :selectable="false"
    :anti-tamper="true"
  />
</template>
```

### 3. 国际化支持

```javascript
// 在 locale 配置中定义水印文本
export default {
  watermark: {
    text: 'Confidential Document',
    copyright: '© 2024 Your Company'
  }
}
```

### 4. 响应式设计

```vue
<template>
  <!-- 在不同屏幕尺寸下调整水印参数 -->
  <ExWatermark 
    :font-size="isMobile ? 12 : 16"
    :gap-x="isMobile ? 80 : 120"
    :gap-y="isMobile ? 60 : 100"
  />
</template>