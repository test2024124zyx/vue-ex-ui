# Message 全局提示

用于展示短暂的操作反馈。服务默认在页面顶部居中显示消息。

<script setup>
import { message } from '../../src/components/message'

const showInfo = () => message.info('这是一条信息提示')
const showSuccess = () => message.success('操作成功')
const showWarning = () => message.warning('请检查输入内容')
const showError = () => message.error('操作失败，请重试')

const showLoading = () => {
  const loading = message.loading('处理中')
  window.setTimeout(() => {
    loading.close()
    message.success('处理完成')
  }, 1500)
}

const showClosable = () => {
  message.info({
    content: '这条消息需要手动关闭',
    duration: 0,
    closable: true
  })
}

const showGrouped = () => {
  message.warning({ content: '请勿重复提交', grouping: true })
}

const showHtml = () => {
  message.info({
    content: '<strong>已保存</strong>到草稿箱',
    dangerouslyUseHTMLString: true
  })
}
</script>

## 不同状态

<div class="demo-container">
  <ExButton @click="showInfo">信息</ExButton>
  <ExButton type="success" @click="showSuccess">成功</ExButton>
  <ExButton type="warning" @click="showWarning">警告</ExButton>
  <ExButton type="danger" @click="showError">错误</ExButton>
</div>

```ts
import { message } from 'vue-ex-ui';

message.info('这是一条信息提示');
message.success('操作成功');
message.warning('请检查输入内容');
message.error('操作失败，请重试');
```

## 加载状态

`loading` 未设置 `duration` 时持续显示，由返回实例负责关闭。

<div class="demo-container">
  <ExButton @click="showLoading">开始处理</ExButton>
</div>

```ts
const loading = message.loading('处理中');

try {
  await submit();
  loading.close();
  message.success('处理完成');
} catch {
  loading.close();
  message.error('处理失败');
}
```

## 手动关闭与合并

<div class="demo-container">
  <ExButton @click="showClosable">手动关闭</ExButton>
  <ExButton type="warning" @click="showGrouped">重复触发合并</ExButton>
  <ExButton @click="message.closeAll()">关闭全部</ExButton>
</div>

```ts
message.info({
  content: '这条消息需要手动关闭',
  duration: 0,
  closable: true,
});

message.warning({
  content: '请勿重复提交',
  grouping: true,
});
```

分组只合并仍处于活动状态且 `type + content` 相同的消息。

## HTML 内容

<div class="demo-container">
  <ExButton @click="showHtml">显示 HTML</ExButton>
</div>

```ts
message.info({
  content: '<strong>已保存</strong>到草稿箱',
  dangerouslyUseHTMLString: true,
});
```

HTML 字符串会经过内置白名单消毒。仍应避免把未经确认的外部输入直接作为提示内容。

## 全局配置

配置影响后续消息；`offset` 与 `zIndex` 作用于全局消息容器。降低 `maxCount` 会立即移除最早的超额消息。

```ts
message.config({
  duration: 5000,
  offset: 32,
  zIndex: 2200,
  maxCount: 3,
  showIcon: true,
  closable: false,
  grouping: false,
});
```

安装 `ExMessage` 或完整组件库后，Options API 可使用类型完整的 `this.$message`。

## 服务 API

| 方法                      | 参数                            | 返回值            |
| ------------------------- | ------------------------------- | ----------------- |
| `message(input)`          | `string \| MessageOptions`      | `MessageInstance` |
| `message.info(input)`     | `string \| MessageTypedOptions` | `MessageInstance` |
| `message.success(input)`  | `string \| MessageTypedOptions` | `MessageInstance` |
| `message.warning(input)`  | `string \| MessageTypedOptions` | `MessageInstance` |
| `message.error(input)`    | `string \| MessageTypedOptions` | `MessageInstance` |
| `message.loading(input)`  | `string \| MessageTypedOptions` | `MessageInstance` |
| `message.close(id)`       | `string`                        | `boolean`         |
| `message.closeAll()`      | —                               | `void`            |
| `message.config(options)` | `Partial<MessageGlobalConfig>`  | `void`            |

类型快捷方法已确定消息类型，因此其配置对象不接受 `type`。

### MessageOptions

| 属性                       | 类型                                             | 默认值                   |
| -------------------------- | ------------------------------------------------ | ------------------------ |
| `content`                  | `string`                                         | 必填                     |
| `type`                     | `info \| success \| warning \| error \| loading` | `info`                   |
| `showIcon`                 | `boolean`                                        | 全局配置                 |
| `closable`                 | `boolean`                                        | 全局配置                 |
| `duration`                 | `number`                                         | 全局配置；loading 为 `0` |
| `class`                    | 原生 Vue class 值                                | —                        |
| `style`                    | 原生 Vue style 值                                | —                        |
| `dangerouslyUseHTMLString` | `boolean`                                        | `false`                  |
| `onClose`                  | `() => void`                                     | —                        |
| `grouping`                 | `boolean`                                        | 全局配置                 |

`duration` 必须是非负有限数值；`0` 表示不自动关闭。

### MessageGlobalConfig

| 属性       | 类型      | 默认值  |
| ---------- | --------- | ------- |
| `duration` | `number`  | `3000`  |
| `offset`   | `number`  | `20`    |
| `zIndex`   | `number`  | `2000`  |
| `maxCount` | `number`  | `5`     |
| `showIcon` | `boolean` | `true`  |
| `closable` | `boolean` | `false` |
| `grouping` | `boolean` | `false` |

### MessageInstance

| 属性/方法 | 类型            |
| --------- | --------------- |
| `id`      | `string`        |
| `close()` | `() => boolean` |

`close()` 仅在本次调用真正发起关闭时返回 `true`。

## ExMessage API

直接渲染组件时可通过默认、`icon` 与 `close` 插槽定制内容，原生 `class`、`style`、ARIA 与 data 属性会合并到根元素。

| 属性                       | 类型          | 默认值  |
| -------------------------- | ------------- | ------- |
| `type`                     | `MessageType` | `info`  |
| `content`                  | `string`      | `''`    |
| `showIcon`                 | `boolean`     | `true`  |
| `closable`                 | `boolean`     | `false` |
| `duration`                 | `number`      | `3000`  |
| `dangerouslyUseHTMLString` | `boolean`     | `false` |

| 事件      | 触发时机           |
| --------- | ------------------ |
| `close`   | 可见状态开始关闭时 |
| `destroy` | 离场动画结束时     |

| 暴露方法     | 类型                        |
| ------------ | --------------------------- |
| `close`      | `() => boolean`             |
| `isVisible`  | `() => boolean`             |
| `getElement` | `() => HTMLElement \| null` |

<style scoped>
.demo-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
}
</style>
