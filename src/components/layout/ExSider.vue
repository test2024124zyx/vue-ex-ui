<template>
  <!-- 遮罩层（仅在 broken 状态且未收起时显示） -->
  <Teleport
    v-if="isBroken && !internalCollapsed"
    to="body"
  >
    <div
      class="ex-sider__mask"
      @click="handleMaskClick"
    />
  </Teleport>

  <aside
    ref="siderRef"
    :class="siderClasses"
    :style="siderStyles"
  >
    <!-- 侧边栏内容 -->
    <div class="ex-sider__content">
      <slot />
    </div>

    <!-- 收起触发器 -->
    <div
      v-if="collapsible && trigger"
      :class="['ex-sider__trigger', `ex-sider__trigger--${trigger}`]"
      :aria-label="internalCollapsed ? locale.expand : locale.collapse"
      role="button"
      tabindex="0"
      @click="handleToggle"
      @keydown.enter="handleToggle"
      @keydown.space.prevent="handleToggle"
    >
      <slot
        name="trigger"
        :collapsed="internalCollapsed"
      >
        <div class="ex-sider__trigger-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline
              v-if="position === 'left'"
              :points="internalCollapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"
            />
            <polyline
              v-else
              :points="internalCollapsed ? '15 18 9 12 15 6' : '9 18 15 12 9 6'"
            />
          </svg>
        </div>
      </slot>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { ExSiderProps, ExSiderEmits, ExSiderExposed } from './types';
import { useLocale } from '../../locale';
import { useNeonEffect, useAnimation } from '../config-provider/composables';

defineOptions({
  name: 'ExSider',
});

const props = withDefaults(defineProps<ExSiderProps>(), {
  width: 256,
  collapsedWidth: 80,
  collapsed: false,
  collapsible: false,
  trigger: 'bottom',
  position: 'left',
  neonBorder: false,
  blur: false,
  transitionDuration: 300,
});

const emit = defineEmits<ExSiderEmits>();

const siderRef = ref<HTMLElement>();
const internalCollapsed = ref(props.collapsed);
const isBroken = ref(false);

// 全局配置
const { t } = useLocale('layout');
const globalNeonEffect = useNeonEffect();
const globalAnimation = useAnimation();

// 国际化
const locale = computed(() => ({
  expand: t('sider.expand'),
  collapse: t('sider.collapse'),
}));

// 监听 collapsed prop 变化
watch(() => props.collapsed, (value) => {
  internalCollapsed.value = value;
});

// 计算类名
const siderClasses = computed(() => {
  const classes = ['ex-sider', `ex-sider--${props.position}`];

  if (internalCollapsed.value) classes.push('ex-sider--collapsed');
  // 支持全局霓虹效果配置
  if (props.neonBorder || (props.neonBorder === undefined && globalNeonEffect.value)) {
    classes.push('ex-sider--neon-border');
  }
  if (props.blur) classes.push('ex-sider--blur');
  if (isBroken.value) classes.push('ex-sider--broken');
  // 支持全局动画配置
  if (!globalAnimation.value) classes.push('ex-sider--no-animation');

  if (props.class) {
    if (typeof props.class === 'string') {
      classes.push(props.class);
    } else if (Array.isArray(props.class)) {
      classes.push(...props.class);
    } else {
      Object.entries(props.class).forEach(([key, value]) => {
        if (value) classes.push(key);
      });
    }
  }

  return classes;
});

// 计算样式
const siderStyles = computed(() => {
  const styles: Record<string, string> = {};

  // 宽度
  const width = internalCollapsed.value ? props.collapsedWidth : props.width;
  styles.width = typeof width === 'number' ? `${width}px` : width;
  styles.minWidth = styles.width;
  styles.maxWidth = styles.width;
  styles.flex = `0 0 ${styles.width}`;

  // 动画时长
  styles['--ex-sider-transition-duration'] = `${props.transitionDuration}ms`;

  // 合并用户样式
  if (props.style) {
    if (typeof props.style === 'string') {
      return `${Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join('; ')}; ${props.style}`;
    } else {
      Object.assign(styles, props.style);
    }
  }

  return styles;
});

// 切换收起状态
const handleToggle = () => {
  internalCollapsed.value = !internalCollapsed.value;
  emit('update:collapsed', internalCollapsed.value);
  emit('collapse', internalCollapsed.value, 'clickTrigger');
};

// 点击遮罩层关闭侧边栏
const handleMaskClick = () => {
  if (isBroken.value && !internalCollapsed.value) {
    internalCollapsed.value = true;
    emit('update:collapsed', true);
    emit('collapse', true, 'clickTrigger');
  }
};

// 响应式断点处理
let mediaQuery: MediaQueryList | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// 防抖处理函数
const debounce = <T extends unknown[]>(fn: (...args: T) => void, delay: number) => {
  return (...args: T) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      fn(...args);
      debounceTimer = null;
    }, delay);
  };
};

const handleBreakpoint = (e: MediaQueryListEvent | MediaQueryList) => {
  // 当屏幕宽度小于断点时，broken = true
  const broken = !e.matches;
  isBroken.value = broken;
  emit('breakpoint', broken);

  // 当断点触发时自动收起侧边栏
  if (broken && !internalCollapsed.value) {
    internalCollapsed.value = true;
    emit('update:collapsed', true);
    emit('collapse', true, 'responsive');
  }
};

// 使用防抖优化性能（150ms延迟）
const debouncedHandleBreakpoint = debounce(handleBreakpoint, 150);

onMounted(() => {
  if (props.breakpoint && typeof window !== 'undefined') {
    // 使用 max-width 查询，当屏幕小于断点时触发
    // 断点值与项目标准一致：480/768/1024/1280/1536
    const breakpoints: Record<string, string> = {
      xs: '(max-width: 479px)',    // 小于 480px 时触发
      sm: '(max-width: 767px)',    // 小于 768px 时触发
      md: '(max-width: 1023px)',   // 小于 1024px 时触发
      lg: '(max-width: 1279px)',   // 小于 1280px 时触发
      xl: '(max-width: 1535px)',   // 小于 1536px 时触发
      '2xl': '(max-width: 1919px)', // 小于 1920px 时触发
    };

    const query = breakpoints[props.breakpoint];
    if (query) {
      mediaQuery = window.matchMedia(query);
      // 初始化时不使用防抖
      handleBreakpoint(mediaQuery);
      // 后续变化使用防抖优化性能
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mediaQuery.addEventListener('change', debouncedHandleBreakpoint as any);
    }
  }
});

onUnmounted(() => {
  // 清理事件监听器
  if (mediaQuery) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mediaQuery.removeEventListener('change', debouncedHandleBreakpoint as any);
  }
  // 清理防抖定时器
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
});

// 暴露方法
const getElement = () => siderRef.value || null;
const toggle = () => handleToggle();

defineExpose<ExSiderExposed>({
  getElement,
  toggle,
});
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-sider {
  position: relative;
  background: var(--ex-color-bg-secondary);
  // 使用CSS变量控制动画时长
  transition: all var(--ex-sider-transition-duration, 300ms) var(--ex-motion-ease-out);

  // 左侧边栏
  &--left {
    border-right: 1px solid var(--ex-color-border-primary);
  }

  // 右侧边栏
  &--right {
    border-left: 1px solid var(--ex-color-border-primary);
  }

  // 内容区
  &__content {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    @include custom-scrollbar(6px);
  }

  // 触发器
  &__trigger {
    position: absolute;
    left: 0;
    right: 0;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ex-color-bg-tertiary);
    border-top: 1px solid var(--ex-color-border-primary);
    cursor: pointer;
    @include transition(all);

    &:hover {
      background: var(--ex-color-bg-hover);
      color: var(--ex-color-primary);
    }

    &--top {
      top: 0;
      border-top: none;
      border-bottom: 1px solid var(--ex-color-border-primary);
    }

    &--bottom {
      bottom: 0;
    }

    &-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 100%;
        height: 100%;
        @include transition(transform);
      }
    }
  }

  // 收起状态
  &--collapsed {
    .ex-sider__content {
      overflow: hidden;
    }
  }

  // 霓虹边框
  &--neon-border {
    &.ex-sider--left {
      border-right-color: var(--ex-color-primary);
      box-shadow: 2px 0 8px var(--ex-color-primary-alpha-20);
    }

    &.ex-sider--right {
      border-left-color: var(--ex-color-primary);
      box-shadow: -2px 0 8px var(--ex-color-primary-alpha-20);
    }
  }

  // 背景模糊
  &--blur {
    background: var(--ex-color-bg-secondary-alpha-80);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  // 响应式断点触发
  &--broken {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: var(--ex-z-overlay);
    box-shadow: var(--ex-shadow-lg);
    @include transition(transform);

    &.ex-sider--left {
      left: 0;
    }

    &.ex-sider--right {
      right: 0;
    }
  }

  // 遮罩层
  &__mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: calc(var(--ex-z-overlay) - 1);
    animation: ex-fade-in 0.3s ease;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  // 禁用动画
  &--no-animation,
  &--no-animation * {
    transition: none !important;
    animation: none !important;
  }
}

// 淡入动画
@keyframes ex-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
