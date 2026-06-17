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
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
      @click="handleClick"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <!-- 图标 -->
      <div
        v-if="showIcon"
        class="ex-notification__icon"
        :class="iconClasses"
      >
        <slot name="icon">
          <ExIcon
            :icon="defaultIcon"
            :size="24"
            aria-hidden="true"
          />
        </slot>
      </div>

      <!-- 内容区域 -->
      <div class="ex-notification__content">
        <!-- 标题 -->
        <div
          v-if="title"
          class="ex-notification__title"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </div>

        <!-- 描述内容 -->
        <div
          v-if="content"
          class="ex-notification__description"
        >
          <slot>
            <!-- dangerouslyUseHTMLString 由用户显式开启；内容已经 sanitizeHtml 消毒，防止 XSS。 -->
            <!-- eslint-disable vue/no-v-html -->
            <span
              v-if="dangerouslyUseHTMLString"
              v-html="sanitizedContent"
            />
            <!-- eslint-enable vue/no-v-html -->
            <span v-else>{{ content }}</span>
          </slot>
        </div>
      </div>

      <!-- 关闭按钮 -->
      <div
        v-if="closable"
        class="ex-notification__close"
        role="button"
        tabindex="0"
        :aria-label="t('notification.close')"
        @click.stop="handleClose"
        @keydown.enter="handleClose"
        @keydown.space.prevent="handleClose"
      >
        <slot name="close">
          <ExIcon
            icon="close-line"
            :size="16"
            aria-hidden="true"
          />
        </slot>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { ExNotificationProps, ExNotificationEmits } from './types';
import { useI18n } from '../../locale';
import { sanitizeHtml } from '../../utils/sanitize';
import ExIcon from '../icon/ExIcon.vue';

defineOptions({
  name: 'ExNotification',
});

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
  onClose: undefined,
  onClick: undefined,
});

const emit = defineEmits<ExNotificationEmits>();

const { t } = useI18n();

// 组件引用
const notificationRef = ref<HTMLElement>();
// 可见状态
const visible = ref(false);
// 定时器 + 剩余时长跟踪（用于悬停暂停 / 移出恢复）
let timer: number | undefined;
let startedAt = 0;
let remaining = props.duration;

// 默认图标映射（内置 SVG 图标名）
const defaultIconMap: Record<string, string> = {
  info: 'information-line',
  success: 'checkbox-circle-line',
  warning: 'error-warning-line',
  error: 'close-circle-line',
};

// 默认图标名
const defaultIcon = computed(() => {
  return defaultIconMap[props.type];
});

// 消毒后的 HTML 内容（防止 XSS 攻击）
const sanitizedContent = computed(() => {
  if (props.dangerouslyUseHTMLString && props.content) {
    return sanitizeHtml(props.content);
  }
  return props.content;
});

// 计算样式类
const notificationClasses = computed(() => {
  const classes = [
    'ex-notification',
    `ex-notification--${props.type}`,
    `ex-notification--${props.position}`,
  ];

  if (props.closable) classes.push('ex-notification--closable');
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

// 计算图标样式类
const iconClasses = computed(() => {
  return [`ex-notification__icon--${props.type}`];
});

// 计算内联样式
const notificationStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (props.zIndex !== undefined) {
    styles.zIndex = String(props.zIndex);
  }

  if (props.customStyle) {
    Object.assign(styles, props.customStyle);
  }

  return styles;
});

// 开始计时器
const startTimer = () => {
  if (props.duration > 0 && remaining > 0) {
    startedAt = Date.now();
    timer = window.setTimeout(() => {
      close();
    }, remaining);
  }
};

// 清除计时器
const clearTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = undefined;
  }
};

// 悬停暂停：记录已消耗时间，移出后按剩余时长继续
const pauseTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = undefined;
    remaining -= Date.now() - startedAt;
  }
};

const resumeTimer = () => {
  if (typeof window !== 'undefined') {
    startTimer();
  }
};

// 关闭通知
const close = () => {
  visible.value = false;
};

// 处理关闭按钮点击
const handleClose = () => {
  close();
};

// 处理点击事件
const handleClick = () => {
  props.onClick?.();
  emit('click');
};

// 处理过渡动画结束
const handleAfterLeave = () => {
  props.onClose?.();
  emit('close');
  emit('destroy');
};

// 生命周期
onMounted(() => {
  visible.value = true;
  // 仅在浏览器环境且 duration > 0 时启动定时器
  if (typeof window !== 'undefined' && props.duration > 0) {
    startTimer();
  }
});

onUnmounted(() => {
  clearTimer();
});

// 暴露方法
defineExpose({
  visible,
  close,
});
</script>

<style scoped lang="scss" src="./ExNotification.scss"></style>
