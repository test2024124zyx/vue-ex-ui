<template>
  <div
    class="ex-slider-input"
    :class="inputClasses"
  >
    <template v-if="range">
      <!-- 范围输入 -->
      <div class="ex-slider-input__range">
        <ex-input
          :model-value="rangeValue[0]"
          :size="size"
          :disabled="disabled"
          :readonly="readonly"
          type="number"
          :min="min"
          :max="rangeValue[1]"
          :step="step"
          class="ex-slider-input__start"
          @update:model-value="handleStartChange"
          @blur="handleBlur"
        />
        <span class="ex-slider-input__separator">-</span>
        <ex-input
          :model-value="rangeValue[1]"
          :size="size"
          :disabled="disabled"
          :readonly="readonly"
          type="number"
          :min="rangeValue[0]"
          :max="max"
          :step="step"
          class="ex-slider-input__end"
          @update:model-value="handleEndChange"
          @blur="handleBlur"
        />
      </div>
    </template>
    
    <template v-else>
      <!-- 单值输入 -->
      <ex-input
        :model-value="singleValue"
        :size="size"
        :disabled="disabled"
        :readonly="readonly"
        type="number"
        :min="min"
        :max="max"
        :step="step"
        class="ex-slider-input__single"
        @update:model-value="handleSingleChange"
        @blur="handleBlur"
      >
        <template
          v-if="showControls"
          #suffix
        >
          <div class="ex-slider-input__controls">
            <button
              type="button"
              class="ex-slider-input__control ex-slider-input__control--increase"
              :disabled="disabled || readonly || singleValue >= max"
              @click="handleIncrease"
            >
              <ex-icon name="chevron-up" />
            </button>
            <button
              type="button"
              class="ex-slider-input__control ex-slider-input__control--decrease"
              :disabled="disabled || readonly || singleValue <= min"
              @click="handleDecrease"
            >
              <ex-icon name="chevron-down" />
            </button>
          </div>
        </template>
      </ex-input>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ExInput } from '../input'
import { ExIcon } from '../icon'
import type { SliderValue, SliderSize } from './types'
import { clamp, getPrecision } from './utils'

interface SliderInputProps {
  value: SliderValue
  min: number
  max: number
  step: number
  disabled?: boolean
  readonly?: boolean
  size?: SliderSize
  showControls?: boolean
  range?: boolean
}

const props = withDefaults(defineProps<SliderInputProps>(), {
  disabled: false,
  readonly: false,
  size: 'medium',
  showControls: false,
  range: false
})

const emit = defineEmits<{
  change: [value: SliderValue]
}>()

// 响应式状态（预留功能）
const _inputValue = ref<SliderValue>(props.value)

// 计算属性
const inputClasses = computed(() => [
  `ex-slider-input--${props.size}`,
  {
    'ex-slider-input--disabled': props.disabled,
    'ex-slider-input--readonly': props.readonly,
    'ex-slider-input--range': props.range,
    'ex-slider-input--with-controls': props.showControls && !props.range
  }
])

const singleValue = computed(() => {
  return props.range ? 0 : (props.value as number)
})

const rangeValue = computed(() => {
  return props.range ? (props.value as [number, number]) : [0, 0]
})

const precision = computed(() => {
  return getPrecision(props.step)
})

// 事件处理
const handleSingleChange = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) return
  
  const clampedValue = clamp(numValue, props.min, props.max)
  const preciseValue = parseFloat(clampedValue.toFixed(precision.value))
  
  emit('change', preciseValue)
}

const handleStartChange = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) return
  
  const currentRange = rangeValue.value
  const clampedValue = clamp(numValue, props.min, currentRange[1])
  const preciseValue = parseFloat(clampedValue.toFixed(precision.value))
  
  emit('change', [preciseValue, currentRange[1]])
}

const handleEndChange = (value: string | number) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) return
  
  const currentRange = rangeValue.value
  const clampedValue = clamp(numValue, currentRange[0], props.max)
  const preciseValue = parseFloat(clampedValue.toFixed(precision.value))
  
  emit('change', [currentRange[0], preciseValue])
}

const handleIncrease = () => {
  if (props.disabled || props.readonly) return
  
  const currentValue = singleValue.value
  const newValue = clamp(currentValue + props.step, props.min, props.max)
  const preciseValue = parseFloat(newValue.toFixed(precision.value))
  
  if (preciseValue !== currentValue) {
    emit('change', preciseValue)
  }
}

const handleDecrease = () => {
  if (props.disabled || props.readonly) return
  
  const currentValue = singleValue.value
  const newValue = clamp(currentValue - props.step, props.min, props.max)
  const preciseValue = parseFloat(newValue.toFixed(precision.value))
  
  if (preciseValue !== currentValue) {
    emit('change', preciseValue)
  }
}

const handleBlur = () => {
  // 可以在这里添加失焦时的验证逻辑
}
</script>