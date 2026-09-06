<template>
  <Transition
    name="ex-notification-fade"
    @after-leave="handleAfterLeave"
  >
    <div
      v-show="visible"
      ref="notificationRef"
      :class="notificationClasses"
      :style="notificationStyles"
      :data-theme="configTheme"
      :role="liveRole"
      :aria-live="ariaLive"
      aria-atomic="true"
      :tabindex="hasClickHandler ? 0 : undefined"
      @click="handleClick"
      @keydown.enter="handleKeyboardClick"
      @keydown.space.prevent="handleKeyboardClick"
      @mouseenter="pauseTimer('hover')"
      @mouseleave="resumeTimer('hover')"
      @focusin="pauseTimer('focus')"
      @focusout="handleFocusOut"
    >
      <div
        v-if="showIcon"
        class="ex-notification__icon"
        :class="iconClasses"
        aria-hidden="true"
      >
        <slot name="icon">
          <ExIcon
            :icon="defaultIcon"
            :size="24"
            aria-hidden="true"
          />
        </slot>
      </div>

      <div class="ex-notification__content">
        <div
          v-if="title || $slots.title"
          class="ex-notification__title"
        >
          <slot name="title">{{ title }}</slot>
        </div>

        <div
          v-if="content || $slots.default"
          class="ex-notification__description"
        >
          <slot>
            <!-- HTML 模式只渲染经过白名单消毒的结果。 -->
            <!-- eslint-disable vue/no-v-html -->
            <span
              v-if="dangerouslyUseHTMLString"
              v-html="sanitizedContent"
            ></span>
            <!-- eslint-enable vue/no-v-html -->
            <span v-else>{{ content }}</span>
          </slot>
        </div>
      </div>

      <button
        v-if="closable"
        type="button"
        class="ex-notification__close"
        :aria-label="t('close')"
        @click.stop="close"
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
import { computed, getCurrentInstance, onMounted, onUnmounted, ref, watch } from 'vue';
import { useLocale } from '../../locale';
import { sanitizeHtml } from '../../utils/sanitize';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useThemeOverrides,
} from '../config-provider/composables';
import ExIcon from '../icon/ExIcon.vue';
import type {
  ExNotificationEmits,
  ExNotificationExposed,
  ExNotificationProps,
  ExNotificationSlots,
  NotificationType,
} from './types';

defineOptions({
  name: 'ExNotification',
});

defineSlots<ExNotificationSlots>();

const props = withDefaults(defineProps<ExNotificationProps>(), {
  type: 'info',
  title: '',
  content: '',
  showIcon: true,
  closable: true,
  duration: 4500,
  customClass: '',
  customStyle: undefined,
  zIndex: undefined,
  offset: 16,
  position: 'top-right',
  dangerouslyUseHTMLString: false,
});
const emit = defineEmits<ExNotificationEmits>();
const componentInstance = getCurrentInstance();
const { t } = useLocale('notification');
const configTheme = useConfigTheme();
const themeOverrides = useThemeOverrides();
const animationEnabled = useAnimation();
const neonEnabled = useNeonEffect();
const notificationRef = ref<HTMLElement | null>(null);
const visible = ref(false);

const defaultIconMap: Record<NotificationType, string> = {
  info: 'information-line',
  success: 'checkbox-circle-line',
  warning: 'error-warning-line',
  error: 'close-circle-line',
};

const defaultIcon = computed(() => defaultIconMap[props.type]);
const liveRole = computed(() => (props.type === 'error' ? 'alert' : 'status'));
const ariaLive = computed(() => (props.type === 'error' ? 'assertive' : 'polite'));
const hasClickHandler = computed(() => Boolean(componentInstance?.vnode.props?.onClick));
const sanitizedContent = computed(() =>
  props.dangerouslyUseHTMLString ? sanitizeHtml(props.content) : props.content
);
const notificationClasses = computed(() => [
  'ex-notification',
  `ex-notification--${props.type}`,
  `ex-notification--${props.position}`,
  {
    'ex-notification--closable': props.closable,
    'ex-notification--clickable': hasClickHandler.value,
    'ex-notification--no-animation': !animationEnabled.value,
    'ex-notification--no-neon': !neonEnabled.value,
  },
  props.customClass,
]);
const iconClasses = computed(() => [`ex-notification__icon--${props.type}`]);
const notificationStyles = computed<Record<string, string>>(() => {
  const styles: Record<string, string> = { ...themeOverrides.value };
  if (props.zIndex !== undefined) styles.zIndex = String(props.zIndex);
  if (props.customStyle) Object.assign(styles, props.customStyle);
  return styles;
});

let timer: number | undefined;
let startedAt = 0;
let remaining = props.duration;
type PauseReason = 'hover' | 'focus';
const pauseReasons = new Set<PauseReason>();

const isTimerPaused = (): boolean => pauseReasons.size > 0;

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
  if (typeof window === 'undefined' || !visible.value || isTimerPaused() || remaining <= 0) return;
  startedAt = Date.now();
  timer = window.setTimeout(() => {
    timer = undefined;
    close();
  }, remaining);
};

const pauseTimer = (reason: PauseReason): void => {
  if (pauseReasons.has(reason)) return;
  const wasPaused = isTimerPaused();
  pauseReasons.add(reason);
  if (wasPaused) return;
  if (timer === undefined || typeof window === 'undefined') return;
  window.clearTimeout(timer);
  timer = undefined;
  remaining = Math.max(0, remaining - (Date.now() - startedAt));
};

const resumeTimer = (reason: PauseReason): void => {
  if (!pauseReasons.delete(reason) || isTimerPaused()) return;
  startTimer();
};

const handleFocusOut = (event: FocusEvent): void => {
  if (event.relatedTarget instanceof Node && notificationRef.value?.contains(event.relatedTarget)) {
    return;
  }
  resumeTimer('focus');
};

const handleClick = (): void => {
  if (hasClickHandler.value) emit('click');
};

const handleKeyboardClick = (): void => {
  if (hasClickHandler.value) emit('click');
};

watch(
  () => props.duration,
  duration => {
    remaining = duration;
    if (!isTimerPaused()) startTimer();
  }
);

const handleAfterLeave = (): void => emit('destroy');

onMounted(() => {
  visible.value = true;
  remaining = props.duration;
  startTimer();
});
onUnmounted(clearTimer);

defineExpose<ExNotificationExposed>({
  close,
  isVisible: () => visible.value,
  getElement: () => notificationRef.value,
});
</script>

<style scoped lang="scss" src="./ExNotification.scss"></style>
