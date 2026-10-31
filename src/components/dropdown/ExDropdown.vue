<template>
  <div
    ref="dropdownRef"
    :class="dropdownClasses"
  >
    <span
      :id="triggerId"
      ref="triggerRef"
      class="ex-dropdown__trigger"
      @mouseenter="handleTriggerEnter"
      @mouseleave="handleTriggerLeave"
      @click="handleTriggerClick"
      @contextmenu="handleContextMenu"
      @keydown="handleTriggerKeydown"
    >
      <slot
        :open="overlayActive"
        :disabled="disabled"
        :trigger-props="triggerProps"
      ></slot>
    </span>

    <Teleport to="body">
      <Transition name="ex-dropdown-fade">
        <div
          v-show="overlayActive"
          :id="menuId"
          ref="menuRef"
          :class="menuClasses"
          :data-theme="configTheme"
          :style="menuStyles"
          role="menu"
          tabindex="-1"
          :data-placement="actualPlacement"
          :aria-label="accessibleLabel"
          :aria-labelledby="accessibleLabel ? undefined : triggerId"
          :aria-activedescendant="activeItemId || undefined"
          @mouseenter="handleMenuEnter"
          @mouseleave="handleMenuLeave"
          @keydown="handleMenuKeydown"
        >
          <div class="ex-dropdown__menu-content">
            <ExDropdownItem
              v-for="(item, index) in items"
              :id="`${menuId}-item-${index}`"
              :key="item.key"
              :label="item.label"
              :icon="item.icon"
              :disabled="item.disabled"
              :divided="item.divided"
              @click="handleDataItemClick(item)"
            />
            <slot name="menu"></slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, provide, ref, useId, watch } from 'vue';
import type { CSSProperties } from 'vue';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
} from '../config-provider/composables';
import { usePopupOverlay } from '../../composables/usePopupOverlay';
import { isComposingKeyboardEvent } from '../../utils/keyboard';
import { computeFloatingPosition } from '../../utils/floating';
import type { FloatingRect } from '../../utils/floating';
import { DROPDOWN_INJECTION_KEY } from './context';
import ExDropdownItem from './ExDropdownItem.vue';
import type {
  DropdownItemData,
  DropdownPlacement,
  DropdownTrigger,
  DropdownTriggerSlotProps,
  ExDropdownEmits,
  ExDropdownExposed,
  ExDropdownProps,
} from './types';

defineOptions({ name: 'ExDropdown' });
defineSlots<{
  default(props: DropdownTriggerSlotProps): unknown;
  menu(): unknown;
}>();

const props = withDefaults(defineProps<ExDropdownProps>(), {
  items: () => [],
  trigger: 'hover',
  placement: 'bottom-start',
  disabled: false,
  visible: undefined,
  offset: 8,
  matchTriggerWidth: false,
  flip: true,
  viewportPadding: 8,
  showDelay: 0,
  hideDelay: 150,
  hideOnClick: true,
  zIndex: undefined,
});
const emit = defineEmits<ExDropdownEmits>();

const TRIGGERS = new Set<DropdownTrigger>(['hover', 'click', 'contextmenu']);
const PLACEMENTS = new Set<DropdownPlacement>([
  'top',
  'top-start',
  'top-end',
  'bottom',
  'bottom-start',
  'bottom-end',
  'left',
  'left-start',
  'left-end',
  'right',
  'right-start',
  'right-end',
]);
const FOCUSABLE_TRIGGER_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const dropdownRef = ref<HTMLDivElement>();
const triggerRef = ref<HTMLSpanElement>();
const menuRef = ref<HTMLDivElement>();
const instanceId = useId();
const triggerId = `ex-dropdown-trigger-${instanceId}`;
const menuId = `ex-dropdown-menu-${instanceId}`;
const baseZIndex = useZIndexLayer('dropdown');
const isVisible = ref(props.visible ?? false);
const activeItemId = ref<string | null>(null);
const actualPlacement = ref<DropdownPlacement>('bottom-start');
const menuPositionStyles = ref<CSSProperties>({});
const configTheme = useConfigTheme();
const neonEffect = useNeonEffect();
const animation = useAnimation();
const contextPoint = ref<{ x: number; y: number } | null>(null);
let hoverTimer: number | undefined;
let positionFrame: number | undefined;
let listenersAttached = false;
let resizeObserver: ResizeObserver | null = null;
let focusMenuWhenOpened = false;
let restoreFocusWhenClosed = false;
let lastTriggerElement: HTMLElement | null = null;
let disposed = false;

const normalizedTrigger = computed<DropdownTrigger>(() =>
  TRIGGERS.has(props.trigger) ? props.trigger : 'hover'
);
const normalizedPlacement = computed<DropdownPlacement>(() =>
  PLACEMENTS.has(props.placement) ? props.placement : 'bottom-start'
);
const isControlled = computed(() => props.visible !== undefined);
const accessibleLabel = computed(() => props.ariaLabel?.trim() || undefined);
const dropdownClasses = computed(() => [
  'ex-dropdown',
  { 'ex-dropdown--disabled': props.disabled },
]);
const menuClasses = computed(() => [
  'ex-dropdown__menu',
  `ex-dropdown__menu--${actualPlacement.value}`,
  {
    'ex-no-neon': !neonEffect.value,
    'ex-no-animation': !animation.value,
  },
]);
const menuStyles = computed<CSSProperties>(() => ({
  ...menuPositionStyles.value,
  ...popupStyles.value,
}));
const triggerProps = computed(() => ({
  'aria-haspopup': 'menu' as const,
  'aria-expanded': overlayActive.value,
  'aria-controls': menuId,
  'aria-disabled': props.disabled ? (true as const) : undefined,
}));

const finiteDelay = (value: number, fallback: number): number =>
  Number.isFinite(value) && value >= 0 ? value : fallback;

const applyVisibility = (nextVisible: boolean, emitLifecycle = true) => {
  if (isVisible.value === nextVisible) return false;
  isVisible.value = nextVisible;
  if (!nextVisible) activeItemId.value = null;
  if (emitLifecycle) {
    if (nextVisible) emit('show');
    else emit('hide');
  }
  return true;
};

const requestVisible = (nextVisible: boolean) => {
  if (nextVisible && props.disabled) return false;
  if (isVisible.value === nextVisible) return false;
  emit('update:visible', nextVisible);
  if (!isControlled.value) applyVisibility(nextVisible);
  return true;
};

const findTriggerElement = (): HTMLElement | null => {
  if (lastTriggerElement?.isConnected) return lastTriggerElement;
  return triggerRef.value?.querySelector<HTMLElement>(FOCUSABLE_TRIGGER_SELECTOR) ?? null;
};

const rememberTriggerElement = (event: Event) => {
  if (!(event.target instanceof HTMLElement)) return;
  const focusable = event.target.closest<HTMLElement>(FOCUSABLE_TRIGGER_SELECTOR);
  if (focusable && triggerRef.value?.contains(focusable)) lastTriggerElement = focusable;
};

const focusTrigger = () => findTriggerElement()?.focus({ preventScroll: true });

const getMenuItems = (): HTMLElement[] => {
  const elements = Array.from(
    menuRef.value?.querySelectorAll<HTMLElement>(
      '[data-ex-dropdown-item]:not([aria-disabled="true"]), [role="menuitem"]:not([aria-disabled="true"])'
    ) ?? []
  );
  // :disabled 同时覆盖原生按钮及禁用 fieldset 后代，不能只检查 ARIA 属性。
  const unique = Array.from(new Set(elements)).filter(item => !item.matches(':disabled'));
  unique.forEach((item, index) => {
    if (!item.id) item.id = `${menuId}-custom-${index}`;
  });
  return unique;
};

/** 只调整菜单自身滚动位置，避免 scrollIntoView 连带滚动页面和触发器。 */
const scrollMenuItemIntoView = (item: HTMLElement): void => {
  const menu = menuRef.value;
  if (!menu) return;

  const menuRect = menu.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  if (itemRect.top < menuRect.top) {
    menu.scrollTop -= menuRect.top - itemRect.top;
  } else if (itemRect.bottom > menuRect.bottom) {
    menu.scrollTop += itemRect.bottom - menuRect.bottom;
  }
};

const activateItem = (itemId: string) => {
  activeItemId.value = itemId;
  nextTick(() => {
    const item = document.getElementById(itemId);
    if (item) scrollMenuItemIntoView(item);
  });
};

const activateBoundaryItem = (boundary: 'first' | 'last') => {
  const items = getMenuItems();
  const item = boundary === 'first' ? items[0] : items[items.length - 1];
  if (item) activateItem(item.id);
};

const moveActiveItem = (step: 1 | -1) => {
  const items = getMenuItems();
  if (items.length === 0) return;
  const currentIndex = items.findIndex(item => item.id === activeItemId.value);
  const nextIndex =
    currentIndex < 0
      ? step === 1
        ? 0
        : items.length - 1
      : (currentIndex + step + items.length) % items.length;
  activateItem(items[nextIndex]!.id);
};

const focusMenu = () => {
  activateBoundaryItem('first');
  menuRef.value?.focus({ preventScroll: true });
};

const requestShow = (focus = false) => {
  focusMenuWhenOpened ||= focus;
  if (!requestVisible(true) && isVisible.value && focus) {
    nextTick(focusMenu);
  }
};

const requestHide = (restoreTriggerFocus = false) => {
  restoreFocusWhenClosed = restoreTriggerFocus;
  const changed = requestVisible(false);
  if (restoreTriggerFocus && !changed && !isVisible.value) {
    restoreFocusWhenClosed = false;
    nextTick(focusTrigger);
  }
};

provide(DROPDOWN_INJECTION_KEY, {
  activeItemId,
  activate: activateItem,
  select: () => {
    if (props.hideOnClick) requestHide(true);
  },
});

const toFloatingRect = (rect: DOMRect): FloatingRect => ({
  top: rect.top,
  right: rect.right,
  bottom: rect.bottom,
  left: rect.left,
  width: rect.width,
  height: rect.height,
});

/** 立即读取布局并更新 fixed 菜单坐标；滚动和缩放事件通过 rAF 合并调用。 */
const updatePosition = () => {
  if (disposed || !triggerRef.value || !menuRef.value || typeof window === 'undefined') return;
  const point = contextPoint.value;
  const contextOffset = finiteDelay(props.offset, 0);
  const reference: FloatingRect = point
    ? {
        top: point.y,
        right: point.x + contextOffset,
        bottom: point.y,
        left: point.x + contextOffset,
        width: 0,
        height: 0,
      }
    : toFloatingRect(triggerRef.value.getBoundingClientRect());
  const menuRect = menuRef.value.getBoundingClientRect();
  const result = computeFloatingPosition({
    reference,
    floating: { width: menuRect.width, height: menuRect.height },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    placement: point ? 'bottom-start' : normalizedPlacement.value,
    offset: props.offset,
    padding: props.viewportPadding,
    flip: point ? false : props.flip,
    matchReferenceWidth: !point && props.matchTriggerWidth,
  });

  actualPlacement.value = result.placement as DropdownPlacement;
  menuPositionStyles.value = {
    top: `${result.y}px`,
    left: `${result.x}px`,
    ...(result.width === undefined ? {} : { width: `${result.width}px` }),
  };
};

/** 只取消当前组件创建的定位任务，服务端渲染期间不读取浏览器全局对象。 */
const cancelScheduledPosition = () => {
  if (positionFrame === undefined) return;
  if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(positionFrame);
  }
  positionFrame = undefined;
};

const schedulePosition = () => {
  if (typeof window === 'undefined') return;
  cancelScheduledPosition();
  if (typeof window.requestAnimationFrame !== 'function') {
    updatePosition();
    return;
  }
  positionFrame = window.requestAnimationFrame(() => {
    positionFrame = undefined;
    updatePosition();
  });
};

const handlePointerOutside = (event: Event) => {
  if (!(event.target instanceof Node)) return;
  if (dropdownRef.value?.contains(event.target) || containsTarget(event.target)) return;
  requestHide(false);
};

const attachPositionListeners = () => {
  if (disposed || !overlayActive.value || listenersAttached || typeof window === 'undefined')
    return;
  document.addEventListener('pointerdown', handlePointerOutside, true);
  window.addEventListener('resize', schedulePosition);
  window.addEventListener('scroll', schedulePosition, true);
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(schedulePosition);
    if (triggerRef.value) resizeObserver.observe(triggerRef.value);
    if (menuRef.value) resizeObserver.observe(menuRef.value);
  }
  listenersAttached = true;
};

const detachPositionListeners = () => {
  if (!listenersAttached || typeof window === 'undefined') return;
  document.removeEventListener('pointerdown', handlePointerOutside, true);
  window.removeEventListener('resize', schedulePosition);
  window.removeEventListener('scroll', schedulePosition, true);
  resizeObserver?.disconnect();
  resizeObserver = null;
  cancelScheduledPosition();
  listenersAttached = false;
};

const clearHoverTimer = () => {
  if (hoverTimer === undefined) return;
  window.clearTimeout(hoverTimer);
  hoverTimer = undefined;
};

const scheduleHoverAction = (action: () => void, delay: number) => {
  clearHoverTimer();
  if (delay === 0) {
    action();
    return;
  }
  hoverTimer = window.setTimeout(() => {
    hoverTimer = undefined;
    action();
  }, delay);
};

const handleTriggerEnter = () => {
  if (normalizedTrigger.value !== 'hover' || props.disabled) return;
  contextPoint.value = null;
  scheduleHoverAction(() => requestShow(false), finiteDelay(props.showDelay, 0));
};

const handleTriggerLeave = () => {
  if (normalizedTrigger.value !== 'hover') return;
  scheduleHoverAction(() => requestHide(false), finiteDelay(props.hideDelay, 150));
};

const handleMenuEnter = () => {
  if (normalizedTrigger.value === 'hover') clearHoverTimer();
};

const handleMenuLeave = () => {
  if (normalizedTrigger.value !== 'hover') return;
  scheduleHoverAction(() => requestHide(false), finiteDelay(props.hideDelay, 150));
};

const handleTriggerClick = (event: MouseEvent) => {
  if (normalizedTrigger.value !== 'click' || props.disabled) return;
  rememberTriggerElement(event);
  contextPoint.value = null;
  if (isVisible.value) requestHide(false);
  else requestShow(true);
};

const handleContextMenu = (event: MouseEvent) => {
  if (normalizedTrigger.value !== 'contextmenu' || props.disabled) return;
  event.preventDefault();
  rememberTriggerElement(event);
  contextPoint.value = { x: event.clientX, y: event.clientY };
  requestShow(true);
};

const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled || event.defaultPrevented || isComposingKeyboardEvent(event)) return;
  if (!['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) return;
  event.preventDefault();
  rememberTriggerElement(event);
  contextPoint.value = null;
  focusMenuWhenOpened = true;
  requestShow(true);
  nextTick(() => {
    if (event.key === 'ArrowUp') activateBoundaryItem('last');
  });
};

const handleMenuKeydown = (event: KeyboardEvent) => {
  if (event.defaultPrevented || isComposingKeyboardEvent(event)) return;
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      moveActiveItem(1);
      return;
    case 'ArrowUp':
      event.preventDefault();
      moveActiveItem(-1);
      return;
    case 'Home':
      event.preventDefault();
      activateBoundaryItem('first');
      return;
    case 'End':
      event.preventDefault();
      activateBoundaryItem('last');
      return;
    case 'Enter':
    case ' ': {
      event.preventDefault();
      document.getElementById(activeItemId.value || '')?.click();
      return;
    }
    case 'Escape':
      event.preventDefault();
      event.stopPropagation();
      requestHide(true);
      return;
    case 'Tab':
      requestHide(false);
      return;
  }

  if (event.ctrlKey || event.altKey || event.metaKey || event.key.length !== 1) return;
  const query = event.key.toLocaleLowerCase();
  const items = getMenuItems();
  const start = Math.max(0, items.findIndex(item => item.id === activeItemId.value) + 1);
  const ordered = [...items.slice(start), ...items.slice(0, start)];
  const match = ordered.find(item =>
    item.textContent?.trim().toLocaleLowerCase().startsWith(query)
  );
  if (match) {
    event.preventDefault();
    activateItem(match.id);
  }
};

const handleDataItemClick = (item: DropdownItemData) => {
  if (!item.disabled) emit('item-click', item);
};

const {
  active: overlayActive,
  styles: popupStyles,
  containsTarget,
} = usePopupOverlay({
  active: () => isVisible.value && !props.disabled,
  container: menuRef,
  zIndex: () => props.zIndex ?? baseZIndex.value,
  closeOnEscape: () => true,
  onEscape: () => requestHide(true),
  restoreFocus: false,
});

watch(
  () => props.visible,
  visible => {
    if (visible !== undefined) applyVisibility(visible);
  },
  { flush: 'sync' }
);

watch(
  overlayActive,
  visible => {
    if (!visible) {
      detachPositionListeners();
      contextPoint.value = null;
      if (restoreFocusWhenClosed) nextTick(focusTrigger);
      restoreFocusWhenClosed = false;
      return;
    }
    nextTick(() => {
      if (disposed || !overlayActive.value) return;
      attachPositionListeners();
      updatePosition();
      if (focusMenuWhenOpened) focusMenu();
      focusMenuWhenOpened = false;
    });
  },
  { immediate: true }
);

watch(
  () => props.disabled,
  disabled => {
    if (!disabled) return;
    clearHoverTimer();
    requestHide(false);
  }
);

watch(
  normalizedPlacement,
  placement => {
    if (!isVisible.value) actualPlacement.value = placement;
    else schedulePosition();
  },
  { immediate: true }
);

watch(
  [
    () => props.offset,
    () => props.viewportPadding,
    () => props.flip,
    () => props.matchTriggerWidth,
  ],
  () => {
    if (overlayActive.value) schedulePosition();
  }
);

const show = () => {
  contextPoint.value = null;
  requestShow(false);
};
const hide = () => requestHide(false);
const getElement = () => dropdownRef.value ?? null;

onBeforeUnmount(() => {
  disposed = true;
  clearHoverTimer();
  detachPositionListeners();
});

defineExpose<ExDropdownExposed>({ show, hide, updatePosition, getElement });
</script>

<style scoped lang="scss" src="./ExDropdown.scss"></style>
