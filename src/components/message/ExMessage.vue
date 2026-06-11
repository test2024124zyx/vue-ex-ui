<template>
  <Transition
    name="ex-message-fade"
    @after-leave="handleAfterLeave"
  >
    <div
      v-show="visible"
      ref="messageRef"
      :class="messageClasses"
      :style="messageStyles"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <!-- 图标 -->
      <div
        v-if="showIcon"
        class="ex-message__icon"
        :class="iconClasses"
      >
        <slot name="icon">
          <!-- 加载图标使用旋转动画 -->
          <img
            v-if="type === 'loading'"
            :src="defaultIconUrl"
            :alt="type"
            class="ex-message__icon-loading"
            width="20"
            height="20"
          >
          <img
            v-else
            :src="defaultIconUrl"
            :alt="type"
            width="20"
            height="20"
          >
        </slot>
      </div>

      <!-- 内容区域 -->
      <div class="ex-message__content">
        <slot>
          <!-- 使用 sanitizeHtml 消毒后的内容，已防止 XSS 攻击 -->
          <span
            v-if="dangerouslyUseHTMLString"
            v-html="sanitizedContent"
          />
          <span v-else>{{ content }}</span>
        </slot>
      </div>

      <!-- 关闭按钮 -->
      <div
        v-if="closable"
        class="ex-message__close"
        role="button"
        tabindex="0"
        :aria-label="t('message.close')"
        @click="handleClose"
        @keydown.enter="handleClose"
        @keydown.space.prevent="handleClose"
      >
        <slot name="close">
          <img
            :src="defaultCloseIconUrl"
            alt="close"
            width="16"
            height="16"
          >
        </slot>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { ExMessageProps, ExMessageEmits } from './types';
import { useI18n } from '../../locale';
import { sanitizeHtml } from '../../utils/sanitize';

defineOptions({
  name: 'ExMessage',
});

const props = withDefaults(defineProps<ExMessageProps>(), {
  type: 'info',
  content: '',
  showIcon: true,
  closable: false,
  duration: 3000,
  customClass: '',
  customStyle: undefined,
  zIndex: undefined,
  offset: 20,
  dangerouslyUseHTMLString: false,
  onClose: undefined,
});

const emit = defineEmits<ExMessageEmits>();

const { t } = useI18n();

// 组件引用
const messageRef = ref<HTMLElement>();
// 可见状态
const visible = ref(false);
// 定时器
let timer: number | undefined;

// 默认图标映射
const defaultIconMap: Record<string, string> = {
  info: 'https://api.iconify.design/ri/information-line.svg',
  success: 'https://api.iconify.design/ri/checkbox-circle-line.svg',
  warning: 'https://api.iconify.design/ri/error-warning-line.svg',
  error: 'https://api.iconify.design/ri/close-circle-line.svg',
  loading: 'https://api.iconify.design/ri/loader-4-line.svg',
};

// 默认图标 URL
const defaultIconUrl = computed(() => {
  return defaultIconMap[props.type];
});

// 默认关闭图标 URL
const defaultCloseIconUrl = 'https://api.iconify.design/ri/close-line.svg';

// 消毒后的 HTML 内容（防止 XSS 攻击）
const sanitizedContent = computed(() => {
  if (props.dangerouslyUseHTMLString && props.content) {
    return sanitizeHtml(props.content);
  }
  return props.content;
});

// 计算样式类
const messageClasses = computed(() => {
  const classes = [
    'ex-message',
    `ex-message--${props.type}`,
  ];

  if (props.closable) classes.push('ex-message--closable');
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

// 计算图标样式类
const iconClasses = computed(() => {
  return [`ex-message__icon--${props.type}`];
});

// 计算内联样式
const messageStyles = computed(() => {
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
  if (props.duration > 0) {
    timer = window.setTimeout(() => {
      close();
    }, props.duration);
  }
};

// 清除计时器
const clearTimer = () => {
  if (timer) {
    clearTimeout(timer);
    timer = undefined;
  }
};

// 关闭消息
const close = () => {
  visible.value = false;
};

// 处理关闭按钮点击
const handleClose = () => {
  close();
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

<style scoped lang="scss" src="./ExMessage.scss"></style>
