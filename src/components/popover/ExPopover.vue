<template>
  <div
    ref="popoverRef"
    class="ex-popover"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focusin="handleFocus"
    @focusout="handleBlur"
    @click="handleClick"
    @contextmenu="handleContextmenu"
  >
    <!-- 触发元素 -->
    <slot></slot>

    <!-- Popover 内容 -->
    <Teleport to="body">
      <Transition :name="transition">
        <div
          v-if="overlayActive"
          :id="popperId"
          ref="popperRef"
          :class="popoverClasses"
          :data-theme="configTheme"
          :style="popoverStyles"
          role="dialog"
          :aria-label="ariaLabel || (!hasTitle ? content : undefined)"
          :aria-labelledby="!ariaLabel && hasTitle ? titleId : undefined"
          @mouseenter="handlePopoverMouseEnter"
          @mouseleave="handlePopoverMouseLeave"
          @focusin="handlePopoverFocusIn"
          @focusout="handlePopoverFocusOut"
          @click.stop
        >
          <!-- 霓虹边框效果 -->
          <div class="ex-popover__border"></div>

          <!-- 标题 -->
          <div
            v-if="title || $slots.title"
            :id="titleId"
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
          ></div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  getCurrentInstance,
  useSlots,
} from 'vue';
import type { ExPopoverProps, ExPopoverEmits, ExPopoverExposed } from './types';
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
const instance = getCurrentInstance();
const slots = useSlots();
const isModelControlled = () => {
  const vnodeProps = instance?.vnode.props;
  return Boolean(
    vnodeProps &&
    (Object.prototype.hasOwnProperty.call(vnodeProps, 'modelValue') ||
      Object.prototype.hasOwnProperty.call(vnodeProps, 'model-value'))
  );
};

const popoverRef = ref<HTMLDivElement>();
const popperRef = ref<HTMLDivElement>();
const visible = ref(isModelControlled() && props.modelValue === true && !props.disabled);
const openTimer = ref<number>();
const closeTimer = ref<number>();
const isPointerInside = ref(false);
const isPopoverHovered = ref(false);
const isFocusInside = ref(false);
const popperId = `ex-popover-${generateId()}`;
const titleId = `${popperId}-title`;
const hasTitle = computed(() => Boolean(props.title || slots.title));
const configTheme = useConfigTheme();
const neonEffect = useNeonEffect();
const animation = useAnimation();
const popoverZIndex = useZIndexLayer('popover');
const {
  styles: popupOverlayStyles,
  containsTarget: containsPopupTarget,
  active: overlayActive,
} = usePopupOverlay({
  active: () => visible.value,
  container: popperRef,
  zIndex: () => props.zIndex ?? popoverZIndex.value,
  restoreFocus: props.trigger === 'click' || props.trigger === 'contextmenu',
  onEscape: () => {
    clearTimers();
    requestVisible(false);
  },
});
// flip 后最终生效的位置（用于同步箭头方向的类名）
const resolvedPlacement = ref(props.placement);

// 计算属性
const popoverClasses = computed(() => {
  const classes = ['ex-popover__popper', `ex-popover__popper--${resolvedPlacement.value}`];

  if (!neonEffect.value) classes.push('ex-no-neon');
  if (!animation.value) classes.push('ex-no-animation');

  if (props.customClass) {
    classes.push(props.customClass);
  }

  return classes;
});

const popoverStyles = computed(() => {
  const styles: Record<string, string | number> = {
    ...popupOverlayStyles.value,
  };

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

const schedulePosition = useFloatingAutoUpdate(
  overlayActive,
  [popoverRef, popperRef],
  [() => props.placement, () => props.offset, () => props.width, () => props.customStyle],
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
  if (!isModelControlled()) commitVisible(nextVisible);
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

const handleMouseEnter = () => {
  if (props.trigger === 'hover') {
    isPointerInside.value = true;
    show();
  }
};

const handleMouseLeave = () => {
  if (props.trigger === 'hover') {
    isPointerInside.value = false;
    if (!isPopoverHovered.value) hide();
  }
};

const handlePopoverMouseEnter = () => {
  if (props.trigger === 'hover') {
    isPopoverHovered.value = true;
    clearTimers();
  }
};

const handlePopoverMouseLeave = () => {
  if (props.trigger === 'hover') {
    isPopoverHovered.value = false;
    if (!isPointerInside.value) hide();
  }
};

const handleFocus = () => {
  if (props.trigger === 'focus') {
    isFocusInside.value = true;
    show();
  }
};

const handleBlur = (event: FocusEvent) => {
  if (props.trigger === 'focus') {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && popperRef.value?.contains(nextTarget)) return;
    isFocusInside.value = false;
    hide();
  }
};

const handlePopoverFocusIn = () => {
  if (props.trigger !== 'focus') return;
  isFocusInside.value = true;
  clearTimers();
};

const handlePopoverFocusOut = (event: FocusEvent) => {
  if (props.trigger !== 'focus') return;
  const nextTarget = event.relatedTarget as Node | null;
  if (
    nextTarget &&
    (popperRef.value?.contains(nextTarget) || popoverRef.value?.contains(nextTarget))
  ) {
    return;
  }
  isFocusInside.value = false;
  hide();
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

const handleContextmenu = (event: MouseEvent) => {
  if (props.trigger !== 'contextmenu' || props.disabled) return;
  event.preventDefault();
  if (visible.value) hide();
  else show();
};

const handleClickOutside = (event: MouseEvent) => {
  if (!popoverRef.value || !popperRef.value) return;

  const target = event.target as Node;
  if (!popoverRef.value.contains(target) && !containsPopupTarget(target)) {
    hide();
  }
};

const handleResize = () => {
  schedulePosition();
};

const handleScroll = () => {
  schedulePosition();
};

interface TriggerAriaSnapshot {
  haspopup: string | null;
  expanded: string | null;
  controls: string | null;
}
const triggerAria = new Map<HTMLElement, TriggerAriaSnapshot>();
const restoreTriggerAria = () => {
  triggerAria.forEach((snapshot, element) => {
    const restore = (name: string, value: string | null) => {
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    };
    restore('aria-haspopup', snapshot.haspopup);
    restore('aria-expanded', snapshot.expanded);
    restore('aria-controls', snapshot.controls);
  });
  triggerAria.clear();
};

const syncTriggerAria = () => {
  restoreTriggerAria();
  if (!popoverRef.value || typeof HTMLElement === 'undefined') return;
  const trigger = Array.from(popoverRef.value.children).find(
    (child): child is HTMLElement => child instanceof HTMLElement
  );
  if (!trigger) return;
  triggerAria.set(trigger, {
    haspopup: trigger.getAttribute('aria-haspopup'),
    expanded: trigger.getAttribute('aria-expanded'),
    controls: trigger.getAttribute('aria-controls'),
  });
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', String(overlayActive.value));
  trigger.setAttribute('aria-controls', popperId);
};

const removeGlobalListeners = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll, true);
  document.removeEventListener('click', handleClickOutside);
};

const syncGlobalListeners = () => {
  removeGlobalListeners();
  if (!overlayActive.value || typeof window === 'undefined' || typeof document === 'undefined')
    return;
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll, true);
  if (props.trigger === 'click' || props.trigger === 'contextmenu') {
    document.addEventListener('click', handleClickOutside);
  }
};

watch(
  [overlayActive, () => props.trigger],
  () => {
    nextTick(syncTriggerAria);
    syncGlobalListeners();
    if (overlayActive.value) nextTick(updatePosition);
  },
  { immediate: true }
);

watch(
  () => props.modelValue,
  newVal => {
    if (!isModelControlled()) return;
    clearTimers();
    commitVisible(Boolean(newVal) && !props.disabled);
  },
  { immediate: true }
);

watch(
  () => props.disabled,
  isDisabled => {
    if (isDisabled) {
      clearTimers();
      isPointerInside.value = false;
      isPopoverHovered.value = false;
      isFocusInside.value = false;
      if (isModelControlled() && props.modelValue === true) emit('update:modelValue', false);
      commitVisible(false);
    } else if (isModelControlled() && props.modelValue === true) {
      commitVisible(true);
    }
  }
);

onMounted(() => {
  syncTriggerAria();
  if (visible.value) nextTick(updatePosition);
});

onUnmounted(() => {
  clearTimers();
  removeGlobalListeners();
  restoreTriggerAria();
});

defineExpose<ExPopoverExposed>({
  show,
  hide,
  updatePosition,
});
</script>

<style scoped lang="scss" src="./ExPopover.scss"></style>
