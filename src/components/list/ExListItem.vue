<template>
  <div
    :class="itemClasses"
    :style="itemStyles"
  >
    <!-- 水平布局 -->
    <template v-if="layout === 'horizontal'">
      <div class="ex-list-item__main">
        <!-- 头像 -->
        <div
          v-if="hasAvatar"
          class="ex-list-item__avatar"
        >
          <slot name="avatar">
            <img
              v-if="typeof item.avatar === 'string'"
              :src="item.avatar"
              :alt="avatarAlt"
              class="ex-list-item__avatar-img"
            >
            <component
              :is="item.avatar"
              v-else
            />
          </slot>
        </div>

        <!-- 内容区域 -->
        <div class="ex-list-item__content">
          <!-- 标题 -->
          <div
            v-if="hasTitle"
            class="ex-list-item__title"
          >
            <slot name="title">
              <span v-if="typeof item.title === 'string'">
                {{ item.title }}
              </span>
              <component
                :is="item.title"
                v-else
              />
            </slot>
          </div>

          <!-- 描述 -->
          <div
            v-if="hasDescription"
            class="ex-list-item__description"
          >
            <slot name="description">
              <span v-if="typeof item.description === 'string'">
                {{ item.description }}
              </span>
              <component
                :is="item.description"
                v-else
              />
            </slot>
          </div>

          <!-- 自定义内容 -->
          <div
            v-if="hasContent"
            class="ex-list-item__body"
          >
            <slot name="content">
              <span v-if="typeof item.content === 'string'">
                {{ item.content }}
              </span>
              <component
                :is="item.content"
                v-else
              />
            </slot>
          </div>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div
        v-if="hasExtra || hasActions"
        class="ex-list-item__extra"
      >
        <!-- 额外内容 -->
        <div
          v-if="hasExtra"
          class="ex-list-item__extra-content"
        >
          <slot name="extra">
            <span v-if="typeof item.extra === 'string'">
              {{ item.extra }}
            </span>
            <component
              :is="item.extra"
              v-else
            />
          </slot>
        </div>

        <!-- 操作按钮 -->
        <div
          v-if="hasActions"
          class="ex-list-item__actions"
        >
          <slot name="actions">
            <button
              v-for="(action, index) in item.actions"
              :key="index"
              :class="getActionClasses(action)"
              :disabled="action.disabled"
              @click="handleActionClick(action, $event)"
            >
              <!-- 图标 -->
              <span
                v-if="action.icon"
                class="ex-list-item__action-icon"
              >
                <component
                  :is="action.icon"
                  v-if="typeof action.icon !== 'string'"
                />
                <i
                  v-else
                  :class="action.icon"
                />
              </span>
              
              <!-- 文本 -->
              <span
                v-if="action.text"
                class="ex-list-item__action-text"
              >
                <span v-if="typeof action.text === 'string'">
                  {{ action.text }}
                </span>
                <component
                  :is="action.text"
                  v-else
                />
              </span>
            </button>
          </slot>
        </div>
      </div>
    </template>

    <!-- 垂直布局 -->
    <template v-else>
      <div class="ex-list-item__header">
        <!-- 头像 -->
        <div
          v-if="hasAvatar"
          class="ex-list-item__avatar"
        >
          <slot name="avatar">
            <img
              v-if="typeof item.avatar === 'string'"
              :src="item.avatar"
              :alt="avatarAlt"
              class="ex-list-item__avatar-img"
            >
            <component
              :is="item.avatar"
              v-else
            />
          </slot>
        </div>

        <!-- 标题和描述 -->
        <div class="ex-list-item__meta">
          <!-- 标题 -->
          <div
            v-if="hasTitle"
            class="ex-list-item__title"
          >
            <slot name="title">
              <span v-if="typeof item.title === 'string'">
                {{ item.title }}
              </span>
              <component
                :is="item.title"
                v-else
              />
            </slot>
          </div>

          <!-- 描述 -->
          <div
            v-if="hasDescription"
            class="ex-list-item__description"
          >
            <slot name="description">
              <span v-if="typeof item.description === 'string'">
                {{ item.description }}
              </span>
              <component
                :is="item.description"
                v-else
              />
            </slot>
          </div>
        </div>

        <!-- 额外内容 -->
        <div
          v-if="hasExtra"
          class="ex-list-item__extra-content"
        >
          <slot name="extra">
            <span v-if="typeof item.extra === 'string'">
              {{ item.extra }}
            </span>
            <component
              :is="item.extra"
              v-else
            />
          </slot>
        </div>
      </div>

      <!-- 内容区域 -->
      <div
        v-if="hasContent"
        class="ex-list-item__body"
      >
        <slot name="content">
          <span v-if="typeof item.content === 'string'">
            {{ item.content }}
          </span>
          <component
            :is="item.content"
            v-else
          />
        </slot>
      </div>

      <!-- 操作按钮 -->
      <div
        v-if="hasActions"
        class="ex-list-item__actions"
      >
        <slot name="actions">
          <button
            v-for="(action, index) in item.actions"
            :key="index"
            :class="getActionClasses(action)"
            :disabled="action.disabled"
            @click="handleActionClick(action, $event)"
          >
            <!-- 图标 -->
            <span
              v-if="action.icon"
              class="ex-list-item__action-icon"
            >
              <component
                :is="action.icon"
                v-if="typeof action.icon !== 'string'"
              />
              <i
                v-else
                :class="action.icon"
              />
            </span>
            
            <!-- 文本 -->
            <span
              v-if="action.text"
              class="ex-list-item__action-text"
            >
              <span v-if="typeof action.text === 'string'">
                {{ action.text }}
              </span>
              <component
                :is="action.text"
                v-else
              />
            </span>
          </button>
        </slot>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import type { ListItem, ListAction, ListLayout, ListSize } from './types'

defineOptions({
  name: 'ExListItem'
})

interface Props {
  /** 列表项数据 */
  item: ListItem
  /** 布局方式 */
  layout?: ListLayout
  /** 尺寸 */
  size?: ListSize
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  style?: CSSProperties
}

interface Emits {
  /** 操作按钮点击事件 */
  'action-click': [action: ListAction, item: ListItem, event: MouseEvent]
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'horizontal',
  size: 'medium',
  className: undefined,
  style: undefined
})

const emit = defineEmits<Emits>()

// 计算属性
const itemClasses = computed(() => [
  'ex-list-item',
  `ex-list-item--${props.layout}`,
  `ex-list-item--${props.size}`,
  props.className
])

const itemStyles = computed((): CSSProperties => ({
  ...props.style
}))

const hasAvatar = computed(() => {
  return props.item.avatar !== undefined
})

const hasTitle = computed(() => {
  return props.item.title !== undefined
})

const hasDescription = computed(() => {
  return props.item.description !== undefined
})

const hasContent = computed(() => {
  return props.item.content !== undefined
})

const hasExtra = computed(() => {
  return props.item.extra !== undefined
})

const hasActions = computed(() => {
  return props.item.actions && props.item.actions.length > 0
})

const avatarAlt = computed(() => {
  if (typeof props.item.title === 'string') {
    return props.item.title
  }
  return 'Avatar'
})

// 方法
const getActionClasses = (action: ListAction) => [
  'ex-list-item__action',
  `ex-list-item__action--${action.type || 'secondary'}`,
  {
    'ex-list-item__action--disabled': action.disabled,
    'ex-list-item__action--icon-only': action.icon && !action.text
  }
]

const handleActionClick = (action: ListAction, event: MouseEvent) => {
  if (action.disabled) return
  
  event.stopPropagation()
  emit('action-click', action, props.item, event)
}
</script>

<style lang="scss" scoped>
@use '../../styles/mixins' as *;

.ex-list-item {
  display: block;
  
  // 布局变体
  &--horizontal {
    .ex-list-item__main {
      @include flex-center;
      align-items: flex-start;
      flex: 1;
      gap: var(--ex-spacing-3);
    }
    
    .ex-list-item__content {
      flex: 1;
      min-width: 0;
    }
    
    .ex-list-item__extra {
      @include flex-center;
      align-items: flex-start;
      gap: var(--ex-spacing-3);
      margin-left: var(--ex-spacing-4);
    }
  }
  
  &--vertical {
    .ex-list-item__header {
      @include flex-center;
      align-items: flex-start;
      gap: var(--ex-spacing-3);
      margin-bottom: var(--ex-spacing-2);
    }
    
    .ex-list-item__meta {
      flex: 1;
      min-width: 0;
    }
    
    .ex-list-item__body {
      margin-bottom: var(--ex-spacing-3);
    }
  }
  
  // 尺寸变体
  &--small {
    .ex-list-item__avatar {
      width: 32px;
      height: 32px;
    }
    
    .ex-list-item__title {
      font-size: var(--ex-text-sm);
    }
    
    .ex-list-item__description {
      font-size: var(--ex-text-xs);
    }
  }
  
  &--medium {
    .ex-list-item__avatar {
      width: 40px;
      height: 40px;
    }
    
    .ex-list-item__title {
      font-size: var(--ex-text-base);
    }
    
    .ex-list-item__description {
      font-size: var(--ex-text-sm);
    }
  }
  
  &--large {
    .ex-list-item__avatar {
      width: 48px;
      height: 48px;
    }
    
    .ex-list-item__title {
      font-size: var(--ex-text-lg);
    }
    
    .ex-list-item__description {
      font-size: var(--ex-text-base);
    }
  }
}

.ex-list-item__avatar {
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: var(--ex-color-bg-secondary);
  @include flex-center;
}

.ex-list-item__avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ex-list-item__title {
  font-weight: var(--ex-font-medium);
  color: var(--ex-color-text-primary);
  line-height: var(--ex-leading-tight);
  margin-bottom: var(--ex-spacing-1);
  
  @include text-ellipsis;
}

.ex-list-item__description {
  color: var(--ex-color-text-secondary);
  line-height: var(--ex-leading-relaxed);
  margin-bottom: var(--ex-spacing-2);
  
  @include text-ellipsis(2);
}

.ex-list-item__body {
  color: var(--ex-color-text-primary);
  line-height: var(--ex-leading-relaxed);
}

.ex-list-item__extra-content {
  color: var(--ex-color-text-secondary);
  font-size: var(--ex-text-sm);
  text-align: right;
  
  .ex-list-item--vertical & {
    text-align: left;
  }
}

.ex-list-item__actions {
  @include flex-center;
  gap: var(--ex-spacing-2);
  
  .ex-list-item--vertical & {
    justify-content: flex-start;
    margin-top: var(--ex-spacing-2);
  }
}

.ex-list-item__action {
  @include flex-center;
  gap: var(--ex-spacing-1);
  padding: var(--ex-spacing-1) var(--ex-spacing-2);
  border: 1px solid var(--ex-color-border-primary);
  border-radius: var(--ex-radius-sm);
  background: var(--ex-color-bg-primary);
  color: var(--ex-color-text-primary);
  font-size: var(--ex-text-sm);
  cursor: pointer;
  @include transition(all);
  
  &:hover:not(&--disabled) {
    border-color: var(--ex-color-primary);
    color: var(--ex-color-primary);
  }
  
  &:active:not(&--disabled) {
    transform: translateY(1px);
  }
  
  &--primary {
    background: var(--ex-color-primary);
    border-color: var(--ex-color-primary);
    color: var(--ex-color-white);
    
    &:hover:not(&--disabled) {
      background: var(--ex-color-primary-hover);
      border-color: var(--ex-color-primary-hover);
    }
  }
  
  &--danger {
    color: var(--ex-color-error);
    border-color: var(--ex-color-error);
    
    &:hover:not(&--disabled) {
      background: var(--ex-color-error);
      color: var(--ex-color-white);
    }
  }
  
  &--ghost {
    background: transparent;
    
    &:hover:not(&--disabled) {
      background: var(--ex-color-bg-secondary);
    }
  }
  
  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &--icon-only {
    padding: var(--ex-spacing-1);
    width: 28px;
    height: 28px;
  }
}

.ex-list-item__action-icon {
  @include flex-center;
  font-size: var(--ex-text-sm);
}

.ex-list-item__action-text {
  white-space: nowrap;
}

// 响应式设计
@include respond-to(sm) {
  .ex-list-item {
    &--horizontal {
      .ex-list-item__extra {
        margin-left: var(--ex-spacing-2);
        flex-direction: column;
        align-items: flex-end;
      }
      
      .ex-list-item__actions {
        flex-direction: column;
        gap: var(--ex-spacing-1);
      }
    }
    
    &--small .ex-list-item__avatar {
      width: 28px;
      height: 28px;
    }
    
    &--medium .ex-list-item__avatar {
      width: 32px;
      height: 32px;
    }
    
    &--large .ex-list-item__avatar {
      width: 40px;
      height: 40px;
    }
  }
  
  .ex-list-item__action {
    padding: var(--ex-spacing-1);
    font-size: var(--ex-text-xs);
    
    &--icon-only {
      width: 24px;
      height: 24px;
    }
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .ex-list-item {
    .ex-list-item__action {
      border-width: 2px;
      font-weight: var(--ex-font-medium);
    }
  }
}

// 减少动画
@media (prefers-reduced-motion: reduce) {
  .ex-list-item {
    .ex-list-item__action {
      transition: none;
      
      &:active:not(&--disabled) {
        transform: none;
      }
    }
  }
}
</style>