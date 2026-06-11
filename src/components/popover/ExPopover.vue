<template>
  <div
    ref="popoverRef"
    class="ex-popover"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="handleClick"
  >
    <!-- 触发元素 -->
    <slot />

    <!-- Popover 内容 -->
    <Teleport to="body">
      <Transition :name="transition">
        <div
          v-if="visible"
          ref="popperRef"
          :class="popoverClasses"
          :style="popoverStyles"
          role="dialog"
          :aria-label="ariaLabel"
          @mouseenter="handlePopoverMouseEnter"
          @mouseleave="handlePopoverMouseLeave"
          @click.stop
        >
          <!-- 霓虹边框效果 -->
          <div class="ex-popover__border" />

          <!-- 标题 -->
          <div
            v-if="title || $slots.title"
            class="ex-popover__title"
          >
            <slot name="title">
              {{ title }}
            </slot>
          </div>

          <!-- 内容 -->
          <div class="ex-popover__content">
            <slot name="content">
              {{ content }}
            </slot>
          </div>

          <!-- 箭头 -->
          <div
            v-if="showArrow"
            class="ex-popover__arrow"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import type { ExPopoverProps, ExPopoverEmits, ExPopoverExposed } from './types';

defineOptions({
  name: 'ExPopover',
});

const props = withDefaults(defineProps<ExPopoverProps>(), {
  placement: 'top',
  trigger: 'click',
  showArrow: true,
  disabled: false,
  offset: 12,
  width: 'auto',
  transition: 'ex-popover-fade',
  openDelay: 0,
  closeDelay: 200,
});

const emit = defineEmits<ExPopoverEmits>();

const popoverRef = ref<HTMLDivElement>();
const popperRef = ref<HTMLDivElement>();
const visible = ref(false);
const openTimer = ref<number>();
const closeTimer = ref<number>();

// 计算属性
const popoverClasses = computed(() => {
  const classes = [
    'ex-popover__popper',
    `ex-popover__popper--${props.placement}`,
  ];

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes;
});

const popoverStyles = computed(() => {
  const styles: Record<string, string> = {
    zIndex: 'calc(var(--ex-z-popover) - 1000 + var(--ex-z-index-base, 1000))',
  };

  if (props.zIndex !== undefined) {
    styles['--ex-z-popover'] = String(props.zIndex);
  }

  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  return styles;
});

// 方法
const clearTimers = () => {
  if (openTimer.value) {
    clearTimeout(openTimer.value);
    openTimer.value = undefined;
  }
  if (closeTimer.value) {
    clearTimeout(closeTimer.value);
    closeTimer.value = undefined;
  }
};

const updatePosition = () => {
  if (!popoverRef.value || !popperRef.value) return;

  const triggerRect = popoverRef.value.getBoundingClientRect();
  const popperRect = popperRef.value.getBoundingClientRect();
  const offset = props.offset;

  let top = 0;
  let left = 0;

  switch (props.placement) {
  case 'top':
    top = triggerRect.top - popperRect.height - offset;
    left = triggerRect.left + (triggerRect.width - popperRect.width) / 2;
    break;
  case 'top-start':
    top = triggerRect.top - popperRect.height - offset;
    left = triggerRect.left;
    break;
  case 'top-end':
    top = triggerRect.top - popperRect.height - offset;
    left = triggerRect.right - popperRect.width;
    break;
  case 'bottom':
    top = triggerRect.bottom + offset;
    left = triggerRect.left + (triggerRect.width - popperRect.width) / 2;
    break;
  case 'bottom-start':
    top = triggerRect.bottom + offset;
    left = triggerRect.left;
    break;
  case 'bottom-end':
    top = triggerRect.bottom + offset;
    left = triggerRect.right - popperRect.width;
    break;
  case 'left':
    top = triggerRect.top + (triggerRect.height - popperRect.height) / 2;
    left = triggerRect.left - popperRect.width - offset;
    break;
  case 'left-start':
    top = triggerRect.top;
    left = triggerRect.left - popperRect.width - offset;
    break;
  case 'left-end':
    top = triggerRect.bottom - popperRect.height;
    left = triggerRect.left - popperRect.width - offset;
    break;
  case 'right':
    top = triggerRect.top + (triggerRect.height - popperRect.height) / 2;
    left = triggerRect.right + offset;
    break;
  case 'right-start':
    top = triggerRect.top;
    left = triggerRect.right + offset;
    break;
  case 'right-end':
    top = triggerRect.bottom - popperRect.height;
    left = triggerRect.right + offset;
    break;
  }

  // 边界检测
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (left < 0) left = 8;
  if (left + popperRect.width > viewportWidth) {
    left = viewportWidth - popperRect.width - 8;
  }
  if (top < 0) top = 8;
  if (top + popperRect.height > viewportHeight) {
    top = viewportHeight - popperRect.height - 8;
  }

  popperRef.value.style.top = `${top}px`;
  popperRef.value.style.left = `${left}px`;
};

const show = () => {
  if (props.disabled) return;

  clearTimers();

  if (props.openDelay > 0) {
    openTimer.value = window.setTimeout(() => {
      visible.value = true;
      emit('update:modelValue', true);
      emit('show');
      nextTick(() => {
        updatePosition();
      });
    }, props.openDelay);
  } else {
    visible.value = true;
    emit('update:modelValue', true);
    emit('show');
    nextTick(() => {
      updatePosition();
    });
  }
};

const hide = () => {
  clearTimers();

  if (props.closeDelay > 0) {
    closeTimer.value = window.setTimeout(() => {
      visible.value = false;
      emit('update:modelValue', false);
      emit('hide');
    }, props.closeDelay);
  } else {
    visible.value = false;
    emit('update:modelValue', false);
    emit('hide');
  }
};

const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    show();
  }
};

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    hide();
  }
};

const handlePopoverMouseEnter = () => {
  if (props.trigger === 'hover') {
    clearTimers();
  }
};

const handlePopoverMouseLeave = () => {
  if (props.trigger === 'hover') {
    hide();
  }
};

const handleFocus = () => {
  if (props.trigger === 'focus') {
    show();
  }
};

const handleBlur = () => {
  if (props.trigger === 'focus') {
    hide();
  }
};

const handleClick = () => {
  if (props.trigger === 'click') {
    if (visible.value) {
      hide();
    } else {
      show();
    }
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (!popoverRef.value || !popperRef.value) return;
  
  const target = event.target as Node;
  if (
    !popoverRef.value.contains(target) &&
    !popperRef.value.contains(target)
  ) {
    hide();
  }
};

const handleResize = () => {
  if (visible.value) {
    updatePosition();
  }
};

const handleScroll = () => {
  if (visible.value) {
    updatePosition();
  }
};

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll, true);
  
  if (props.trigger === 'click') {
    document.addEventListener('click', handleClickOutside);
  }
});

onUnmounted(() => {
  clearTimers();
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll, true);
  document.removeEventListener('click', handleClickOutside);
});

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined) {
    if (newVal) {
      show();
    } else {
      hide();
    }
  }
});

defineExpose<ExPopoverExposed>({
  show,
  hide,
  updatePosition,
});
</script>

<style scoped lang="scss" src="./ExPopover.scss"></style>
