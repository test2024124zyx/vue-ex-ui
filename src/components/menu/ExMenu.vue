<template>
  <nav
    ref="menuRef"
    :class="menuClasses"
    :style="menuStyles"
    role="navigation"
    :aria-label="ariaLabel || 'Main menu'"
  >
    <!-- 搜索框 -->
    <div v-if="searchable" class="ex-menu__search">
      <input
        v-model="searchQuery"
        type="text"
        class="ex-menu__search-input"
        :placeholder="t('search')"
        :aria-label="t('search')"
        @input="handleSearch"
      />
      <span class="ex-menu__search-icon">
        <ExIcon icon="search-line" :size="16" aria-hidden="true" />
      </span>
    </div>

    <ul
      class="ex-menu__list"
      :role="mode === 'horizontal' ? 'menubar' : 'menu'"
      :aria-orientation="mode === 'horizontal' ? 'horizontal' : 'vertical'"
    >
      <slot v-if="$slots.default" />
      <template v-else-if="displayItems && displayItems.length > 0">
        <template v-for="item in displayItems" :key="item.key">
          <ExSubMenu
            v-if="item.children && item.children.length > 0"
            :item-key="item.key"
            :title="item.label"
            :disabled="item.disabled"
          >
            <template v-if="item.icon" #icon>
              <img :src="item.icon" :alt="item.label" width="20" height="20" />
            </template>
            <ExMenuItem
              v-for="child in item.children"
              :key="child.key"
              :item-key="child.key"
              :disabled="child.disabled"
              :path="child.path"
            >
              <template v-if="child.icon" #icon>
                <img :src="child.icon" :alt="child.label" width="18" height="18" />
              </template>
              {{ child.label }}
            </ExMenuItem>
          </ExSubMenu>
          <ExMenuItem v-else :item-key="item.key" :disabled="item.disabled" :path="item.path">
            <template v-if="item.icon" #icon>
              <img :src="item.icon" :alt="item.label" width="20" height="20" />
            </template>
            {{ item.label }}
          </ExMenuItem>
        </template>
      </template>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { computed, provide, ref, watch, onMounted, onUnmounted } from 'vue';
import type { ExMenuProps, ExMenuEmits, ExMenuExposed, MenuItem } from './types';
import { useLocale } from '../../locale';
import { useNeonEffect, useAnimation } from '../config-provider/composables';

defineOptions({
  name: 'ExMenu',
});

const props = withDefaults(defineProps<ExMenuProps>(), {
  mode: 'vertical',
  collapsed: false,
  selectable: true,
  responsive: false,
  breakpoint: 768,
  searchable: false,
  activeKey: undefined,
  defaultActiveKey: undefined,
  openKeys: undefined,
  defaultOpenKeys: undefined,
  items: undefined,
  ariaLabel: undefined,
  class: undefined,
  style: undefined,
});

const emit = defineEmits<ExMenuEmits>();

const menuRef = ref<HTMLElement>();
const internalActiveKey = ref<string>(props.defaultActiveKey || props.activeKey || '');
const internalOpenKeys = ref<string[]>(props.defaultOpenKeys || props.openKeys || []);
const isMobile = ref(false);
const searchQuery = ref('');
let _mql: MediaQueryList | null = null;
const _applyResponsive = () => {
  if (!_mql) return;
  isMobile.value = _mql.matches;
};
onMounted(() => {
  if (props.responsive && typeof window !== 'undefined') {
    _mql = window.matchMedia(`(max-width: ${props.breakpoint}px)`);
    _applyResponsive();
    _mql.addEventListener?.('change', _applyResponsive);
  }
});
onUnmounted(() => {
  if (_mql && _mql.removeEventListener) {
    _mql.removeEventListener('change', _applyResponsive);
  }
  _mql = null;
});

watch(
  () => props.activeKey,
  newKey => {
    if (newKey !== undefined) internalActiveKey.value = newKey;
  }
);

watch(
  () => props.openKeys,
  newKeys => {
    if (newKeys !== undefined) internalOpenKeys.value = [...newKeys];
  }
);

// 全局配置
const { t } = useLocale('menu');
const globalNeonEffect = useNeonEffect();
const globalAnimation = useAnimation();

const menuClasses = computed(() => {
  const classes = ['ex-menu', `ex-menu--${props.mode}`];

  if (props.collapsed && props.mode === 'inline') classes.push('ex-menu--collapsed');

  // 支持全局霓虹效果
  if (globalNeonEffect.value) classes.push('ex-menu--neon');

  // 支持全局动画配置
  if (!globalAnimation.value) classes.push('ex-menu--no-animation');

  // 响应式支持
  if (props.responsive && isMobile.value) classes.push('ex-menu--mobile');

  classes.push(...normalizeCustomClass(props.class));
  return classes;
});

const menuStyles = computed(() => {
  if (!props.style) return undefined;
  return typeof props.style === 'string' ? props.style : props.style;
});

const handleItemClick = (key: string, item?: MenuItem) => {
  if (!props.selectable) return;
  internalActiveKey.value = key;
  emit('update:activeKey', key);
  emit('select', key, item || { key, label: '' });
  emit('click', key, item || { key, label: '' });
};

const handleOpenChange = (key: string, open: boolean) => {
  const newOpenKeys = [...internalOpenKeys.value];
  const index = newOpenKeys.indexOf(key);
  if (open && index === -1) newOpenKeys.push(key);
  else if (!open && index !== -1) newOpenKeys.splice(index, 1);
  internalOpenKeys.value = newOpenKeys;
  emit('update:openKeys', newOpenKeys);
  emit('openChange', newOpenKeys);
};

// 搜索功能：对 items 模式做真实过滤（保留命中项及其祖先链），并同时 emit 供自定义处理。
// 插槽（default slot）模式下组件无法感知子项文本，仍只 emit，由使用方自行过滤。
const filterMenuItems = (list: MenuItem[], query: string): MenuItem[] =>
  list
    .map(item => {
      const selfMatch = (item.label || '').toLowerCase().includes(query);
      const matchedChildren = item.children ? filterMenuItems(item.children, query) : undefined;
      if (selfMatch) return { ...item };
      if (matchedChildren && matchedChildren.length > 0) {
        return { ...item, children: matchedChildren };
      }
      return null;
    })
    .filter((item): item is MenuItem => item !== null);

const displayItems = computed(() => {
  const list = props.items;
  if (!list || !props.searchable) return list;
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return list;
  return filterMenuItems(list, query);
});

const handleSearch = () => {
  emit('search', searchQuery.value);
};

provide('exMenu', {
  mode: computed(() => props.mode),
  collapsed: computed(() => props.collapsed),
  activeKey: computed(() => internalActiveKey.value),
  openKeys: computed(() => internalOpenKeys.value),
  handleItemClick,
  handleOpenChange,
  t,
});

defineExpose<ExMenuExposed>({
  getActiveKey: () => internalActiveKey.value,
  getOpenKeys: () => [...internalOpenKeys.value],
  setActiveKey: (key: string) => {
    internalActiveKey.value = key;
    emit('update:activeKey', key);
  },
  setOpenKeys: (keys: string[]) => {
    internalOpenKeys.value = [...keys];
    emit('update:openKeys', keys);
  },
  getElement: () => menuRef.value || null,
});
</script>

<style scoped lang="scss" src="./ExMenu.scss"></style>
