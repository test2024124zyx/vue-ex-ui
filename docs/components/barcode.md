# Barcode 条码

生成各种格式的条码，支持多种样式和主题。

## 基础用法

最基本的条码生成。

<script setup>
</script>

<div class="demo-container">
  <ex-barcode value="123456789012" />
</div>

```vue
<template>
  <ex-barcode value="123456789012" />
</template>
```

## 条码格式

支持多种常见的条码格式。

<div class="demo-container">
  <div class="barcode-grid">
    <div class="barcode-item">
      <p class="barcode-label">CODE128 (默认)</p>
      <ex-barcode value="Hello World" format="CODE128" />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">EAN-13 (商品条码)</p>
      <ex-barcode value="5901234123457" format="EAN13" />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">CODE39</p>
      <ex-barcode value="CODE39" format="CODE39" />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">UPC-A</p>
      <ex-barcode value="012345678905" format="UPC" />
    </div>
  </div>
</div>

```vue
<template>
  <!-- CODE128 (默认) -->
  <ex-barcode value="Hello World" format="CODE128" />

  <!-- EAN-13 (商品条码) -->
  <ex-barcode value="5901234123457" format="EAN13" />

  <!-- CODE39 -->
  <ex-barcode value="CODE39" format="CODE39" />

  <!-- UPC-A -->
  <ex-barcode value="012345678905" format="UPC" />
</template>
```

## 自定义尺寸

调整条码的宽度和高度。

<div class="demo-container">
  <div class="barcode-grid">
    <div class="barcode-item">
      <p class="barcode-label">小尺寸</p>
      <ex-barcode value="123456" :width="1" :height="50" />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">中等尺寸 (默认)</p>
      <ex-barcode value="123456" :width="2" :height="100" />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">大尺寸</p>
      <ex-barcode value="123456" :width="3" :height="150" />
    </div>
  </div>
</div>

```vue
<template>
  <!-- 小尺寸 -->
  <ex-barcode value="123456" :width="1" :height="50" />

  <!-- 中等尺寸 (默认) -->
  <ex-barcode value="123456" :width="2" :height="100" />

  <!-- 大尺寸 -->
  <ex-barcode value="123456" :width="3" :height="150" />
</template>
```

## 赛博朋克风格

提供霓虹和赛博朋克风格的条码样式。

<div class="demo-container">
  <div class="barcode-grid">
    <div class="barcode-item">
      <p class="barcode-label">默认样式</p>
      <ex-barcode value="DEFAULT123" type="default" />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">霓虹样式</p>
      <ex-barcode value="NEON456" type="neon" />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">赛博朋克样式</p>
      <ex-barcode value="CYBER2077" type="gaming" />
    </div>
  </div>
</div>

```vue
<template>
  <!-- 默认样式 -->
  <ex-barcode value="DEFAULT123" type="default" />

  <!-- 霓虹样式 -->
  <ex-barcode value="NEON456" type="neon" />

  <!-- 赛博朋克样式 -->
  <ex-barcode value="CYBER2077" type="gaming" />
</template>
```

## 自定义颜色

自定义条码的线条颜色和背景颜色。

<div class="demo-container">
  <div class="barcode-grid">
    <div class="barcode-item">
      <p class="barcode-label">蓝色条码</p>
      <ex-barcode 
        value="BLUE123" 
        line-color="#29abe2"
        background="#0b0f14"
      />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">粉色条码</p>
      <ex-barcode 
        value="PINK456" 
        line-color="#ff007f"
        background="#1a0a1e"
      />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">绿色条码</p>
      <ex-barcode 
        value="GREEN789" 
        line-color="#00ff41"
        background="#000000"
      />
    </div>
  </div>
</div>

```vue
<template>
  <!-- 蓝色条码 -->
  <ex-barcode value="BLUE123" line-color="#29abe2" background="#0b0f14" />

  <!-- 粉色条码 -->
  <ex-barcode value="PINK456" line-color="#ff007f" background="#1a0a1e" />

  <!-- 绿色条码 -->
  <ex-barcode value="GREEN789" line-color="#00ff41" background="#000000" />
</template>
```

## 文本显示

控制条码下方文本的显示和位置。

<div class="demo-container">
  <div class="barcode-grid">
    <div class="barcode-item">
      <p class="barcode-label">显示文本 (默认)</p>
      <ex-barcode value="123456" :display-value="true" />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">隐藏文本</p>
      <ex-barcode value="123456" :display-value="false" />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">文本在顶部</p>
      <ex-barcode value="123456" text-position="top" />
    </div>
    <div class="barcode-item">
      <p class="barcode-label">自定义字体大小</p>
      <ex-barcode value="123456" :font-size="24" />
    </div>
  </div>
</div>

```vue
<template>
  <!-- 显示文本 (默认) -->
  <ex-barcode value="123456" :display-value="true" />

  <!-- 隐藏文本 -->
  <ex-barcode value="123456" :display-value="false" />

  <!-- 文本在顶部 -->
  <ex-barcode value="123456" text-position="top" />

  <!-- 自定义字体大小 -->
  <ex-barcode value="123456" :font-size="24" />
</template>
```

## 下载功能

支持下载条码为图片。

<script setup>
import { ref } from 'vue';

const barcodeRef = ref();

const handleDownload = () => {
  barcodeRef.value?.download('my-barcode.png');
};
</script>

<div class="demo-container">
  <div style="display: flex; flex-direction: column; gap: 12px; align-items: center;">
    <ex-barcode ref="barcodeRef" value="DOWNLOAD123" />
    <ex-button type="primary" size="small" @click="handleDownload">
      下载条码
    </ex-button>
  </div>
</div>

```vue
<template>
  <div>
    <ex-barcode ref="barcodeRef" value="DOWNLOAD123" />
    <ex-button @click="handleDownload">下载条码</ex-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const barcodeRef = ref();

const handleDownload = () => {
  barcodeRef.value?.download('my-barcode.png');
};
</script>
```

## API

### Props

| 参数          | 说明         | 类型                          | 默认值      |
| ------------- | ------------ | ----------------------------- | ----------- |
| value         | 条码值       | string                        | ''          |
| format        | 条码格式     | BarcodeFormat                 | 'CODE128'   |
| width         | 条码宽度     | number                        | 2           |
| height        | 条码高度     | number                        | 100         |
| display-value | 是否显示文本 | boolean                       | true        |
| text-position | 文本位置     | 'top' / 'bottom'              | 'bottom'    |
| text-margin   | 文本边距     | number                        | 2           |
| font-size     | 字体大小     | number                        | 20          |
| font          | 字体         | string                        | 'monospace' |
| text-align    | 文本对齐     | 'left' / 'center' / 'right'   | 'center'    |
| line-color    | 线条颜色     | string                        | '#000000'   |
| background    | 背景颜色     | string                        | '#ffffff'   |
| margin        | 边距         | number                        | 10          |
| flat          | 是否平滑     | boolean                       | false       |
| type          | 样式类型     | 'default' / 'neon' / 'gaming' (赛博朋克) | 'default'   |
| bordered      | 是否显示边框 | boolean                       | true        |
| border-radius | 圆角         | number                        | 8           |
| error-text    | 错误提示文本 | string                        | —           |
| aria-label    | 无障碍标签   | string                        | —           |

### Barcode Format

支持的条码格式：

- `CODE128` - CODE128 (默认，最常用)
- `CODE39` - CODE39
- `EAN13` - EAN-13 (商品条码，13位数字)
- `EAN8` - EAN-8 (8位数字)
- `UPC` - UPC-A (12位数字)
- `ITF14` - ITF-14 (14位数字)
- `MSI` - MSI
- `pharmacode` - Pharmacode
- `codabar` - Codabar

### Slots

| 插槽名 | 说明         | 参数              |
| ------ | ------------ | ----------------- |
| error  | 错误状态插槽 | { error: string } |

### Methods

| 方法名    | 说明            | 参数                                |
| --------- | --------------- | ----------------------------------- |
| download  | 下载条码        | (filename?: string)                 |
| toDataURL | 获取条码数据URL | (type?: 'image/png' / 'image/jpeg') |
| refresh   | 刷新条码        | —                                   |

<style scoped>
.demo-container {
  padding: 16px;
  background: var(--ex-color-bg-secondary);
  border-radius: var(--ex-radius-base);
  margin: 16px 0;
}

.barcode-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.barcode-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.barcode-label {
  margin: 0;
  font-size: 14px;
  color: var(--ex-color-text-secondary);
  text-align: center;
}
</style>
