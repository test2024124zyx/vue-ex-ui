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
          :aria-orientation="position === 'left' || position === 'right' ? 'vertical' : 'horizontal'"
        >
          <!-- 标签页项 -->
          <div
            v-for="pane in panes"
            :id="`${tabsUid}-tab-${pane.name}`"
            :key="pane.name"
            :class="getTabClasses(pane)"
            :aria-selected="activeTab === pane.name"
            :aria-disabled="pane.disabled"
            :aria-controls="`${tabsUid}-panel-${pane.name}`"
            role="tab"
            :tabindex="getTabTabindex(pane)"
            @click="handleTabClick(pane, $event)"
            @keydown="handleTabKeydown(pane, $event)"
          >
            <!-- 标签页图标插槽 -->
            <div
              v-if="$slots[`icon-${pane.name}`]"
              class="ex-tabs__tab-icon"
            >
              <slot :name="`icon-${pane.name}`" />
            </div>

            <!-- 标签页标题 -->
            <span class="ex-tabs__tab-label">
              <slot :name="`label-${pane.name}`">
                {{ pane.label || pane.name }}
              </slot>
            </span>

            <!-- 关闭按钮（editable 同时启用增删，与添加按钮配套） -->
            <div
              v-if="(closable || editable || pane.closable) && !pane.disabled"
              class="ex-tabs__tab-close"
              @click.stop="handleTabRemove(pane.name)"
            >
              <ExIcon
                icon="close-line"
                :size="14"
                aria-hidden="true"
              />
            </div>
          </div>

          <!-- 添加按钮 -->
          <div
            v-if="addable || editable"
            class="ex-tabs__tab ex-tabs__tab--add"
            @click="handleTabAdd"
          >
            <ExIcon
              icon="add-line"
              :size="16"
              aria-hidden="true"
            />
          </div>

          <!-- 激活指示器（无标签时不显示，避免关闭全部后残留指示条） -->
          <div
            v-if="type === 'line' && panes.length > 0"
            ref="indicatorRef"
            class="ex-tabs__indicator"
            :style="indicatorStyle"
          />
        </div>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="ex-tabs__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, provide, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import type { ExTabsProps, ExTabsEmits, ExTabsExposed } from './types';
import { generateId } from '../../utils/id';

defineOptions({
  name: 'ExTabs',
});

const props = withDefaults(defineProps<ExTabsProps>(), {
  type: 'line',
  position: 'top',
  size: 'medium',
  closable: false,
  addable: false,
  editable: false,
  animated: true,
});

const emit = defineEmits<ExTabsEmits>();

interface PaneInfo {
  name: string | number;
  label?: string;
  disabled?: boolean;
  closable?: boolean;
}

const tabsRef = ref<HTMLDivElement>();
const navRef = ref<HTMLDivElement>();
const indicatorRef = ref<HTMLDivElement>();
const panes = ref<PaneInfo[]>([]);
const activeTab = ref(props.modelValue);
// 每个 Tabs 实例唯一前缀，避免多实例间 tab/panel 的 id 冲突
const tabsUid = generateId('ex-tabs');

// 提供给子组件
provide('exTabsUid', tabsUid);
provide('activeTab', activeTab);
provide('registerPane', (pane: PaneInfo) => {
  panes.value.push(pane);
  if (!activeTab.value && !pane.disabled) {
    activeTab.value = pane.name;
  }
});
provide('unregisterPane', (name: string | number) => {
  const index = panes.value.findIndex(p => p.name === name);
  if (index > -1) {
    panes.value.splice(index, 1);
  }
});

// 计算属性
const tabsClasses = computed(() => {
  const classes = [
    'ex-tabs',
    `ex-tabs--${props.type}`,
    `ex-tabs--${props.position}`,
    `ex-tabs--${props.size}`,
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

  return classes;
};

// 漫游式 tabindex：仅激活项可被 Tab 键聚焦，其余项用方向键在 tablist 内移动（WAI-ARIA tabs 规范）
const getTabTabindex = (pane: PaneInfo) => {
  if (pane.disabled) return -1;
  return activeTab.value === pane.name ? 0 : -1;
};

const indicatorStyle = ref({});

// 更新指示器位置
const updateIndicator = async () => {
  if (props.type !== 'line' || !navRef.value) return;

  await nextTick();

  const activeTabEl = navRef.value.querySelector('.ex-tabs__tab--active') as HTMLElement;
  if (!activeTabEl) return;

  const isVertical = props.position === 'left' || props.position === 'right';

  if (isVertical) {
    indicatorStyle.value = {
      height: `${activeTabEl.offsetHeight}px`,
      transform: `translateY(${activeTabEl.offsetTop}px)`,
    };
  } else {
    indicatorStyle.value = {
      width: `${activeTabEl.offsetWidth}px`,
      transform: `translateX(${activeTabEl.offsetLeft}px)`,
    };
  }
};

// 事件处理
const handleTabClick = (pane: PaneInfo, event: MouseEvent | KeyboardEvent) => {
  if (pane.disabled) return;

  activeTab.value = pane.name;
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
    document.getElementById(`${tabsUid}-tab-${pane.name}`)?.focus();
  });
};

// 键盘导航：Enter/Space 激活；方向键在标签间移动（依据 position 决定横/纵向）；Home/End 跳首尾
const handleTabKeydown = (pane: PaneInfo, event: KeyboardEvent) => {
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
    const nextPane = panes.value[index + 1] || panes.value[index - 1];
    if (nextPane) {
      activeTab.value = nextPane.name;
      emit('update:modelValue', nextPane.name);
      emit('change', nextPane.name);
    }
  }
};

const handleTabAdd = () => {
  emit('tab-add');
};

// 监听
watch(
  () => props.modelValue,
  val => {
    activeTab.value = val;
    updateIndicator();
  }
);

watch(activeTab, () => {
  updateIndicator();
});

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
