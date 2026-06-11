<template>
  <transition name="ex-alert-fade" @after-leave="handleAfterLeave">
    <div
      v-show="visible"
      ref="alertRef"
      :class="alertClasses"
      :style="alertStyles"
      role="alert"
      :aria-live="type === 'error' ? 'assertive' : 'polite'"
    >
      <!-- 图标 -->
      <div v-if="showIcon" class="ex-alert__icon">
        <slot name="icon">
          <ExIcon :icon="builtinIcon" :src="customIconUrl" :size="20" aria-hidden="true" />
        </slot>
      </div>

      <!-- 内容区域 -->
      <div class="ex-alert__content">
        <!-- 标题 -->
        <div v-if="title || $slots.title" class="ex-alert__title">
          <slot name="title">
            {{ title }}
          </slot>
        </div>

        <!-- 描述/默认内容 -->
        <div v-if="description || $slots.default" class="ex-alert__description">
          <slot>
            {{ description }}
          </slot>
        </div>
      </div>

      <!-- 操作区域 -->
      <div v-if="$slots.action" class="ex-alert__action">
        <slot name="action" />
      </div>

      <!-- 关闭按钮 -->
      <div
        v-if="closable"
        class="ex-alert__close"
        role="button"
        tabindex="0"
        :aria-label="t('alert.close')"
        @click="handleClose"
        @keydown.enter="handleClose"
        @keydown.space.prevent="handleClose"
      >
        <slot name="close">
          <span v-if="closeText" class="ex-alert__close-text">
            {{ closeText }}
          </span>
          <ExIcon
            v-else
            :icon="builtinCloseIcon"
            :src="customCloseIconUrl"
            :size="16"
            aria-hidden="true"
          />
        </slot>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { ExAlertProps, ExAlertEmits, ExAlertInstance } from './types';
import ExIcon from '../icon/ExIcon.vue';
import { useI18n } from '../../locale';
import { useComponentSize } from '../config-provider/composables';

defineOptions({
  name: 'ExAlert',
});

const props = withDefaults(defineProps<ExAlertProps>(), {
  type: 'info',
  size: undefined, // 使用 ConfigProvider 的默认值
  variant: 'standard',
  showIcon: true,
  closable: false,
  center: false,
  bordered: true,
});

const emit = defineEmits<ExAlertEmits>();

const { t } = useI18n();

// 使用全局尺寸配置
const componentSize = useComponentSize(computed(() => props.size));

const alertRef = ref<HTMLElement>();
const visible = ref(true);

// 图标映射（内置 SVG 图标名）
const iconMap = {
  success: 'checkbox-circle-line',
  info: 'information-line',
  warning: 'error-warning-line',
  error: 'close-circle-line',
};

// props.icon / props.closeIcon 允许传入自定义图片 URL，否则使用内置图标
const builtinIcon = computed(() => (props.icon ? undefined : iconMap[props.type]));
const customIconUrl = computed(() => props.icon);
const builtinCloseIcon = computed(() => (props.closeIcon ? undefined : 'close-line'));
const customCloseIconUrl = computed(() => props.closeIcon);

// 样式类
const alertClasses = computed(() => {
  const classes = [
    'ex-alert',
    `ex-alert--${props.type}`,
    `ex-alert--${componentSize.value}`,
    `ex-alert--${props.variant}`,
  ];

  if (props.center) classes.push('ex-alert--center');
  if (!props.bordered) classes.push('ex-alert--borderless');
  if (props.closable) classes.push('ex-alert--closable');
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

const alertStyles = computed(() => {
  return props.customStyle || {};
});

// 事件处理
const handleClose = (event: MouseEvent | KeyboardEvent) => {
  visible.value = false;
  emit('close', event as MouseEvent);
};

const handleAfterLeave = () => {
  emit('afterClose');
};

// 暴露方法
const close = () => {
  visible.value = false;
};

defineExpose<ExAlertInstance>({
  close,
});
</script>

<style scoped lang="scss" src="./ExAlert.scss"></style>
