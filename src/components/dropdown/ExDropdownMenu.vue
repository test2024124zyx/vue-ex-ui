<template>
  <div
    :class="menuClasses"
    :style="menuStyles"
    role="menu"
  >
    <ExDropdownItem
      v-for="item in items"
      :key="item.key"
      :item="item"
      :level="0"
      @select="handleSelect"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { dropdownMenuProps, type DropdownItem } from './types'
import { useI18n } from '../../locale'
import ExDropdownItem from './ExDropdownItem.vue'

defineOptions({
  name: 'ExDropdownMenu'
})

const props = defineProps(dropdownMenuProps)
const emit = defineEmits<{
  select: [key: string, item: DropdownItem]
}>()

const { t: _t } = useI18n()

// 计算菜单样式类
const menuClasses = computed(() => [
  'ex-dropdown-menu'
])

// 计算菜单样式
const menuStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  const minWidth = typeof props.minWidth === 'number' ? `${props.minWidth}px` : props.minWidth
  const maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  
  styles.minWidth = minWidth
  styles.maxHeight = maxHeight
  
  return styles
})

// 处理选择
const handleSelect = (key: string, item: DropdownItem) => {
  emit('select', key, item)
}
</script>