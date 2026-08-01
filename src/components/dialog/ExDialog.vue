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
        v-if="shouldRender"
        v-show="visible"
        ref="dialogRef"
        class="ex-dialog-wrapper"
        :class="wrapperClasses"
        :data-theme="configTheme"
        :style="wrapperStyles"
        v-bind="$attrs"
        @click.self="handleMaskClick"
      >
        <div
          v-if="modal"
          class="ex-dialog-modal"
          :class="modalClass"
          @click="handleMaskClick"
        ></div>

        <Transition name="ex-dialog-zoom">
          <div
            v-if="shouldRender"
            v-show="visible"
            ref="dialogContainerRef"
            class="ex-dialog"
            :class="dialogClasses"
            role="dialog"
            :aria-modal="modal ? 'true' : undefined"
            :aria-label="ariaLabel || undefined"
            :aria-labelledby="!ariaLabel && hasTitle ? titleId : undefined"
            @click.stop
          >
            <div
              v-if="showHeader"
              class="ex-dialog__header"
            >
              <div
                v-if="$slots.icon"
                class="ex-dialog__icon"
              >
                <slot name="icon"></slot>
              </div>

              <div
                v-if="hasTitle"
                class="ex-dialog__title-wrapper"
              >
                <h3
                  :id="titleId"
                  class="ex-dialog__title"
                >
                  <slot name="title">
                    {{ title }}
                  </slot>
                </h3>
              </div>

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

            <div class="ex-dialog__body">
              <slot></slot>
            </div>

            <div
              v-if="hasFooter"
              class="ex-dialog__footer"
            >
              <slot name="footer">
                <div class="ex-dialog__footer-actions">
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
import { computed, ref, useId, useSlots } from 'vue';
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import { useLocale } from '../../locale';
import { useOverlay } from '../../composables/useOverlay';
import { useGuardedVisibility } from '../../composables/useGuardedVisibility';
import { useConfigTheme, useZIndex } from '../config-provider/composables';
import type { ExDialogEmits, ExDialogExposed, ExDialogProps } from './types';

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
  zIndex: undefined,
});

const emit = defineEmits<ExDialogEmits>();
const slots = useSlots();
const { t } = useLocale('dialog');
const baseZIndex = useZIndex(50);
const configTheme = useConfigTheme();
const dialogRef = ref<HTMLDivElement>();
const dialogContainerRef = ref<HTMLDivElement>();
const titleId = `ex-dialog-title-${useId()}`;

const { visible, hasOpened, requestOpen, requestClose } = useGuardedVisibility({
  modelValue: () => props.modelValue,
  beforeOpen: () => props.beforeOpen,
  beforeClose: () => props.beforeClose,
  requestModelValue: value => emit('update:modelValue', value),
  onOpen: () => emit('open'),
  onClose: () => emit('close'),
  onGuardError: (error, phase) => emit('guardError', error, phase),
});

const shouldRender = computed(() => visible.value || (hasOpened.value && !props.destroyOnClose));
const hasTitle = computed(() => Boolean(props.title || slots.title));
const showHeader = computed(() => Boolean(hasTitle.value || slots.icon || props.showClose));
const hasFooter = computed(() =>
  Boolean(slots.footer || (props.showFooter && (props.showConfirm || props.showCancel)))
);

const wrapperClasses = computed(() => [
  {
    'ex-dialog-wrapper--center': props.center,
    'ex-dialog-wrapper--modeless': !props.modal,
  },
]);
const wrapperStyles = computed(() => ({ zIndex: props.zIndex ?? baseZIndex.value }));
const dialogClasses = computed(() => [
  `ex-dialog--${props.size}`,
  `ex-dialog--${props.type}`,
  {
    'ex-dialog--fullscreen': props.fullscreen,
    [props.customClass || '']: Boolean(props.customClass),
  },
]);

useOverlay({
  active: () => visible.value,
  container: dialogContainerRef,
  lockScroll: () => props.lockScroll,
  closeOnEscape: () => props.closeOnPressEscape,
  onEscape: async () => {
    await requestClose();
  },
  trapFocus: () => props.modal,
  autoFocus: () => props.modal,
  restoreFocus: true,
});

const handleOpened = () => emit('opened');
const handleClosed = () => emit('closed');

const handleMaskClick = () => {
  if (props.modal && props.closeOnClickModal) void requestClose();
};
const handleClose = () => void requestClose();
const handleConfirm = () => emit('confirm');
const handleCancel = () => {
  emit('cancel');
  void requestClose();
};

const open = () => requestOpen();
const close = () => requestClose();
const getElement = () => dialogContainerRef.value ?? null;

defineExpose<ExDialogExposed>({ open, close, getElement });
</script>

<style scoped lang="scss" src="./ExDialog.scss"></style>
