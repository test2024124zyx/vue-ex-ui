<template>
  <li
    ref="itemRef"
    v-bind="rootAttrs"
    :class="itemClasses"
    role="none"
  >
    <component
      :is="actionTag"
      ref="actionRef"
      v-bind="actionAttrs"
      class="ex-menu-item__action"
      :type="isLink ? undefined : 'button'"
      :disabled="!isLink && effectiveDisabled ? true : undefined"
      :href="isLink && !effectiveDisabled ? normalizedHref : undefined"
      :target="isLink && !effectiveDisabled ? props.target : undefined"
      :rel="isLink && !effectiveDisabled ? secureRel : undefined"
      role="menuitem"
      :aria-disabled="effectiveDisabled ? 'true' : undefined"
      :aria-current="isActive ? 'page' : undefined"
      :tabindex="tabIndex"
      :data-menu-key="props.itemKey"
      @click="handleClick"
      @focus="handleFocus"
      @keydown="handleKeydown"
    >
      <span class="ex-menu-item__content">
        <span
          v-if="hasIcon"
          class="ex-menu-item__icon"
        >
          <slot name="icon"></slot>
        </span>
        <span class="ex-menu-item__label">
          <slot></slot>
        </span>
        <span
          v-if="isActive"
          class="ex-menu-item__indicator"
          aria-hidden="true"
        ></span>
      </span>
    </component>
  </li>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeMount, onBeforeUnmount, ref, useAttrs, watch } from 'vue';
import { buildSecureRel, normalizeLinkHref } from '../link/link-utils';
import { hasRenderableContent } from '../../utils/vnode';
import { MENU_INJECTION_KEY, MENU_BRANCH_VISIBLE_KEY } from './context';
import { isComposingKeyboardEvent } from '../../utils/keyboard';
import { moveMenuFocus, type MenuFocusDirection } from './menu-utils';
import type { ExMenuItemEmits, ExMenuItemExposed, ExMenuItemProps, ExMenuItemSlots } from './types';

defineOptions({
  name: 'ExMenuItem',
  inheritAttrs: false,
});

const slots = defineSlots<ExMenuItemSlots>();

const props = withDefaults(defineProps<ExMenuItemProps>(), {
  disabled: false,
  href: undefined,
  target: undefined,
  rel: undefined,
});
const emit = defineEmits<ExMenuItemEmits>();
const attrs = useAttrs();
const menuContext = inject(MENU_INJECTION_KEY, null);
const ancestorVisible = inject(
  MENU_BRANCH_VISIBLE_KEY,
  computed(() => true)
);
const itemRef = ref<HTMLLIElement | null>(null);
const actionRef = ref<HTMLAnchorElement | HTMLButtonElement | null>(null);

const isLink = computed(() => props.href !== undefined);
const normalizedHref = computed(() => normalizeLinkHref(props.href));
const effectiveDisabled = computed(
  () => props.disabled || (isLink.value && normalizedHref.value === undefined)
);
const focusDisabled = computed(() => effectiveDisabled.value || !ancestorVisible.value);
const secureRel = computed(() => buildSecureRel(props.rel, props.target));
const actionTag = computed(() => (isLink.value ? 'a' : 'button'));
const isActive = computed(() => menuContext?.activeKey.value === props.itemKey);
const hasIcon = computed(() => hasRenderableContent(slots.icon?.()));
const tabIndex = computed(() =>
  menuContext
    ? menuContext.getTabIndex(props.itemKey, focusDisabled.value)
    : effectiveDisabled.value
      ? -1
      : 0
);

const itemClasses = computed(() => [
  'ex-menu-item',
  {
    'ex-menu-item--active': isActive.value,
    'ex-menu-item--disabled': effectiveDisabled.value,
    'ex-menu-item--collapsed': menuContext?.collapsed.value === true,
    'ex-menu-item--has-icon': hasIcon.value,
    'ex-menu-item--horizontal': menuContext?.mode.value === 'horizontal',
  },
]);

const OBSOLETE_ATTRS = new Set(['path']);
const actionAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => key === 'title' || key.startsWith('aria-'))
  )
);
const rootAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => {
      const normalizedKey = key.replace(/-/g, '').toLowerCase();
      return (
        key !== 'title' &&
        !key.startsWith('aria-') &&
        !['role', 'tabindex', 'href', 'target', 'rel', 'disabled'].includes(key) &&
        !OBSOLETE_ATTRS.has(normalizedKey)
      );
    })
  )
);

let unregisterFocusable: (() => void) | undefined;
onBeforeMount(() => {
  unregisterFocusable = menuContext?.registerFocusable(props.itemKey, focusDisabled);
});
onBeforeUnmount(() => unregisterFocusable?.());
watch(
  () => props.itemKey,
  () => {
    unregisterFocusable?.();
    unregisterFocusable = menuContext?.registerFocusable(props.itemKey, focusDisabled);
  }
);

const handleClick = (event: MouseEvent): void => {
  if (effectiveDisabled.value) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  emit('click', props.itemKey, event);
  menuContext?.handleItemClick(props.itemKey, event);
};

const handleFocus = (): void => {
  menuContext?.setTabStop(props.itemKey);
};

const focusDirectionForEvent = (
  event: KeyboardEvent,
  horizontal: boolean
): MenuFocusDirection | null => {
  if (event.key === 'Home') return 'first';
  if (event.key === 'End') return 'last';
  if (horizontal && ['ArrowRight', 'Right'].includes(event.key)) return 'next';
  if (horizontal && ['ArrowLeft', 'Left'].includes(event.key)) return 'previous';
  if (!horizontal && ['ArrowDown', 'Down'].includes(event.key)) return 'next';
  if (!horizontal && ['ArrowUp', 'Up'].includes(event.key)) return 'previous';
  return null;
};

const handleKeydown = (event: KeyboardEvent): void => {
  if (effectiveDisabled.value || event.defaultPrevented || isComposingKeyboardEvent(event)) return;
  if (isLink.value && event.key === ' ') {
    event.preventDefault();
    actionRef.value?.click();
    return;
  }

  const current = event.currentTarget as HTMLElement;
  const list = current.closest<HTMLElement>('ul[data-ex-menu-list]');
  const direction = focusDirectionForEvent(
    event,
    list?.getAttribute('aria-orientation') === 'horizontal'
  );
  if (!direction) return;

  const target = moveMenuFocus(current, direction);
  if (!target) return;
  event.preventDefault();
  const targetKey = target.dataset.menuKey;
  if (targetKey) menuContext?.setTabStop(targetKey);
};

defineExpose<ExMenuItemExposed>({
  getElement: () => itemRef.value,
  getActionElement: () => actionRef.value,
});
</script>

<style scoped lang="scss" src="./ExMenuItem.scss"></style>
