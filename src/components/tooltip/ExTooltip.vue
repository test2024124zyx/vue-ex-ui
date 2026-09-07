<template>
  <div
    ref="tooltipRef"
    class="ex-tooltip"
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
          v-if="overlayActive"
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
import { computed, ref, watch, nextTick, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import type { ExTooltipProps, ExTooltipEmits, ExTooltipExposed } from './types';
import { calcPopperPosition } from '../../utils/popper';
import { generateId } from '../../utils/id';
import { usePopupOverlay } from '../../composables/usePopupOverlay';
import { useFloatingAutoUpdate } from '../../composables/useFloatingAutoUpdate';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
} from '../config-provider/composables';

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
const instance = getCurrentInstance();
const isModelControlled = () => {
  const vnodeProps = instance?.vnode.props;
  return Boolean(
    vnodeProps &&
    (Object.prototype.hasOwnProperty.call(vnodeProps, 'modelValue') ||
      Object.prototype.hasOwnProperty.call(vnodeProps, 'model-value'))
  );
};

const tooltipRef = ref<HTMLDivElement>();
const popperRef = ref<HTMLDivElement>();
const visible = ref(isModelControlled() && props.modelValue === true && !props.disabled);
const openTimer = ref<number>();
const closeTimer = ref<number>();
const isPointerInside = ref(false);
const isFocusInside = ref(false);
const isPopperHovered = ref(false);
const popperId = `ex-tooltip-${generateId()}`;
const configTheme = useConfigTheme();
const neonEffect = useNeonEffect();
const animation = useAnimation();
const tooltipZIndex = useZIndexLayer('tooltip');
const { styles: tooltipStyles, active: overlayActive } = usePopupOverlay({
  active: () => visible.value,
  container: popperRef,
  zIndex: () => props.zIndex ?? tooltipZIndex.value,
  restoreFocus: false,
  onEscape: () => {
    clearTimers();
    requestVisible(false);
  },
});
// flip 后最终生效的位置（用于同步箭头方向的类名）
const resolvedPlacement = ref(props.placement);

// 计算属性
const tooltipClasses = computed(() => {
  const classes = [
    'ex-tooltip__popper',
    `ex-tooltip__popper--${resolvedPlacement.value}`,
    `ex-tooltip__popper--${props.effect}`,
  ];

  if (!neonEffect.value) classes.push('ex-no-neon');
  if (!animation.value) classes.push('ex-no-animation');

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes;
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

const schedulePosition = useFloatingAutoUpdate(
  overlayActive,
  [tooltipRef, popperRef],
  [() => props.placement, () => props.offset, () => props.customClass],
  updatePosition
);

const commitVisible = (nextVisible: boolean) => {
  if (visible.value === nextVisible) return;
  visible.value = nextVisible;
  if (nextVisible) emit('show');
  else emit('hide');
  if (nextVisible) nextTick(updatePosition);
};

const requestVisible = (nextVisible: boolean) => {
  if (!isModelControlled() || props.modelValue !== nextVisible) {
    emit('update:modelValue', nextVisible);
  }
  if (!isModelControlled()) {
    commitVisible(nextVisible);
  }
};

const show = () => {
  if (props.disabled) return;
  clearTimers();

  const requestShow = () => {
    if (!props.disabled) requestVisible(true);
  };
  if (props.openDelay > 0 && typeof window !== 'undefined') {
    openTimer.value = window.setTimeout(requestShow, props.openDelay);
  } else {
    requestShow();
  }
};

const hide = () => {
  clearTimers();

  const requestHide = () => requestVisible(false);
  if (props.closeDelay > 0 && typeof window !== 'undefined') {
    closeTimer.value = window.setTimeout(requestHide, props.closeDelay);
  } else {
    requestHide();
  }
};

const shouldStayVisible = () => {
  if (props.trigger === 'hover-focus') {
    return isPointerInside.value || isFocusInside.value || isPopperHovered.value;
  }
  if (props.trigger === 'hover') return isPointerInside.value || isPopperHovered.value;
  if (props.trigger === 'focus') return isFocusInside.value;
  return visible.value;
};

const hideWhenInactive = () => {
  if (!shouldStayVisible()) hide();
};

const handleMouseEnter = () => {
  if (props.trigger === 'hover' || props.trigger === 'hover-focus') {
    isPointerInside.value = true;
    show();
  }
};

const handleMouseLeave = () => {
  if (props.trigger === 'hover' || props.trigger === 'hover-focus') {
    isPointerInside.value = false;
    hideWhenInactive();
  }
};

const handleFocus = () => {
  if (props.trigger === 'focus' || props.trigger === 'hover-focus') {
    isFocusInside.value = true;
    show();
  }
};

const handleBlur = () => {
  if (props.trigger === 'focus' || props.trigger === 'hover-focus') {
    isFocusInside.value = false;
    hideWhenInactive();
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
    isPopperHovered.value = true;
    clearTimers();
  }
};

const handlePopperLeave = () => {
  if (props.trigger === 'hover' || props.trigger === 'hover-focus') {
    isPopperHovered.value = false;
    hideWhenInactive();
  }
};

const handleResize = () => {
  schedulePosition();
};

const handleScroll = () => {
  schedulePosition();
};

const describedElements = new Map<HTMLElement, string | null>();
const restoreTriggerDescriptions = () => {
  describedElements.forEach((description, element) => {
    if (description === null) element.removeAttribute('aria-describedby');
    else element.setAttribute('aria-describedby', description);
  });
  describedElements.clear();
};

const syncTriggerDescriptions = () => {
  restoreTriggerDescriptions();
  if (!overlayActive.value || !tooltipRef.value || typeof HTMLElement === 'undefined') return;
  const trigger = Array.from(tooltipRef.value.children).find(
    (child): child is HTMLElement => child instanceof HTMLElement
  );
  if (!trigger) return;
  const current = trigger.getAttribute('aria-describedby');
  describedElements.set(trigger, current);
  const ids = new Set((current ?? '').split(/\s+/).filter(Boolean));
  ids.add(popperId);
  trigger.setAttribute('aria-describedby', Array.from(ids).join(' '));
};

// 仅在浮层可见时挂载全局监听器
watch(
  overlayActive,
  isVisible => {
    nextTick(syncTriggerDescriptions);
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (isVisible) {
      nextTick(updatePosition);
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
    } else {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      restoreTriggerDescriptions();
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (visible.value) nextTick(updatePosition);
});

onUnmounted(() => {
  clearTimers();
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll, true);
  restoreTriggerDescriptions();
});

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  newVal => {
    if (isModelControlled()) {
      clearTimers();
      commitVisible(Boolean(newVal) && !props.disabled);
    }
  },
  { immediate: true }
);

watch(
  () => props.disabled,
  isDisabled => {
    if (isDisabled) {
      clearTimers();
      isPointerInside.value = false;
      isFocusInside.value = false;
      isPopperHovered.value = false;
      if (isModelControlled() && props.modelValue === true) emit('update:modelValue', false);
      commitVisible(false);
    } else if (isModelControlled() && props.modelValue === true) {
      commitVisible(true);
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
