<template>
  <div
    ref="popoverRef"
    class="ex-popover"
    :aria-haspopup="true"
    :aria-expanded="visible"
    :aria-controls="visible ? popperId : undefined"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocus"
    @focusout="handleBlur"
    @click="handleClick"
  >
    <!-- 触发元素 -->
    <slot />

    <!-- Popover 内容 -->
    <Teleport to="body">
      <Transition :name="transition">
        <div
          v-if="visible"
          :id="popperId"
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
          <div v-if="title || $slots.title" class="ex-popover__title">
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
          <div v-if="showArrow" class="ex-popover__arrow" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import type { ExPopoverProps, ExPopoverEmits, ExPopoverExposed } from './types';
import { calcPopperPosition } from '../../utils/popper';
import { generateId } from '../../utils/id';

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
const popperId = `ex-popover-${generateId()}`;
// flip 后最终生效的位置（用于同步箭头方向的类名）
const resolvedPlacement = ref(props.placement);

// 计算属性
const popoverClasses = computed(() => {
  const classes = ['ex-popover__popper', `ex-popover__popper--${resolvedPlacement.value}`];

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes;
});

const popoverStyles = computed(() => {
  const styles: Record<string, string | number> = {
    zIndex: 'calc(var(--ex-z-popover) - 1000 + var(--ex-z-index-base, 1000))',
  };

  if (props.zIndex !== undefined) {
    styles['--ex-z-popover'] = String(props.zIndex);
  }

  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }

  // 合并自定义浮层样式
  if (props.customStyle) {
    if (typeof props.customStyle === 'string') {
      // 字符串样式无法与对象样式合并，交由 Vue 处理（对象优先）
      return [styles, props.customStyle];
    }
    Object.assign(styles, props.customStyle);
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

  const { top, left, placement } = calcPopperPosition(
    triggerRect,
    { width: popperRect.width, height: popperRect.height },
    props.placement,
    props.offset
  );

  resolvedPlacement.value = placement as typeof resolvedPlacement.value;
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
  if (!popoverRef.value.contains(target) && !popperRef.value.contains(target)) {
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
watch(
  () => props.modelValue,
  newVal => {
    if (newVal !== undefined) {
      if (newVal) {
        show();
      } else {
        hide();
      }
    }
  }
);

defineExpose<ExPopoverExposed>({
  show,
  hide,
  updatePosition,
});
</script>

<style scoped lang="scss" src="./ExPopover.scss"></style>
