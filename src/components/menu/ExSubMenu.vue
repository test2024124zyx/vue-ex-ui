<template>
  <li
    ref="subMenuRef"
    v-bind="rootAttrs"
    :class="subMenuClasses"
    role="none"
  >
    <ExDropdown
      v-if="isHorizontal"
      :visible="isOpen"
      trigger="hover"
      :placement="props.popupPlacement"
      :offset="6"
      @update:visible="handleDropdownVisible"
    >
      <template #default="{ triggerProps }">
        <button
          ref="titleButtonRef"
          v-bind="{ ...actionAttrs, ...triggerProps }"
          type="button"
          class="ex-submenu__title"
          :class="{ 'is-open': isOpen }"
          :disabled="props.disabled"
          role="menuitem"
          aria-haspopup="menu"
          :aria-expanded="isOpen"
          :aria-disabled="props.disabled ? 'true' : undefined"
          :tabindex="tabIndex"
          :data-menu-key="props.itemKey"
          @click="handleTitleClick"
          @focus="handleTitleFocus"
          @keydown="handleTitleKeydown"
        >
          <span class="ex-submenu__content">
            <span
              v-if="hasIcon"
              class="ex-submenu__icon"
            >
              <slot name="icon"></slot>
            </span>
            <span class="ex-submenu__label">
              <slot name="title">{{ props.title }}</slot>
            </span>
            <span
              class="ex-submenu__arrow"
              :class="{ 'is-open': isOpen }"
              aria-hidden="true"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </span>
        </button>
      </template>

      <template #menu>
        <ul
          ref="submenuListRef"
          class="ex-submenu__list ex-submenu__list--popup"
          role="none"
          aria-orientation="vertical"
          data-ex-menu-list
          @keydown="handleListKeydown"
        >
          <slot></slot>
        </ul>
      </template>
    </ExDropdown>

    <template v-else>
      <button
        ref="titleButtonRef"
        v-bind="actionAttrs"
        type="button"
        class="ex-submenu__title"
        :class="{ 'is-open': isOpen }"
        :disabled="props.disabled"
        role="menuitem"
        aria-haspopup="menu"
        :aria-expanded="isOpen"
        :aria-controls="submenuId"
        :aria-disabled="props.disabled ? 'true' : undefined"
        :tabindex="tabIndex"
        :data-menu-key="props.itemKey"
        @click="handleTitleClick"
        @focus="handleTitleFocus"
        @keydown="handleTitleKeydown"
      >
        <span class="ex-submenu__content">
          <span
            v-if="hasIcon"
            class="ex-submenu__icon"
          >
            <slot name="icon"></slot>
          </span>
          <span class="ex-submenu__label">
            <slot name="title">{{ props.title }}</slot>
          </span>
          <span
            class="ex-submenu__arrow"
            :class="{ 'is-open': isOpen }"
            aria-hidden="true"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </span>
      </button>

      <div
        class="ex-submenu__collapse"
        :class="{ 'ex-submenu__collapse--open': isOpen }"
        :aria-hidden="isOpen ? undefined : 'true'"
        :inert="isOpen ? undefined : true"
      >
        <ul
          :id="submenuId"
          ref="submenuListRef"
          class="ex-submenu__list"
          role="menu"
          aria-orientation="vertical"
          data-ex-menu-list
          @keydown="handleListKeydown"
        >
          <slot></slot>
        </ul>
      </div>
    </template>
  </li>
</template>

<script setup lang="ts">
import {
  computed,
  inject,
  nextTick,
  onBeforeMount,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  useAttrs,
  useId,
  watch,
} from 'vue';
import ExDropdown from '../dropdown/ExDropdown.vue';
import { hasRenderableContent } from '../../utils/vnode';
import { MENU_INJECTION_KEY, MENU_BRANCH_VISIBLE_KEY } from './context';
import { registerOverlayEscapeBoundary } from '../../composables/overlay-manager';
import { isComposingKeyboardEvent } from '../../utils/keyboard';
import { getDirectMenuActions, moveMenuFocus } from './menu-utils';
import type { ExSubMenuEmits, ExSubMenuExposed, ExSubMenuProps, ExSubMenuSlots } from './types';

defineOptions({
  name: 'ExSubMenu',
  inheritAttrs: false,
});

const slots = defineSlots<ExSubMenuSlots>();

const props = withDefaults(defineProps<ExSubMenuProps>(), {
  disabled: false,
  popupPlacement: 'bottom-start',
});
const emit = defineEmits<ExSubMenuEmits>();
const attrs = useAttrs();
const menuContext = inject(MENU_INJECTION_KEY, null);
const ancestorVisible = inject(
  MENU_BRANCH_VISIBLE_KEY,
  computed(() => true)
);
const subMenuRef = ref<HTMLLIElement | null>(null);
const titleButtonRef = ref<HTMLButtonElement | null>(null);
const submenuListRef = ref<HTMLUListElement | null>(null);
const internalOpen = ref(false);
const pendingFocus = ref<'first' | 'last' | null>(null);
const submenuId = `ex-submenu-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

const isHorizontal = computed(() => menuContext?.mode.value === 'horizontal');
const isOpen = computed(() =>
  menuContext ? menuContext.openKeys.value.includes(props.itemKey) : internalOpen.value
);
provide(
  MENU_BRANCH_VISIBLE_KEY,
  computed(() => ancestorVisible.value && isOpen.value && !menuContext?.collapsed.value)
);
const hasIcon = computed(() => hasRenderableContent(slots.icon?.()));
const tabIndex = computed(() =>
  menuContext ? menuContext.getTabIndex(props.itemKey, disabled.value) : disabled.value ? -1 : 0
);
const subMenuClasses = computed(() => [
  'ex-submenu',
  {
    'ex-submenu--open': isOpen.value,
    'ex-submenu--disabled': props.disabled,
    'ex-submenu--collapsed': menuContext?.collapsed.value === true,
    'ex-submenu--has-icon': hasIcon.value,
    'ex-submenu--horizontal': isHorizontal.value,
  },
]);

const actionAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key === 'title' || key.startsWith('aria-'))
  )
);
const rootAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(
      ([key]) =>
        key !== 'title' &&
        !key.startsWith('aria-') &&
        !['role', 'tabindex', 'disabled'].includes(key)
    )
  )
);

let unregisterFocusable: (() => void) | undefined;
const disabled = computed(() => props.disabled || !ancestorVisible.value);
onBeforeMount(() => {
  unregisterFocusable = menuContext?.registerFocusable(props.itemKey, disabled);
});
onBeforeUnmount(() => unregisterFocusable?.());
watch(
  () => props.itemKey,
  () => {
    unregisterFocusable?.();
    unregisterFocusable = menuContext?.registerFocusable(props.itemKey, disabled);
  }
);
let unregisterEscape: (() => void) | undefined;
onMounted(() => {
  if (subMenuRef.value)
    unregisterEscape = registerOverlayEscapeBoundary(
      subMenuRef.value,
      () => !isHorizontal.value && isOpen.value && ancestorVisible.value,
      closeAndRestoreFocus
    );
});
onBeforeUnmount(() => unregisterEscape?.());

const focusBoundaryItem = (boundary: 'first' | 'last'): void => {
  const list = submenuListRef.value;
  if (!list) return;
  const actions = getDirectMenuActions(list);
  const target = boundary === 'first' ? actions[0] : actions[actions.length - 1];
  if (!target) return;
  target.focus({ preventScroll: true });
  const key = target.dataset.menuKey;
  if (key) menuContext?.setTabStop(key);
};

watch(isOpen, open => {
  if (!open || !pendingFocus.value) return;
  const boundary = pendingFocus.value;
  pendingFocus.value = null;
  nextTick(() => focusBoundaryItem(boundary));
});

const requestOpen = (open: boolean): boolean => {
  if (open && props.disabled) return false;
  if (isOpen.value === open) return false;

  if (menuContext) menuContext.handleOpenChange(props.itemKey, open);
  else internalOpen.value = open;
  emit('open-change', open);
  return true;
};

const handleDropdownVisible = (visible: boolean): void => {
  requestOpen(visible);
};

const handleTitleClick = (event: MouseEvent): void => {
  if (props.disabled) return;
  emit('title-click', props.itemKey, event);
  requestOpen(!isOpen.value);
};

const handleTitleFocus = (): void => {
  menuContext?.setTabStop(props.itemKey);
};

const moveTitleFocus = (direction: 'next' | 'previous' | 'first' | 'last'): boolean => {
  const title = titleButtonRef.value;
  if (!title) return false;
  const target = moveMenuFocus(title, direction);
  const key = target?.dataset.menuKey;
  if (key) menuContext?.setTabStop(key);
  return target !== null;
};

const openAndFocus = (boundary: 'first' | 'last'): void => {
  pendingFocus.value = boundary;
  if (!requestOpen(true) && isOpen.value) {
    pendingFocus.value = null;
    nextTick(() => focusBoundaryItem(boundary));
  }
};

const closeAndRestoreFocus = (): void => {
  requestOpen(false);
  pendingFocus.value = null;
  nextTick(() => titleButtonRef.value?.focus({ preventScroll: true }));
};

const handleTitleKeydown = (event: KeyboardEvent): void => {
  if (props.disabled || event.defaultPrevented || isComposingKeyboardEvent(event)) return;

  if (event.key === 'Home' || event.key === 'End') {
    if (moveTitleFocus(event.key === 'Home' ? 'first' : 'last')) event.preventDefault();
    return;
  }

  if (isHorizontal.value && ['ArrowRight', 'Right', 'ArrowLeft', 'Left'].includes(event.key)) {
    const direction = ['ArrowRight', 'Right'].includes(event.key) ? 'next' : 'previous';
    if (moveTitleFocus(direction)) event.preventDefault();
    return;
  }

  if (['ArrowDown', 'Down'].includes(event.key)) {
    event.preventDefault();
    openAndFocus('first');
    return;
  }
  if (['ArrowUp', 'Up'].includes(event.key)) {
    event.preventDefault();
    openAndFocus('last');
    return;
  }
  if (!isHorizontal.value && ['ArrowRight', 'Right'].includes(event.key)) {
    event.preventDefault();
    openAndFocus('first');
    return;
  }
  if (['Escape', 'Esc'].includes(event.key) && isOpen.value) {
    event.preventDefault();
    event.stopPropagation();
    closeAndRestoreFocus();
  }
};

const handleListKeydown = (event: KeyboardEvent): void => {
  if (event.defaultPrevented || isComposingKeyboardEvent(event)) return;
  if (!['Escape', 'Esc', 'ArrowLeft', 'Left'].includes(event.key)) return;
  event.preventDefault();
  event.stopPropagation();
  closeAndRestoreFocus();
};

defineExpose<ExSubMenuExposed>({
  isOpen: () => isOpen.value,
  toggle: () => {
    if (!props.disabled) requestOpen(!isOpen.value);
  },
  open: () => {
    if (!props.disabled) requestOpen(true);
  },
  close: () => requestOpen(false),
  getElement: () => subMenuRef.value,
});
</script>

<style scoped lang="scss" src="./ExSubMenu.scss"></style>
