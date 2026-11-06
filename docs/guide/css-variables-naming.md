# CSS 变量命名规范

ExUI 使用统一的 CSS 变量命名规范，确保主题系统的一致性和可维护性。

## 命名结构

所有 CSS 变量遵循以下命名结构：

```
--{namespace}-{category}-{name}-{variant}-{state}
```

### 组成部分

1. **namespace**: 命名空间前缀，固定为 `ex`
2. **category**: 变量类别（color, spacing, font, shadow 等）
3. **name**: 具体名称（primary, secondary, bg, text 等）
4. **variant**: 可选的变体（hover, active, light, dark 等）
5. **state**: 可选的状态（alpha-10, rgb 等）

## 颜色变量

### 基础颜色

```css
--ex-color-{name}
--ex-color-{name}-hover
--ex-color-{name}-active
```

**示例**:

```css
--ex-color-primary
--ex-color-primary-hover
--ex-color-primary-active
--ex-color-secondary
--ex-color-accent
```

### 背景色

```css
--ex-color-bg-{level}
```

**示例**:

```css
--ex-color-bg-primary      /* 主背景 */
--ex-color-bg-secondary    /* 次级背景 */
--ex-color-bg-tertiary     /* 三级背景 */
--ex-color-bg-elevated     /* 浮层背景 */
--ex-color-bg-hover        /* 悬停背景 */
--ex-color-bg-active       /* 激活背景 */
```

### 文本色

```css
--ex-color-text-{level}
```

**示例**:

```css
--ex-color-text-primary    /* 主文本 */
--ex-color-text-secondary  /* 次要文本 */
--ex-color-text-tertiary   /* 三级文本 */
--ex-color-text-disabled   /* 禁用文本 */
```

### 边框色

```css
--ex-color-border-{level}
```

**示例**:

```css
--ex-color-border-primary
--ex-color-border-secondary
```

### 状态色

```css
--ex-color-{status}
--ex-color-{status}-hover
--ex-color-{status}-active
```

**示例**:

```css
--ex-color-success
--ex-color-success-hover
--ex-color-success-active
--ex-color-warning
--ex-color-danger
--ex-color-info
```

### 透明度变量

透明度变量使用 `alpha-{number}` 后缀，数字表示透明度百分比：

```css
--ex-color-{name}-alpha-{opacity}
```

**示例**:

```css
--ex-color-primary-alpha-05   /* 5% 不透明度 */
--ex-color-primary-alpha-10   /* 10% 不透明度 */
--ex-color-primary-alpha-20   /* 20% 不透明度 */
--ex-color-primary-alpha-30   /* 30% 不透明度 */
--ex-color-primary-alpha-40   /* 40% 不透明度 */
--ex-color-primary-alpha-50   /* 50% 不透明度 */
--ex-color-primary-alpha-60   /* 60% 不透明度 */
--ex-color-primary-alpha-80   /* 80% 不透明度 */
--ex-color-primary-alpha-90   /* 90% 不透明度 */
```

### RGB 格式变量

用于需要动态调整透明度的场景：

```css
--ex-color-{name}-rgb
```

**示例**:

```css
--ex-color-bg-primary-rgb: 11, 15, 20;
--ex-color-neon-blue-500-rgb: 41, 171, 226;

/* 使用方式 */
background: rgba(var(--ex-color-bg-primary-rgb), 0.8);
```

### 渐变中间色

用于渐变效果的中间色调：

```css
--ex-color-{name}-mid
--ex-color-{name}-dark
--ex-color-{name}-darker
```

**示例**:

```css
--ex-color-success-mid
--ex-color-success-dark
--ex-color-success-darker
```

## 间距变量

间距采用 **数字刻度**（基于 4px 栅格），而非 t-shirt 尺寸：

```css
--ex-spacing-{step}
```

**示例**:

```css
--ex-spacing-1     /* 4px */
--ex-spacing-2     /* 8px */
--ex-spacing-3     /* 12px */
--ex-spacing-4     /* 16px */
--ex-spacing-5     /* 20px */
--ex-spacing-6     /* 24px */
--ex-spacing-8     /* 32px */
--ex-spacing-10    /* 40px */
--ex-spacing-12    /* 48px */
--ex-spacing-16    /* 64px */
/* 继续到 --ex-spacing-64（256px） */
```

## 字体变量

### 字体大小

```css
--ex-text-{size}
```

**示例**:

```css
--ex-text-xs      /* 12px */
--ex-text-sm      /* 14px */
--ex-text-base    /* 16px */
--ex-text-lg      /* 18px */
--ex-text-xl      /* 20px */
--ex-text-2xl     /* 24px */
/* 继续到 --ex-text-6xl（60px） */
```

### 字体粗细

```css
--ex-font-{level}
```

**示例**:

```css
--ex-font-light       /* 300 */
--ex-font-normal      /* 400 */
--ex-font-medium      /* 500 */
--ex-font-semibold    /* 600 */
--ex-font-bold        /* 700 */
--ex-font-extrabold   /* 800 */
```

### 行高

```css
--ex-leading-{level}
```

**示例**:

```css
--ex-leading-tight    /* 1.25 */
--ex-leading-snug     /* 1.375 */
--ex-leading-normal   /* 1.5 */
--ex-leading-relaxed  /* 1.625 */
--ex-leading-loose    /* 2 */
```

## 阴影变量

### 普通阴影

```css
--ex-shadow-{size}
```

**示例**:

```css
--ex-shadow-sm
--ex-shadow-md
--ex-shadow-lg
--ex-shadow-xl
```

### 霓虹发光阴影

```css
--ex-shadow-neon-{size}
```

**示例**:

```css
--ex-shadow-neon-sm
--ex-shadow-neon-md
--ex-shadow-neon-lg
```

## 渐变变量

```css
--ex-gradient-{name}
```

**示例**:

```css
--ex-gradient-primary
--ex-gradient-secondary
--ex-gradient-bg
```

## 圆角变量

```css
--ex-radius-{size}
```

**示例**:

```css
--ex-radius-none  /* 0 */
--ex-radius-sm    /* 2px */
--ex-radius-base  /* 4px */
--ex-radius-md    /* 6px */
--ex-radius-lg    /* 8px */
--ex-radius-xl    /* 12px */
--ex-radius-2xl   /* 16px */
--ex-radius-full  /* 9999px */
```

## 过渡动画变量

动画时长与缓动均归在 `--ex-motion-*` 命名空间下：

```css
--ex-motion-duration-{speed}
--ex-motion-ease-{type}
```

**示例**:

```css
--ex-motion-duration-fast    /* 120ms */
--ex-motion-duration-base    /* 200ms */
--ex-motion-duration-medium  /* 320ms */
--ex-motion-duration-slow    /* 480ms */

--ex-motion-ease-in-out      /* cubic-bezier(0.4, 0, 0.2, 1) */
--ex-motion-ease-in          /* cubic-bezier(0.4, 0, 1, 1) */
--ex-motion-ease-out         /* cubic-bezier(0, 0, 0.2, 1) */
```

## Z-index 变量

```css
--ex-z-{level}
```

**示例**:

```css
--ex-z-dropdown   /* 1000 */
--ex-z-sticky     /* 1020 */
--ex-z-overlay    /* 1040 */
--ex-z-modal      /* 1050 */
--ex-z-popover    /* 1060 */
--ex-z-toast      /* 1080 */
--ex-z-tooltip    /* 1090 */
--ex-z-loading    /* 1100 */
```

## 特殊颜色

### 霓虹色系

```css
--ex-color-neon-{color}-{shade}
```

**示例**:

```css
--ex-color-neon-blue-400
--ex-color-neon-blue-500
--ex-color-neon-blue-600
--ex-color-neon-pink-400
--ex-color-neon-pink-500
--ex-color-neon-pink-600
```

### 固定颜色

```css
--ex-color-white
--ex-color-black
```

## 使用示例

### 基础使用

```scss
.my-component {
  background: var(--ex-color-bg-primary);
  color: var(--ex-color-text-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-base);
  padding: var(--ex-spacing-4);
  transition: all var(--ex-motion-duration-base) var(--ex-motion-ease-in-out);
}
```

### 使用透明度

```scss
.overlay {
  background: var(--ex-color-black-alpha-50);
}

.hover-effect {
  &:hover {
    background: var(--ex-color-primary-alpha-10);
  }
}
```

### 使用 RGB 变量

```scss
.dynamic-opacity {
  /* 可以动态调整透明度（注意：仅部分颜色提供 -rgb 变量，如 bg-primary、success、warning 等） */
  background: rgba(var(--ex-color-bg-primary-rgb), 0.15);
}
```

### 使用渐变

```scss
.gradient-button {
  background: var(--ex-gradient-primary);
}
```

## 命名规则总结

1. ✅ **使用小写字母和连字符**: `--ex-color-primary`
2. ✅ **保持一致的层级结构**: namespace → category → name → variant
3. ✅ **使用语义化命名**: `primary`, `secondary`, `success` 而不是 `blue`, `red`
4. ✅ **透明度使用 alpha-{number}**: `alpha-10`, `alpha-20`
5. ✅ **RGB 格式使用 -rgb 后缀**: `--ex-color-primary-rgb`
6. ✅ **状态使用标准后缀**: `-hover`, `-active`, `-disabled`
7. ❌ **避免使用驼峰命名**: 不要用 `--exColorPrimary`
8. ❌ **避免使用下划线**: 不要用 `--ex_color_primary`
9. ❌ **避免过长的名称**: 保持简洁明了

## 添加新变量

当需要添加新的 CSS 变量时，请遵循以下步骤：

1. 确定变量的类别和用途
2. 按照命名规范创建变量名
3. 在所有主题文件中定义该变量
4. 更新本文档
5. 在组件中使用新变量

## 主题特定变量

某些变量可能只在特定主题中存在，应该使用主题前缀：

```css
/* 仅在霓虹主题中使用 */
--ex-color-neon-blue-500
--ex-color-neon-pink-500

/* 仅在高对比度主题中使用 */
--ex-color-high-contrast-border
```

## 最佳实践

1. **优先使用语义化变量**: 使用 `--ex-color-bg-primary` 而不是 `--ex-color-dark-blue`
2. **避免硬编码颜色值**: 始终使用 CSS 变量
3. **保持一致性**: 相同用途的变量在不同主题中应该有相同的名称
4. **文档化**: 为新变量添加注释说明用途
5. **测试**: 在所有主题中测试新变量的效果

## 参考资源

- [CSS 自定义属性 (MDN)](https://developer.mozilla.org/zh-CN/docs/Web/CSS/--*)
- [CSS 变量最佳实践](https://www.smashingmagazine.com/2018/05/css-custom-properties-strategy-guide/)
- [设计系统中的 CSS 变量](https://css-tricks.com/css-custom-properties-in-design-systems/)
