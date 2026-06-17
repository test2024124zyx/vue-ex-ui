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
            :aria-labelledby="title ? titleId : undefined"
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
                  <ExIcon
                    icon="close-line"
                    :size="20"
                    aria-hidden="true"
                  />
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
                  :id="titleId"
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
import ExIcon from '../icon/ExIcon.vue';
import { computed, ref, watch, useSlots } from 'vue';
import type { ExModalProps, ExModalEmits, ExModalExposed } from './types';
import { useLocale } from '../../locale';
import { generateId } from '../../utils/id';
import ExButton from '../button/ExButton.vue';
import { useOverlay } from '../../composables/useOverlay';

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
  showFooter: true,
});

const emit = defineEmits<ExModalEmits>();

const { t } = useLocale('dialog');

const wrapRef = ref<HTMLDivElement>();
const modalRef = ref<HTMLDivElement>();
const visible = ref(props.modelValue);
const titleId = `ex-modal-title-${generateId()}`;

// 获取 slots
const slots = useSlots();

// 计算属性
const hasHeader = computed((): boolean => {
  return !!(props.title || slots.title || slots.icon);
});

const hasFooter = computed((): boolean => {
  // 传入 footer 插槽时始终渲染；否则由 showFooter 控制默认按钮区
  return slots.footer !== undefined || props.showFooter;
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

// 同步父级 modelValue 到内部 visible
watch(
  () => props.modelValue,
  newVal => {
    visible.value = newVal;
  }
);

// 浮层通用机制：滚动锁定、自动聚焦、焦点陷阱、Esc 关闭、卸载清理
// （与 ExDialog 共用同一套 useOverlay 实现，消除重复逻辑）
useOverlay({
  active: () => visible.value,
  container: modalRef,
  closeOnEscape: () => props.keyboard,
  onEscape: () => handleCancel(),
  restoreFocus: true,
});

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
// 说明：模态框根节点使用 v-if（visible）渲染，关闭后内容即从 DOM 卸载，
// 因此插槽内容默认在每次关闭时销毁、下次打开重建。destroyOnClose 保留用于语义表达。
const handleAfterClose = () => {
  emit('afterClose');
};

// 暴露的方法
const getElement = () => modalRef.value || null;

defineExpose<ExModalExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExModal.scss"></style>
