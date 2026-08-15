<template>
  <nav
    ref="menuRef"
    v-bind="rootAttrs"
    :class="menuClasses"
    :aria-label="resolvedAriaLabel"
  >
    <div
      v-if="props.searchable"
      class="ex-menu__search"
    >
      <ExInput
        :model-value="searchQuery"
        size="small"
        clearable
        :placeholder="t('search')"
        :aria-label="t('search')"
        @update:model-value="handleSearch"
      >
        <template #prefix>
          <ExIcon
            icon="search-line"
            aria-hidden="true"
          />
        </template>
      </ExInput>
    </div>

    <ul
      class="ex-menu__list"
      :role="normalizedMode === 'horizontal' ? 'menubar' : 'menu'"
      :aria-orientation="normalizedMode === 'horizontal' ? 'horizontal' : 'vertical'"
      data-ex-menu-list
    >
      <slot v-if="$slots.default"></slot>
      <ExMenuNode
        v-for="item in displayItems"
        v-else
        :key="item.key"
        :item="item"
      />
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, provide, ref, useAttrs, watch } from 'vue';
import type { Ref } from 'vue';
import { useControllableState } from '../../composables/useControllableState';
import { useLocale } from '../../locale';
import ExIcon from '../icon/ExIcon.vue';
import ExInput from '../input/ExInput.vue';
import type { InputModelValue } from '../input/types';
import { MENU_INJECTION_KEY } from './context';
import ExMenuNode from './ExMenuNode.vue';
import {
  buildMenuItemMap,
  filterMenuItems,
  normalizeMenuKeys,
  normalizeMenuMode,
  validateMenuItems,
} from './menu-utils';
import type { ExMenuEmits, ExMenuExposed, ExMenuProps, ExMenuSlots, MenuSelectInfo } from './types';

defineOptions({
  name: 'ExMenu',
  inheritAttrs: false,
});

defineSlots<ExMenuSlots>();

const props = withDefaults(defineProps<ExMenuProps>(), {
  mode: 'vertical',
  activeKey: undefined,
  defaultActiveKey: undefined,
  openKeys: undefined,
  defaultOpenKeys: undefined,
  collapsed: false,
  selectable: true,
  items: () => [],
  searchable: false,
});
const emit = defineEmits<ExMenuEmits>();
const attrs = useAttrs();
const { t } = useLocale('menu');
const menuRef = ref<HTMLElement | null>(null);
const searchQuery = ref('');
const normalizedMode = computed(() => normalizeMenuMode(props.mode));
const isCollapsed = computed(() => normalizedMode.value === 'inline' && props.collapsed);

const activeState = useControllableState<string>({
  controlledValue: () => (typeof props.activeKey === 'string' ? props.activeKey : undefined),
  defaultValue: () => (typeof props.defaultActiveKey === 'string' ? props.defaultActiveKey : ''),
  onChange: key => emit('update:activeKey', key),
});
const activeKey = computed(() => activeState.value.value);

const openState = useControllableState<string[]>({
  controlledValue: () =>
    props.openKeys === undefined ? undefined : normalizeMenuKeys(props.openKeys),
  defaultValue: () => normalizeMenuKeys(props.defaultOpenKeys),
  clone: keys => [...keys],
  onChange: keys => {
    const snapshot = [...keys];
    emit('update:openKeys', snapshot);
    emit('open-change', [...snapshot]);
  },
});
const openKeys = computed(() => normalizeMenuKeys(openState.value.value));

const validatedItems = computed(() => validateMenuItems(props.items));
const itemMap = computed(() => buildMenuItemMap(validatedItems.value));
const displayItems = computed(() =>
  props.searchable ? filterMenuItems(validatedItems.value, searchQuery.value) : validatedItems.value
);

const menuClasses = computed(() => [
  'ex-menu',
  `ex-menu--${normalizedMode.value}`,
  { 'ex-menu--collapsed': isCollapsed.value },
]);

const OBSOLETE_ATTRS = new Set(['responsive', 'breakpoint', 'arialabel']);
const rootAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => {
      const normalizedKey = key.replace(/-/g, '').toLowerCase();
      return key !== 'aria-label' && key !== 'role' && !OBSOLETE_ATTRS.has(normalizedKey);
    })
  )
);
const resolvedAriaLabel = computed(() => {
  const label = attrs['aria-label'];
  return typeof label === 'string' && label.trim() ? label.trim() : t('menu');
});

const focusables = new Map<string, Readonly<Ref<boolean>>>();
const tabStopKey = ref<string | null>(activeKey.value || null);

const ensureTabStop = (): void => {
  const activeRecord = activeKey.value ? focusables.get(activeKey.value) : undefined;
  if (activeRecord && !activeRecord.value) {
    tabStopKey.value = activeKey.value;
    return;
  }

  const currentRecord = tabStopKey.value ? focusables.get(tabStopKey.value) : undefined;
  if (currentRecord && !currentRecord.value) return;

  tabStopKey.value =
    Array.from(focusables.entries()).find(([, disabled]) => !disabled.value)?.[0] ?? null;
};

const registerFocusable = (key: string, disabled: Readonly<Ref<boolean>>): (() => void) => {
  focusables.set(key, disabled);
  const stop = watch(disabled, ensureTabStop);
  ensureTabStop();

  return () => {
    stop();
    if (focusables.get(key) === disabled) focusables.delete(key);
    ensureTabStop();
  };
};

watch(activeKey, ensureTabStop);

const getTabIndex = (key: string, disabled: boolean): 0 | -1 => {
  if (disabled) return -1;
  const activeRecord = activeKey.value ? focusables.get(activeKey.value) : undefined;
  if (activeRecord && !activeRecord.value) return activeKey.value === key ? 0 : -1;
  return tabStopKey.value === key ? 0 : -1;
};

const setTabStop = (key: string): void => {
  const record = focusables.get(key);
  if (record && !record.value) tabStopKey.value = key;
};

const handleItemClick = (key: string, event: MouseEvent): MenuSelectInfo => {
  setTabStop(key);
  const info: MenuSelectInfo = { key, item: itemMap.value.get(key), event };
  emit('item-click', info);

  if (props.selectable) {
    if (activeKey.value !== key) activeState.request(key);
    emit('select', info);
  }
  return info;
};

const arraysEqual = (first: readonly string[], second: readonly string[]): boolean =>
  first.length === second.length && first.every((key, index) => key === second[index]);

const handleOpenChange = (key: string, open: boolean): void => {
  const nextKeys = [...openKeys.value];
  const index = nextKeys.indexOf(key);
  if (open && index < 0) nextKeys.push(key);
  else if (!open && index >= 0) nextKeys.splice(index, 1);
  if (!arraysEqual(nextKeys, openKeys.value)) openState.request(nextKeys);
};

const handleSearch = (value: InputModelValue): void => {
  const query = typeof value === 'string' ? value : String(value);
  searchQuery.value = query;
  emit('search', query);
};

provide(MENU_INJECTION_KEY, {
  mode: normalizedMode,
  collapsed: isCollapsed,
  activeKey,
  openKeys,
  tabStopKey,
  registerFocusable,
  getTabIndex,
  setTabStop,
  handleItemClick,
  handleOpenChange,
});

const setActiveKey = (key: string): void => {
  if (typeof key !== 'string' || key.trim() === '') {
    throw new TypeError('Menu activeKey 必须是非空字符串');
  }
  if (activeKey.value !== key) activeState.request(key);
};

const setOpenKeys = (keys: string[]): void => {
  const normalized = normalizeMenuKeys(keys);
  if (!arraysEqual(normalized, openKeys.value)) openState.request(normalized);
};

defineExpose<ExMenuExposed>({
  getActiveKey: () => activeKey.value || undefined,
  getOpenKeys: () => [...openKeys.value],
  setActiveKey,
  setOpenKeys,
  getElement: () => menuRef.value,
});
</script>

<style scoped lang="scss" src="./ExMenu.scss"></style>
