<template>
  <div class="ex-loading-bar-provider">
    <slot />
    <Teleport :to="container">
      <ExLoadingBar
        v-if="visible"
        ref="loadingBarRef"
        :percentage="percentage"
        :status="status"
        :height="3"
        :animated="true"
        :rounded="false"
        :class="['ex-loading-bar--global']"
        :style="globalStyles"
      />
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, provide, onUnmounted } from 'vue'
import { loadingBarProviderProps, type LoadingBarInst } from './types'
import { useI18n } from '../../locale'
import ExLoadingBar from './ExLoadingBar.vue'

defineOptions({
  name: 'ExLoadingBarProvider'
})

const props = defineProps(loadingBarProviderProps)
const { t: _t } = useI18n()

// 状态管理
const visible = ref(false)
const percentage = ref(0)
const status = ref<'loading' | 'success' | 'error' | 'warning'>('loading')
const loadingBarRef = ref<InstanceType<typeof ExLoadingBar>>()

// 定时器
let progressTimer: number | null = null
let finishTimer: number | null = null

// 计算加载条属性
const _currentLoadingBarProps = computed(() => {
  const baseProps = {
    percentage: percentage.value,
    status: status.value,
    height: 3,
    animated: true,
    rounded: false
  }
  
  // 合并用户自定义样式，但确保类型正确
  const userStyle = props.loadingBarStyle || {}
  const mergedProps = { ...baseProps, ...userStyle }
  
  // 确保 height 是 number 类型
  if (typeof mergedProps.height !== 'number') {
    mergedProps.height = 3
  }
  
  return mergedProps
})

// 计算全局样式
const globalStyles = computed(() => ({
  position: 'fixed',
  top: '0',
  left: '0',
  right: '0',
  zIndex: 'calc(var(--ex-z-loading) - 1000 + var(--ex-z-index-base, 1000))',
  pointerEvents: 'none'
}))

// 清理定时器
const clearTimers = () => {
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  if (finishTimer) {
    clearTimeout(finishTimer)
    finishTimer = null
  }
}

// 加载条实例方法
const loadingBarInst: LoadingBarInst = {
  start() {
    clearTimers()
    visible.value = true
    status.value = 'loading'
    percentage.value = 0
    
    // 模拟进度增长
    progressTimer = window.setInterval(() => {
      if (percentage.value < 90) {
        const increment = Math.random() * 10
        percentage.value = Math.min(90, percentage.value + increment)
      }
    }, 200)
  },
  
  finish() {
    clearTimers()
    status.value = 'success'
    percentage.value = 100
    
    finishTimer = window.setTimeout(() => {
      visible.value = false
      percentage.value = 0
    }, 500)
  },
  
  error() {
    clearTimers()
    status.value = 'error'
    percentage.value = 100
    
    finishTimer = window.setTimeout(() => {
      visible.value = false
      percentage.value = 0
    }, 1500)
  },
  
  warning() {
    clearTimers()
    status.value = 'warning'
    percentage.value = 100
    
    finishTimer = window.setTimeout(() => {
      visible.value = false
      percentage.value = 0
    }, 1500)
  },
  
  reset() {
    clearTimers()
    visible.value = false
    percentage.value = 0
    status.value = 'loading'
  },
  
  setPercentage(value: number) {
    percentage.value = Math.max(0, Math.min(100, value))
    if (!visible.value) {
      visible.value = true
    }
  }
}

// 提供加载条实例
provide('loading-bar', loadingBarInst)

// 组件卸载时清理
onUnmounted(() => {
  clearTimers()
})

// 暴露实例方法
defineExpose(loadingBarInst)
</script>