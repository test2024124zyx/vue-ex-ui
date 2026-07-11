<template>
  <li ref="subMenuRef" :class="subMenuClasses" :style="subMenuStyles" role="none">
    <template v-if="isHorizontal">
      <ExDropdown
        :visible="isOpen"
        trigger="hover"
        :placement="popupPlacement"
        :offset="6"
        :match-trigger-width="true"
        @update:visible="onDropdownVisible"
      >
        <button
          ref="titleButtonRef"
          type="button"
          class="ex-submenu__title"
          :disabled="disabled"
          role="menuitem"
          aria-haspopup="menu"
          :aria-expanded="isOpen"
          :aria-controls="submenuId"
          @click="handleTitleClick"
          @keydown="handleTitleKeydown"
        >
          <span v-if="$slots.icon" class="ex-submenu__icon">
            <slot name="icon" />
          </span>
          <span
            v-if="!menuContext?.collapsed.value || menuContext?.mode.value !== 'inline'"
            class="ex-submenu__label"
          >
            <slot name="title">{{ title }}</slot>
          </span>
          <span
            v-if="!menuContext?.collapsed.value || menuContext?.mode.value !== 'inline'"
            class="ex-submenu__arrow"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </button>
        <template #menu>
          <ul
            :id="submenuId"
            ref="submenuListRef"
            class="ex-submenu__list"
            role="menu"
            aria-orientation="vertical"
            @keydown="handleListKeydown"
          >
            <slot />
          </ul>
        </template>
      </ExDropdown>
    </template>
    <template v-else>
      <button
        ref="titleButtonRef"
        type="button"
        class="ex-submenu__title"
        :disabled="disabled"
        role="menuitem"
        aria-haspopup="menu"
        :aria-expanded="isOpen"
        :aria-controls="submenuId"
        @click="handleTitleClick"
        @keydown="handleTitleKeydown"
      >
        <span v-if="$slots.icon" class="ex-submenu__icon">
          <slot name="icon" />
        </span>
        <span
          v-if="!menuContext?.collapsed.value || menuContext?.mode.value !== 'inline'"
          class="ex-submenu__label"
        >
          <slot name="title">{{ title }}</slot>
        </span>
        <span
          v-if="!menuContext?.collapsed.value || menuContext?.mode.value !== 'inline'"
          class="ex-submenu__arrow"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>
      <transition
        name="ex-submenu-slide"
        @enter="onEnter"
        @after-enter="onAfterEnter"
        @leave="onLeave"
        @after-leave="onAfterLeave"
      >
        <ul
          v-show="isOpen"
          :id="submenuId"
          ref="submenuListRef"
          class="ex-submenu__list"
          role="menu"
          aria-orientation="vertical"
          @keydown="handleListKeydown"
        >
          <slot />
        </ul>
      </transition>
    </template>
  </li>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { computed, inject, ref, watch, nextTick } from 'vue';
import ExDropdown from '../dropdown/ExDropdown.vue';
import type { DropdownPlacement } from '../dropdown/types';
import type { ExSubMenuEmits, ExSubMenuExposed } from './types';
import { generateId } from '../../utils/id';

interface Props {
  itemKey: string;
  title: string;
  disabled?: boolean;
  popupPlacement?: DropdownPlacement;
  class?: string | string[] | Record<string, boolean>;
  style?: string | Record<string, string | number>;
}

defineOptions({
  name: 'ExSubMenu',
});

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  popupPlacement: 'bottom-start',
  class: undefined,
  style: undefined,
});

const emit = defineEmits<ExSubMenuEmits>();

interface MenuContext {
  openKeys: { value: string[] };
  collapsed: { value: boolean };
  mode: { value: string };
  handleOpenChange: (key: string, open: boolean) => void;
}

const subMenuRef = ref<HTMLLIElement>();
const titleButtonRef = ref<HTMLButtonElement>();
const submenuListRef = ref<HTMLUListElement>();
// 用全局唯一 id，避免同一页面多个 Menu 含相同 itemKey 的子菜单时 DOM id / aria-controls 冲突
const submenuId = generateId('ex-submenu');
const menuContext = inject<MenuContext | null>('exMenu', null);
const internalOpen = ref(false);

const isHorizontal = computed(() => menuContext?.mode.value === 'horizontal');

const isOpen = computed(() => {
  if (menuContext?.openKeys?.value) {
    return menuContext.openKeys.value.includes(props.itemKey);
  }
  return internalOpen.value;
});

watch(isOpen, newVal => {
  emit('openChange', newVal);
});

function onDropdownVisible(visible: boolean) {
  if (props.disabled) return;
  if (menuContext?.handleOpenChange) {
    menuContext.handleOpenChange(props.itemKey, visible);
  } else {
    internalOpen.value = visible;
  }
  if (!visible) {
    nextTick(() => titleButtonRef.value?.focus());
  }
}

const subMenuClasses = computed(() => {
  const classes = ['ex-submenu'];
  if (isOpen.value) classes.push('ex-submenu--open');
  if (props.disabled) classes.push('ex-submenu--disabled');
  classes.push(...normalizeCustomClass(props.class));
  return classes;
});

const subMenuStyles = computed(() => {
  if (!props.style) return undefined;
  return typeof props.style === 'string' ? props.style : props.style;
});

const handleTitleClick = (event: MouseEvent | KeyboardEvent) => {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  emit('titleClick', props.itemKey);
  const nextOpen = !isOpen.value;
  if (menuContext?.handleOpenChange) {
    menuContext.handleOpenChange(props.itemKey, nextOpen);
  } else {
    internalOpen.value = nextOpen;
  }
  if (nextOpen) {
    nextTick(() => {
      focusFirstItem();
    });
  }
};

function handleTitleKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  switch (event.key) {
    case 'ArrowDown':
    case 'Down':
      event.preventDefault();
      if (!isOpen.value) {
        if (menuContext?.handleOpenChange) menuContext.handleOpenChange(props.itemKey, true);
        else internalOpen.value = true;
      }
      nextTick(() => focusFirstItem());
      break;
    case 'ArrowUp':
    case 'Up':
      event.preventDefault();
      if (!isOpen.value) {
        if (menuContext?.handleOpenChange) menuContext.handleOpenChange(props.itemKey, true);
        else internalOpen.value = true;
      }
      nextTick(() => focusLastItem());
      break;
    case 'ArrowRight':
    case 'Right':
      if (menuContext?.mode.value === 'horizontal') {
        event.preventDefault();
        if (!isOpen.value) {
          if (menuContext?.handleOpenChange) menuContext.handleOpenChange(props.itemKey, true);
          else internalOpen.value = true;
        }
        nextTick(() => focusFirstItem());
      }
      break;
    case 'Escape':
    case 'Esc':
      if (isOpen.value) {
        event.preventDefault();
        closeSubmenu();
      }
      break;
  }
}

function handleListKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'Escape':
    case 'Esc':
      event.preventDefault();
      closeSubmenu();
      break;
    case 'ArrowLeft':
    case 'Left':
      if (menuContext?.mode.value === 'horizontal') {
        event.preventDefault();
        closeSubmenu();
      }
      break;
  }
}

function focusFirstItem() {
  const list = submenuListRef.value;
  if (!list) return;
  const items = list.querySelectorAll<HTMLElement>('.ex-menu-item:not(.ex-menu-item--disabled)');
  const first = items.item(0);
  if (first) first.focus();
}

function focusLastItem() {
  const list = submenuListRef.value;
  if (!list) return;
  const items = list.querySelectorAll<HTMLElement>('.ex-menu-item:not(.ex-menu-item--disabled)');
  const last = items.length > 0 ? items.item(items.length - 1) : null;
  if (last) last.focus();
}

function closeSubmenu() {
  if (menuContext?.handleOpenChange) {
    menuContext.handleOpenChange(props.itemKey, false);
  } else {
    internalOpen.value = false;
  }
  nextTick(() => {
    titleButtonRef.value?.focus();
  });
}

const onEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '0';
  element.style.overflow = 'hidden';
  void element.offsetHeight;
  element.style.height = `${element.scrollHeight}px`;
};

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '';
  element.style.overflow = '';
};

const onLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = `${element.scrollHeight}px`;
  element.style.overflow = 'hidden';
  void element.offsetHeight;
  element.style.height = '0';
};

const onAfterLeave = (el: Element) => {
  const element = el as HTMLElement;
  element.style.height = '';
  element.style.overflow = '';
};

defineExpose<ExSubMenuExposed>({
  isOpen: () => isOpen.value,
  toggle: () => {
    if (props.disabled) return;
    if (menuContext?.handleOpenChange) {
      menuContext.handleOpenChange(props.itemKey, !isOpen.value);
    } else {
      internalOpen.value = !internalOpen.value;
    }
  },
  open: () => {
    if (props.disabled) return;
    if (menuContext?.handleOpenChange) {
      menuContext.handleOpenChange(props.itemKey, true);
    } else {
      internalOpen.value = true;
    }
  },
  close: () => {
    if (menuContext?.handleOpenChange) {
      menuContext.handleOpenChange(props.itemKey, false);
    } else {
      internalOpen.value = false;
    }
  },
  getElement: () => subMenuRef.value || null,
});
</script>

<style scoped lang="scss" src="./ExSubMenu.scss"></style>
