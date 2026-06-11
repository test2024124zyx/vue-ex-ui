<template>
  <Teleport
    to="body"
    :disabled="!appendToBody"
  >
    <div
      v-if="visible"
      class="ex-modal-root"
      :style="rootStyles"
      v-bind="$attrs"
    >
      <!-- 遮罩层 -->
      <Transition name="ex-modal-mask-fade">
        <div
          v-if="mask && visible"
          class="ex-modal-mask"
          @click="handleMaskClick"
        />
      </Transition>

      <!-- 模态框包装器 -->
      <div
        ref="wrapRef"
        class="ex-modal-wrap"
        :class="wrapClasses"
        @click.self="handleMaskClick"
      >
        <Transition
          name="ex-modal-zoom"
          @after-leave="handleAfterClose"
        >
          <div
            v-if="visible"
            ref="modalRef"
            class="ex-modal"
            :class="modalClasses"
            :style="modalStyles"
            role="dialog"
            :aria-modal="mask"
            :aria-label="ariaLabel || title"
            :aria-labelledby="title ? 'ex-modal-title' : undefined"
          >
            <div class="ex-modal-content">
              <!-- 关闭按钮 -->
              <button
                v-if="showClose"
                type="button"
                class="ex-modal-close"
                :aria-label="t('close')"
                @click="handleCancel"
              >
                <slot name="closeIcon">
                  <img
                    src="https://api.iconify.design/ri/close-line.svg"
                    alt="关闭"
                    width="20"
                    height="20"
                  >
                </slot>
              </button>

              <!-- 头部 -->
              <div
                v-if="hasHeader"
                class="ex-modal-header"
              >
                <div
                  v-if="$slots.icon"
                  class="ex-modal-header__icon"
                >
                  <slot name="icon" />
                </div>
                <div
                  id="ex-modal-title"
                  class="ex-modal-title"
                >
                  <slot name="title">
                    {{ title }}
                  </slot>
                </div>
              </div>

              <!-- 内容 -->
              <div
                class="ex-modal-body"
                :style="bodyStyle"
              >
                <slot />
              </div>

              <!-- 底部 -->
              <div
                v-if="hasFooter"
                class="ex-modal-footer"
              >
                <slot name="footer">
                  <ExButton @click="handleCancel">
                    {{ cancelText || t('cancel') }}
                  </ExButton>
                  <ExButton
                    :type="okType"
                    :loading="confirmLoading"
                    @click="handleOk"
                  >
                    {{ okText || t('ok') }}
                  </ExButton>
                </slot>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount, useSlots } from 'vue';
import type { ExModalProps, ExModalEmits, ExModalExposed } from './types';
import { useLocale } from '../../locale';
import ExButton from '../button/ExButton.vue';
import { lockScroll, unlockScroll, trapFocus, autoFocus } from './utils';

defineOptions({
  name: 'ExModal',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExModalProps>(), {
  modelValue: false,
  size: 'medium',
  type: 'default',
  showClose: true,
  mask: true,
  maskClosable: true,
  keyboard: true,
  okType: 'primary',
  confirmLoading: false,
  centered: false,
  zIndex: 1000,
  appendToBody: true,
  destroyOnClose: false,
});

const emit = defineEmits<ExModalEmits>();

const { t } = useLocale('dialog');

const wrapRef = ref<HTMLDivElement>();
const modalRef = ref<HTMLDivElement>();
const visible = ref(props.modelValue);
let releaseFocusTrap: (() => void) | null = null;

// 获取 slots
const slots = useSlots();

// 计算属性
const hasHeader = computed((): boolean => {
  return !!(props.title || slots.title || slots.icon);
});

const hasFooter = computed((): boolean => {
  return slots.footer !== undefined || (!slots.footer && true);
});

const wrapClasses = computed(() => {
  const classes = ['ex-modal-wrap'];
  if (props.centered) classes.push('ex-modal-wrap--centered');
  if (props.wrapClassName) classes.push(props.wrapClassName);
  return classes;
});

const modalClasses = computed(() => {
  const classes = ['ex-modal'];
  if (props.size) classes.push(`ex-modal--${props.size}`);
  if (props.type) classes.push(`ex-modal--${props.type}`);
  return classes;
});

const modalStyles = computed(() => {
  const styles: Record<string, string> = {};
  if (props.width) {
    styles.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
  }
  return styles;
});

// 根容器样式：以 CSS 变量统一 z-index，可由 prop 覆盖
const rootStyles = computed(() => {
  const styles: Record<string, string> = {
    zIndex: 'calc(var(--ex-z-modal) - 1000 + var(--ex-z-index-base, 1000))',
  };
  if (props.zIndex !== undefined) {
    styles['--ex-z-modal'] = String(props.zIndex);
  }
  return styles;
});

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal;
    if (newVal) {
      nextTick(() => {
        lockScroll();
        if (modalRef.value) {
          autoFocus(modalRef.value);
          releaseFocusTrap = trapFocus(modalRef.value);
        }
      });
    } else {
      unlockScroll();
      if (releaseFocusTrap) {
        releaseFocusTrap();
        releaseFocusTrap = null;
      }
    }
  }
);

// 点击遮罩层
const handleMaskClick = () => {
  if (props.maskClosable) {
    handleCancel();
  }
};

// 确认
const handleOk = async () => {
  emit('ok');
  if (props.beforeClose) {
    const result = await props.beforeClose();
    if (result === false) return;
  }
  emit('update:modelValue', false);
};

// 取消
const handleCancel = async () => {
  emit('cancel');
  if (props.beforeClose) {
    const result = await props.beforeClose();
    if (result === false) return;
  }
  emit('update:modelValue', false);
};

// 关闭后的回调
const handleAfterClose = () => {
  emit('afterClose');
  if (props.destroyOnClose) {
    // 销毁内容的逻辑可以在这里实现
  }
};

// ESC 键关闭
const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.keyboard && visible.value) {
    handleCancel();
  }
};

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscapeKey);
  unlockScroll();
  if (releaseFocusTrap) {
    releaseFocusTrap();
    releaseFocusTrap = null;
  }
});

// 暴露的方法
const getElement = () => modalRef.value || null;

defineExpose<ExModalExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExModal.scss"></style>
