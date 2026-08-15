# 双主题迁移指南

ExUI 现在将全局主题收敛为两个赛博朋克主题：`neon-blue`（赛博暗色）和 `light`（赛博亮色）。旧的 `neon-pink`、`dark`、`matrix`、`high-contrast` 不再是有效的 `Theme` 值，也不会继续作为兼容别名维护。

## 迁移映射

| 旧值            | 推荐新值    | 迁移说明                                                     |
| --------------- | ----------- | ------------------------------------------------------------ |
| `neon-pink`     | `neon-blue` | 保留旧主题的深色赛博氛围，强调色由新主题 token 统一管理      |
| `dark`          | `neon-blue` | 暗色系统偏好统一映射到赛博暗色                               |
| `matrix`        | `neon-blue` | 矩阵风格不再作为独立主题，强对比由媒体查询增强               |
| `high-contrast` | `neon-blue` | 使用 `prefers-contrast: more` 获取边界增强，不创建第三个主题 |

如果业务原本使用亮色页面，应直接改用 `light`。

## 代码迁移

```ts
// 旧代码
setTheme('neon-pink');
toggleTheme(['neon-blue', 'dark']);

// 新代码
setTheme('light');
toggleTheme(['neon-blue', 'light']);
```

`ThemeConfig.isHighContrast` 和 `isHighContrastTheme` 已移除。请改用 CSS 媒体查询控制高对比度表现：

```scss
@media (prefers-contrast: more) {
  .ex-app [class^='ex-'],
  .ex-app [class*=' ex-'] {
    border-width: 2px;
  }
}
```

## CSS 选择器迁移

旧的主题覆盖选择器应改为两个有效值：

```scss
// 旧代码
[data-theme='neon-pink'] {
  /* ... */
}
[data-theme='dark'] {
  /* ... */
}

// 新代码
[data-theme='neon-blue'] {
  /* 赛博暗色覆盖 */
}
[data-theme='light'] {
  /* 赛博亮色覆盖 */
}
```

优先覆盖语义变量，而不是覆盖组件内部类名：

```scss
.brand-scope {
  --ex-color-primary: #1677ff;
  --ex-color-primary-hover: #0958d9;
  --ex-color-bg-elevated: #ffffff;
}
```

## 持久化数据

存储键仍为 `ex-ui-theme`。升级后如果存储中保存的是旧值，加载函数会返回 `null`，应用会回退到系统偏好或默认的 `neon-blue`。如需在升级时保留用户选择，请在调用 `usePersistedTheme` 前完成迁移：

```ts
const saved = localStorage.getItem('ex-ui-theme');
if (saved === 'neon-pink' || saved === 'dark' || saved === 'matrix' || saved === 'high-contrast') {
  localStorage.setItem('ex-ui-theme', 'neon-blue');
}
```

## 视觉检查清单

- [ ] 主题类型只包含 `neon-blue` 和 `light`。
- [ ] 主题选择器只展示两个选项。
- [ ] 文字、边框、状态色使用语义化变量。
- [ ] 亮色主题下 tooltip、图表图例和浮层文字仍然清晰。
- [ ] 高对比度通过 `prefers-contrast` 验证，不依赖旧主题名称。
- [ ] `prefers-reduced-motion` 下扫描线和复杂发光被关闭。
- [ ] 浏览器中验证根节点主题、ConfigProvider 局部主题和多个 Provider 并存场景。
