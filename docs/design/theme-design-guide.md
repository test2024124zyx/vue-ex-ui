# ExUI 双主题设计指南

ExUI 的视觉系统只包含两个全局主题。两者共享组件结构、间距、圆角、动效和状态语义，仅通过语义化 CSS 变量改变明暗层次与赛博纹理强度。

## 1. 赛博暗色主题：`neon-blue`

赛博暗色是默认主题，强调深色终端背景和霓虹蓝紫的层次关系。

```scss
--ex-color-primary: #29abe2;
--ex-color-secondary: #a86bff;
--ex-color-accent: #ff3bd1;
--ex-color-bg-primary: #0b0f14;
--ex-color-bg-secondary: #0f1720;
--ex-color-text-primary: #e6f0ff;
--ex-color-text-secondary: #8fa3b8;
```

设计要求：

- 背景负责承载氛围，网格和扫描线必须低对比度，不能干扰正文。
- 发光只用于主操作、焦点和状态反馈，不将所有边框同时做成霓虹灯。
- 深色背景上的正文、辅助文字和禁用文字分别使用独立 token，不能共享一个灰色。
- 交互状态优先使用边框、颜色和轻微阴影变化，避免大面积缩放造成布局抖动。

## 2. 赛博亮色主题：`light`

赛博亮色保留赛博朋克识别度，但以可读性为第一优先级，适用于后台、文档和长时间操作场景。

```scss
--ex-color-primary: #1668dc;
--ex-color-secondary: #6645c9;
--ex-color-accent: #c2298a;
--ex-color-bg-primary: #ffffff;
--ex-color-bg-secondary: #f5f7fa;
--ex-color-text-primary: #1a2332;
--ex-color-text-secondary: #5a6b7d;
--ex-color-text-tertiary: #64748b;
```

设计要求：

- 主色、次色和状态色在白底上必须满足正文或控件的可读性要求。
- 网格、扫描线和阴影收敛为弱纹理，避免在亮色背景上产生眩光。
- 主按钮使用 `--ex-button-ink-on-bright` 控制文字颜色，不能依赖主题外的固定白色。
- 卡片和浮层通过边框、层级背景和柔和投影建立层次，不使用纯黑大面积描边。

## 3. 共享设计契约

### 颜色

组件优先使用以下语义 token：

```scss
color: var(--ex-color-text-primary);
background: var(--ex-color-bg-elevated);
border-color: var(--ex-color-border-primary);
```

只有品牌装饰或图表序列允许使用 `--ex-color-neon-blue-*`、`--ex-color-neon-pink-*` 等调色板 token。组件正文不应直接绑定某个主题的原始颜色。

### 间距和尺寸

- 交互控件的可操作区域尽量不小于 44px。
- 小尺寸视觉可以缩小文字和图标，但不能把键盘焦点、清除按钮和图标按钮压缩到不可操作。
- 容器、控件和浮层分别使用 `--ex-radius-md`、`--ex-radius-lg` 和 `--ex-radius-xl`，避免每个组件重新发明圆角值。

### 动效

- 过渡只声明实际会变化的属性：颜色、边框、透明度、变换和阴影。
- 不使用 `transition: all`，避免尺寸、布局和定位被隐式动画化。
- `prefers-reduced-motion: reduce` 必须关闭扫描线、脉冲、闪烁和非必要过渡。

### 无障碍

- 交互行为使用原生 `button`、`input` 或 `a`，不要用带点击事件的裸 `span` 代替控件。
- 自定义复合输入只保留一个真正的表单控件，其余视觉单元标记为装饰内容。
- 树、组合框、对话框和弹出层必须建立 `aria-controls`、`aria-expanded`、`aria-selected` 等状态关系。
- 焦点必须可见，颜色不能是唯一的状态表达方式。

## 4. 主题切换

```ts
import { setTheme, toggleTheme } from 'vue-ex-ui';

setTheme('neon-blue');
setTheme('light');
toggleTheme();
```

主题切换通过 CSS 变量完成，不应通过重新挂载整个应用实现。`prefers-color-scheme` 只负责选择两个主题之一；`prefers-contrast` 和 `prefers-reduced-motion` 负责调整可读性与动效。

## 5. 评审清单

- [ ] 组件只依赖语义化 token，两个主题下都能正确显示。
- [ ] 正文和辅助文字在对应背景上满足可读性要求。
- [ ] 所有可操作元素有原生语义、可见焦点和键盘路径。
- [ ] 清除、关闭、展开、切换等图标按钮有可访问名称。
- [ ] 主题切换不会污染宿主页面的非 ExUI 元素。
- [ ] 减少动效和强制颜色模式下仍保持信息层次。
- [ ] 通过浏览器和多视口检查实际渲染，而不是只依赖静态测试。
