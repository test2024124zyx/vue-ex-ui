<template>
  <Teleport
    v-if="isOverlayVisible"
    to="body"
  >
    <button
      type="button"
      class="ex-sider__mask"
      :data-theme="configTheme"
      :class="{ 'is-no-animation': !globalAnimation }"
      :style="maskStyles"
      :aria-label="locale.collapse"
      @click="requestCollapsed(true, 'mask')"
    ></button>
  </Teleport>

  <aside
    v-bind="$attrs"
    ref="siderRef"
    :class="siderClasses"
    :style="siderStyles"
    :aria-label="resolvedAriaLabel"
    :role="isOverlayVisible ? 'dialog' : undefined"
    :aria-modal="isOverlayVisible ? 'true' : undefined"
    :hidden="isOverlayOpen && !isOverlayVisible"
    :tabindex="isOverlayVisible ? -1 : undefined"
  >
    <div
      :id="contentId"
      class="ex-sider__content"
      :hidden="isZeroWidth"
      :inert="isZeroWidth ? true : undefined"
    >
      <slot></slot>
    </div>

    <button
      v-if="collapsible && trigger"
      type="button"
      :class="['ex-sider__trigger', `ex-sider__trigger--${trigger}`]"
      :aria-label="collapsed ? locale.expand : locale.collapse"
      :aria-expanded="!collapsed"
      :aria-controls="contentId"
      @click="toggle"
    >
      <slot
        name="trigger"
        :collapsed="collapsed"
        :broken="isBroken"
      >
        <span
          class="ex-sider__trigger-icon"
          aria-hidden="true"
        >
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
              :points="collapsed ? '9 18 15 12 9 6' : '15 18 9 12 15 6'"
            />
            <polyline
              v-else
              :points="collapsed ? '15 18 9 12 15 6' : '9 18 15 12 9 6'"
            />
          </svg>
        </span>
      </slot>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useOverlay } from '../../composables/useOverlay';
import { useControllableState } from '../../composables/useControllableState';
import { useLocale } from '../../locale';
import { generateId } from '../../utils/id';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
  useThemeOverrides,
} from '../config-provider/composables';
import { layoutContextKey } from './context';
import {
  getSiderBreakpointQuery,
  isZeroLayoutLength,
  normalizeLayoutLength,
  normalizeTransitionDuration,
} from './layout-utils';
import type { ExSiderEmits, ExSiderExposed, ExSiderProps, SiderCollapseSource } from './types';

defineOptions({
  name: 'ExSider',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExSiderProps>(), {
  width: 256,
  collapsedWidth: 80,
  collapsed: undefined,
  defaultCollapsed: false,
  collapsible: false,
  trigger: 'bottom',
  position: 'left',
  neonBorder: undefined,
  blur: false,
  transitionDuration: 300,
  ariaLabel: '',
});
const emit = defineEmits<ExSiderEmits>();

const siderRef = ref<HTMLElement>();
const isBroken = ref(false);
const contentId = generateId('ex-sider-content');
const layoutContext = inject(layoutContextKey, null);
const { t } = useLocale('layout');
const globalNeonEffect = useNeonEffect();
const globalAnimation = useAnimation();
const configTheme = useConfigTheme();
const overlayZIndex = useZIndexLayer('overlay');
const themeOverrides = useThemeOverrides();

// 未传 collapsed 时由内部状态管理；受控模式只向外请求变更。
const collapsedState = useControllableState<boolean>({
  controlledValue: () => props.collapsed,
  defaultValue: () => props.defaultCollapsed,
  onChange: value => emit('update:collapsed', value),
});
const collapsed = collapsedState.value;
const isOverlayOpen = computed(() => isBroken.value && !collapsed.value);

const locale = computed(() => ({
  label: t('sider.label'),
  expand: t('sider.expand'),
  collapse: t('sider.collapse'),
}));
const resolvedAriaLabel = computed(() => props.ariaLabel.trim() || locale.value.label);
const activeWidth = computed(() =>
  normalizeLayoutLength(
    collapsed.value ? props.collapsedWidth : props.width,
    collapsed.value ? 80 : 256
  )
);
const isZeroWidth = computed(() => collapsed.value && isZeroLayoutLength(activeWidth.value));

const siderClasses = computed(() => [
  'ex-sider',
  `ex-sider--${props.position}`,
  {
    'ex-sider--collapsed': collapsed.value,
    'ex-sider--broken': isBroken.value,
    'ex-sider--zero-width': isZeroWidth.value,
    'ex-sider--neon-border': props.neonBorder ?? globalNeonEffect.value,
    'ex-sider--blur': props.blur,
    'ex-sider--no-animation': !globalAnimation.value,
    [`ex-sider--trigger-${props.trigger}`]: props.collapsible && Boolean(props.trigger),
  },
]);
const siderStyles = computed<Record<string, string>>(() => {
  const styles: Record<string, string> = {
    ...themeOverrides.value,
    '--ex-sider-width': activeWidth.value,
    '--ex-sider-transition-duration':
      normalizeTransitionDuration(props.transitionDuration, 300) + 'ms',
  };
  if (isBroken.value) styles.zIndex = String(overlay.zIndex.value);
  return styles;
});
const maskStyles = computed<Record<string, string>>(() => ({
  ...themeOverrides.value,
  zIndex: String(overlay.zIndex.value - 1),
}));

const requestCollapsed = (value: boolean, source: SiderCollapseSource): void => {
  if (source !== 'responsive') collapsedByResponsive = false;
  if (value === collapsed.value) return;
  collapsedState.request(value);
  emit('collapse', value, source);
};

const toggle = (): void => requestCollapsed(!collapsed.value, 'trigger');
const overlay = useOverlay({
  active: () => isOverlayOpen.value,
  scopeActive: () => !isBroken.value || !collapsed.value,
  container: siderRef,
  zIndex: () => overlayZIndex.value,
  onEscape: () => requestCollapsed(true, 'mask'),
  restoreFocus: true,
});
const isOverlayVisible = overlay.active;

let mediaQuery: MediaQueryList | null = null;
let mediaChangeListener: ((event: MediaQueryListEvent) => void) | null = null;
let breakpointInitialized = false;
let mounted = false;
let unregisterSider: (() => void) | null = null;
let collapsedByResponsive = false;

const detachMediaQuery = (): void => {
  if (mediaQuery && mediaChangeListener) {
    if (typeof mediaQuery.removeEventListener === 'function') {
      mediaQuery.removeEventListener('change', mediaChangeListener);
    } else {
      mediaQuery.removeListener(mediaChangeListener);
    }
  }
  mediaQuery = null;
  mediaChangeListener = null;
  breakpointInitialized = false;
};

const applyBreakpointMatches = (matches: boolean): void => {
  const broken = !matches;
  if (breakpointInitialized && broken === isBroken.value) return;
  breakpointInitialized = true;
  isBroken.value = broken;
  emit('breakpoint', broken);
  if (broken && !collapsed.value) {
    collapsedByResponsive = true;
    requestCollapsed(true, 'responsive');
  } else if (!broken && collapsedByResponsive) {
    collapsedByResponsive = false;
    requestCollapsed(false, 'responsive');
  }
};

const setupBreakpoint = (): void => {
  const wasBroken = isBroken.value;
  detachMediaQuery();

  if (
    !props.breakpoint ||
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    if (wasBroken) {
      isBroken.value = false;
      emit('breakpoint', false);
    }
    return;
  }

  const query = getSiderBreakpointQuery(props.breakpoint);
  if (!query) return;
  mediaQuery = window.matchMedia(query);
  applyBreakpointMatches(mediaQuery.matches);
  mediaChangeListener = event => applyBreakpointMatches(event.matches);
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', mediaChangeListener);
  } else {
    mediaQuery.addListener(mediaChangeListener);
  }
};

watch(
  () => props.breakpoint,
  () => {
    if (mounted) setupBreakpoint();
  }
);

onMounted(() => {
  mounted = true;
  unregisterSider = layoutContext?.registerSider() ?? null;
  setupBreakpoint();
});

onBeforeUnmount(() => {
  mounted = false;
  detachMediaQuery();
  unregisterSider?.();
  unregisterSider = null;
});

const getElement = (): HTMLElement | null => siderRef.value ?? null;

defineExpose<ExSiderExposed>({ getElement, toggle });
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-sider {
  position: relative;
  box-sizing: border-box;
  flex: 0 0 var(--ex-sider-width);
  width: var(--ex-sider-width);
  min-width: var(--ex-sider-width);
  max-width: var(--ex-sider-width);
  min-height: 0;
  overflow: visible;
  background: var(--ex-color-bg-secondary);
  transition:
    width var(--ex-sider-transition-duration) var(--ex-motion-ease-out),
    min-width var(--ex-sider-transition-duration) var(--ex-motion-ease-out),
    max-width var(--ex-sider-transition-duration) var(--ex-motion-ease-out),
    flex-basis var(--ex-sider-transition-duration) var(--ex-motion-ease-out),
    transform var(--ex-sider-transition-duration) var(--ex-motion-ease-out);

  &--left {
    order: 0;
    border-right: 1px solid var(--ex-color-border-primary);
  }

  &--right {
    order: 1;
    border-left: 1px solid var(--ex-color-border-primary);
  }

  &__content {
    box-sizing: border-box;
    height: 100%;
    overflow: auto;
    @include custom-scrollbar(6px);
  }

  &--trigger-top &__content {
    padding-top: 48px;
  }

  &--trigger-bottom &__content {
    padding-bottom: 48px;
  }

  &__trigger {
    position: absolute;
    right: 0;
    left: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 48px;
    padding: 0;
    color: var(--ex-color-text-secondary);
    background: var(--ex-color-bg-tertiary);
    border: 0;
    border-top: 1px solid var(--ex-color-border-primary);
    cursor: pointer;
    transition:
      color var(--ex-motion-duration-fast) var(--ex-motion-ease-in-out),
      background-color var(--ex-motion-duration-fast) var(--ex-motion-ease-in-out);

    &:hover {
      color: var(--ex-color-primary);
      background: var(--ex-color-bg-hover);
    }

    &:focus-visible {
      outline: 2px solid var(--ex-color-primary);
      outline-offset: -3px;
    }

    &--top {
      top: 0;
      border-top: 0;
      border-bottom: 1px solid var(--ex-color-border-primary);
    }

    &--bottom {
      bottom: 0;
    }
  }

  &__trigger-icon {
    display: inline-flex;
    width: 20px;
    height: 20px;
    align-items: center;
    justify-content: center;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &--collapsed &__content {
    overflow: hidden;
  }

  &--zero-width &__trigger {
    width: 40px;
    height: 40px;
    border: 1px solid var(--ex-color-border-primary);
    border-radius: 0 var(--ex-radius-base) var(--ex-radius-base) 0;
  }

  &--zero-width.ex-sider--left &__trigger {
    right: -40px;
    left: auto;
  }

  &--zero-width.ex-sider--right &__trigger {
    right: auto;
    left: -40px;
    border-radius: var(--ex-radius-base) 0 0 var(--ex-radius-base);
  }

  &--neon-border.ex-sider--left {
    border-right-color: var(--ex-color-primary);
    box-shadow: 2px 0 8px var(--ex-color-primary-alpha-20);
  }

  &--neon-border.ex-sider--right {
    border-left-color: var(--ex-color-primary);
    box-shadow: -2px 0 8px var(--ex-color-primary-alpha-20);
  }

  &--blur {
    background: var(--ex-color-bg-secondary-alpha-80);
    backdrop-filter: blur(12px);
  }

  &--broken {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: var(--ex-z-overlay);
    box-shadow: var(--ex-shadow-lg);
  }

  &--broken.ex-sider--left {
    left: 0;
  }

  &--broken.ex-sider--right {
    right: 0;
  }

  &--no-animation {
    transition: none;
  }
}

.ex-sider__mask {
  position: fixed;
  inset: 0;
  z-index: calc(var(--ex-z-overlay) - 1);
  width: 100%;
  height: 100%;
  padding: 0;
  background: var(--ex-color-black-alpha-50);
  border: 0;
  cursor: default;
  animation: ex-sider-mask-in var(--ex-motion-duration-base) var(--ex-motion-ease-out);
  backdrop-filter: blur(4px);

  &.is-no-animation {
    animation: none;
  }

  &:focus-visible {
    outline: 2px solid var(--ex-color-primary);
    outline-offset: -2px;
  }
}

@keyframes ex-sider-mask-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ex-sider,
  .ex-sider__mask {
    transition: none;
    animation: none;
  }
}
</style>
