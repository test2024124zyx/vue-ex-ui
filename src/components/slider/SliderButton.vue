<template>
  <div
    ref="buttonRef"
    class="ex-slider__button"
    :class="buttonClasses"
    :style="buttonStyle"
    :tabindex="disabled ? -1 : 0"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="value"
    :aria-disabled="disabled"
    :aria-orientation="vertical ? 'vertical' : 'horizontal'"
    role="slider"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeydown"
  >
    <!-- 工具提示 -->
    <div
      v-if="showTooltip && (dragging || focused || hovered)"
      ref="tooltipRef"
      class="ex-slider__tooltip"
      :class="tooltipClasses"
      :style="tooltipStyle"
    >
      <div class="ex-slider__tooltip-content">
        {{ tooltipText }}
      </div>
      <div class="ex-slider__tooltip-arrow" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import type { SliderSize, SliderDragEvent } from './types'
import { getButtonStyle, clamp } from './utils'

interface SliderButtonProps {
  value: number
  min: number
  max: number
  vertical?: boolean
  disabled?: boolean
  readonly?: boolean
  size?: SliderSize
  color?: string | null
  showTooltip?: boolean
  formatTooltip?: ((value: number) => string) | null
  dragging?: boolean
  index?: number
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<SliderButtonProps>(), {
  vertical: false,
  disabled: false,
  readonly: false,
  size: 'medium',
  color: null,
  showTooltip: true,
  formatTooltip: null,
  dragging: false,
  index: 0,
  placement: 'top'
})

const emit = defineEmits<{
  'drag-start': [event: SliderDragEvent]
  'drag': [event: SliderDragEvent]
  'drag-end': [event: SliderDragEvent]
}>()

// 模板引用
const buttonRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()

// 响应式状态
const focused = ref(false)
const hovered = ref(false)
const isDragging = ref(false)

// 计算属性
const buttonClasses = computed(() => [
  `ex-slider__button--${props.size}`,
  {
    'ex-slider__button--vertical': props.vertical,
    'ex-slider__button--disabled': props.disabled,
    'ex-slider__button--readonly': props.readonly,
    'ex-slider__button--dragging': props.dragging || isDragging.value,
    'ex-slider__button--focused': focused.value,
    'ex-slider__button--hovered': hovered.value
  }
])

const buttonStyle = computed(() => {
  const baseStyle = getButtonStyle(props.value, props.min, props.max, props.vertical, false)
  
  if (props.color) {
    return {
      ...baseStyle,
      backgroundColor: props.color,
      borderColor: props.color
    }
  }
  
  return baseStyle
})

const tooltipClasses = computed(() => [
  `ex-slider__tooltip--${props.placement}`,
  {
    'ex-slider__tooltip--vertical': props.vertical,
    'ex-slider__tooltip--visible': showTooltip.value && (props.dragging || focused.value || hovered.value)
  }
])

const tooltipStyle = computed(() => {
  if (!props.vertical) {
    return {
      transform: 'translateX(-50%)'
    }
  } else {
    return {
      transform: 'translateY(-50%)'
    }
  }
})

const tooltipText = computed(() => {
  if (props.formatTooltip) {
    return props.formatTooltip(props.value)
  }
  return String(props.value)
})

const showTooltip = computed(() => {
  return props.showTooltip && !props.disabled
})

// 事件处理
const handleMouseDown = (event: MouseEvent) => {
  if (props.disabled || props.readonly) return
  
  event.preventDefault()
  event.stopPropagation()
  
  isDragging.value = true
  
  const dragEvent: SliderDragEvent = {
    value: props.value,
    index: props.index,
    originalEvent: event
  }
  
  emit('drag-start', dragEvent)
  
  // 添加鼠标悬停状态
  hovered.value = true
}

const handleTouchStart = (event: TouchEvent) => {
  if (props.disabled || props.readonly) return
  
  event.preventDefault()
  event.stopPropagation()
  
  isDragging.value = true
  
  const dragEvent: SliderDragEvent = {
    value: props.value,
    index: props.index,
    originalEvent: event
  }
  
  emit('drag-start', dragEvent)
}

const handleFocus = () => {
  if (props.disabled) return
  focused.value = true
}

const handleBlur = () => {
  focused.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.readonly) return
  
  const { key } = event
  let handled = false
  let newValue = props.value
  
  const step = 1 // 可以从父组件传入
  
  switch (key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      event.preventDefault()
      newValue = clamp(props.value - step, props.min, props.max)
      handled = true
      break
      
    case 'ArrowRight':
    case 'ArrowUp':
      event.preventDefault()
      newValue = clamp(props.value + step, props.min, props.max)
      handled = true
      break
      
    case 'Home':
      event.preventDefault()
      newValue = props.min
      handled = true
      break
      
    case 'End':
      event.preventDefault()
      newValue = props.max
      handled = true
      break
      
    case 'PageUp':
      event.preventDefault()
      newValue = clamp(props.value + step * 10, props.min, props.max)
      handled = true
      break
      
    case 'PageDown':
      event.preventDefault()
      newValue = clamp(props.value - step * 10, props.min, props.max)
      handled = true
      break
  }
  
  if (handled && newValue !== props.value) {
    const dragEvent: SliderDragEvent = {
      value: newValue,
      index: props.index,
      originalEvent: event
    }
    
    emit('drag-start', dragEvent)
    emit('drag', dragEvent)
    emit('drag-end', dragEvent)
  }
}

// 监听拖拽状态变化
watch(() => props.dragging, (newDragging) => {
  isDragging.value = newDragging
  
  if (!newDragging) {
    hovered.value = false
  }
})

// 暴露方法
defineExpose({
  focus: () => buttonRef.value?.focus(),
  blur: () => buttonRef.value?.blur()
})
</script>