import { generateId } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { generateId }

import type { EmptyType, EmptyImageConfig, EmptyConfigMap } from './types'

/**
 * 获取尺寸对应的像素值
 */
export function getImageSize(size: number | string): string {
  if (typeof size === 'number') {
    return `${size}px`
  }
  return size
}

/**
 * 内置空状态配置
 */
export const EMPTY_CONFIGS: EmptyConfigMap = {
  default: {
    content: `
      <svg viewBox="0 0 184 152" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <g transform="translate(24 31.67)">
            <ellipse fill-opacity=".8" fill="#F5F5F7" cx="67.797" cy="106.89" rx="67.797" ry="12.668"/>
            <path d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z" fill="#AEB8C2"/>
            <path d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z" fill="url(#linearGradient-1)" transform="translate(13.56)"/>
            <path d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#F5F5F7"/>
            <path d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a.715.715 0 1 1 0 1.429H42.94a.715.715 0 1 1 0-1.429zM42.94 61.53h49.713a.715.715 0 1 1 0 1.428H42.94a.715.715 0 1 1 0-1.428zM42.94 73.292h49.713a.715.715 0 1 1 0 1.429H42.94a.715.715 0 1 1 0-1.429zM42.94 85.055h49.713a.715.715 0 1 1 0 1.429H42.94a.715.715 0 1 1 0-1.429z" fill="#DCE0E6"/>
          </g>
          <g transform="translate(149.65 15.383)" fill="#DCE0E6">
            <circle cx="20.654" cy="3.167" r="2.849"/>
            <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"/>
          </g>
        </g>
        <defs>
          <linearGradient id="linearGradient-1" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stop-color="#606266"/>
            <stop offset="100%" stop-color="#909399"/>
          </linearGradient>
        </defs>
      </svg>
    `,
    description: 'empty.default',
    size: 120
  },
  search: {
    content: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <circle cx="100" cy="100" r="80" stroke="#E4E7ED" stroke-width="2" fill="#F5F7FA"/>
          <circle cx="85" cy="85" r="25" stroke="#909399" stroke-width="3" fill="none"/>
          <path d="m105 105 20 20" stroke="#909399" stroke-width="3" stroke-linecap="round"/>
          <path d="M70 85h30M85 70v30" stroke="#C0C4CC" stroke-width="2" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    description: 'empty.search',
    size: 100
  },
  network: {
    content: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <circle cx="100" cy="100" r="80" stroke="#E4E7ED" stroke-width="2" fill="#F5F7FA"/>
          <path d="M60 120h80M80 140h40M90 160h20" stroke="#C0C4CC" stroke-width="3" stroke-linecap="round"/>
          <circle cx="100" cy="80" r="15" fill="#F56C6C"/>
          <path d="M95 75h10M95 85h10" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    description: 'empty.network',
    size: 100
  },
  data: {
    content: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <rect x="40" y="60" width="120" height="80" rx="8" stroke="#E4E7ED" stroke-width="2" fill="#F5F7FA"/>
          <path d="M60 80h80M60 100h60M60 120h40" stroke="#C0C4CC" stroke-width="2" stroke-linecap="round"/>
          <circle cx="140" cy="100" r="20" fill="#E6A23C"/>
          <path d="M135 95h10M135 105h10" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    description: 'empty.data',
    size: 100
  },
  permission: {
    content: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <circle cx="100" cy="100" r="80" stroke="#E4E7ED" stroke-width="2" fill="#F5F7FA"/>
          <rect x="70" y="90" width="60" height="40" rx="4" fill="#F56C6C"/>
          <circle cx="100" cy="75" r="15" stroke="#F56C6C" stroke-width="3" fill="none"/>
          <path d="M95 110h10" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    description: 'empty.permission',
    size: 100
  },
  error: {
    content: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <circle cx="100" cy="100" r="80" stroke="#E4E7ED" stroke-width="2" fill="#F5F7FA"/>
          <circle cx="100" cy="100" r="30" fill="#F56C6C"/>
          <path d="M90 90l20 20M110 90l-20 20" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    description: 'empty.error',
    size: 100
  },
  maintenance: {
    content: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <circle cx="100" cy="100" r="80" stroke="#E4E7ED" stroke-width="2" fill="#F5F7FA"/>
          <path d="M70 100h60" stroke="#E6A23C" stroke-width="4" stroke-linecap="round"/>
          <circle cx="85" cy="100" r="8" fill="#E6A23C"/>
          <circle cx="115" cy="100" r="8" fill="#E6A23C"/>
          <path d="M100 70v60" stroke="#E6A23C" stroke-width="3" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    description: 'empty.maintenance',
    size: 100
  },
  'no-data': {
    content: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <rect x="40" y="60" width="120" height="80" rx="8" stroke="#E4E7ED" stroke-width="2" fill="#F5F7FA"/>
          <path d="M60 80h80M60 100h60M60 120h40" stroke="#C0C4CC" stroke-width="2" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    description: 'empty.noData',
    size: 100
  },
  'no-result': {
    content: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <circle cx="100" cy="100" r="60" stroke="#E4E7ED" stroke-width="2" fill="#F5F7FA"/>
          <path d="M140 140l20 20" stroke="#C0C4CC" stroke-width="4" stroke-linecap="round"/>
          <path d="M85 85l30 30M115 85l-30 30" stroke="#F56C6C" stroke-width="3" stroke-linecap="round"/>
        </g>
      </svg>
    `,
    description: 'empty.noResult',
    size: 100
  },
  'network-error': {
    content: `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <g fill="none" fill-rule="evenodd">
          <circle cx="100" cy="100" r="80" stroke="#E4E7ED" stroke-width="2" fill="#F5F7FA"/>
          <path d="M70 100h60" stroke="#F56C6C" stroke-width="4" stroke-linecap="round"/>
          <circle cx="70" cy="100" r="8" fill="#F56C6C"/>
          <circle cx="100" cy="100" r="8" fill="#F56C6C"/>
          <circle cx="130" cy="100" r="8" fill="#F56C6C"/>
        </g>
      </svg>
    `,
    description: 'empty.networkError',
    size: 100
  }
}

/**
 * 获取空状态配置
 */
export function getEmptyConfig(type: EmptyType): EmptyImageConfig {
  return EMPTY_CONFIGS[type] || EMPTY_CONFIGS.default
}

/**
 * 检查是否为有效的图片 URL
 */
export function isValidImageUrl(url: string): boolean {
  try {
    new URL(url)
    return /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(url)
  } catch {
    return false
  }
}

// generateId 已从 '../../utils' 导入并重新导出