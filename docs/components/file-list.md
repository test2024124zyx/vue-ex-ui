# FileList 文件列表

文件列表组件，支持多种视图模式和文件操作。复用 Button、Input、Select、Pagination、Tree、Empty 等组件，提供统一的交互体验。

<script setup>
import { ref,computed } from 'vue'

// 模拟文件数据
const files = ref([
  {
    id: '1',
    name: 'project-design.pdf',
    size: 2048576,
    type: 'application/pdf',
    modifiedTime: new Date('2024-01-15'),
    thumbUrl: '',
    isDirectory: false,
  },
  {
    id: '2',
    name: 'screenshot.png',
    size: 1024000,
    type: 'image/png',
    modifiedTime: new Date('2024-01-14'),
    thumbUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200',
    isDirectory: false,
  },
  {
    id: '3',
    name: 'documents',
    size: 0,
    type: '',
    modifiedTime: new Date('2024-01-13'),
    thumbUrl: '',
    isDirectory: true,
    children: [
      {
        id: '3-1',
        name: 'report.docx',
        size: 512000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        modifiedTime: new Date('2024-01-12'),
        thumbUrl: '',
        isDirectory: false,
      },
      {
        id: '3-2',
        name: 'data.xlsx',
        size: 256000,
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        modifiedTime: new Date('2024-01-11'),
        thumbUrl: '',
        isDirectory: false,
      },
    ],
  },
  {
    id: '4',
    name: 'video-tutorial.mp4',
    size: 10485760,
    type: 'video/mp4',
    modifiedTime: new Date('2024-01-10'),
    thumbUrl: '',
    isDirectory: false,
  },
  {
    id: '5',
    name: 'music.mp3',
    size: 3145728,
    type: 'audio/mpeg',
    modifiedTime: new Date('2024-01-09'),
    thumbUrl: '',
    isDirectory: false,
  },
])

const selectedIds = ref([])

const handleClick = (file) => {
  console.log('点击文件:', file.name)
}

const handlePreview = (file) => {
  console.log('预览文件:', file.name)
}

const handleDownload = (file) => {
  console.log('下载文件:', file.name)
}

const handleDelete = (file) => {
  console.log('删除文件:', file.name)
}

const handleSearch = (keyword) => {
  console.log('搜索:', keyword)
}
// 模拟文件系统数据
const fileSystem = ref({
  id: 'root',
  name: '我的文档',
  isDirectory: true,
  children: [
    {
      id: 'folder-1',
      name: '工作文件',
      size: 0,
      type: '',
      modifiedTime: new Date('2024-01-20'),
      isDirectory: true,
      children: [
        {
          id: 'file-1-1',
          name: '项目方案.docx',
          size: 524288,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          modifiedTime: new Date('2024-01-19'),
          isDirectory: false,
        },
        {
          id: 'file-1-2',
          name: '数据分析.xlsx',
          size: 1048576,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          modifiedTime: new Date('2024-01-18'),
          isDirectory: false,
        },
      ],
    },
    {
      id: 'folder-2',
      name: '图片',
      size: 0,
      type: '',
      modifiedTime: new Date('2024-01-15'),
      isDirectory: true,
      children: [
        {
          id: 'file-2-1',
          name: '风景照.jpg',
          size: 2097152,
          type: 'image/jpeg',
          modifiedTime: new Date('2024-01-14'),
          thumbUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200',
          isDirectory: false,
        },
        {
          id: 'file-2-2',
          name: '截图.png',
          size: 1572864,
          type: 'image/png',
          modifiedTime: new Date('2024-01-13'),
          thumbUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200',
          isDirectory: false,
        },
      ],
    },
    {
      id: 'folder-3',
      name: '视频',
      size: 0,
      type: '',
      modifiedTime: new Date('2024-01-10'),
      isDirectory: true,
      children: [
        {
          id: 'file-3-1',
          name: '教程视频.mp4',
          size: 52428800,
          type: 'video/mp4',
          modifiedTime: new Date('2024-01-09'),
          isDirectory: false,
        },
      ],
    },
    {
      id: 'file-root-1',
      name: 'README.md',
      size: 4096,
      type: 'text/markdown',
      modifiedTime: new Date('2024-01-25'),
      isDirectory: false,
    },
  ],
})

// 当前路径
const currentPath = ref(['root'])
const selectedFileIds = ref([])
const viewMode = ref('list')

// 当前显示的文件列表
const currentFiles = computed(() => {
  let current = fileSystem.value
  
  // 根据路径导航到当前文件夹
  for (let i = 1; i < currentPath.value.length; i++) {
    const folderId = currentPath.value[i]
    const folder = current.children?.find(f => f.id === folderId)
    if (folder && folder.isDirectory) {
      current = folder
    }
  }
  
  return current.children || []
})

// 面包屑路径
const breadcrumbs = computed(() => {
  const crumbs = [{ id: 'root', name: '我的文档' }]
  let current = fileSystem.value
  
  for (let i = 1; i < currentPath.value.length; i++) {
    const folderId = currentPath.value[i]
    const folder = current.children?.find(f => f.id === folderId)
    if (folder) {
      crumbs.push({ id: folder.id, name: folder.name })
      current = folder
    }
  }
  
  return crumbs
})

// 是否可以返回上一级
const canGoBack = computed(() => currentPath.value.length > 1)

// 文件操作
const handleFileClick = (file) => {
  if (file.isDirectory) {
    // 进入文件夹
    currentPath.value.push(file.id)
    selectedFileIds.value = []
  }
}

const handleFileDblClick = (file) => {
  if (!file.isDirectory) {
    // 双击文件，打开预览
    handlePreview(file)
  }
}

const handleBreadcrumbClick = (index) => {
  // 点击面包屑导航
  currentPath.value = currentPath.value.slice(0, index + 1)
  selectedFileIds.value = []
}

const handleGoBack1 = () => {
  if (canGoBack.value) {
    currentPath.value.pop()
    selectedFileIds.value = []
  }
}


const handleDelete1 = (file) => {
  if (confirm(`确定要删除 "${file.name}" 吗？`)) {
    // 这里应该实现删除逻辑
    alert(`已删除: ${file.name}`)
  }
}

const handleRefresh = () => {
  selectedFileIds.value = []
  alert('已刷新')
}

// 树形数据（用于左侧目录树）
const treeData = computed(() => {
  const convertToTreeNode = (item, parentPath = []) => {
    const path = [...parentPath, item.id]
    return {
      key: item.id,
      label: item.name,
      icon: item.isDirectory 
        ? 'https://api.iconify.design/ri/folder-line.svg'
        : 'https://api.iconify.design/ri/file-text-line.svg',
      children: item.children
        ?.filter(child => child.isDirectory) // 只显示文件夹
        .map(child => convertToTreeNode(child, path)),
      isLeaf: !item.isDirectory || !item.children?.some(c => c.isDirectory),
      data: { path },
    }
  }
  
  return [convertToTreeNode(fileSystem.value)]
})

// 树形选中的节点
const treeSelectedKeys = computed(() => {
  return [currentPath.value[currentPath.value.length - 1]]
})

// 树形展开的节点
const treeExpandedKeys = ref(['root'])

// 处理树节点点击
const handleTreeNodeClick = (node) => {
  if (node.data?.path) {
    currentPath.value = node.data.path
    selectedFileIds.value = []
  }
}
</script>

## 基础用法

基础的文件列表展示。

<div class="demo-container">
  <ExFileList
    :files="files"
    :loading="false"
    @click="handleClick"
    @preview="handlePreview"
    @download="handleDownload"
    @delete="handleDelete"
  />
</div>

```vue
<template>
  <ExFileList
    :files="files"
    @click="handleClick"
    @preview="handlePreview"
    @download="handleDownload"
    @delete="handleDelete"
  />
</template>

<script setup>
import { ref } from 'vue';

const files = ref([
  {
    id: '1',
    name: 'document.pdf',
    size: 2048576,
    type: 'application/pdf',
    modifiedTime: new Date(),
    isDirectory: false,
  },
  // ... 更多文件
]);

const handleClick = file => {
  console.log('点击文件:', file.name);
};
</script>
```

## 视图模式

支持列表、网格、表格、树形四种视图模式。使用 ExButton 组件实现视图切换。

<div class="demo-container">
  <ExFileList
    :files="files"
    view-mode="grid"
    :show-view-switch="true"
  />
</div>

```vue
<template>
  <!-- 列表视图 -->
  <ExFileList :files="files" view-mode="list" />

  <!-- 网格视图 -->
  <ExFileList :files="files" view-mode="grid" />

  <!-- 表格视图 -->
  <ExFileList :files="files" view-mode="table" />

  <!-- 树形视图 -->
  <ExFileList :files="files" view-mode="tree" />
</template>
```

## 搜索和排序

使用 ExInput 和 ExSelect 组件实现搜索和排序功能。

<div class="demo-container">
  <ExFileList
    :files="files"
    :show-search="true"
    :show-sort="true"
    sort-field="name"
    sort-order="asc"
    @search="handleSearch"
  />
</div>

```vue
<template>
  <ExFileList
    :files="files"
    :show-search="true"
    :show-sort="true"
    sort-field="name"
    sort-order="asc"
    @search="handleSearch"
  />
</template>

<script setup>
const handleSearch = keyword => {
  console.log('搜索:', keyword);
};
</script>
```

::: tip 组件复用

- **搜索框**: 使用 `ExInput` 组件，支持清空按钮和前缀图标
- **排序选择**: 使用 `ExSelect` 组件，提供下拉选项
- **排序按钮**: 使用 `ExButton` 组件，显示升序/降序图标
  :::

## 文件选择

支持单选和多选模式。

<div class="demo-container">
  <ExFileList
    :files="files"
    v-model:selected-ids="selectedIds"
    :selectable="true"
    :multiple="true"
  />
  <div style="margin-top: 16px; color: var(--ex-color-text-secondary);">
    已选择: {{ selectedIds.length }} 个文件
  </div>
</div>

```vue
<template>
  <ExFileList
    :files="files"
    v-model:selected-ids="selectedIds"
    :selectable="true"
    :multiple="true"
  />
  <div>已选择: {{ selectedIds.length }} 个文件</div>
</template>

<script setup>
import { ref } from 'vue';

const selectedIds = ref([]);
</script>
```

## 分页

使用 ExPagination 组件实现分页功能。

<div class="demo-container">
  <ExFileList
    :files="files"
    :show-pagination="true"
    :page-size="3"
  />
</div>

```vue
<template>
  <ExFileList :files="files" :show-pagination="true" :page-size="20" />
</template>
```

::: tip 分页组件
使用 `ExPagination` 组件替代原生分页按钮，提供：

- 总数显示
- 页码跳转
- 每页条数切换
- 统一的赛博朋克主题样式
  :::

## 空状态

使用 ExEmpty 组件显示空状态。

<div class="demo-container">
  <ExFileList
    :files="[]"
    empty-text="暂无文件，请上传文件"
  />
</div>

```vue
<template>
  <ExFileList :files="[]" empty-text="暂无文件，请上传文件" />
</template>
```

## 树形视图

使用 ExTree 组件实现树形文件浏览。

<div class="demo-container">
  <ExFileList
    :files="files"
    view-mode="tree"
  />
</div>

```vue
<template>
  <ExFileList :files="files" view-mode="tree" />
</template>
```

::: tip 树形组件
使用 `ExTree` 组件实现树形视图，支持：

- 文件夹展开/收起
- 节点选择
- 复选框多选
- 自定义节点内容
  :::

## 自定义操作

自定义文件操作按钮。

<div class="demo-container">
  <ExFileList
    :files="files"
    :show-actions="true"
    :previewable="true"
    :downloadable="true"
    :deletable="true"
    @preview="handlePreview"
    @download="handleDownload"
    @delete="handleDelete"
  />
</div>

```vue
<template>
  <ExFileList
    :files="files"
    :show-actions="true"
    :previewable="true"
    :downloadable="true"
    :deletable="true"
    @preview="handlePreview"
    @download="handleDownload"
    @delete="handleDelete"
  />
</template>

<script setup>
const handlePreview = file => {
  // 预览文件
};

const handleDownload = file => {
  // 下载文件
};

const handleDelete = file => {
  // 删除文件
};
</script>
```

## 加载状态

使用 ExLoading 组件显示加载状态。

```vue
<template>
  <ExFileList :files="files" :loading="loading" />
</template>

<script setup>
import { ref } from 'vue';

const files = ref([]);
const loading = ref(true);

// 模拟加载
setTimeout(() => {
  loading.value = false;
  files.value = [
    // ... 文件数据
  ];
}, 2000);
</script>
```

::: tip 加载组件
使用 `ExLoading` 组件显示加载状态，配置为：

- 非全屏模式
- 无遮罩层
- 大尺寸旋转动画
  :::

## API

### FileList Props

| 属性                                    | 说明             | 类型                                           | 默认值       |
| --------------------------------------- | ---------------- | ---------------------------------------------- | ------------ |
| `files`                                 | 文件列表数据     | `FileItem[]`                                   | `[]`         |
| `view-mode`                             | 视图模式         | `'list' \| 'grid' \| 'table' \| 'tree'`        | `'list'`     |
| `selectable`                            | 是否可选择       | `boolean`                                      | `false`      |
| `multiple`                              | 是否多选         | `boolean`                                      | `false`      |
| `selected-ids` / `v-model:selected-ids` | 选中的文件ID     | `string[]`                                     | `[]`         |
| `show-toolbar`                          | 是否显示工具栏   | `boolean`                                      | `true`       |
| `show-search`                           | 是否显示搜索     | `boolean`                                      | `true`       |
| `show-sort`                             | 是否显示排序     | `boolean`                                      | `true`       |
| `show-view-switch`                      | 是否显示视图切换 | `boolean`                                      | `true`       |
| `sort-field`                            | 排序字段         | `'name' \| 'size' \| 'type' \| 'modifiedTime'` | `'name'`     |
| `sort-order`                            | 排序顺序         | `'asc' \| 'desc'`                              | `'asc'`      |
| `show-size`                             | 是否显示文件大小 | `boolean`                                      | `true`       |
| `show-type`                             | 是否显示文件类型 | `boolean`                                      | `true`       |
| `show-modified-time`                    | 是否显示修改时间 | `boolean`                                      | `true`       |
| `show-actions`                          | 是否显示操作按钮 | `boolean`                                      | `true`       |
| `previewable`                           | 是否可预览       | `boolean`                                      | `true`       |
| `downloadable`                          | 是否可下载       | `boolean`                                      | `true`       |
| `deletable`                             | 是否可删除       | `boolean`                                      | `true`       |
| `loading`                               | 是否加载中       | `boolean`                                      | `false`      |
| `empty-text`                            | 空状态文本       | `string`                                       | `'暂无文件'` |
| `page-size`                             | 每页显示数量     | `number`                                       | `20`         |
| `show-pagination`                       | 是否显示分页     | `boolean`                                      | `false`      |

### FileItem 类型

```typescript
interface FileItem {
  /** 文件 ID */
  id: string;
  /** 文件名 */
  name: string;
  /** 文件大小（字节） */
  size: number;
  /** 文件 MIME 类型 */
  type: string;
  /** 文件 URL */
  url?: string;
  /** 缩略图 URL */
  thumbUrl?: string;
  /** 修改时间 */
  modifiedTime?: Date;
  /** 创建时间 */
  createdTime?: Date;
  /** 是否为文件夹 */
  isDirectory?: boolean;
  /** 子文件（文件夹时） */
  children?: FileItem[];
  /** 自定义数据 */
  meta?: Record<string, unknown>;
}
```

### FileList Events

| 事件名                | 说明         | 回调参数                               |
| --------------------- | ------------ | -------------------------------------- |
| `update:selected-ids` | 选中状态变化 | `(ids: string[])`                      |
| `update:view-mode`    | 视图模式变化 | `(mode: ViewMode)`                     |
| `click`               | 点击文件     | `(file: FileItem)`                     |
| `dblclick`            | 双击文件     | `(file: FileItem)`                     |
| `select`              | 选择文件     | `(file: FileItem, selected: boolean)`  |
| `preview`             | 预览文件     | `(file: FileItem)`                     |
| `download`            | 下载文件     | `(file: FileItem)`                     |
| `delete`              | 删除文件     | `(file: FileItem)`                     |
| `search`              | 搜索         | `(keyword: string)`                    |
| `sort`                | 排序         | `(field: SortField, order: SortOrder)` |
| `page-change`         | 页码变化     | `(page: number)`                       |

### FileList Methods

| 方法名             | 说明           | 参数                           |
| ------------------ | -------------- | ------------------------------ |
| `selectAll`        | 全选           | `()`                           |
| `unselectAll`      | 取消全选       | `()`                           |
| `selectFile`       | 选择文件       | `(id: string)`                 |
| `unselectFile`     | 取消选择文件   | `(id: string)`                 |
| `getSelectedFiles` | 获取选中的文件 | `() => FileItem[]`             |
| `refresh`          | 刷新列表       | `()`                           |
| `getElement`       | 获取DOM元素    | `() => HTMLDivElement \| null` |

## 组件复用说明

FileList 组件充分复用了现有组件，提供统一的交互体验：

### 使用的组件

| 组件             | 用途                         | 优势                 |
| ---------------- | ---------------------------- | -------------------- |
| **ExButton**     | 视图切换、全选按钮、排序按钮 | 统一的按钮样式和交互 |
| **ExInput**      | 搜索输入框                   | 支持清空、前缀图标   |
| **ExSelect**     | 排序字段选择                 | 下拉选项、统一样式   |
| **ExPagination** | 分页控制                     | 完整的分页功能       |
| **ExTree**       | 树形视图                     | 文件夹展开、节点操作 |
| **ExEmpty**      | 空状态显示                   | 统一的空状态样式     |
| **ExLoading**    | 加载状态                     | 统一的加载动画       |

### 设计优势

1. **统一的视觉风格** - 所有交互元素使用相同的赛博朋克主题
2. **一致的交互体验** - 按钮、输入框等行为保持一致
3. **易于维护** - 组件更新自动应用到文件列表
4. **代码复用** - 减少重复代码，提高开发效率

## 无障碍支持

- 完整的键盘导航支持
- ARIA 属性支持
- 支持屏幕阅读器

## 完整示例：资源管理器

一个类似 Windows 资源管理器的完整示例，包含面包屑导航、文件夹浏览、文件操作等功能。

<div class="demo-container explorer-demo">
  <!-- 工具栏 -->
  <div class="explorer-toolbar">
    <div class="explorer-toolbar-left">
      <ExButton
        size="small"
        :disabled="!canGoBack"
        @click="handleGoBack1"
      >
        <template #prefix>
          <img
            src="https://api.iconify.design/ri/arrow-left-line.svg"
            alt="返回"
            width="16"
            height="16"
          >
        </template>
        返回
      </ExButton>
      <ExButton
        size="small"
        @click="handleRefresh"
      >
        <template #prefix>
          <img
            src="https://api.iconify.design/ri/refresh-line.svg"
            alt="刷新"
            width="16"
            height="16"
          >
        </template>
        刷新
      </ExButton>
    </div>
    <!-- 面包屑导航 -->
    <div class="explorer-breadcrumb">
      <span
        v-for="(crumb, index) in breadcrumbs"
        :key="crumb.id"
        class="explorer-breadcrumb-item"
      >
        <button
          class="explorer-breadcrumb-btn"
          @click="handleBreadcrumbClick(index)"
        >
          {{ crumb.name }}
        </button>
        <span
          v-if="index < breadcrumbs.length - 1"
          class="explorer-breadcrumb-separator"
        >
          /
        </span>
      </span>
    </div>
  </div>

  <!-- 主内容区域 -->
  <div class="explorer-main" style="display:flex;">
    <!-- 左侧目录树 -->
    <div class="explorer-sidebar">
      <div class="explorer-sidebar-header">
        <img
          src="https://api.iconify.design/ri/folder-open-line.svg"
          alt="文件夹"
          width="20"
          height="20"
        >
        <span>文件夹</span>
      </div>
      <ExTree
        :data="treeData"
        :selected-keys="treeSelectedKeys"
        :expanded-keys="treeExpandedKeys"
        :show-icon="true"
        @node-click="handleTreeNodeClick"
        @update:expanded-keys="keys => treeExpandedKeys = keys"
      />
    </div>
    <!-- 右侧文件列表 -->
    <div class="explorer-content">
      <ExFileList
    :files="currentFiles"
    v-model:selected-ids="selectedFileIds"
    v-model:view-mode="viewMode"
    :selectable="true"
    :multiple="true"
    :show-toolbar="true"
    :show-search="true"
    :show-sort="true"
    :show-view-switch="true"
    :show-pagination="true"
    :page-size="10"
    @click="handleFileClick"
    @dblclick="handleFileDblClick"
    @preview="handlePreview"
    @download="handleDownload"
    @delete="handleDelete"
      />
    </div>
  </div>

  <!-- 状态栏 -->
  <div class="explorer-statusbar">
    <span>{{ currentFiles.length }} 个项目</span>
    <span v-if="selectedFileIds.length > 0">
      已选择 {{ selectedFileIds.length }} 个项目
    </span>
  </div>
</div>

```vue
<template>
  <div class="explorer-demo">
    <!-- 工具栏 -->
    <div class="explorer-toolbar">
      <div class="explorer-toolbar-left">
        <ExButton size="small" :disabled="!canGoBack" @click="handleGoBack">
          <template #prefix>
            <img src="..." alt="返回" width="16" height="16" />
          </template>
          返回
        </ExButton>
        <ExButton size="small" @click="handleRefresh">
          <template #prefix>
            <img src="..." alt="刷新" width="16" height="16" />
          </template>
          刷新
        </ExButton>
      </div>

      <!-- 面包屑导航 -->
      <div class="explorer-breadcrumb">
        <span v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
          <button @click="handleBreadcrumbClick(index)">
            {{ crumb.name }}
          </button>
          <span v-if="index < breadcrumbs.length - 1">/</span>
        </span>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="explorer-main">
      <!-- 左侧目录树 -->
      <div class="explorer-sidebar">
        <div class="explorer-sidebar-header">
          <img src="..." alt="文件夹" width="20" height="20" />
          <span>文件夹</span>
        </div>
        <ExTree
          :data="treeData"
          :selected-keys="treeSelectedKeys"
          :expanded-keys="treeExpandedKeys"
          :show-icon="true"
          @node-click="handleTreeNodeClick"
          @update:expanded-keys="keys => (treeExpandedKeys = keys)"
        />
      </div>

      <!-- 右侧文件列表 -->
      <div class="explorer-content">
        <ExFileList
          :files="currentFiles"
          v-model:selected-ids="selectedFileIds"
          v-model:view-mode="viewMode"
          :selectable="true"
          :multiple="true"
          :show-toolbar="true"
          :show-pagination="true"
          :page-size="10"
          @click="handleFileClick"
          @dblclick="handleFileDblClick"
          @preview="handlePreview"
          @download="handleDownload"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="explorer-statusbar">
      <span>{{ currentFiles.length }} 个项目</span>
      <span v-if="selectedFileIds.length > 0">已选择 {{ selectedFileIds.length }} 个项目</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// 文件系统数据结构
const fileSystem = ref({
  id: 'root',
  name: '我的文档',
  isDirectory: true,
  children: [
    {
      id: 'folder-1',
      name: '工作文件',
      isDirectory: true,
      children: [
        {
          id: 'file-1-1',
          name: '项目方案.docx',
          size: 524288,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          modifiedTime: new Date(),
          isDirectory: false,
        },
      ],
    },
    // ... 更多文件和文件夹
  ],
});

// 当前路径（ID 数组）
const currentPath = ref(['root']);
const selectedFileIds = ref([]);
const viewMode = ref('list');

// 计算当前显示的文件列表
const currentFiles = computed(() => {
  let current = fileSystem.value;

  for (let i = 1; i < currentPath.value.length; i++) {
    const folderId = currentPath.value[i];
    const folder = current.children?.find(f => f.id === folderId);
    if (folder && folder.isDirectory) {
      current = folder;
    }
  }

  return current.children || [];
});

// 面包屑导航
const breadcrumbs = computed(() => {
  const crumbs = [{ id: 'root', name: '我的文档' }];
  let current = fileSystem.value;

  for (let i = 1; i < currentPath.value.length; i++) {
    const folderId = currentPath.value[i];
    const folder = current.children?.find(f => f.id === folderId);
    if (folder) {
      crumbs.push({ id: folder.id, name: folder.name });
      current = folder;
    }
  }

  return crumbs;
});

const canGoBack = computed(() => currentPath.value.length > 1);

// 文件操作
const handleFileClick = file => {
  if (file.isDirectory) {
    currentPath.value.push(file.id);
    selectedFileIds.value = [];
  }
};

const handleBreadcrumbClick = index => {
  currentPath.value = currentPath.value.slice(0, index + 1);
  selectedFileIds.value = [];
};

const handleGoBack = () => {
  if (canGoBack.value) {
    currentPath.value.pop();
    selectedFileIds.value = [];
  }
};

// 树形数据转换
const treeData = computed(() => {
  const convertToTreeNode = (item, parentPath = []) => {
    const path = [...parentPath, item.id];
    return {
      key: item.id,
      label: item.name,
      icon: item.isDirectory
        ? 'https://api.iconify.design/ri/folder-line.svg'
        : 'https://api.iconify.design/ri/file-text-line.svg',
      children: item.children
        ?.filter(child => child.isDirectory)
        .map(child => convertToTreeNode(child, path)),
      isLeaf: !item.isDirectory || !item.children?.some(c => c.isDirectory),
      data: { path },
    };
  };

  return [convertToTreeNode(fileSystem.value)];
});

const treeSelectedKeys = computed(() => {
  return [currentPath.value[currentPath.value.length - 1]];
});

const treeExpandedKeys = ref(['root']);

const handleTreeNodeClick = node => {
  if (node.data?.path) {
    currentPath.value = node.data.path;
    selectedFileIds.value = [];
  }
};
</script>

<style scoped>
.explorer-demo {
  display: flex;
  flex-direction: column;
  height: 600px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  overflow: hidden;
}

.explorer-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--ex-color-bg-elevated);
  border-bottom: 1px solid var(--ex-color-border-primary);
}

.explorer-toolbar-left {
  display: flex;
  gap: 8px;
}

.explorer-breadcrumb {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
}

.explorer-breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.explorer-breadcrumb-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--ex-color-text-secondary);
  cursor: pointer;
  border-radius: var(--ex-radius-sm);
  transition: all 0.2s;
}

.explorer-breadcrumb-btn:hover {
  background: rgba(0, 240, 255, 0.1);
  color: var(--ex-color-neon-blue-500);
}

.explorer-breadcrumb-separator {
  color: var(--ex-color-text-tertiary);
}

.explorer-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.explorer-sidebar {
  width: 250px;
  background: var(--ex-color-bg-elevated);
  border-right: 1px solid var(--ex-color-border-primary);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.explorer-sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--ex-color-bg-secondary);
  border-bottom: 1px solid var(--ex-color-border-primary);
  font-weight: var(--ex-font-semibold);
  color: var(--ex-color-text-primary);
}

.explorer-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.explorer-statusbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--ex-color-bg-elevated);
  border-top: 1px solid var(--ex-color-border-primary);
  font-size: var(--ex-text-sm);
  color: var(--ex-color-text-secondary);
}
</style>
```

### 功能特性

这个资源管理器示例包含以下功能：

1. **左侧目录树** - 使用 ExTree 组件显示文件夹结构，支持展开/收起
2. **面包屑导航** - 显示当前路径，点击可快速跳转
3. **返回按钮** - 返回上一级目录
4. **刷新按钮** - 刷新当前目录
5. **文件夹浏览** - 单击文件夹进入，双击文件预览
6. **多选操作** - 支持选择多个文件进行批量操作
7. **视图切换** - 列表、网格、表格、树形四种视图
8. **搜索排序** - 快速查找和排序文件
9. **状态栏** - 显示文件数量和选中状态
10. **文件操作** - 预览、下载、删除等操作
11. **双向同步** - 左侧树和右侧列表状态同步

### 实现要点

- **左侧目录树**: 使用 ExTree 组件，只显示文件夹，支持展开/收起
- **树形数据转换**: 递归转换文件系统为树形节点，保存路径信息
- **双向同步**: 点击树节点更新右侧列表，右侧导航同步树的选中状态
- **路径追踪**: 使用路径数组 `currentPath` 追踪导航历史
- **面包屑导航**: 支持快速跳转到任意层级
- **文件操作**: 文件夹单击进入，文件双击预览
- **响应式布局**: 左右分栏，自适应高度

## 主题定制

文件列表跟随 ExUI 全局主题（`ConfigProvider` / 全局 `--ex-color-*` 变量）自动适配，无需单独配置。

<style scoped>
.demo-container {
  padding: 24px;
  background: var(--ex-color-bg-primary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  margin: 16px 0;
}

.explorer-demo {
  display: flex;
  flex-direction: column;
  height: 600px;
  background: var(--ex-color-bg-secondary);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-lg);
  overflow: hidden;
  padding: 0;
}

.explorer-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: var(--ex-color-bg-elevated);
  border-bottom: 1px solid var(--ex-color-border-primary);
}

.explorer-toolbar-left {
  display: flex;
  gap: 8px;
}

.explorer-breadcrumb {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
}

.explorer-breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.explorer-breadcrumb-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--ex-color-text-secondary);
  cursor: pointer;
  border-radius: var(--ex-radius-sm);
  transition: all 0.2s;
  font-size: var(--ex-text-sm);
}

.explorer-breadcrumb-btn:hover {
  background: rgba(0, 240, 255, 0.1);
  color: var(--ex-color-neon-blue-500);
}

.explorer-breadcrumb-separator {
  color: var(--ex-color-text-tertiary);
}

.explorer-statusbar {
  display: flex;
  justify-content: space-between;
  padding: 8px 16px;
  background: var(--ex-color-bg-elevated);
  border-top: 1px solid var(--ex-color-border-primary);
  font-size: var(--ex-text-sm);
  color: var(--ex-color-text-secondary);
}
</style>
