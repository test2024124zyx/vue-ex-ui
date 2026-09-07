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
        v-show="overlayActive"
        class="ex-dialog-wrapper"
        :class="wrapperClasses"
        :data-theme="configTheme"
        :style="wrapperStyles"
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
            v-show="overlayActive"
            ref="dialogContainerRef"
            v-bind="panelAttrs"
            class="ex-dialog"
            :class="dialogClasses"
            :role="dialogRole"
            :aria-modal="modal ? 'true' : undefined"
            :aria-label="accessibleLabel"
            :aria-labelledby="labelledBy"
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
import { computed, ref, useAttrs, useId, useSlots, watch } from 'vue';
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import { useLocale } from '../../locale';
import { useOverlay } from '../../composables/useOverlay';
import { useGuardedVisibility } from '../../composables/useGuardedVisibility';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useThemeOverrides,
  useZIndexLayer,
} from '../config-provider/composables';
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
const attrs = useAttrs();
const { t } = useLocale('dialog');
const baseZIndex = useZIndexLayer('modal');
const configTheme = useConfigTheme();
const neonEffect = useNeonEffect();
const animation = useAnimation();
const themeOverrides = useThemeOverrides();
const dialogContainerRef = ref<HTMLDivElement>();
const titleId = `ex-dialog-title-${useId()}`;
const CONTROLLED_PANEL_ATTRS = new Set(['aria-label', 'aria-labelledby', 'aria-modal', 'role']);

const readTextAttribute = (name: string): string | undefined => {
  const value = attrs[name];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};
const nativeAriaLabel = computed(() => readTextAttribute('aria-label'));
const nativeLabelledBy = computed(() => readTextAttribute('aria-labelledby'));
const dialogRole = computed(() =>
  readTextAttribute('role')?.toLowerCase() === 'alertdialog' ? 'alertdialog' : 'dialog'
);
const panelAttrs = computed(() =>
  Object.fromEntries(Object.entries(attrs).filter(([key]) => !CONTROLLED_PANEL_ATTRS.has(key)))
);

const { visible, hasOpened, requestOpen, requestClose } = useGuardedVisibility({
  modelValue: () => props.modelValue,
  beforeOpen: () => props.beforeOpen,
  beforeClose: () => props.beforeClose,
  requestModelValue: value => emit('update:modelValue', value),
  onOpen: () => emit('open'),
  onClose: () => emit('close'),
  onGuardError: (error, phase) => emit('guardError', error, phase),
});

const shouldRender = computed(
  () => overlayActive.value || (hasOpened.value && !props.destroyOnClose)
);
const hasTitle = computed(() => Boolean(props.title || slots.title));
const accessibleLabel = computed(() => {
  const explicitLabel = props.ariaLabel?.trim() || nativeAriaLabel.value;
  if (explicitLabel) return explicitLabel;
  if (nativeLabelledBy.value || hasTitle.value) return undefined;
  return t('label');
});
const labelledBy = computed(() => {
  if (props.ariaLabel?.trim() || nativeAriaLabel.value) return undefined;
  return nativeLabelledBy.value ?? (hasTitle.value ? titleId : undefined);
});
const showHeader = computed(() => Boolean(hasTitle.value || slots.icon || props.showClose));
const hasFooter = computed(() =>
  Boolean(slots.footer || (props.showFooter && (props.showConfirm || props.showCancel)))
);

const wrapperClasses = computed(() => [
  {
    'ex-dialog-wrapper--center': props.center,
    'ex-dialog-wrapper--modeless': !props.modal,
    'ex-no-neon': !neonEffect.value,
    'ex-no-animation': !animation.value,
  },
]);
const wrapperStyles = computed(() => ({
  ...themeOverrides.value,
  zIndex: overlayZIndex.value,
}));
const dialogClasses = computed(() => [
  `ex-dialog--${props.size}`,
  `ex-dialog--${props.type}`,
  {
    'ex-dialog--fullscreen': props.fullscreen,
    [props.customClass || '']: Boolean(props.customClass),
  },
]);

const { zIndex: overlayZIndex, active: overlayActive } = useOverlay({
  active: () => visible.value,
  container: dialogContainerRef,
  zIndex: () => props.zIndex ?? baseZIndex.value,
  lockScroll: () => props.lockScroll,
  closeOnEscape: () => props.closeOnPressEscape,
  onEscape: async () => {
    await requestCloseIntent('api');
  },
  trapFocus: () => props.modal,
  autoFocus: () => props.modal,
  restoreFocus: true,
});

const handleOpened = () => emit('opened');
const handleClosed = () => emit('closed');

type CloseIntent = 'cancel' | 'api';
let pendingCloseIntent: Promise<boolean> | null = null;

/** 所有关闭入口共享同一任务，避免异步守卫期间重复发出取消事件。 */
const requestCloseIntent = (intent: CloseIntent): Promise<boolean> => {
  if (pendingCloseIntent) return pendingCloseIntent;

  if (intent === 'cancel') emit('cancel');
  const operation = requestClose();
  pendingCloseIntent = operation;
  const clearPending = () => {
    if (pendingCloseIntent === operation) pendingCloseIntent = null;
  };
  void operation.then(clearPending, clearPending);
  return operation;
};

watch(
  () => props.modelValue,
  () => {
    pendingCloseIntent = null;
  }
);

const handleMaskClick = () => {
  if (props.modal && props.closeOnClickModal) void requestCloseIntent('api');
};
const handleClose = () => void requestCloseIntent('api');
const handleConfirm = () => emit('confirm');
const handleCancel = () => {
  void requestCloseIntent('cancel');
};

const open = () => {
  pendingCloseIntent = null;
  requestOpen();
};
const close = () => requestCloseIntent('api');
const getElement = () => dialogContainerRef.value ?? null;

defineExpose<ExDialogExposed>({ open, close, getElement });
</script>

<style scoped lang="scss" src="./ExDialog.scss"></style>
