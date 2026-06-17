<template>
  <Teleport to="body">
    <Transition :name="transitionName">
      <button
        v-if="isVisible && deviceAllowed"
        ref="rootRef"
        type="button"
        :class="rootClasses"
        :style="rootStyle"
        :aria-label="resolvedAriaLabel"
        @click="handleClick"
      >
        <!-- 环形进度 -->
        <svg
          v-if="showProgress && progressType === 'circle'"
          class="ex-back-top__ring"
          viewBox="0 0 48 48"
          aria-hidden="true"
        >
          <circle
            class="ex-back-top__ring-track"
            cx="24"
            cy="24"
            r="21"
            fill="none"
          />
          <circle
            class="ex-back-top__ring-bar"
            cx="24"
            cy="24"
            r="21"
            fill="none"
            :stroke-dasharray="ringCircumference"
            :stroke-dashoffset="ringOffset"
            transform="rotate(-90 24 24)"
          />
        </svg>

        <!-- 线形进度 -->
        <span
          v-else-if="showProgress && progressType === 'line'"
          class="ex-back-top__line"
          aria-hidden="true"
        >
          <span
            class="ex-back-top__line-fill"
            :style="{ width: `${scrollInfo.scrollPercent}%` }"
          />
        </span>

        <span class="ex-back-top__content">
          <slot :percent="scrollInfo.scrollPercent">
            <span class="ex-back-top__icon">
              <slot name="icon">
                <component
                  :is="icon"
                  v-if="iconIsComponent"
                />
                <ExIcon
                  v-else
                  :icon="typeof icon === 'string' ? icon : 'arrow-up-line'"
                  :size="iconSize"
                  aria-hidden="true"
                />
              </slot>
            </span>
            <span
              v-if="text"
              class="ex-back-top__text"
            >{{ text }}</span>
            <span
              v-if="showPercent"
              class="ex-back-top__percent"
            >{{ Math.round(scrollInfo.scrollPercent) }}%</span>
          </slot>
        </span>
      </button>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, isVNode, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import type { ExBackTopProps, ExBackTopEmits, ExBackTopExposed, BackTopScrollInfo } from './types';
import { resolveTarget, getScrollInfo, scrollToPosition, getPositionStyle, isMobile } from './utils';

defineOptions({
  name: 'ExBackTop',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExBackTopProps>(), {
  position: 'bottom-right',
  shape: 'circle',
  size: 'medium',
  visibilityHeight: 200,
  visibilityPercent: undefined,
  target: undefined,
  scrollBehavior: 'smooth',
  scrollDuration: 400,
  scrollTo: 0,
  offset: undefined,
  animation: 'fade',
  text: undefined,
  icon: undefined,
  showProgress: false,
  progressType: 'circle',
  showPercent: false,
  zIndex: undefined,
  showOnMobile: true,
  mobileBreakpoint: 768,
  ariaLabel: undefined,
  class: undefined,
  style: undefined,
});

const emit = defineEmits<ExBackTopEmits>();

const rootRef = ref<HTMLButtonElement>();
const isVisible = ref(false);
const scrolling = ref(false);
const scrollInfo = reactive<BackTopScrollInfo>({
  scrollTop: 0,
  scrollPercent: 0,
  scrollHeight: 0,
  clientHeight: 0,
});

let scrollTarget: HTMLElement | Window | null = null;
let rafId: number | null = null;

// ---------------------------------------------------------------------------
// 派生状态
// ---------------------------------------------------------------------------
const deviceAllowed = computed(() => props.showOnMobile || !isMobile(props.mobileBreakpoint));

const iconIsComponent = computed(() => {
  const ic = props.icon;
  return !!ic && (isVNode(ic) || typeof ic === 'function' || typeof ic === 'object');
});

const iconSize = computed(() => ({ small: 18, medium: 20, large: 24 })[props.size]);

const transitionName = computed(() =>
  props.animation === 'none' ? '' : `ex-back-top-${props.animation}`
);

const resolvedAriaLabel = computed(() => props.ariaLabel || props.text || 'Back to top');

const ringCircumference = computed(() => 2 * Math.PI * 21);
const ringOffset = computed(() => ringCircumference.value * (1 - scrollInfo.scrollPercent / 100));

const rootClasses = computed(() => [
  'ex-back-top',
  `ex-back-top--${props.shape}`,
  `ex-back-top--${props.size}`,
  {
    'ex-back-top--with-text': !!props.text,
    'ex-back-top--with-progress': props.showProgress,
  },
  ...normalizeCustomClass(props.class),
]);

const rootStyle = computed<CSSProperties>(() => {
  const base = getPositionStyle(props.position, props.offset);
  if (props.zIndex !== undefined) base.zIndex = props.zIndex;
  if (!props.style) return base;
  return typeof props.style === 'string'
    ? ({ ...base, cssText: props.style } as unknown as CSSProperties)
    : { ...base, ...props.style };
});

// ---------------------------------------------------------------------------
// 滚动监听
// ---------------------------------------------------------------------------
const computeVisible = (info: BackTopScrollInfo) =>
  props.visibilityPercent !== undefined
    ? info.scrollPercent >= props.visibilityPercent
    : info.scrollTop >= props.visibilityHeight;

const update = () => {
  if (!scrollTarget) return;
  Object.assign(scrollInfo, getScrollInfo(scrollTarget));
  const next = computeVisible(scrollInfo);
  if (next !== isVisible.value) {
    isVisible.value = next;
    emit('visibility-change', next);
  }
};

const onScroll = () => {
  if (rafId !== null) return;
  rafId = requestAnimationFrame(() => {
    rafId = null;
    update();
  });
};

const bind = () => {
  scrollTarget = resolveTarget(props.target);
  scrollTarget.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
};

const unbind = () => {
  scrollTarget?.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onScroll);
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  scrollTarget = null;
};

// ---------------------------------------------------------------------------
// 行为
// ---------------------------------------------------------------------------
const scrollToTop = async (): Promise<void> => {
  if (scrolling.value || !scrollTarget) return;
  scrolling.value = true;
  emit('scroll-start');
  try {
    await scrollToPosition(scrollTarget, props.scrollTo, props.scrollBehavior, props.scrollDuration);
  } finally {
    scrolling.value = false;
    emit('scroll-end');
  }
};

const handleClick = (event: MouseEvent) => {
  emit('click', event);
  scrollToTop();
};

const show = () => {
  if (!isVisible.value) {
    isVisible.value = true;
    emit('visibility-change', true);
  }
};

const hide = () => {
  if (isVisible.value) {
    isVisible.value = false;
    emit('visibility-change', false);
  }
};

// ---------------------------------------------------------------------------
// 生命周期
// ---------------------------------------------------------------------------
watch(
  () => props.target,
  () => {
    unbind();
    bind();
  }
);

onMounted(bind);
onBeforeUnmount(unbind);

defineExpose<ExBackTopExposed>({
  scrollToTop,
  show,
  hide,
  getElement: () => rootRef.value || null,
});
</script>

<style scoped lang="scss">
@use '../../styles/mixins' as *;

.ex-back-top {
  position: fixed;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--ex-color-border-primary);
  background: var(--ex-color-bg-secondary);
  color: var(--ex-color-text-secondary);
  box-shadow: var(--ex-shadow-md);
  cursor: pointer;
  z-index: var(--ex-z-sticky);
  transition:
    color var(--ex-motion-duration-base, 200ms) var(--ex-motion-ease-out, ease),
    border-color var(--ex-motion-duration-base, 200ms) var(--ex-motion-ease-out, ease),
    background var(--ex-motion-duration-base, 200ms) var(--ex-motion-ease-out, ease),
    box-shadow var(--ex-motion-duration-base, 200ms) var(--ex-motion-ease-out, ease),
    transform var(--ex-motion-duration-base, 200ms) var(--ex-motion-ease-out, ease);

  &:hover {
    color: var(--ex-color-primary);
    border-color: var(--ex-color-primary);
    box-shadow: 0 6px 16px var(--ex-color-primary-alpha-30);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid var(--ex-color-primary);
    outline-offset: 2px;
  }

  // 尺寸
  &--small {
    width: 40px;
    height: 40px;
  }
  &--medium {
    width: 48px;
    height: 48px;
  }
  &--large {
    width: 56px;
    height: 56px;
  }

  // 形状
  &--circle {
    border-radius: var(--ex-radius-full);
  }
  &--square {
    border-radius: 0;
  }
  &--rounded {
    border-radius: var(--ex-radius-lg);
  }

  // 带文字时纵向排布、自动宽度
  &--with-text {
    width: auto;
    min-width: 48px;
    height: auto;
    min-height: 48px;
    padding: var(--ex-spacing-2) var(--ex-spacing-3);
  }
}

.ex-back-top__content {
  position: relative;
  z-index: 1;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  line-height: 1;
}

.ex-back-top__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ex-back-top__text {
  font-size: var(--ex-text-xs);
  font-weight: var(--ex-font-medium);
  white-space: nowrap;
}

.ex-back-top__percent {
  font-size: var(--ex-text-xs);
  font-weight: var(--ex-font-semibold);
}

// 环形进度（铺满按钮）
.ex-back-top__ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.ex-back-top__ring-track {
  stroke: var(--ex-color-border-primary);
  stroke-width: 2;
}
.ex-back-top__ring-bar {
  stroke: var(--ex-color-primary);
  stroke-width: 2;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--ex-motion-duration-base, 200ms) linear;
}

// 线形进度（按钮底部）
.ex-back-top__line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  overflow: hidden;
  background: var(--ex-color-border-primary);
  pointer-events: none;
}
.ex-back-top__line-fill {
  display: block;
  height: 100%;
  background: var(--ex-color-primary);
  transition: width var(--ex-motion-duration-base, 200ms) linear;
}

// ---- 过渡动画 ----
.ex-back-top-fade-enter-active,
.ex-back-top-fade-leave-active,
.ex-back-top-slide-enter-active,
.ex-back-top-slide-leave-active,
.ex-back-top-zoom-enter-active,
.ex-back-top-zoom-leave-active {
  transition:
    opacity var(--ex-motion-duration-base, 200ms) var(--ex-motion-ease-out, ease),
    transform var(--ex-motion-duration-base, 200ms) var(--ex-motion-ease-out, ease);
}

.ex-back-top-fade-enter-from,
.ex-back-top-fade-leave-to {
  opacity: 0;
}

.ex-back-top-slide-enter-from,
.ex-back-top-slide-leave-to {
  opacity: 0;
  transform: translateY(16px);
}

.ex-back-top-zoom-enter-from,
.ex-back-top-zoom-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

@media (prefers-reduced-motion: reduce) {
  .ex-back-top,
  .ex-back-top__ring-bar,
  .ex-back-top__line-fill {
    transition: none;
  }
}

@media print {
  .ex-back-top {
    display: none !important;
  }
}
</style>
