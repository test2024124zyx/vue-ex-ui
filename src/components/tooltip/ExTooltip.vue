<template>
  <div
    ref="tooltipRef"
    class="ex-tooltip"
    :aria-describedby="visible ? popperId : undefined"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocus"
    @focusout="handleBlur"
    @click="handleClick"
  >
    <!-- 触发元素 -->
    <slot></slot>

    <!-- Tooltip 内容 -->
    <Teleport to="body">
      <Transition :name="transition">
        <div
          v-if="visible"
          :id="popperId"
          ref="popperRef"
          :class="tooltipClasses"
          :data-theme="configTheme"
          :style="tooltipStyles"
          role="tooltip"
          :aria-label="ariaLabel"
          @mouseenter="handlePopperEnter"
          @mouseleave="handlePopperLeave"
        >
          <!-- 霓虹边框效果 -->
          <div class="ex-tooltip__border"></div>

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
          ></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onUnmounted } from 'vue';
import type { ExTooltipProps, ExTooltipEmits, ExTooltipExposed } from './types';
import { calcPopperPosition } from '../../utils/popper';
import { generateId } from '../../utils/id';
import { useConfigTheme } from '../config-provider/composables';

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
const popperId = `ex-tooltip-${generateId()}`;
const configTheme = useConfigTheme();
// flip 后最终生效的位置（用于同步箭头方向的类名）
const resolvedPlacement = ref(props.placement);

// 计算属性
const tooltipClasses = computed(() => {
  const classes = [
    'ex-tooltip__popper',
    `ex-tooltip__popper--${resolvedPlacement.value}`,
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

// 鼠标移入浮层时取消关闭计时，允许用户在浮层内交互/选中文本
const handlePopperEnter = () => {
  if (props.trigger === 'hover' || props.trigger === 'hover-focus') {
    clearTimers();
  }
};

const handlePopperLeave = () => {
  if (props.trigger === 'hover' || props.trigger === 'hover-focus') {
    hide();
  }
};

const handleResize = () => {
  updatePosition();
};

const handleScroll = () => {
  updatePosition();
};

// Esc 关闭（WAI-ARIA tooltip 规范要求）
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    clearTimers();
    visible.value = false;
    emit('hide');
  }
};

// 仅在浮层可见时挂载全局监听器
watch(visible, isVisible => {
  if (isVisible) {
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleEscape);
  } else {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll, true);
    document.removeEventListener('keydown', handleEscape);
  }
});

onUnmounted(() => {
  clearTimers();
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll, true);
  document.removeEventListener('keydown', handleEscape);
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

defineExpose<ExTooltipExposed>({
  show,
  hide,
  updatePosition,
});
</script>

<style scoped lang="scss" src="./ExTooltip.scss"></style>
