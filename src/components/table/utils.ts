import { deepClone, debounce, throttle, generateId } from '../../utils'

// 重新导出工具函数，保持向后兼容
export { deepClone, debounce, throttle, generateId }

import type { 
  TableColumn, 
  TableSorter, 
  TablePagination,
  CellRenderInfo,
  HeaderRenderInfo,
  TableSize,
  TableRenderOptions
} from './types'

/**
 * 获取行键值
 */
export function getRowKey<T>(
  record: T,
  index: number,
  rowKey?: string | ((record: T, index: number) => string | number)
): string | number {
  if (typeof rowKey === 'function') {
    return rowKey(record, index)
  }
  
  if (typeof rowKey === 'string') {
    const value = (record as Record<string, unknown>)[rowKey]
    return (typeof value === 'string' || typeof value === 'number') ? value : index
  }
  
  const recordObj = record as Record<string, unknown>
  const key = recordObj.key
  const id = recordObj.id
  if (typeof key === 'string' || typeof key === 'number') return key
  if (typeof id === 'string' || typeof id === 'number') return id
  return index
}

/**
 * 获取列键值
 */
export function getColumnKey<T>(column: TableColumn<T>, index: number): string {
  return column.key || column.dataIndex?.toString() || `column-${index}`
}

/**
 * 获取单元格值
 */
export function getCellValue<T>(record: T, dataIndex?: string | string[]): unknown {
  if (!dataIndex) return undefined
  
  if (typeof dataIndex === 'string') {
    return (record as Record<string, unknown>)[dataIndex]
  }
  
  if (Array.isArray(dataIndex)) {
    let value: unknown = record
    for (const key of dataIndex) {
      value = (value as Record<string, unknown>)?.[key]
      if (value === undefined) break
    }
    return value
  }
  
  return undefined
}

/**
 * 设置单元格值
 */
export function setCellValue<T>(record: T, dataIndex: string | string[], value: unknown): T {
  if (!dataIndex) return record
  
  const newRecord = { ...record } as Record<string, unknown>
  
  if (typeof dataIndex === 'string') {
    newRecord[dataIndex] = value
  } else if (Array.isArray(dataIndex)) {
    let current: Record<string, unknown> = newRecord
    for (let i = 0; i < dataIndex.length - 1; i++) {
      const key = dataIndex[i]
      if (key && (!current[key] || typeof current[key] !== 'object')) {
        current[key] = {}
      }
      if (key) {
        current = current[key] as Record<string, unknown>
      }
    }
    const lastKey = dataIndex[dataIndex.length - 1]
    if (lastKey) {
      current[lastKey] = value
    }
  }
  
  return newRecord as T
}

/**
 * 扁平化列配置
 */
export function flattenColumns<T>(columns: TableColumn<T>[]): TableColumn<T>[] {
  const result: TableColumn<T>[] = []
  
  function flatten(cols: TableColumn<T>[]) {
    cols.forEach(column => {
      if (column.children && column.children.length > 0) {
        flatten(column.children)
      } else {
        result.push(column)
      }
    })
  }
  
  flatten(columns)
  return result
}

/**
 * 获取固定列
 */
export function getFixedColumns<T>(columns: TableColumn<T>[]): {
  left: TableColumn<T>[]
  center: TableColumn<T>[]
  right: TableColumn<T>[]
} {
  const left: TableColumn<T>[] = []
  const center: TableColumn<T>[] = []
  const right: TableColumn<T>[] = []
  
  columns.forEach(column => {
    if (column.fixed === 'left' || column.fixed === true) {
      left.push(column)
    } else if (column.fixed === 'right') {
      right.push(column)
    } else {
      center.push(column)
    }
  })
  
  return { left, center, right }
}

/**
 * 计算列宽度
 */
export function calculateColumnWidth<T>(
  column: TableColumn<T>,
  containerWidth: number,
  totalColumns: number
): number {
  if (column.width) {
    return typeof column.width === 'number' ? column.width : parseInt(column.width)
  }
  
  // 平均分配剩余宽度
  return Math.floor(containerWidth / totalColumns)
}

/**
 * 排序数据
 */
export function sortData<T>(
  data: T[],
  sorter: TableSorter
): T[] {
  if (!sorter.field || !sorter.order) {
    return data
  }
  
  const sortedData = [...data]
  
  sortedData.sort((a, b) => {
    let result = 0
    
    if (sorter.sorter && typeof sorter.sorter === 'function') {
      result = sorter.sorter(a, b)
    } else {
      const aValue = getCellValue(a, sorter.field)
      const bValue = getCellValue(b, sorter.field)
      
      // 类型安全的比较
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        result = aValue - bValue
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        result = aValue.localeCompare(bValue)
      } else if (aValue != null && bValue != null) {
        result = String(aValue).localeCompare(String(bValue))
      } else if (aValue == null && bValue != null) {
        result = -1
      } else if (aValue != null && bValue == null) {
        result = 1
      } else {
        result = 0
      }
    }
    
    return sorter.order === 'descend' ? -result : result
  })
  
  return sortedData
}

/**
 * 筛选数据
 */
export function filterData<T>(
  data: T[],
  filters: Record<string, unknown>,
  columns: TableColumn<T>[]
): T[] {
  let filteredData = data
  
  Object.keys(filters).forEach(key => {
    const filterValue = filters[key]
    if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
      return
    }
    
    const column = columns.find(col => getColumnKey(col, 0) === key)
    if (!column || !column.onFilter) {
      return
    }
    
    filteredData = filteredData.filter(record => {
      if (Array.isArray(filterValue)) {
        return filterValue.some(value => column.onFilter!(value, record))
      } else {
        return column.onFilter!(filterValue, record)
      }
    })
  })
  
  return filteredData
}

/**
 * 分页数据
 */
export function paginateData<T>(
  data: T[],
  pagination: TablePagination
): { data: T[]; total: number } {
  const { current = 1, pageSize = 10 } = pagination
  const total = data.length
  
  if (pageSize <= 0) {
    return { data, total }
  }
  
  const startIndex = (current - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  return {
    data: data.slice(startIndex, endIndex),
    total
  }
}

/**
 * 处理表格数据
 */
export function processTableData<T>(
  data: T[],
  sorter: TableSorter,
  filters: Record<string, unknown>,
  pagination: TablePagination,
  columns: TableColumn<T>[]
): { data: T[]; total: number } {
  // 1. 筛选
  let processedData = filterData(data, filters, columns)
  
  // 2. 排序
  processedData = sortData(processedData, sorter)
  
  // 3. 分页
  return paginateData(processedData, pagination)
}

/**
 * 生成表格类名
 */
export function getTableClasses(
  size: TableSize,
  bordered: boolean,
  striped: boolean,
  hoverable: boolean,
  loading: boolean,
  className?: string
): string[] {
  const classes = [
    'ex-table',
    `ex-table--${size}`
  ]
  
  if (bordered) {
    classes.push('ex-table--bordered')
  }
  
  if (striped) {
    classes.push('ex-table--striped')
  }
  
  if (hoverable) {
    classes.push('ex-table--hoverable')
  }
  
  if (loading) {
    classes.push('ex-table--loading')
  }
  
  if (className) {
    classes.push(className)
  }
  
  return classes
}

/**
 * 生成行类名
 */
export function getRowClasses<T>(
  record: T,
  index: number,
  selected: boolean,
  expanded: boolean,
  rowClassName?: string | ((record: T, index: number) => string)
): string[] {
  const classes = ['ex-table__row']
  
  if (selected) {
    classes.push('ex-table__row--selected')
  }
  
  if (expanded) {
    classes.push('ex-table__row--expanded')
  }
  
  if (index % 2 === 1) {
    classes.push('ex-table__row--odd')
  }
  
  if (typeof rowClassName === 'string') {
    classes.push(rowClassName)
  } else if (typeof rowClassName === 'function') {
    const customClass = rowClassName(record, index)
    if (customClass) {
      classes.push(customClass)
    }
  }
  
  return classes
}

/**
 * 生成单元格类名
 */
export function getCellClasses<T>(
  column: TableColumn<T>,
  editing: boolean = false
): string[] {
  const classes = ['ex-table__cell']
  
  if (column.align) {
    classes.push(`ex-table__cell--${column.align}`)
  }
  
  if (column.fixed) {
    classes.push('ex-table__cell--fixed')
    if (typeof column.fixed === 'string') {
      classes.push(`ex-table__cell--fixed-${column.fixed}`)
    }
  }
  
  if (column.ellipsis) {
    classes.push('ex-table__cell--ellipsis')
  }
  
  if (editing) {
    classes.push('ex-table__cell--editing')
  }
  
  if (column.className) {
    classes.push(column.className)
  }
  
  return classes
}

/**
 * 生成表头单元格类名
 */
export function getHeaderCellClasses<T>(
  column: TableColumn<T>,
  sortable: boolean,
  filtered: boolean,
  sortOrder?: 'ascend' | 'descend'
): string[] {
  const classes = ['ex-table__header-cell']
  
  if (column.align) {
    classes.push(`ex-table__header-cell--${column.align}`)
  }
  
  if (column.fixed) {
    classes.push('ex-table__header-cell--fixed')
    if (typeof column.fixed === 'string') {
      classes.push(`ex-table__header-cell--fixed-${column.fixed}`)
    }
  }
  
  if (sortable) {
    classes.push('ex-table__header-cell--sortable')
    if (sortOrder) {
      classes.push(`ex-table__header-cell--sorted-${sortOrder}`)
    }
  }
  
  if (filtered) {
    classes.push('ex-table__header-cell--filtered')
  }
  
  if (column.headerClassName) {
    classes.push(column.headerClassName)
  }
  
  return classes
}

/**
 * 验证编辑值
 */
export function validateEditValue(value: unknown, rules: Array<{ required?: boolean; message?: string; validator?: (value: unknown) => boolean | string }> = []): string | null {
  for (const rule of rules) {
    if (rule.required && (value === undefined || value === null || value === '')) {
      return rule.message || '此字段为必填项'
    }
    
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(value)
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message || '验证失败'
      }
    }
  }
  
  return null
}

/**
 * 格式化分页信息
 */
export function formatPaginationInfo(
  total: number,
  current: number,
  pageSize: number
): { start: number; end: number; total: number } {
  const start = (current - 1) * pageSize + 1
  const end = Math.min(current * pageSize, total)
  
  return { start, end, total }
}

/**
 * 计算表格滚动位置
 */
export function calculateScrollPosition(
  scrollLeft: number,
  scrollTop: number,
  scrollWidth: number,
  scrollHeight: number,
  clientWidth: number,
  clientHeight: number
): {
  isScrollLeft: boolean
  isScrollRight: boolean
  isScrollTop: boolean
  isScrollBottom: boolean
} {
  const isScrollLeft = scrollLeft <= 0
  const isScrollRight = scrollLeft >= scrollWidth - clientWidth - 1
  const isScrollTop = scrollTop <= 0
  const isScrollBottom = scrollTop >= scrollHeight - clientHeight - 1
  
  return {
    isScrollLeft,
    isScrollRight,
    isScrollTop,
    isScrollBottom
  }
}

// deepClone, debounce, throttle 和 generateId 已从 '../../utils' 导入并重新导出

/**
 * 检查是否为空值
 */
export function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化数字
 */
export function formatNumber(num: number, precision: number = 2): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision
  })
}

/**
 * 格式化日期
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return ''
  }
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('复制失败:', error);
    }
    return false;
  }
}

/**
 * 获取表格渲染选项
 */
export function getTableRenderOptions(props: Partial<TableRenderOptions>): TableRenderOptions {
  return {
    showHeader: props.showHeader ?? true,
    bordered: props.bordered ?? false,
    striped: props.striped ?? false,
    hoverable: props.hoverable ?? true,
    size: props.size ?? 'medium',
    tableLayout: props.tableLayout ?? 'auto'
  }
}

/**
 * 创建单元格渲染信息
 */
export function createCellRenderInfo<T extends Record<string, unknown>>(
  value: unknown,
  record: T,
  index: number,
  column: TableColumn<T>,
  editing: boolean = false
): CellRenderInfo<T> {
  return {
    value,
    record,
    index,
    column,
    editing
  }
}

/**
 * 创建表头渲染信息
 */
export function createHeaderRenderInfo<T>(
  column: TableColumn<T>,
  index: number,
  sortOrder?: 'ascend' | 'descend',
  filteredValue?: unknown[]
): HeaderRenderInfo<T> {
  // 转换排序顺序格式
  let convertedSortOrder: 'asc' | 'desc' | null = null
  if (sortOrder === 'ascend') {
    convertedSortOrder = 'asc'
  } else if (sortOrder === 'descend') {
    convertedSortOrder = 'desc'
  }

  return {
    column,
    index,
    sortOrder: convertedSortOrder,
    filteredValue,
    sortable: !!column.sortable,
    filtered: !!(filteredValue && filteredValue.length > 0)
  }
}