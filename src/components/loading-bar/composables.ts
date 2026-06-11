import { inject } from 'vue'
import type { LoadingBarInst } from './types'

/**
 * 使用加载条
 */
export function useLoadingBar(): LoadingBarInst | null {
  const loadingBar = inject<LoadingBarInst | null>('loading-bar', null)
  
  if (!loadingBar && import.meta.env.DEV) {
    console.warn('[ExLoadingBar] LoadingBar instance not found. Make sure to wrap your app with ExLoadingBarProvider.')
  }
  
  return loadingBar
}

/**
 * 创建全局加载条实例
 */
export function createLoadingBar(): LoadingBarInst {
  let container: HTMLElement | null = null
  let loadingBarElement: HTMLElement | null = null
  let percentage = 0
  let status: 'loading' | 'success' | 'error' | 'warning' = 'loading'
  let progressTimer: number | null = null
  let finishTimer: number | null = null

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

  const createLoadingBarElement = () => {
    if (loadingBarElement) {
      return loadingBarElement
    }

    loadingBarElement = document.createElement('div')
    loadingBarElement.className = 'ex-loading-bar ex-loading-bar--global ex-loading-bar--loading'
    loadingBarElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--ex-color-bg-secondary, #1a1a1a);
      z-index: 9999;
      pointer-events: none;
      overflow: hidden;
    `

    const track = document.createElement('div')
    track.className = 'ex-loading-bar__track'
    track.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    `

    const progress = document.createElement('div')
    progress.className = 'ex-loading-bar__progress'
    progress.style.cssText = `
      position: relative;
      height: 100%;
      background: var(--ex-color-neon-blue-500, #29ABE2);
      transition: width 0.2s ease;
      width: 0%;
      box-shadow: 0 0 10px var(--ex-color-neon-blue-500, #29ABE2);
    `

    track.appendChild(progress)
    loadingBarElement.appendChild(track)

    return loadingBarElement
  }

  const updateProgress = () => {
    if (!loadingBarElement) return

    const progress = loadingBarElement.querySelector('.ex-loading-bar__progress') as HTMLElement
    if (progress) {
      progress.style.width = `${percentage}%`
    }

    // 更新状态样式
    loadingBarElement.className = `ex-loading-bar ex-loading-bar--global ex-loading-bar--${status}`
    
    const statusColors = {
      loading: 'var(--ex-color-neon-blue-500, #29ABE2)',
      success: 'var(--ex-color-success, #52c41a)',
      error: 'var(--ex-color-error, #ff4d4f)',
      warning: 'var(--ex-color-warning, #faad14)'
    }
    
    if (progress) {
      progress.style.background = statusColors[status]
      progress.style.boxShadow = `0 0 10px ${statusColors[status]}`
    }
  }

  const show = () => {
    if (!container) {
      container = document.body
    }

    const element = createLoadingBarElement()
    if (!container.contains(element)) {
      container.appendChild(element)
    }
    updateProgress()
  }

  const hide = () => {
    if (loadingBarElement && container && container.contains(loadingBarElement)) {
      container.removeChild(loadingBarElement)
    }
  }

  return {
    start() {
      clearTimers()
      percentage = 0
      status = 'loading'
      show()

      // 模拟进度增长
      progressTimer = window.setInterval(() => {
        if (percentage < 90) {
          const increment = Math.random() * 10
          percentage = Math.min(90, percentage + increment)
          updateProgress()
        }
      }, 200)
    },

    finish() {
      clearTimers()
      status = 'success'
      percentage = 100
      updateProgress()

      finishTimer = window.setTimeout(() => {
        hide()
        percentage = 0
      }, 500)
    },

    error() {
      clearTimers()
      status = 'error'
      percentage = 100
      updateProgress()

      finishTimer = window.setTimeout(() => {
        hide()
        percentage = 0
      }, 1500)
    },

    warning() {
      clearTimers()
      status = 'warning'
      percentage = 100
      updateProgress()

      finishTimer = window.setTimeout(() => {
        hide()
        percentage = 0
      }, 1500)
    },

    reset() {
      clearTimers()
      hide()
      percentage = 0
      status = 'loading'
    },

    setPercentage(value: number) {
      percentage = Math.max(0, Math.min(100, value))
      show()
      updateProgress()
    },

    update(value: number) {
      percentage = Math.max(0, Math.min(100, value))
      show()
      updateProgress()
    }
  }
}