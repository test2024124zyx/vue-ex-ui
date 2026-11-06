<template>
  <Transition
    name="ex-message-fade"
    @after-leave="handleAfterLeave"
  >
    <div
      v-show="visible"
      ref="messageRef"
      :style="themeOverrides"
      v-bind="rootAttrs"
      :class="messageClasses"
      :data-theme="configTheme"
      :role="liveRole"
      :aria-live="ariaLive"
      aria-atomic="true"
      @mouseenter="pauseTimer('hover')"
      @mouseleave="resumeTimer('hover')"
      @focusin="pauseTimer('focus')"
      @focusout="handleFocusOut"
    >
      <span
        v-if="props.showIcon"
        class="ex-message__icon"
        :class="{ 'ex-message__icon-loading': props.type === 'loading' }"
        aria-hidden="true"
      >
        <slot name="icon">
          <ExIcon
            :icon="defaultIcon"
            :size="20"
          />
        </slot>
      </span>

      <span class="ex-message__content">
        <slot>
          <!-- HTML 模式只渲染经过白名单消毒的结果。 -->
          <!-- eslint-disable vue/no-v-html -->
          <span
            v-if="props.dangerouslyUseHTMLString"
            v-html="sanitizedContent"
          ></span>
          <!-- eslint-enable vue/no-v-html -->
          <span v-else>{{ props.content }}</span>
        </slot>
      </span>

      <button
        v-if="props.closable"
        type="button"
        class="ex-message__close"
        :aria-label="t('close')"
        @click="close"
      >
        <slot name="close">
          <ExIcon
            icon="close-line"
            :size="16"
            aria-hidden="true"
          />
        </slot>
      </button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, useAttrs, watch } from 'vue';
import { useLocale } from '../../locale';
import { sanitizeHtml } from '../../utils/sanitize';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useThemeOverrides,
} from '../config-provider/composables';
import ExIcon from '../icon/ExIcon.vue';
import { normalizeMessageDuration, normalizeMessageType } from './message-utils';
import type {
  ExMessageEmits,
  ExMessageExposed,
  ExMessageProps,
  ExMessageSlots,
  MessageType,
} from './types';

defineOptions({
  name: 'ExMessage',
  inheritAttrs: false,
});

defineSlots<ExMessageSlots>();

const props = withDefaults(defineProps<ExMessageProps>(), {
  type: 'info',
  content: '',
  showIcon: true,
  closable: false,
  duration: 3000,
  dangerouslyUseHTMLString: false,
});
const emit = defineEmits<ExMessageEmits>();
const attrs = useAttrs();
const { t } = useLocale('message');
const configTheme = useConfigTheme();
const themeOverrides = useThemeOverrides();
const animationEnabled = useAnimation();
const neonEnabled = useNeonEffect();
const messageRef = ref<HTMLElement | null>(null);
const visible = ref(false);
const normalizedType = computed(() => normalizeMessageType(props.type));
const normalizedDuration = computed(() => normalizeMessageDuration(props.duration));

const defaultIconMap: Record<MessageType, string> = {
  info: 'information-line',
  success: 'checkbox-circle-line',
  warning: 'error-warning-line',
  error: 'close-circle-line',
  loading: 'loader-4-line',
};

const defaultIcon = computed(() => defaultIconMap[normalizedType.value]);
const liveRole = computed(() => (normalizedType.value === 'error' ? 'alert' : 'status'));
const ariaLive = computed(() => (normalizedType.value === 'error' ? 'assertive' : 'polite'));
const sanitizedContent = computed(() =>
  props.dangerouslyUseHTMLString ? sanitizeHtml(props.content) : props.content
);
const messageClasses = computed(() => [
  'ex-message',
  `ex-message--${normalizedType.value}`,
  { 'ex-message--closable': props.closable },
  { 'ex-message--no-animation': !animationEnabled.value },
  { 'ex-message--no-neon': !neonEnabled.value },
]);

const OBSOLETE_ATTRS = new Set([
  'customclass',
  'customstyle',
  'offset',
  'zindex',
  'closeonroutechange',
  'grouping',
  'position',
]);
const rootAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => {
      const normalizedKey = key.replace(/-/g, '').toLowerCase();
      return (
        key !== 'role' &&
        key !== 'aria-live' &&
        key !== 'aria-atomic' &&
        !OBSOLETE_ATTRS.has(normalizedKey)
      );
    })
  )
);

let timer: number | undefined;
let startedAt = 0;
let remaining = normalizedDuration.value;
type PauseReason = 'hover' | 'focus';
const pauseReasons = new Set<PauseReason>();

const clearTimer = (): void => {
  if (timer === undefined || typeof window === 'undefined') return;
  window.clearTimeout(timer);
  timer = undefined;
};

const close = (): boolean => {
  if (!visible.value) return false;
  clearTimer();
  visible.value = false;
  emit('close');
  return true;
};

const startTimer = (): void => {
  clearTimer();
  if (typeof window === 'undefined' || !visible.value || pauseReasons.size > 0 || remaining <= 0) {
    return;
  }

  startedAt = Date.now();
  timer = window.setTimeout(() => {
    timer = undefined;
    close();
  }, remaining);
};

const pauseTimer = (reason: PauseReason): void => {
  if (pauseReasons.has(reason)) return;
  const wasPaused = pauseReasons.size > 0;
  pauseReasons.add(reason);
  if (wasPaused) return;
  if (timer === undefined || typeof window === 'undefined') return;
  window.clearTimeout(timer);
  timer = undefined;
  remaining = Math.max(0, remaining - (Date.now() - startedAt));
};

const resumeTimer = (reason: PauseReason): void => {
  if (!pauseReasons.delete(reason) || pauseReasons.size > 0) return;
  startTimer();
};

const handleFocusOut = (event: FocusEvent): void => {
  if (event.relatedTarget instanceof Node && messageRef.value?.contains(event.relatedTarget))
    return;
  resumeTimer('focus');
};

watch(normalizedDuration, duration => {
  remaining = duration;
  if (pauseReasons.size === 0) startTimer();
});

const handleAfterLeave = (): void => emit('destroy');

onMounted(() => {
  visible.value = true;
  remaining = normalizedDuration.value;
  startTimer();
});

onUnmounted(clearTimer);

defineExpose<ExMessageExposed>({
  close,
  isVisible: () => visible.value,
  getElement: () => messageRef.value,
});
</script>

<style scoped lang="scss" src="./ExMessage.scss"></style>
