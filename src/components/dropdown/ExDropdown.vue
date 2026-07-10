<template>
  <div ref="dropdownRef" :class="dropdownClasses" :style="dropdownStyles" :aria-label="ariaLabel">
    <div
      ref="triggerRef"
      class="ex-dropdown__trigger"
      role="button"
      :tabindex="disabled ? -1 : 0"
      aria-haspopup="menu"
      :aria-expanded="isVisible"
      :aria-controls="menuId"
      @mouseenter="handleTriggerEnter"
      @mouseleave="handleTriggerLeave"
      @click="handleTriggerClick"
      @contextmenu="handleContextMenu"
      @keydown="handleKeydown"
    >
      <slot />
    </div>

    <Teleport to="body">
      <Transition name="ex-dropdown-fade">
        <div
          v-show="isVisible"
          :id="menuId"
          ref="menuRef"
          :class="menuClasses"
          :style="menuStyles"
          role="menu"
          :aria-activedescendant="activeIndex >= 0 ? `${menuId}-item-${activeIndex}` : undefined"
          @mouseenter="handleMenuEnter"
          @mouseleave="handleMenuLeave"
        >
          <div class="ex-dropdown__menu-content">
            <template v-for="(item, index) in items" :key="item.key || index">
              <div v-if="item.divided" class="ex-dropdown__divider" role="separator" />
              <ExDropdownItem
                :id="`${menuId}-item-${index}`"
                :label="item.label"
                :icon="item.icon"
                :disabled="item.disabled"
                :active="index === activeIndex"
                @click="handleItemClick(item)"
              />
            </template>
            <slot name="menu" />
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type {
  ExDropdownProps,
  ExDropdownEmits,
  ExDropdownExposed,
  DropdownItemData,
} from './types';
import ExDropdownItem from './ExDropdownItem.vue';
import { generateId } from '../../utils/id';

defineOptions({
  name: 'ExDropdown',
});

const props = withDefaults(defineProps<ExDropdownProps>(), {
  items: () => [],
  trigger: 'hover',
  placement: 'bottom-start',
  disabled: false,
  visible: undefined,
  offset: 8,
  matchTriggerWidth: false,
});

const emit = defineEmits<ExDropdownEmits>();

const dropdownRef = ref<HTMLDivElement>();
const triggerRef = ref<HTMLDivElement>();
const menuRef = ref<HTMLDivElement>();
const isVisible = ref(false);
const menuStyles = ref<Record<string, string>>({});
const hoverTimer = ref<number>();
const menuId = `${generateId('ex-dropdown')}-menu`;
/** 键盘导航当前高亮项索引（-1 表示无） */
const activeIndex = ref(-1);

/** 可被键盘导航选中的菜单项索引（跳过禁用项） */
const enabledIndexes = computed(() =>
  props.items.map((item, index) => (item.disabled ? -1 : index)).filter(index => index >= 0)
);

/** 将高亮项滚动进可视区域 */
const scrollActiveIntoView = () => {
  if (activeIndex.value < 0) return;
  nextTick(() => {
    const el = menuRef.value?.querySelector<HTMLElement>(`#${menuId}-item-${activeIndex.value}`);
    // scrollIntoView 在部分环境（如 jsdom）不可用，做存在性守卫
    if (typeof el?.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  });
};

/** 移动高亮：step=+1 向下，-1 向上；wrap 环绕 */
const moveActive = (step: 1 | -1) => {
  const list = enabledIndexes.value;
  if (list.length === 0) return;
  const current = list.indexOf(activeIndex.value);
  const next =
    current === -1
      ? step === 1
        ? 0
        : list.length - 1
      : (current + step + list.length) % list.length;
  activeIndex.value = list[next]!;
  scrollActiveIntoView();
};

// 计算属性
const dropdownClasses = computed(() => {
  const classes = ['ex-dropdown'];

  if (props.disabled) classes.push('ex-dropdown--disabled');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const dropdownStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const menuClasses = computed(() => {
  return ['ex-dropdown__menu', `ex-dropdown__menu--${props.placement}`];
});

// 方法
const updateMenuPosition = () => {
  if (!triggerRef.value || !menuRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const menuRect = menuRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const spacing = props.offset ?? 8;

  let top = 0;
  let left = 0;

  // 根据 placement 计算位置
  const [mainPlacement, subPlacement] = props.placement.split('-');
  const effectiveMenuWidth = props.matchTriggerWidth
    ? Math.max(menuRect.width, triggerRect.width)
    : menuRect.width;

  switch (mainPlacement) {
    case 'bottom':
      top = triggerRect.bottom + spacing;
      if (subPlacement === 'start') {
        left = triggerRect.left; // 左对齐
      } else if (subPlacement === 'end') {
        left = triggerRect.right - effectiveMenuWidth; // 右对齐
      } else {
        left = triggerRect.left + (triggerRect.width - effectiveMenuWidth) / 2;
      }
      break;
    case 'top':
      top = triggerRect.top - menuRect.height - spacing;
      if (subPlacement === 'start') {
        left = triggerRect.left; // 左对齐
      } else if (subPlacement === 'end') {
        left = triggerRect.right - effectiveMenuWidth; // 右对齐
      } else {
        left = triggerRect.left + (triggerRect.width - effectiveMenuWidth) / 2;
      }
      break;
    case 'left':
      left = triggerRect.left - menuRect.width - spacing;
      if (subPlacement === 'start') {
        top = triggerRect.top;
      } else if (subPlacement === 'end') {
        top = triggerRect.bottom - menuRect.height;
      } else {
        top = triggerRect.top + (triggerRect.height - menuRect.height) / 2;
      }
      break;
    case 'right':
      left = triggerRect.right + spacing;
      if (subPlacement === 'start') {
        top = triggerRect.top;
      } else if (subPlacement === 'end') {
        top = triggerRect.bottom - menuRect.height;
      } else {
        top = triggerRect.top + (triggerRect.height - menuRect.height) / 2;
      }
      break;
  }

  // 边界检测和调整
  if (left + effectiveMenuWidth > viewportWidth - spacing) {
    left = viewportWidth - effectiveMenuWidth - spacing;
  }
  if (left < spacing) {
    left = spacing;
  }
  if (top + menuRect.height > viewportHeight - spacing) {
    top = viewportHeight - menuRect.height - spacing;
  }
  if (top < spacing) {
    top = spacing;
  }

  const styles: Record<string, string> = {
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 'var(--ex-z-dropdown, 1000)',
  };
  if (props.matchTriggerWidth) {
    styles.minWidth = `${Math.max(triggerRect.width, menuRect.width)}px`;
  }
  menuStyles.value = styles;
};

// 受控模式（传入 visible prop）下，isVisible 只由 props.visible 的 watch 驱动，
// 内部不直接改写，避免与父级状态脱节。
const isControlled = computed(() => props.visible !== undefined);

const show = () => {
  if (props.disabled) return;
  if (!isControlled.value) isVisible.value = true;
  emit('update:visible', true);
  emit('show');
  nextTick(() => {
    updateMenuPosition();
  });
};

const hide = () => {
  if (!isControlled.value) isVisible.value = false;
  activeIndex.value = -1;
  emit('update:visible', false);
  emit('hide');
};

const clearHoverTimer = () => {
  if (hoverTimer.value) {
    clearTimeout(hoverTimer.value);
    hoverTimer.value = undefined;
  }
};

const handleTriggerEnter = () => {
  if (props.trigger === 'hover') {
    clearHoverTimer();
    show();
  }
};

const handleTriggerLeave = () => {
  if (props.trigger === 'hover') {
    clearHoverTimer();
    hoverTimer.value = window.setTimeout(() => {
      hide();
    }, 200);
  }
};

const handleMenuEnter = () => {
  if (props.trigger === 'hover') {
    clearHoverTimer();
  }
};

const handleMenuLeave = () => {
  if (props.trigger === 'hover') {
    clearHoverTimer();
    hoverTimer.value = window.setTimeout(() => {
      hide();
    }, 200);
  }
};

const handleTriggerClick = () => {
  if (props.trigger === 'click') {
    if (isVisible.value) {
      hide();
    } else {
      show();
    }
  }
};

const handleContextMenu = (e: MouseEvent) => {
  if (props.trigger === 'contextmenu') {
    e.preventDefault();
    show();
  }
};

/**
 * 键盘交互：
 * - 关闭态：↓ / Enter / Space 打开并高亮首项
 * - 打开态：↑↓ 导航、Home/End 跳转首尾、Enter/Space 选中、Esc/Tab 关闭
 */
const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return;

  if (!isVisible.value) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      show();
      nextTick(() => {
        activeIndex.value = enabledIndexes.value[0] ?? -1;
        scrollActiveIntoView();
      });
    }
    return;
  }

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      moveActive(1);
      break;
    case 'ArrowUp':
      e.preventDefault();
      moveActive(-1);
      break;
    case 'Home':
      e.preventDefault();
      activeIndex.value = enabledIndexes.value[0] ?? -1;
      scrollActiveIntoView();
      break;
    case 'End':
      e.preventDefault();
      activeIndex.value = enabledIndexes.value[enabledIndexes.value.length - 1] ?? -1;
      scrollActiveIntoView();
      break;
    case 'Enter':
    case ' ': {
      e.preventDefault();
      const item = props.items[activeIndex.value];
      if (item) handleItemClick(item);
      break;
    }
    case 'Escape':
      e.preventDefault();
      hide();
      triggerRef.value?.focus();
      break;
    case 'Tab':
      hide();
      break;
  }
};

const handleItemClick = (item: DropdownItemData) => {
  if (item.disabled) return;
  emit('item-click', item);
  hide();
};

const handleClickOutside = (e: MouseEvent) => {
  if (!dropdownRef.value || !menuRef.value) return;
  if (!dropdownRef.value.contains(e.target as Node) && !menuRef.value.contains(e.target as Node)) {
    hide();
  }
};

const getElement = () => {
  return dropdownRef.value || null;
};

// 监听 visible 属性
watch(
  () => props.visible,
  newValue => {
    if (newValue !== undefined) {
      isVisible.value = newValue;
      if (newValue) {
        nextTick(() => {
          updateMenuPosition();
        });
      }
    }
  }
);

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', updateMenuPosition);
  window.addEventListener('scroll', updateMenuPosition, true);
});

onUnmounted(() => {
  clearHoverTimer();
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', updateMenuPosition);
  window.removeEventListener('scroll', updateMenuPosition, true);
});

// 暴露的方法
defineExpose<ExDropdownExposed>({
  show,
  hide,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExDropdown.scss"></style>
