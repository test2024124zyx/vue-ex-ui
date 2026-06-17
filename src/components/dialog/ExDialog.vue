<template>
  <Teleport
    to="body"
    :disabled="!appendToBody"
  >
    <Transition
      name="ex-dialog-fade"
      @after-enter="handleOpened"
      @after-leave="handleClosed"
    >
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
        <div
          v-if="modal"
          class="ex-dialog-modal"
          :class="modalClass"
        />

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
            :aria-labelledby="title ? titleId : undefined"
            @click.stop
          >
            <!-- 头部 -->
            <div
              v-if="showHeader"
              class="ex-dialog__header"
            >
              <!-- 图标插槽 -->
              <div
                v-if="$slots.icon"
                class="ex-dialog__icon"
              >
                <slot name="icon" />
              </div>

              <!-- 标题 -->
              <div class="ex-dialog__title-wrapper">
                <h3
                  :id="titleId"
                  class="ex-dialog__title"
                >
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
                  <ExIcon
                    icon="close-line"
                    :size="20"
                    aria-hidden="true"
                  />
                </slot>
              </button>
            </div>

            <!-- 内容 -->
            <div class="ex-dialog__body">
              <slot />
            </div>

            <!-- 底部 -->
            <div
              v-if="showFooterSlot"
              class="ex-dialog__footer"
            >
              <slot name="footer">
                <div
                  v-if="showFooter"
                  class="ex-dialog__footer-actions"
                >
                  <ExButton
                    v-if="showCancel"
                    type="default"
                    @click="handleCancel"
                  >
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
import { computed, ref, watch, useSlots } from 'vue';
import type { ExDialogProps, ExDialogEmits, ExDialogExposed } from './types';
import { useLocale } from '../../locale';
import { generateId } from '../../utils/id';
import { useOverlay } from '../../composables/useOverlay';
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
const visible = ref(false);
const titleId = `ex-dialog-title-${generateId()}`;

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

// 监听 modelValue 变化：父级状态是唯一事实来源
// beforeClose 守卫只在"请求关闭"（handleClose）时执行，
// 避免出现 modelValue 与内部 visible 脱钩导致对话框无法再关闭的问题
// 浮层通用机制：滚动锁定、自动聚焦、焦点陷阱、Esc 关闭、焦点归还、卸载清理
// （与 ExModal 共用同一套 useOverlay 实现，消除重复逻辑）
useOverlay({
  active: () => visible.value,
  container: dialogContainerRef,
  lockScroll: () => props.lockScroll,
  closeOnEscape: () => props.closeOnPressEscape,
  onEscape: () => handleClose(),
  restoreFocus: true,
});

// 执行打开（守卫通过后置 visible，副作用由 useOverlay 处理）
const openDialog = async () => {
  if (props.beforeOpen) {
    const result = await props.beforeOpen();
    if (result === false) {
      // 拒绝打开时回写 modelValue，保持与父级同步
      emit('update:modelValue', false);
      return;
    }
  }

  visible.value = true;
  emit('open');
};

// 执行关闭（守卫已在 handleClose 中执行；副作用由 useOverlay 处理）
const closeDialog = () => {
  if (!visible.value) return;

  visible.value = false;
  emit('close');
};

// 监听 modelValue 变化：父级状态是唯一事实来源
// 置于 openDialog/closeDialog 之后，避免 immediate 触发时引用未初始化的 const
watch(
  () => props.modelValue,
  newVal => {
    if (newVal) {
      void openDialog();
    } else {
      closeDialog();
    }
  },
  { immediate: true }
);

// 打开动画结束
const handleOpened = () => {
  emit('opened');
};

// 关闭动画结束
// 说明：对话框包裹层使用 v-if（visible）渲染，关闭后内容即从 DOM 卸载，
// 因此插槽内容默认在每次关闭时销毁、下次打开重建。destroyOnClose 保留用于语义表达。
const handleClosed = () => {
  emit('closed');
};

// 点击遮罩层
const handleWrapperClick = () => {
  if (props.closeOnClickModal) {
    handleClose();
  }
};

// 请求关闭对话框（关闭按钮 / 遮罩 / Esc / 取消按钮统一入口）
const handleClose = async () => {
  if (props.beforeClose) {
    const result = await props.beforeClose();
    if (result === false) return;
  }
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
