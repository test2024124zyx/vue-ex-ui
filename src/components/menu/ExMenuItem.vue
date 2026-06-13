<template>
  <li
    ref="itemRef"
    :class="itemClasses"
    :style="itemStyles"
    role="menuitem"
    :aria-disabled="disabled"
    :aria-current="isActive ? 'page' : undefined"
    :tabindex="disabled ? -1 : 0"
    @click="handleClick"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
    @keydown="handleKeydown"
  >
    <div class="ex-menu-item__content">
      <span v-if="$slots.icon" class="ex-menu-item__icon">
        <slot name="icon" />
      </span>
      <span
        v-if="!menuContext?.collapsed.value || menuContext?.mode.value !== 'inline'"
        class="ex-menu-item__label"
      >
        <slot />
      </span>
      <!-- 激活指示器 -->
      <span v-if="isActive" class="ex-menu-item__indicator" />
    </div>
  </li>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, inject, ref } from 'vue';
import type { ExMenuItemEmits, ExMenuItemExposed } from './types';

interface Props {
  itemKey: string;
  disabled?: boolean;
  path?: string;
  class?: string | string[] | Record<string, boolean>;
  style?: string | Record<string, string | number>;
}

defineOptions({
  name: 'ExMenuItem',
});

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  path: undefined,
  class: undefined,
  style: undefined,
});

const emit = defineEmits<ExMenuItemEmits>();

interface MenuContext {
  activeKey: { value: string };
  collapsed: { value: boolean };
  mode: { value: string };
  handleItemClick: (key: string) => void;
}

const itemRef = ref<HTMLLIElement>();
const menuContext = inject<MenuContext | null>('exMenu', null);

const isActive = computed(() => {
  return menuContext?.activeKey.value === props.itemKey;
});

const itemClasses = computed(() => {
  const classes = ['ex-menu-item'];

  if (isActive.value) classes.push('ex-menu-item--active');
  if (props.disabled) classes.push('ex-menu-item--disabled');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const itemStyles = computed(() => {
  if (!props.style) return undefined;
  return typeof props.style === 'string' ? props.style : props.style;
});

const handleClick = (event: MouseEvent | KeyboardEvent) => {
  if (props.disabled) {
    event.preventDefault();
    return;
  }

  // 如果有路径，触发路由跳转
  if (props.path) {
    // 检查是否是外部链接
    if (props.path.startsWith('http://') || props.path.startsWith('https://')) {
      window.open(props.path, '_blank');
    } else {
      // 内部路由，触发自定义事件让父组件处理
      // 或者可以直接使用 router.push(props.path)
      window.location.hash = props.path;
    }
  }

  emit('click', props.itemKey);
  menuContext?.handleItemClick(props.itemKey);
};

// 键盘导航
const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;

  const currentElement = itemRef.value;
  if (!currentElement) return;

  const menuList = currentElement.parentElement;
  if (!menuList) return;

  const items = Array.from(
    menuList.querySelectorAll('.ex-menu-item:not(.ex-menu-item--disabled)')
  ) as HTMLElement[];
  const currentIndex = items.indexOf(currentElement);
  if (currentIndex < 0) return;

  let targetIndex = currentIndex;
  const isTopLevelHorizontal =
    menuList.classList.contains('ex-menu__list') && menuContext?.mode.value === 'horizontal';

  switch (event.key) {
    case 'ArrowRight':
    case 'Right':
      if (isTopLevelHorizontal) {
        event.preventDefault();
        targetIndex = (currentIndex + 1) % items.length;
      } else {
        return;
      }
      break;
    case 'ArrowLeft':
    case 'Left':
      if (isTopLevelHorizontal) {
        event.preventDefault();
        targetIndex = (currentIndex - 1 + items.length) % items.length;
      } else {
        return;
      }
      break;
    case 'ArrowDown':
    case 'Down':
      event.preventDefault();
      targetIndex = (currentIndex + 1) % items.length;
      break;
    case 'ArrowUp':
    case 'Up':
      event.preventDefault();
      targetIndex = (currentIndex - 1 + items.length) % items.length;
      break;
    case 'Home':
      event.preventDefault();
      targetIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      targetIndex = items.length - 1;
      break;
    case 'Escape':
    case 'Esc':
      if (isTopLevelHorizontal) {
        event.preventDefault();
        (currentElement as HTMLElement).blur();
      }
      return;
    default:
      return;
  }

  items[targetIndex]?.focus();
};

defineExpose<ExMenuItemExposed>({
  getElement: () => itemRef.value || null,
});
</script>

<style scoped lang="scss" src="./ExMenuItem.scss"></style>
