<template>
  <div
    ref="dropdownRef"
    :class="dropdownClasses"
    :style="dropdownStyles"
    :aria-label="ariaLabel"
  >
    <div
      ref="triggerRef"
      class="ex-dropdown__trigger"
      @mouseenter="handleTriggerEnter"
      @mouseleave="handleTriggerLeave"
      @click="handleTriggerClick"
      @contextmenu="handleContextMenu"
    >
      <slot />
    </div>

    <Teleport to="body">
      <Transition name="ex-dropdown-fade">
        <div
          v-show="isVisible"
          ref="menuRef"
          :class="menuClasses"
          :style="menuStyles"
          @mouseenter="handleMenuEnter"
          @mouseleave="handleMenuLeave"
        >
          <div class="ex-dropdown__menu-content">
            <template
              v-for="(item, index) in items"
              :key="item.key || index"
            >
              <div
                v-if="item.divided"
                class="ex-dropdown__divider"
              />
              <ExDropdownItem
                :label="item.label"
                :icon="item.icon"
                :disabled="item.disabled"
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
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { ExDropdownProps, ExDropdownEmits, ExDropdownExposed, DropdownItemData } from './types';
import ExDropdownItem from './ExDropdownItem.vue';

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

// 计算属性
const dropdownClasses = computed(() => {
  const classes = ['ex-dropdown'];

  if (props.disabled) classes.push('ex-dropdown--disabled');

  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class);
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class);
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  }

  return classes;
});

const dropdownStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const menuClasses = computed(() => {
  return [
    'ex-dropdown__menu',
    `ex-dropdown__menu--${props.placement}`,
  ];
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
    zIndex: 'calc(var(--ex-z-dropdown) - 1000 + var(--ex-z-index-base, 1000))',
  };
  if (props.matchTriggerWidth) {
    styles.minWidth = `${Math.max(triggerRect.width, menuRect.width)}px`;
  }
  menuStyles.value = styles;
};

const show = () => {
  if (props.disabled) return;
  isVisible.value = true;
  emit('update:visible', true);
  emit('show');
  nextTick(() => {
    updateMenuPosition();
  });
};

const hide = () => {
  isVisible.value = false;
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

const handleItemClick = (item: DropdownItemData) => {
  if (item.disabled) return;
  emit('item-click', item);
  hide();
};

const handleClickOutside = (e: MouseEvent) => {
  if (!dropdownRef.value || !menuRef.value) return;
  if (
    !dropdownRef.value.contains(e.target as Node) &&
    !menuRef.value.contains(e.target as Node)
  ) {
    hide();
  }
};

const getElement = () => {
  return dropdownRef.value || null;
};

// 监听 visible 属性
watch(() => props.visible, (newValue) => {
  if (newValue !== undefined) {
    isVisible.value = newValue;
    if (newValue) {
      nextTick(() => {
        updateMenuPosition();
      });
    }
  }
});

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
