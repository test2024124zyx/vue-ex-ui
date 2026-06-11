<template>
  <Teleport to="body" :disabled="!appendToBody">
    <Transition name="ex-dialog-fade" @after-enter="handleOpened" @after-leave="handleClosed">
      <div
        v-if="visible"
        ref="dialogRef"
        class="ex-dialog-wrapper"
        :class="wrapperClasses"
        :style="wrapperStyles"
        v-bind="$attrs"
        @click.self="handleWrapperClick"
      >
        <!-- 遮罩层 -->
        <div v-if="modal" class="ex-dialog-modal" :class="modalClass" />

        <!-- 对话框容器 -->
        <Transition name="ex-dialog-zoom">
          <div
            v-if="visible"
            ref="dialogContainerRef"
            class="ex-dialog"
            :class="dialogClasses"
            role="dialog"
            :aria-modal="modal"
            :aria-label="ariaLabel || title"
            :aria-labelledby="title ? 'ex-dialog-title' : undefined"
            @click.stop
          >
            <!-- 头部 -->
            <div v-if="showHeader" class="ex-dialog__header">
              <!-- 图标插槽 -->
              <div v-if="$slots.icon" class="ex-dialog__icon">
                <slot name="icon" />
              </div>

              <!-- 标题 -->
              <div class="ex-dialog__title-wrapper">
                <h3 id="ex-dialog-title" class="ex-dialog__title">
                  <slot name="title">
                    {{ title }}
                  </slot>
                </h3>
              </div>

              <!-- 关闭按钮 -->
              <button
                v-if="showClose"
                type="button"
                class="ex-dialog__close"
                :aria-label="t('close')"
                @click="handleClose"
              >
                <slot name="close">
                  <ExIcon icon="close-line" :size="20" aria-hidden="true" />
                </slot>
              </button>
            </div>

            <!-- 内容 -->
            <div class="ex-dialog__body">
              <slot />
            </div>

            <!-- 底部 -->
            <div v-if="showFooterSlot" class="ex-dialog__footer">
              <slot name="footer">
                <div v-if="showFooter" class="ex-dialog__footer-actions">
                  <ExButton v-if="showCancel" type="default" @click="handleCancel">
                    {{ cancelText || t('cancel') }}
                  </ExButton>
                  <ExButton
                    v-if="showConfirm"
                    type="primary"
                    :loading="confirmLoading"
                    :disabled="confirmDisabled"
                    @click="handleConfirm"
                  >
                    {{ confirmText || t('confirm') }}
                  </ExButton>
                </div>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount, useSlots } from 'vue';
import type { ExDialogProps, ExDialogEmits, ExDialogExposed } from './types';
import { useLocale } from '../../locale';
import ExButton from '../button/ExButton.vue';

defineOptions({
  name: 'ExDialog',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExDialogProps>(), {
  modelValue: false,
  size: 'medium',
  type: 'default',
  showClose: true,
  modal: true,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  showFooter: true,
  showConfirm: true,
  showCancel: true,
  confirmLoading: false,
  confirmDisabled: false,
  center: false,
  fullscreen: false,
  lockScroll: true,
  appendToBody: true,
  destroyOnClose: false,
  zIndex: 1050,
});

const emit = defineEmits<ExDialogEmits>();

const { t } = useLocale('dialog');

const dialogRef = ref<HTMLDivElement>();
const dialogContainerRef = ref<HTMLDivElement>();
const visible = ref(props.modelValue);

// 获取 slots
const slots = useSlots();

// 计算属性
const showHeader = computed((): boolean => {
  return !!(props.title || slots.title || slots.icon || props.showClose);
});

const showFooterSlot = computed((): boolean => {
  return !!(props.showFooter || slots.footer);
});

const wrapperClasses = computed(() => {
  const classes = ['ex-dialog-wrapper'];
  if (props.center) classes.push('ex-dialog-wrapper--center');
  return classes;
});

const wrapperStyles = computed(() => {
  return {
    zIndex: props.zIndex,
  };
});

const dialogClasses = computed(() => {
  const classes = ['ex-dialog'];

  if (props.size) classes.push(`ex-dialog--${props.size}`);
  if (props.type) classes.push(`ex-dialog--${props.type}`);
  if (props.fullscreen) classes.push('ex-dialog--fullscreen');
  if (props.customClass) classes.push(props.customClass);

  return classes;
});

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  async newVal => {
    if (newVal) {
      await handleBeforeOpen();
    } else {
      await handleBeforeClose();
    }
  }
);

// 打开前的处理
const handleBeforeOpen = async () => {
  if (props.beforeOpen) {
    const result = await props.beforeOpen();
    if (result === false) return;
  }

  visible.value = true;
  emit('open');

  await nextTick();

  if (props.lockScroll) {
    document.body.style.overflow = 'hidden';
  }
};

// 关闭前的处理
const handleBeforeClose = async () => {
  if (props.beforeClose) {
    const result = await props.beforeClose();
    if (result === false) return;
  }

  visible.value = false;
  emit('close');

  if (props.lockScroll) {
    document.body.style.overflow = '';
  }
};

// 打开动画结束
const handleOpened = () => {
  emit('opened');
};

// 关闭动画结束
const handleClosed = () => {
  emit('closed');
  if (props.destroyOnClose) {
    // 销毁内容的逻辑可以在这里实现
  }
};

// 点击遮罩层
const handleWrapperClick = () => {
  if (props.closeOnClickModal) {
    handleClose();
  }
};

// 关闭对话框
const handleClose = async () => {
  emit('update:modelValue', false);
};

// 确认
const handleConfirm = () => {
  emit('confirm');
};

// 取消
const handleCancel = () => {
  emit('cancel');
  handleClose();
};

// ESC 键关闭
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnPressEscape && visible.value) {
    handleClose();
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscapeKey);
  if (props.lockScroll) {
    document.body.style.overflow = '';
  }
});

// 暴露的方法
const open = () => {
  emit('update:modelValue', true);
};

const close = () => {
  emit('update:modelValue', false);
};

const getElement = () => dialogContainerRef.value || null;

defineExpose<ExDialogExposed>({
  open,
  close,
  getElement,
});
</script>

<style scoped lang="scss" src="./ExDialog.scss"></style>
