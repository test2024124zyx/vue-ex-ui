<template>
  <div
    ref="tabsRef"
    :class="tabsClasses"
    :style="tabsStyles"
  >
    <!-- 标签页导航 -->
    <div :class="`ex-tabs__nav-wrap ex-tabs__nav-wrap--${position}`">
      <div class="ex-tabs__nav-scroll">
        <div
          ref="navRef"
          class="ex-tabs__nav"
          role="tablist"
          :aria-orientation="
            position === 'left' || position === 'right' ? 'vertical' : 'horizontal'
          "
        >
          <!-- 标签页项 -->
          <div
            v-for="pane in panes"
            :key="pane.name"
            class="ex-tabs__tab-item"
          >
            <button
              :id="getTabId(pane.name)"
              type="button"
              :class="getTabClasses(pane)"
              :aria-selected="activeTab === pane.name"
              :aria-disabled="pane.disabled"
              :aria-controls="getPanelId(pane.name)"
              :disabled="pane.disabled"
              role="tab"
              :tabindex="getTabTabindex(pane)"
              @click="handleTabClick(pane, $event)"
              @keydown="handleTabKeydown(pane, $event)"
            >
              <!-- 标签页图标插槽 -->
              <span
                v-if="$slots[`icon-${pane.name}`]"
                class="ex-tabs__tab-icon"
              >
                <slot :name="`icon-${pane.name}`"></slot>
              </span>

              <!-- 标签页标题 -->
              <span class="ex-tabs__tab-label">
                <slot :name="`label-${pane.name}`">
                  {{ pane.label || pane.name }}
                </slot>
              </span>
            </button>

            <!-- 关闭按钮（editable 同时启用增删，与添加按钮配套） -->
            <button
              v-if="(closable || editable || pane.closable) && !pane.disabled"
              type="button"
              class="ex-tabs__tab-close"
              :aria-label="`${t('close')} ${pane.label || pane.name}`"
              @click.stop="handleTabRemove(pane.name)"
              @keydown.stop
            >
              <ExIcon
                icon="close-line"
                :size="14"
                aria-hidden="true"
              />
            </button>
          </div>

          <!-- 添加按钮 -->
          <button
            v-if="addable || editable"
            type="button"
            class="ex-tabs__tab ex-tabs__tab--add"
            :aria-label="t('add')"
            @click="handleTabAdd"
          >
            <ExIcon
              icon="add-line"
              :size="16"
              aria-hidden="true"
            />
          </button>

          <!-- 激活指示器（无标签时不显示，避免关闭全部后残留指示条） -->
          <div
            v-if="type === 'line' && panes.length > 0"
            class="ex-tabs__indicator"
            :style="indicatorStyle"
          ></div>
        </div>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="ex-tabs__content">
      <SlotContent />
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, provide, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import type { ExTabsProps, ExTabsEmits, ExTabsExposed } from './types';
import { generateId } from '../../utils/id';
import { useLocale } from '../../locale';
import { useSlotItems } from '../../composables/useSlotItems';
import { isComposingKeyboardEvent } from '../../utils/keyboard';
import { useControllableState } from '../../composables/useControllableState';
import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExTabs',
});

const props = withDefaults(defineProps<ExTabsProps>(), {
  type: 'line',
  position: 'top',
  size: undefined,
  closable: false,
  addable: false,
  editable: false,
  animated: true,
});

const emit = defineEmits<ExTabsEmits>();
const componentSize = useComponentSize(computed(() => props.size));
const { t } = useLocale('tabs');

interface PaneInfo {
  name: string | number;
  label?: string;
  disabled?: boolean;
  closable?: boolean;
}

const tabsRef = ref<HTMLDivElement>();
const navRef = ref<HTMLDivElement>();
const registeredPanes = ref<PaneInfo[]>([]);
const { items: slotItems, SlotContent } = useSlotItems('ExTabPane');
const slotPanes = computed<PaneInfo[]>(() =>
  slotItems.value.map(node => ({
    name: node.props?.name as string | number,
    label: node.props?.label as string | undefined,
    disabled: node.props?.disabled === true || node.props?.disabled === '',
    closable: node.props?.closable === true || node.props?.closable === '',
  }))
);
const panes = computed(() => {
  const names = new Set(slotPanes.value.map(pane => pane.name));
  return [...slotPanes.value, ...registeredPanes.value.filter(pane => !names.has(pane.name))];
});
const tabState = useControllableState<string | number | undefined>({
  controlledValue: () => props.modelValue,
  defaultValue: undefined,
});
const selectedTab = tabState.value;
const activeTab = computed(
  () => selectedTab.value ?? panes.value.find(pane => !pane.disabled)?.name
);
// 每个 Tabs 实例唯一前缀，避免多实例间 tab/panel 的 id 冲突
const tabsUid = generateId('ex-tabs');
const encodePaneName = (name: string | number) => {
  const encodedName = Array.from(String(name), character =>
    character.codePointAt(0)?.toString(16)
  ).join('-');
  return `${typeof name}-${encodedName || 'empty'}`;
};
const getTabId = (name: string | number) => `${tabsUid}-tab-${encodePaneName(name)}`;
const getPanelId = (name: string | number) => `${tabsUid}-panel-${encodePaneName(name)}`;

// 提供给子组件
provide('exTabsUid', tabsUid);
provide('getTabId', getTabId);
provide('getPanelId', getPanelId);
provide('activeTab', activeTab);
provide('registerPane', (pane: PaneInfo) => {
  if (!slotPanes.value.some(item => item.name === pane.name)) registeredPanes.value.push(pane);
});
provide('updatePane', (registeredName: string | number, pane: PaneInfo) => {
  const target = registeredPanes.value.find(current => current.name === registeredName);
  const activeNameChanged = activeTab.value === registeredName && registeredName !== pane.name;
  if (target) Object.assign(target, pane);
  if (activeNameChanged) {
    tabState.request(pane.name);
    emit('update:modelValue', pane.name);
    emit('change', pane.name);
  }
});
let isTabsUnmounting = false;
let removalRequest: { name: string | number; nextName: string | number } | undefined;
provide('unregisterPane', (name: string | number) => {
  registeredPanes.value = registeredPanes.value.filter(pane => pane.name !== name);
});

onMounted(() =>
  watch(
    panes,
    (nextPanes, previousPanes) => {
      if (
        isTabsUnmounting ||
        selectedTab.value === undefined ||
        nextPanes.some(pane => pane.name === selectedTab.value)
      )
        return;
      const index = previousPanes.findIndex(pane => pane.name === selectedTab.value);
      // 同一轮卸载会多次更新注册列表，已移除的项只发一次替代请求。
      if (index < 0) return;
      const nextPane =
        nextPanes.slice(index).find(pane => !pane.disabled) ||
        nextPanes
          .slice(0, index)
          .reverse()
          .find(pane => !pane.disabled);
      if (removalRequest?.name === selectedTab.value && removalRequest?.nextName === nextPane?.name)
        return;
      tabState.request(nextPane?.name);
      if (nextPane) {
        emit('update:modelValue', nextPane.name);
        emit('change', nextPane.name);
      }
    },
    { flush: 'post' }
  )
);

// 计算属性
const tabsClasses = computed(() => {
  const classes = [
    'ex-tabs',
    `ex-tabs--${props.type}`,
    `ex-tabs--${props.position}`,
    `ex-tabs--${componentSize.value}`,
  ];

  if (props.animated) classes.push('ex-tabs--animated');

  classes.push(...normalizeCustomClass(props.class));

  return classes;
});

const tabsStyles = computed(() => {
  if (!props.style) return undefined;
  if (typeof props.style === 'string') return props.style;
  return props.style;
});

const getTabClasses = (pane: PaneInfo) => {
  const classes = ['ex-tabs__tab'];

  if (activeTab.value === pane.name) classes.push('ex-tabs__tab--active');
  if (pane.disabled) classes.push('ex-tabs__tab--disabled');
  if (props.closable || props.editable || pane.closable) classes.push('ex-tabs__tab--closable');
  if (panes.value[0]?.name === pane.name) classes.push('ex-tabs__tab--first');
  if (panes.value[panes.value.length - 1]?.name === pane.name) {
    classes.push('ex-tabs__tab--last');
  }

  return classes;
};

// 漫游式 tabindex：仅激活项可被 Tab 键聚焦，其余项用方向键在 tablist 内移动（WAI-ARIA tabs 规范）
const getTabTabindex = (pane: PaneInfo) => {
  if (pane.disabled) return -1;
  const activePane = panes.value.find(item => item.name === activeTab.value && !item.disabled);
  if (activePane) return activeTab.value === pane.name ? 0 : -1;
  return panes.value.find(item => !item.disabled)?.name === pane.name ? 0 : -1;
};

const indicatorStyle = ref({});

// 更新指示器位置
const updateIndicator = async () => {
  if (props.type !== 'line' || !navRef.value) return;

  await nextTick();

  if (isTabsUnmounting || !navRef.value) return;

  const activeTabEl = navRef.value.querySelector('.ex-tabs__tab--active') as HTMLElement;
  if (!activeTabEl) {
    indicatorStyle.value = { display: 'none' };
    return;
  }

  const isVertical = props.position === 'left' || props.position === 'right';
  const activeTabRect = activeTabEl.getBoundingClientRect();
  const navRect = navRef.value.getBoundingClientRect();
  // offsetLeft/offsetTop 只相对于最近的定位父级，标签项本身有定位样式时会始终得到局部坐标。
  // 使用两个元素的视口坐标差，才能得到指示条相对于导航容器的真实位置。
  const indicatorOffset = isVertical
    ? activeTabRect.top - navRect.top + navRef.value.scrollTop
    : activeTabRect.left - navRect.left + navRef.value.scrollLeft;

  if (isVertical) {
    indicatorStyle.value = {
      height: `${activeTabEl.offsetHeight}px`,
      transform: `translateY(${indicatorOffset}px)`,
    };
  } else {
    indicatorStyle.value = {
      width: `${activeTabEl.offsetWidth}px`,
      transform: `translateX(${indicatorOffset}px)`,
    };
  }
};

// 事件处理
const handleTabClick = (pane: PaneInfo, event: MouseEvent | KeyboardEvent) => {
  if (pane.disabled) return;

  tabState.request(pane.name);
  emit('update:modelValue', pane.name);
  emit('change', pane.name);

  // 只有 MouseEvent 才触发 tab-click 事件
  if (event instanceof MouseEvent) {
    emit('tab-click', pane.name, event);
  }

  updateIndicator();
};

// 将焦点移动到指定标签的 DOM 元素
const focusTab = (pane: PaneInfo) => {
  nextTick(() => {
    if (typeof document === 'undefined') return;
    document.getElementById(getTabId(pane.name))?.focus();
  });
};

// 键盘导航：Enter/Space 激活；方向键在标签间移动（依据 position 决定横/纵向）；Home/End 跳首尾
const handleTabKeydown = (pane: PaneInfo, event: KeyboardEvent) => {
  if (event.defaultPrevented || isComposingKeyboardEvent(event)) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleTabClick(pane, event);
    return;
  }

  const isVertical = props.position === 'left' || props.position === 'right';
  const nextKeys = isVertical ? ['ArrowDown', 'Down'] : ['ArrowRight', 'Right'];
  const prevKeys = isVertical ? ['ArrowUp', 'Up'] : ['ArrowLeft', 'Left'];

  const enabled = panes.value.filter(p => !p.disabled);
  if (enabled.length === 0) return;
  const idx = enabled.findIndex(p => p.name === pane.name);

  let target: PaneInfo | undefined;
  if (nextKeys.includes(event.key)) {
    target = enabled[(idx + 1) % enabled.length];
  } else if (prevKeys.includes(event.key)) {
    target = enabled[(idx - 1 + enabled.length) % enabled.length];
  } else if (event.key === 'Home') {
    target = enabled[0];
  } else if (event.key === 'End') {
    target = enabled[enabled.length - 1];
  } else {
    return;
  }

  event.preventDefault();
  if (target) {
    handleTabClick(target, event);
    focusTab(target);
  }
};

const handleTabRemove = (name: string | number) => {
  emit('tab-remove', name);

  // 如果删除的是当前激活的标签页，切换到下一个
  if (activeTab.value === name) {
    const index = panes.value.findIndex(p => p.name === name);
    const nextPane =
      panes.value.slice(index + 1).find(pane => !pane.disabled) ||
      panes.value
        .slice(0, index)
        .reverse()
        .find(pane => !pane.disabled);
    if (nextPane) {
      // 点击关闭已请求替代项，本轮真实卸载无需再次发出相同请求。
      const pending = { name, nextName: nextPane.name };
      removalRequest = pending;
      nextTick(() => {
        if (removalRequest === pending) removalRequest = undefined;
      });
      tabState.request(nextPane.name);
      emit('update:modelValue', nextPane.name);
      emit('change', nextPane.name);
    }
  }
};

const handleTabAdd = () => {
  emit('tab-add');
};

onMounted(() =>
  watch(activeTab, () => {
    updateIndicator();
  })
);

onMounted(() =>
  watch(
    [() => JSON.stringify(panes.value), () => props.position, componentSize, () => props.type],
    updateIndicator,
    { flush: 'post' }
  )
);

// 生命周期
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  updateIndicator();
  // 容器/标签尺寸变化（窗口缩放、字体加载、标签增删）时同步指示条位置
  if (typeof ResizeObserver !== 'undefined' && navRef.value) {
    resizeObserver = new ResizeObserver(() => updateIndicator());
    resizeObserver.observe(navRef.value);
  }
});

onBeforeUnmount(() => {
  isTabsUnmounting = true;
  resizeObserver?.disconnect();
  resizeObserver = null;
});

// 暴露的方法
const getElement = () => tabsRef.value || null;

defineExpose<ExTabsExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExTabs.scss"></style>
