<template>
  <Teleport
    :to="teleportTarget"
    :disabled="!shouldTeleport"
  >
    <Transition name="ex-loading-fade">
      <div
        v-if="visible"
        ref="loadingRef"
        v-bind="rootAttrs"
        :class="loadingClasses"
        :data-theme="configTheme"
        :style="loadingStyles"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-busy="true"
        :aria-label="accessibleLabel"
      >
        <div
          v-if="mask"
          class="ex-loading__mask"
          aria-hidden="true"
          @click="handleMaskClick"
        ></div>

        <div class="ex-loading__content">
          <div
            class="ex-loading__spinner"
            aria-hidden="true"
          >
            <slot name="spinner">
              <div
                v-if="normalizedType === 'spinner'"
                class="ex-loading__spinner-circle"
              >
                <svg viewBox="0 0 50 50">
                  <circle
                    cx="25"
                    cy="25"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-dasharray="31.4 31.4"
                  />
                </svg>
              </div>

              <div
                v-else-if="normalizedType === 'dots'"
                class="ex-loading__dots"
              >
                <span class="ex-loading__dot"></span>
                <span class="ex-loading__dot"></span>
                <span class="ex-loading__dot"></span>
              </div>

              <div
                v-else-if="normalizedType === 'pulse'"
                class="ex-loading__pulse"
              >
                <span class="ex-loading__pulse-ring"></span>
                <span class="ex-loading__pulse-ring"></span>
                <span class="ex-loading__pulse-ring"></span>
              </div>

              <div
                v-else-if="normalizedType === 'bars'"
                class="ex-loading__bars"
              >
                <span class="ex-loading__bar"></span>
                <span class="ex-loading__bar"></span>
                <span class="ex-loading__bar"></span>
                <span class="ex-loading__bar"></span>
              </div>

              <div
                v-else
                class="ex-loading__neon"
              >
                <span class="ex-loading__neon-ring"></span>
              </div>
            </slot>
          </div>

          <div
            v-if="text || slots.default"
            class="ex-loading__text"
          >
            <slot>{{ text }}</slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, useAttrs, useSlots, watch } from 'vue';
import { lockDocumentScroll, unlockDocumentScroll } from '../../composables/overlay-manager';
import { useLocale } from '../../locale';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
} from '../config-provider/composables';
import {
  acquireLoadingTargetPosition,
  normalizeLoadingColor,
  normalizeLoadingSize,
  normalizeLoadingType,
  normalizeLoadingZIndex,
  resolveLoadingTarget,
} from './loading-utils';
import type { ExLoadingEmits, ExLoadingExposed, ExLoadingProps } from './types';

defineOptions({
  name: 'ExLoading',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExLoadingProps>(), {
  visible: true,
  type: 'spinner',
  size: 'medium',
  fullscreen: false,
  mask: true,
  maskClosable: false,
  lockScroll: true,
});
const emit = defineEmits<ExLoadingEmits>();
const attrs = useAttrs();
const slots = useSlots();
const { t } = useLocale('loading');
const configTheme = useConfigTheme();
const animationEnabled = useAnimation();
const neonEnabled = useNeonEffect();
const overlayZIndex = useZIndexLayer('overlay');
const modalZIndex = useZIndexLayer('modal');

const OBSOLETE_ATTRS = new Set([
  'loading',
  'theme',
  'position',
  'animation',
  'minduration',
  'maxduration',
  'disableanimation',
  'showpercentage',
  'percentage',
  'showtime',
  'cancelable',
  'showdetails',
  'autohide',
  'autohidedelay',
  'closable',
  'draggable',
  'arialabel',
]);

const rootAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => {
      if (key === 'aria-label') return true;
      // 使用正则兼容组件库当前的 ES 构建目标，同时识别 kebab-case 旧属性。
      return !OBSOLETE_ATTRS.has(key.replace(/-/g, '').toLowerCase());
    })
  )
);

const loadingRef = shallowRef<HTMLDivElement | null>(null);
const resolvedTarget = shallowRef<HTMLElement | null>(null);
const isMounted = shallowRef(false);
const normalizedType = computed(() => normalizeLoadingType(props.type));
const normalizedSize = computed(() => normalizeLoadingSize(props.size));

const loadingClasses = computed(() => [
  'ex-loading',
  `ex-loading--${normalizedType.value}`,
  `ex-loading--${normalizedSize.value}`,
  {
    'ex-loading--fullscreen': props.fullscreen,
    'ex-loading--no-mask': !props.mask,
    'ex-loading--no-animation': !animationEnabled.value,
    'ex-loading--no-neon': !neonEnabled.value,
  },
]);

const loadingStyles = computed<Record<string, string>>(() => {
  const styles: Record<string, string> = {};
  const color = normalizeLoadingColor(props.color);
  const zIndex = normalizeLoadingZIndex(props.zIndex);
  if (color) styles['--ex-loading-color'] = color;
  styles['--ex-loading-z-index'] = String(
    zIndex ?? (props.fullscreen ? modalZIndex.value : overlayZIndex.value)
  );
  return styles;
});

const accessibleLabel = computed(() => {
  const nativeLabel = attrs['aria-label'];
  if (typeof nativeLabel === 'string' && nativeLabel.trim()) return nativeLabel.trim();
  return props.text?.trim() || t('loading');
});

const canUseDom = (): boolean => typeof document !== 'undefined';
const shouldTeleport = computed(
  () => isMounted.value && canUseDom() && (props.fullscreen || resolvedTarget.value !== null)
);
const teleportTarget = computed<string | HTMLElement>(() =>
  props.fullscreen ? 'body' : (resolvedTarget.value ?? 'body')
);

let releaseTargetPosition: (() => void) | null = null;
const syncTarget = (): void => {
  releaseTargetPosition?.();
  releaseTargetPosition = null;
  if (!isMounted.value) {
    resolvedTarget.value = null;
    return;
  }
  resolvedTarget.value = props.fullscreen ? null : resolveLoadingTarget(props.target);
  if (props.visible && resolvedTarget.value) {
    releaseTargetPosition = acquireLoadingTargetPosition(resolvedTarget.value);
  }
};

let holdsScrollLock = false;
const syncScrollLock = (): void => {
  const shouldLock =
    isMounted.value && props.visible && props.fullscreen && props.mask && props.lockScroll;
  if (shouldLock && !holdsScrollLock) {
    lockDocumentScroll();
    holdsScrollLock = true;
  } else if (!shouldLock && holdsScrollLock) {
    unlockDocumentScroll();
    holdsScrollLock = false;
  }
};

watch([() => props.target, () => props.fullscreen, () => props.visible], syncTarget, {
  immediate: true,
});
watch(
  [() => props.visible, () => props.fullscreen, () => props.mask, () => props.lockScroll],
  syncScrollLock,
  { immediate: true }
);

onMounted(() => {
  // 服务端与客户端首屏都先原位渲染，挂载后再迁移，避免 hydration 分支不一致。
  isMounted.value = true;
  syncTarget();
  syncScrollLock();
});

onBeforeUnmount(() => {
  isMounted.value = false;
  releaseTargetPosition?.();
  releaseTargetPosition = null;
  if (holdsScrollLock) {
    unlockDocumentScroll();
    holdsScrollLock = false;
  }
});

const requestClose = (): void => {
  if (!props.visible) return;
  emit('update:visible', false);
  emit('close');
};

const handleMaskClick = (): void => {
  if (props.maskClosable) requestClose();
};

const getElement = (): HTMLDivElement | null => loadingRef.value;

defineExpose<ExLoadingExposed>({
  getElement,
  close: requestClose,
});
</script>

<style scoped lang="scss" src="./ExLoading.scss"></style>
