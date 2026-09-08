# Notification 通知提醒

悬浮出现在页面角落，显示全局的通知提醒消息。

<script setup>
import { h, onBeforeUnmount } from 'vue'
import { notification } from '../../src/components/notification'

onBeforeUnmount(() => notification.closeAll())

const showInfo = () => {
  notification.info({
    title: '信息提示',
    content: '这是一条信息通知',
  })
}

const showSuccess = () => {
  notification.success({
    title: '操作成功',
    content: '您的操作已成功完成',
  })
}

const showWarning = () => {
  notification.warning({
    title: '警告',
    content: '请注意，此操作可能有风险',
  })
}

const showError = () => {
  notification.error({
    title: '错误',
    content: '操作失败，请稍后重试',
  })
}

const showTopLeft = () => {
  notification.info({
    title: '左上角通知',
    content: '这条通知显示在左上角',
    position: 'top-left',
  })
}

const showTopRight = () => {
  notification.info({
    title: '右上角通知',
    content: '这条通知显示在右上角',
    position: 'top-right',
  })
}

const showBottomRight = () => {
  notification.info({
    title: '右下角通知',
    content: '这条通知显示在右下角',
    position: 'bottom-right',
  })
}

const showBottomLeft = () => {
  notification.info({
    title: '左下角通知',
    content: '这条通知显示在左下角',
    position: 'bottom-left',
  })
}

const showCustomDuration = () => {
  notification.info({
    title: '自定义时长',
    content: '这条通知将在 10 秒后关闭',
    duration: 10000,
  })
}

const showNonClosable = () => {
  notification.info({
    title: '不可关闭',
    content: '这条通知不会自动关闭，也没有关闭按钮',
    duration: 0,
    closable: false,
  })
}

const showHtml = () => {
  notification.info({
    title: 'HTML 内容',
    content: '<strong>加粗文本</strong> 和 <em>斜体文本</em>',
    dangerouslyUseHTMLString: true,
  })
}

const showVNode = () => {
  notification.info({
    title: '结构化内容',
    content: h('a', { href: '#基础用法' }, '查看使用方式'),
  })
}

const showWithCallback = () => {
  notification.success({
    title: '带回调的通知',
    content: '点击通知或关闭按钮会触发回调',
    onClick: () => {
      console.log('通知被点击')
    },
    onClose: () => {
      console.log('通知已关闭')
    },
  })
}

const closeAll = () => {
  notification.closeAll()
}
</script>

## 基础用法

从页面角落悬浮出现，4.5 秒后自动消失。

::: raw
<div class="demo-container">
  <ex-button @click="showInfo">信息通知</ex-button>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-button @click="showInfo">信息通知</ex-button>
</template>

<script setup>
import { notification } from 'vue-ex-ui';

const showInfo = () => {
  notification.info({
    title: '信息提示',
    content: '这是一条信息通知',
  });
};
</script>
```

:::

## 不同类型

用来显示「成功、警告、消息、错误」类的通知。

::: raw
<div class="demo-container">
  <ex-button @click="showInfo">信息</ex-button>
  <ex-button
    type="success"
    @click="showSuccess"
  >
    成功
  </ex-button>
  <ex-button
    type="warning"
    @click="showWarning"
  >
    警告
  </ex-button>
  <ex-button
    type="danger"
    @click="showError"
  >
    错误
  </ex-button>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-button @click="showInfo">信息</ex-button>
  <ex-button
    type="success"
    @click="showSuccess"
  >
    成功
  </ex-button>
  <ex-button
    type="warning"
    @click="showWarning"
  >
    警告
  </ex-button>
  <ex-button
    type="danger"
    @click="showError"
  >
    错误
  </ex-button>
</template>

<script setup>
import { notification } from 'vue-ex-ui';

const showInfo = () => {
  notification.info({
    title: '信息提示',
    content: '这是一条信息通知',
  });
};

const showSuccess = () => {
  notification.success({
    title: '操作成功',
    content: '您的操作已成功完成',
  });
};

const showWarning = () => {
  notification.warning({
    title: '警告',
    content: '请注意，此操作可能有风险',
  });
};

const showError = () => {
  notification.error({
    title: '错误',
    content: '操作失败，请稍后重试',
  });
};
</script>
```

:::

## 不同位置

可以设置通知从四个角落弹出。

::: raw
<div class="demo-container">
  <ex-button @click="showTopRight">右上角</ex-button>
  <ex-button @click="showTopLeft">左上角</ex-button>
  <ex-button @click="showBottomRight">右下角</ex-button>
  <ex-button @click="showBottomLeft">左下角</ex-button>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-button @click="showTopRight">右上角</ex-button>
  <ex-button @click="showTopLeft">左上角</ex-button>
  <ex-button @click="showBottomRight">右下角</ex-button>
  <ex-button @click="showBottomLeft">左下角</ex-button>
</template>

<script setup>
import { notification } from 'vue-ex-ui';

const showTopRight = () => {
  notification.info({
    title: '右上角通知',
    content: '这条通知显示在右上角',
    position: 'top-right',
  });
};

const showTopLeft = () => {
  notification.info({
    title: '左上角通知',
    content: '这条通知显示在左上角',
    position: 'top-left',
  });
};

const showBottomRight = () => {
  notification.info({
    title: '右下角通知',
    content: '这条通知显示在右下角',
    position: 'bottom-right',
  });
};

const showBottomLeft = () => {
  notification.info({
    title: '左下角通知',
    content: '这条通知显示在左下角',
    position: 'bottom-left',
  });
};
</script>
```

:::

## 自定义时长

自定义通知显示时长。常驻且不显示关闭按钮的通知可以通过“关闭所有”示例清理，离开本页也会清理通知。

::: raw
<div class="demo-container">
  <ex-button @click="showCustomDuration">10 秒后关闭</ex-button>
  <ex-button @click="showNonClosable">不自动关闭</ex-button>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-button @click="showCustomDuration">10 秒后关闭</ex-button>
  <ex-button @click="showNonClosable">不自动关闭</ex-button>
</template>

<script setup>
import { onBeforeUnmount } from 'vue';
import { notification } from 'vue-ex-ui';

onBeforeUnmount(() => notification.closeAll());

const showCustomDuration = () => {
  notification.info({
    title: '自定义时长',
    content: '这条通知将在 10 秒后关闭',
    duration: 10000,
  });
};

const showNonClosable = () => {
  notification.info({
    title: '不可关闭',
    content: '这条通知不会自动关闭，也没有关闭按钮',
    duration: 0,
    closable: false,
  });
};
</script>
```

:::

## HTML 内容

支持渲染 HTML 字符串。

::: raw
<div class="demo-container">
  <ex-button @click="showHtml">HTML 内容</ex-button>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-button @click="showHtml">HTML 内容</ex-button>
</template>

<script setup>
import { notification } from 'vue-ex-ui';

const showHtml = () => {
  notification.info({
    title: 'HTML 内容',
    content: '<strong>加粗文本</strong> 和 <em>斜体文本</em>',
    dangerouslyUseHTMLString: true,
  });
};
</script>
```

:::

::: warning 安全提示
`dangerouslyUseHTMLString` 会经过内置白名单消毒，但仍应避免传入未经确认的外部 HTML。
编程式服务的 `content` 类型是 `string | VNode`。需要结构化内容时，优先传入真实 VNode；VNode 不能与
`dangerouslyUseHTMLString` 同时使用。
:::

## VNode 内容

使用 Vue 的 `h` 函数创建带语义和交互的内容。链接会定位到本页的基础用法。

::: raw
<div class="demo-container">
  <ex-button @click="showVNode">VNode 内容</ex-button>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-button @click="showVNode">VNode 内容</ex-button>
</template>

<script setup>
import { h } from 'vue';
import { notification } from 'vue-ex-ui';

const showVNode = () => {
  notification.info({
    title: '结构化内容',
    content: h('a', { href: '#基础用法' }, '查看使用方式'),
  });
};
</script>
```

:::

## 带回调

可以设置点击和关闭时的回调函数。

::: raw
<div class="demo-container">
  <ex-button @click="showWithCallback">带回调的通知</ex-button>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-button @click="showWithCallback">带回调的通知</ex-button>
</template>

<script setup>
import { notification } from 'vue-ex-ui';

const showWithCallback = () => {
  notification.success({
    title: '带回调的通知',
    content: '点击通知或关闭按钮会触发回调',
    onClick: () => {
      console.log('通知被点击');
    },
    onClose: () => {
      console.log('通知已关闭');
    },
  });
};
</script>
```

:::

## 关闭所有

一次性关闭所有通知。

::: raw
<div class="demo-container">
  <ex-button @click="showInfo">显示通知</ex-button>
  <ex-button @click="showSuccess">显示通知</ex-button>
  <ex-button @click="showWarning">显示通知</ex-button>
  <ex-button
    type="danger"
    @click="closeAll"
  >
    关闭所有
  </ex-button>
</div>
:::

::: details 查看示例代码

```vue
<template>
  <ex-button @click="showInfo">显示通知</ex-button>
  <ex-button @click="showSuccess">显示通知</ex-button>
  <ex-button @click="showWarning">显示通知</ex-button>
  <ex-button
    type="danger"
    @click="closeAll"
  >
    关闭所有
  </ex-button>
</template>

<script setup>
import { notification } from 'vue-ex-ui';

const showInfo = () => {
  notification.info({
    title: '信息提示',
    content: '这是一条信息通知',
  });
};

const showSuccess = () => {
  notification.success({
    title: '操作成功',
    content: '您的操作已成功完成',
  });
};

const showWarning = () => {
  notification.warning({
    title: '警告',
    content: '请注意，此操作可能有风险',
  });
};

const closeAll = () => {
  notification.closeAll();
};
</script>
```

:::

## 全局配置

可以通过 `notification.config` 方法配置全局默认选项。

```typescript
import { notification } from 'vue-ex-ui';

// 配置全局默认选项
notification.config({
  duration: 5000, // 默认显示时长
  offset: 20, // 距离边缘的偏移量
  maxCount: 3, // 最大显示数量
  showIcon: true, // 是否显示图标
  closable: true, // 是否可关闭
  position: 'top-right', // 默认位置
});
```

配置会先整体校验再提交，非法字段不会留下部分更新。安装组件库后，每个 Vue App 的
`$notification` 相互独立；在 ConfigProvider 子树的 `setup()` 中使用
`useNotificationService()`，通知会继承最近的主题、语言和 z-index，并在 Provider 卸载时清理。

## API

### 方法

| 方法名                        | 说明         | 参数                       | 返回值                 |
| ----------------------------- | ------------ | -------------------------- | ---------------------- |
| notification(options)         | 显示通知     | `NotificationOptions`      | `NotificationInstance` |
| notification.info(options)    | 显示信息通知 | `NotificationOptions`      | `NotificationInstance` |
| notification.success(options) | 显示成功通知 | `NotificationOptions`      | `NotificationInstance` |
| notification.warning(options) | 显示警告通知 | `NotificationOptions`      | `NotificationInstance` |
| notification.error(options)   | 显示错误通知 | `NotificationOptions`      | `NotificationInstance` |
| notification.close(id)        | 关闭指定通知 | `string`                   | `boolean`              |
| notification.closeAll()       | 关闭所有通知 | —                          | —                      |
| notification.config(options)  | 配置全局选项 | `NotificationGlobalConfig` | —                      |

### NotificationOptions

| 参数                     | 说明                                  | 类型            | 可选值                                            | 默认值    |
| ------------------------ | ------------------------------------- | --------------- | ------------------------------------------------- | --------- |
| id                       | 通知唯一标识                          | string          | —                                                 | 自动生成  |
| type                     | 通知类型                              | string          | info / success / warning / error                  | info      |
| title                    | 通知标题                              | string          | —                                                 | —         |
| content                  | 通知内容                              | string \| VNode | —                                                 | —         |
| showIcon                 | 是否显示图标                          | boolean         | —                                                 | true      |
| closable                 | 是否可关闭                            | boolean         | —                                                 | true      |
| duration                 | 显示时长（毫秒），设为 0 则不自动关闭 | number          | —                                                 | 4500      |
| position                 | 显示位置                              | string          | top-right / top-left / bottom-right / bottom-left | top-right |
| customClass              | 自定义 CSS 类名                       | string          | —                                                 | —         |
| customStyle              | 自定义样式                            | object          | —                                                 | —         |
| zIndex                   | 层级                                  | number          | —                                                 | 2000      |
| offset                   | 距离边缘的偏移量                      | number          | —                                                 | 16        |
| dangerouslyUseHTMLString | 是否将内容作为 HTML 处理              | boolean         | —                                                 | false     |
| onClose                  | 关闭时的回调                          | () => void      | —                                                 | —         |
| onClick                  | 点击时的回调                          | () => void      | —                                                 | —         |

### Slots

| 插槽名  | 说明           |
| ------- | -------------- |
| default | 通知内容       |
| title   | 自定义标题     |
| icon    | 自定义图标     |
| close   | 自定义关闭按钮 |

### NotificationInstance

| 属性/方法 | 说明         | 类型          |
| --------- | ------------ | ------------- |
| id        | 通知唯一标识 | string        |
| close     | 关闭通知     | () => boolean |

### NotificationGlobalConfig

| 参数     | 说明         | 类型    | 默认值                             |
| -------- | ------------ | ------- | ---------------------------------- |
| duration | 默认显示时长 | number  | 4500                               |
| offset   | 默认偏移量   | number  | 16                                 |
| zIndex   | 默认层级     | number  | 2000（Provider 内为基础层级 + 80） |
| maxCount | 最大显示数量 | number  | 10                                 |
| showIcon | 是否显示图标 | boolean | true                               |
| closable | 是否可关闭   | boolean | true                               |
| position | 默认位置     | string  | top-right                          |

## 最佳实践

### 使用场景

- **info**：用于普通的信息通知
- **success**：用于操作成功后的反馈
- **warning**：用于警告用户注意某些事项
- **error**：用于操作失败后的错误提示

### 与 Message 的区别

| 特性       | Message      | Notification |
| ---------- | ------------ | ------------ |
| 显示位置   | 页面顶部居中 | 页面四个角落 |
| 内容复杂度 | 简单文本     | 标题 + 描述  |
| 使用场景   | 轻量级反馈   | 详细通知     |
| 默认时长   | 3 秒         | 4.5 秒       |

### 无障碍

- 错误通知使用 `role="alert"` 与 `aria-live="assertive"`，会立即播报
- 其他类型使用 `role="status"` 与 `aria-live="polite"`，等待当前朗读完成
- 关闭控件是真实 `<button>`，无需额外模拟 Enter / Space
- 鼠标悬停或键盘焦点进入通知时都会暂停倒计时

## 常见问题

**Q：通知会在我阅读时消失吗？**
不会。鼠标移入通知时暂停倒计时，移出后按剩余时长继续，避免读到一半被关闭。

**Q：不同位置的通知会互相挤压吗？**
不会。四个角落各自维护独立队列与容器，互不影响；`maxCount` 超限时自动移除最早的一条。

**Q：如何让通知常驻、由用户手动关闭？**
设置 `duration: 0`，通知不会自动关闭，由用户点击关闭按钮或调用 `instance.close()`。

**Q：和 Message 怎么选？**
轻量、无标题的瞬时反馈用 [Message](/components/message)；带标题+描述、信息量更大的通知用 Notification。

## 主题定制

Notification 由服务创建并定位在页面角落，不定义独立的组件级变量。定制方式：

- **单条**：通过 `customClass` / `customStyle` 选项定制。
- **全局**：覆盖各类型所消费的全局色彩令牌：

```css
:root {
  --ex-color-success: #00d68f; /* success */
  --ex-color-warning: #ffaa00; /* warning */
  --ex-color-neon-blue-500: #29abe2; /* info */
  --ex-color-neon-pink-500: #ff2d78; /* error */
}
```

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-secondary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
