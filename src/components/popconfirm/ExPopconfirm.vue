<template>
  <ExPopover
    v-model="popoverVisible"
    :placement="placement"
    :trigger="trigger"
    :disabled="disabled"
    :aria-label="title || t('confirm')"
    :custom-class="popupClasses"
    :custom-style="popupStyle"
    @update:model-value="handleVisibleChange"
  >
    <!-- 触发元素 -->
    <slot></slot>

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
              <ExIcon
                :icon="customIconUrl ? undefined : defaultIcon"
                :src="customIconUrl"
                :size="20"
                aria-hidden="true"
              />
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
            :disabled="confirmPending"
            @click.stop="handleCancel"
          >
            {{ cancelText || t('cancel') }}
          </ExButton>
          <ExButton
            size="small"
            :type="okType"
            :loading="effectiveConfirmLoading"
            :disabled="effectiveConfirmLoading"
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
import ExIcon from '../icon/ExIcon.vue';

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

const popoverVisible = ref(false);
const confirmPending = ref(false);
const effectiveConfirmLoading = computed(() => props.confirmLoading || confirmPending.value);

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
    default: 'question-line',
    primary: 'information-line',
    success: 'checkbox-circle-line',
    warning: 'error-warning-line',
    danger: 'close-circle-line',
    info: 'information-line',
    error: 'close-circle-line',
  };
  return iconMap[props.type] || iconMap.default;
});

// 允许通过 icon prop 传入自定义图片 URL
const customIconUrl = computed(() => props.icon);

// 事件处理
const handleVisibleChange = (visible: boolean) => {
  emit('update:visible', visible);
};

const handleConfirm = async () => {
  if (props.disabled || props.confirmLoading || confirmPending.value) return;
  confirmPending.value = true;
  try {
    if (props.beforeConfirm) {
      const result = await props.beforeConfirm();
      if (result === false) return;
    }

    emit('confirm');
    popoverVisible.value = false;
  } catch (error) {
    emit('confirm-error', error);
  } finally {
    confirmPending.value = false;
  }
};

const handleCancel = () => {
  if (confirmPending.value) return;
  emit('cancel');
  popoverVisible.value = false;
};

// 暴露的方法
const show = () => {
  if (props.disabled) return;
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
