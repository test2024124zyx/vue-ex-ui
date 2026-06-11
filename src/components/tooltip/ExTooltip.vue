<template>
  <div
    ref="tooltipRef"
    class="ex-tooltip"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @click="handleClick"
  >
    <!-- 触发元素 -->
    <slot />

    <!-- Tooltip 内容 -->
    <Teleport to="body">
      <Transition :name="transition">
        <div
          v-if="visible"
          ref="popperRef"
          :class="tooltipClasses"
          :style="tooltipStyles"
          role="tooltip"
          :aria-label="ariaLabel"
        >
          <!-- 霓虹边框效果 -->
          <div class="ex-tooltip__border" />

          <!-- 内容 -->
          <div class="ex-tooltip__content">
            <slot name="content">
              {{ content }}
            </slot>
          </div>

          <!-- 箭头 -->
          <div
            v-if="showArrow"
            class="ex-tooltip__arrow"
            :style="arrowStyle"
          />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import type { ExTooltipProps, ExTooltipEmits, ExTooltipExposed } from './types';

defineOptions({
  name: 'ExTooltip',
});

const props = withDefaults(defineProps<ExTooltipProps>(), {
  placement: 'top',
  trigger: 'hover',
  effect: 'dark',
  showArrow: true,
  disabled: false,
  offset: 12,
  transition: 'ex-tooltip-fade',
  openDelay: 0,
  closeDelay: 200,
});

const emit = defineEmits<ExTooltipEmits>();

const tooltipRef = ref<HTMLDivElement>();
const popperRef = ref<HTMLDivElement>();
const visible = ref(false);
const openTimer = ref<number>();
const closeTimer = ref<number>();

// 计算属性
const tooltipClasses = computed(() => {
  const classes = [
    'ex-tooltip__popper',
    `ex-tooltip__popper--${props.placement}`,
    `ex-tooltip__popper--${props.effect}`,
  ];

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes;
});

const tooltipStyles = computed(() => {
  const styles: Record<string, string> = {
    zIndex: 'calc(var(--ex-z-tooltip) - 1000 + var(--ex-z-index-base, 1000))',
  };

  if (props.zIndex !== undefined) {
    styles['--ex-z-tooltip'] = String(props.zIndex);
  }

  return styles;
});

const arrowStyle = computed(() => {
  const styles: Record<string, string> = {};
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
  if (!tooltipRef.value || !popperRef.value) return;

  const triggerRect = tooltipRef.value.getBoundingClientRect();
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
      emit('show');
      nextTick(() => {
        updatePosition();
      });
    }, props.openDelay);
  } else {
    visible.value = true;
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
      emit('hide');
    }, props.closeDelay);
  } else {
    visible.value = false;
    emit('hide');
  }
};

const handleMouseEnter = () => {
  if (props.trigger === 'hover' || props.trigger === 'hover-focus') {
    show();
  }
};

const handleMouseLeave = () => {
  if (props.trigger === 'hover' || props.trigger === 'hover-focus') {
    hide();
  }
};

const handleFocus = () => {
  if (props.trigger === 'focus' || props.trigger === 'hover-focus') {
    show();
  }
};

const handleBlur = () => {
  if (props.trigger === 'focus' || props.trigger === 'hover-focus') {
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
});

onUnmounted(() => {
  clearTimers();
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll, true);
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

defineExpose<ExTooltipExposed>({
  show,
  hide,
  updatePosition,
});
</script>

<style scoped lang="scss" src="./ExTooltip.scss"></style>
