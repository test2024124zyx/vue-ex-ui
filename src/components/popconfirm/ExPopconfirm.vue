<template>
  <ExPopover
    ref="popoverRef"
    v-model:visible="popoverVisible"
    :placement="placement"
    :trigger="trigger"
    :disabled="disabled"
    :popup-class="popupClasses"
    :popup-style="popupStyle"
    @update:visible="handleVisibleChange"
  >
    <!-- 触发元素 -->
    <slot />

    <!-- 确认框内容 -->
    <template #content>
      <div :class="popconfirmClasses">
        <!-- 头部 -->
        <div class="ex-popconfirm__header">
          <!-- 图标 -->
          <div
            v-if="showIcon"
            class="ex-popconfirm__icon"
          >
            <slot name="icon">
              <img
                v-if="defaultIcon"
                :src="defaultIcon"
                :alt="type"
                width="20"
                height="20"
              >
            </slot>
          </div>

          <!-- 内容 -->
          <div class="ex-popconfirm__content">
            <div class="ex-popconfirm__title">
              <slot name="title">
                {{ title }}
              </slot>
            </div>
            <div
              v-if="description || $slots.description"
              class="ex-popconfirm__description"
            >
              <slot name="description">
                {{ description }}
              </slot>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="ex-popconfirm__footer">
          <ExButton
            v-if="showCancel"
            size="small"
            @click.stop="handleCancel"
          >
            {{ cancelText || t('cancel') }}
          </ExButton>
          <ExButton
            size="small"
            :type="okType"
            :loading="confirmLoading"
            @click.stop="handleConfirm"
          >
            {{ okText || t('confirm') }}
          </ExButton>
        </div>
      </div>
    </template>
  </ExPopover>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ExPopconfirmProps, ExPopconfirmEmits, ExPopconfirmExposed } from './types';
import { useLocale } from '../../locale';
import ExPopover from '../popover/ExPopover.vue';
import ExButton from '../button/ExButton.vue';

defineOptions({
  name: 'ExPopconfirm',
});

const props = withDefaults(defineProps<ExPopconfirmProps>(), {
  type: 'warning',
  okType: 'primary',
  showCancel: true,
  confirmLoading: false,
  disabled: false,
  placement: 'top',
  trigger: 'click',
  showIcon: true,
});

const emit = defineEmits<ExPopconfirmEmits>();

const { t } = useLocale('dialog');

const popoverRef = ref();
const popoverVisible = ref(false);

// 计算属性
const popconfirmClasses = computed(() => {
  const classes = ['ex-popconfirm'];
  if (props.type) classes.push(`ex-popconfirm--${props.type}`);
  return classes;
});

const popupClasses = computed(() => {
  const classes: string[] = [];
  if (props.popupClass) classes.push(props.popupClass);
  return classes.join(' ');
});

const defaultIcon = computed(() => {
  const iconMap: Record<string, string> = {
    default: 'https://api.iconify.design/ri/question-line.svg',
    primary: 'https://api.iconify.design/ri/information-line.svg',
    success: 'https://api.iconify.design/ri/checkbox-circle-line.svg',
    warning: 'https://api.iconify.design/ri/error-warning-line.svg',
    danger: 'https://api.iconify.design/ri/close-circle-line.svg',
    info: 'https://api.iconify.design/ri/information-line.svg',
    error: 'https://api.iconify.design/ri/close-circle-line.svg',
  };
  return props.icon || iconMap[props.type] || iconMap.default;
});

// 事件处理
const handleVisibleChange = (visible: boolean) => {
  emit('update:visible', visible);
};

const handleConfirm = async () => {
  if (props.beforeConfirm) {
    const result = await props.beforeConfirm();
    if (result === false) return;
  }

  emit('confirm');
  popoverVisible.value = false;
};

const handleCancel = () => {
  emit('cancel');
  popoverVisible.value = false;
};

// 暴露的方法
const show = () => {
  popoverVisible.value = true;
};

const hide = () => {
  popoverVisible.value = false;
};

defineExpose<ExPopconfirmExposed>({
  show,
  hide,
});
</script>

<style scoped lang="scss" src="./ExPopconfirm.scss"></style>
