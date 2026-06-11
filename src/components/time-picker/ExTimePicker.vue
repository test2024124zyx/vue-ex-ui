<template>
  <div
    class="ex-time-picker"
    :class="timePickerClasses"
  >
    <div
      ref="triggerRef"
      class="ex-time-picker__trigger"
      :class="triggerClasses"
      @click="handleTriggerClick"
    >
      <input
        ref="inputRef"
        v-model="displayValue"
        class="ex-time-picker__input"
        :placeholder="placeholderText"
        :disabled="disabled"
        :readonly="readonly || !editable"
        :style="inputStyle"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keydown="handleKeydown"
      >
      
      <!-- 前缀图标 -->
      <span
        v-if="prefixIcon"
        class="ex-time-picker__prefix"
      >
        <ex-icon :name="prefixIcon" />
      </span>
      
      <!-- 后缀图标 -->
      <span class="ex-time-picker__suffix">
        <!-- 清空按钮 -->
        <ex-icon
          v-if="showClearIcon"
          name="close-circle"
          class="ex-time-picker__clear"
          @click.stop="handleClear"
        />
        <!-- 时间图标 -->
        <ex-icon
          v-else
          :name="suffixIcon || 'clock'"
          class="ex-time-picker__icon"
        />
      </span>
    </div>

    <!-- 时间面板 -->
    <teleport to="body">
      <div
        v-if="panelVisible"
        ref="panelRef"
        class="ex-time-picker__panel"
        :class="panelClasses"
        :style="panelStyle"
      >
        <time-panel
          :value="currentValue"
          :format="format"
          :step="step"
          :disabled-time="disabledTime"
          :show-now="showNow"
          :use12-hours="use12Hours"
          :visible="panelVisible"
          @change="handleTimeChange"
          @confirm="handleConfirm"
          @now="handleNow"
        />
      </div>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ExIcon from '../icon'
import TimePanel from './TimePanel.vue'
import type { ExTimePickerProps, TimeValue, TimeChangeEvent } from './types'
import {
  formatTime,

  timeToString,
  stringToTime,

  getCurrentTime
} from './utils'

defineOptions({
  name: 'ExTimePicker'
})

const props = withDefaults(defineProps<ExTimePickerProps>(), {
  format: 'HH:mm:ss',
  placeholder: '',
  disabled: false,
  readonly: false,
  clearable: true,
  size: 'medium',
  status: 'normal',
  step: () => ({ hour: 1, minute: 1, second: 1 }),
  showNow: true,
  use12Hours: false,
  validateEvent: true,
  bordered: true
})

const emit = defineEmits<{
  'update:modelValue': [value: TimeValue]
  change: [event: TimeChangeEvent]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  clear: []
}>()

const { t } = useI18n()

// 模板引用
const triggerRef = ref<HTMLElement>()
const inputRef = ref<HTMLInputElement>()
const panelRef = ref<HTMLElement>()

// 响应式状态
const panelVisible = ref(false)
const displayValue = ref('')
const currentValue = ref<Date | null>(null)
const focused = ref(false)
const editable = ref(true)

// 计算属性
const timePickerClasses = computed(() => [
  `ex-time-picker--${props.size}`,
  `ex-time-picker--${props.status}`,
  {
    'ex-time-picker--disabled': props.disabled,
    'ex-time-picker--readonly': props.readonly,
    'ex-time-picker--focused': focused.value,
    'ex-time-picker--borderless': !props.bordered
  }
])

const triggerClasses = computed(() => ({
  'ex-time-picker__trigger--active': panelVisible.value,
  'ex-time-picker__trigger--disabled': props.disabled,
  'ex-time-picker__trigger--readonly': props.readonly
}))

const panelClasses = computed(() => [
  props.popperClass,
  {
    'ex-time-picker__panel--visible': panelVisible.value
  }
])

const showClearIcon = computed(() => {
  return props.clearable && 
         !props.disabled && 
         !props.readonly && 
         displayValue.value && 
         focused.value
})

const placeholderText = computed(() => {
  return props.placeholder || t('timePicker.selectTime')
})

// 更新显示值函数定义
const updateDisplayValue = (value: TimeValue) => {
  if (!value) {
    displayValue.value = ''
    currentValue.value = null
    return
  }

  if (typeof value === 'string') {
    const parsed = stringToTime(value, props.format)
    if (parsed) {
      currentValue.value = parsed
      displayValue.value = formatTime(parsed, props.format)
    } else {
      displayValue.value = value
      currentValue.value = null
    }
  } else if (value instanceof Date) {
    currentValue.value = value
    displayValue.value = formatTime(value, props.format)
  }
}

// 监听器
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== undefined) {
      updateDisplayValue(newValue)
    }
  },
  { immediate: true }
)

watch(
  () => props.format,
  () => {
    if (props.modelValue !== undefined) {
      updateDisplayValue(props.modelValue)
    }
  }
)



// 事件处理
const handleTriggerClick = () => {
  if (props.disabled || props.readonly) return
  
  if (panelVisible.value) {
    hidePanel()
  } else {
    showPanel()
  }
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  
  displayValue.value = value
  
  if (!value) {
    currentValue.value = null
    emitChange(null)
    return
  }
  
  const parsed = stringToTime(value, props.format)
  if (parsed) {
    currentValue.value = parsed
    emitChange(parsed)
  }
}

const handleBlur = (event: FocusEvent) => {
  focused.value = false
  
  // 验证并格式化输入值
  if (displayValue.value) {
    const parsed = stringToTime(displayValue.value, props.format)
    if (parsed) {
      displayValue.value = formatTime(parsed, props.format)
    }
  }
  
  emit('blur', event)
  
  // 延迟隐藏面板，允许点击面板
  setTimeout(() => {
    if (!panelRef.value?.contains(document.activeElement)) {
      hidePanel()
    }
  }, 200)
}

const handleFocus = (event: FocusEvent) => {
  focused.value = true
  emit('focus', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      if (panelVisible.value) {
        handleConfirm()
      } else {
        showPanel()
      }
      break
    case 'Escape':
      event.preventDefault()
      hidePanel()
      break
    case 'Tab':
      hidePanel()
      break
    case 'ArrowDown':
      event.preventDefault()
      if (!panelVisible.value) {
        showPanel()
      }
      break
  }
}

const handleClear = () => {
  displayValue.value = ''
  currentValue.value = null
  emitChange(null)
  emit('clear')
  hidePanel()
  inputRef.value?.focus()
}

const handleTimeChange = (time: Date) => {
  currentValue.value = time
  displayValue.value = formatTime(time, props.format)
  emitChange(time)
}

const handleConfirm = () => {
  if (currentValue.value) {
    emitChange(currentValue.value)
  }
  hidePanel()
  inputRef.value?.focus()
}

const handleNow = () => {
  const now = getCurrentTime()
  currentValue.value = now
  displayValue.value = formatTime(now, props.format)
  emitChange(now)
}

// 显示/隐藏面板
const showPanel = async () => {
  if (props.disabled || props.readonly) return
  
  panelVisible.value = true
  await nextTick()
  updatePanelPosition()
}

const hidePanel = () => {
  panelVisible.value = false
}

// 更新面板位置
const updatePanelPosition = () => {
  if (!triggerRef.value || !panelRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const panelEl = panelRef.value
  
  // 计算位置
  const top = triggerRect.bottom + window.scrollY + 4
  const left = triggerRect.left + window.scrollX
  
  // 检查是否超出视口
  const panelRect = panelEl.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  let finalLeft = left
  let finalTop = top
  
  // 水平位置调整
  if (left + panelRect.width > viewportWidth) {
    finalLeft = viewportWidth - panelRect.width - 8
  }
  
  // 垂直位置调整
  if (top + panelRect.height > viewportHeight) {
    finalTop = triggerRect.top + window.scrollY - panelRect.height - 4
  }
  
  panelEl.style.left = `${Math.max(8, finalLeft)}px`
  panelEl.style.top = `${Math.max(8, finalTop)}px`
}

// 发射变更事件
const emitChange = (value: TimeValue) => {
  emit('update:modelValue', value)
  emit('change', {
    value,
    timeString: value ? timeToString(value, props.format) : ''
  })
}

// 点击外部关闭面板
const handleClickOutside = (event: Event) => {
  const target = event.target as Node
  
  if (
    panelVisible.value &&
    triggerRef.value &&
    panelRef.value &&
    !triggerRef.value.contains(target) &&
    !panelRef.value.contains(target)
  ) {
    hidePanel()
  }
}

// 窗口大小变化时更新面板位置
const handleResize = () => {
  if (panelVisible.value) {
    updatePanelPosition()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
})

// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  showPanel,
  hidePanel
})
</script>