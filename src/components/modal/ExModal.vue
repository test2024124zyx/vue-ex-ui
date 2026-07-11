<template>
  <Teleport
    to="body"
    :disabled="!appendToBody"
  >
    <Transition
      name="ex-modal-fade"
      @after-leave="handleAfterClose"
    >
      <div
        v-if="shouldRender"
        v-show="visible"
        class="ex-modal-root"
        :class="rootClasses"
        :style="rootStyles"
      >
        <div
          v-if="mask"
          class="ex-modal-mask"
          aria-hidden="true"
          @click="handleMaskClick"
        ></div>

        <div
          class="ex-modal-wrap"
          :class="wrapClasses"
          @click.self="handleMaskClick"
        >
          <div
            ref="modalRef"
            v-bind="panelAttrs"
            :class="modalClasses"
            :style="modalStyles"
            :role="dialogRole"
            :aria-modal="mask ? 'true' : undefined"
            :aria-label="accessibleLabel"
            :aria-labelledby="labelledBy"
          >
            <div class="ex-modal-content">
              <div
                v-if="hasHeader"
                class="ex-modal-header"
              >
                <div
                  v-if="hasIcon"
                  class="ex-modal-header__icon"
                  aria-hidden="true"
                >
                  <slot name="icon"></slot>
                </div>
                <h2
                  v-if="hasTitle"
                  :id="titleId"
                  class="ex-modal-title"
                >
                  <slot name="title">
                    {{ title }}
                  </slot>
                </h2>

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
              </div>

              <div
                class="ex-modal-body"
                :style="bodyStyle"
              >
                <slot></slot>
              </div>

              <div
                v-if="hasFooter"
                class="ex-modal-footer"
              >
                <slot name="footer">
                  <ExButton
                    type="default"
                    @click="handleCancel"
                  >
                    {{ resolvedCancelText }}
                  </ExButton>
                  <ExButton
                    :type="normalizedOkType"
                    :loading="confirmLoading"
                    @click="handleOk"
                  >
                    {{ resolvedOkText }}
                  </ExButton>
                </slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, useAttrs, useId, watch } from 'vue';
import type { CSSProperties } from 'vue';
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import { useAnimation, useNeonEffect, useZIndex } from '../config-provider/composables';
import { useGuardedVisibility } from '../../composables/useGuardedVisibility';
import { useOverlay } from '../../composables/useOverlay';
import { useLocale } from '../../locale';
import { hasRenderableContent } from '../../utils/vnode';
import type {
  ExModalEmits,
  ExModalExposed,
  ExModalProps,
  ExModalSlots,
  ModalOkType,
  ModalSize,
  ModalType,
} from './types';

defineOptions({
  name: 'ExModal',
  inheritAttrs: false,
});

const slots = defineSlots<ExModalSlots>();
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
  zIndex: undefined,
  appendToBody: true,
  destroyOnClose: false,
  showFooter: true,
  lockScroll: true,
});

const emit = defineEmits<ExModalEmits>();
const attrs = useAttrs();
const { t } = useLocale('dialog');
const baseZIndex = useZIndex(50);
const neonEffect = useNeonEffect();
const animation = useAnimation();
const modalRef = ref<HTMLDivElement>();
const titleId = `ex-modal-title-${useId()}`;

const MODAL_SIZES = new Set<ModalSize>(['small', 'medium', 'large']);
const MODAL_TYPES = new Set<ModalType>([
  'default',
  'primary',
  'success',
  'warning',
  'danger',
  'info',
]);
const MODAL_OK_TYPES = new Set<ModalOkType>(['default', 'primary', 'success', 'warning', 'danger']);
const DEFAULT_MODAL_Z_INDEX = 1050;
const CONTROLLED_PANEL_ATTRS = new Set(['aria-label', 'aria-labelledby', 'aria-modal', 'role']);
const OBSOLETE_ATTRS = new Set(['arialabel']);

/** 运行时非法枚举值必须回退，不能生成不存在的样式类。 */
const normalizedSize = computed<ModalSize>(() =>
  MODAL_SIZES.has(props.size as ModalSize) ? (props.size as ModalSize) : 'medium'
);
const normalizedType = computed<ModalType>(() =>
  MODAL_TYPES.has(props.type as ModalType) ? (props.type as ModalType) : 'default'
);
const normalizedOkType = computed<ModalOkType>(() =>
  MODAL_OK_TYPES.has(props.okType as ModalOkType) ? (props.okType as ModalOkType) : 'primary'
);

const readTextAttribute = (name: string): string | undefined => {
  const value = attrs[name];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
};
const nativeAriaLabel = computed(() => readTextAttribute('aria-label'));
const nativeLabelledBy = computed(() => readTextAttribute('aria-labelledby'));
const dialogRole = computed(() =>
  typeof attrs.role === 'string' && attrs.role.trim().toLowerCase() === 'alertdialog'
    ? 'alertdialog'
    : 'dialog'
);
const panelAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(([key]) => {
      if (CONTROLLED_PANEL_ATTRS.has(key)) return false;
      return !OBSOLETE_ATTRS.has(key.replace(/-/g, '').toLowerCase());
    })
  )
);

const { visible, hasOpened, requestOpen, requestClose } = useGuardedVisibility({
  modelValue: () => props.modelValue,
  beforeOpen: () => props.beforeOpen,
  beforeClose: () => props.beforeClose,
  requestModelValue: value => emit('update:modelValue', value),
  onOpen: () => emit('open'),
  onClose: () => emit('close'),
  onGuardError: (error, phase) => emit('guardError', error, phase),
  skipRedundantRequests: true,
});

const shouldRender = computed(() => visible.value || (hasOpened.value && !props.destroyOnClose));
const hasTitle = computed(() =>
  slots.title
    ? hasRenderableContent(slots.title())
    : typeof props.title === 'string' && props.title.trim().length > 0
);
const hasIcon = computed(() => hasRenderableContent(slots.icon?.()));
const hasHeader = computed(() => hasTitle.value || hasIcon.value || props.showClose);
const hasFooter = computed(() =>
  slots.footer ? hasRenderableContent(slots.footer()) : props.showFooter
);
const accessibleLabel = computed(() => {
  if (nativeAriaLabel.value) return nativeAriaLabel.value;
  if (nativeLabelledBy.value || hasTitle.value) return undefined;
  return t('label');
});
const labelledBy = computed(() => {
  if (nativeAriaLabel.value) return undefined;
  return nativeLabelledBy.value ?? (hasTitle.value ? titleId : undefined);
});
const resolvedOkText = computed(() => props.okText?.trim() || t('ok'));
const resolvedCancelText = computed(() => props.cancelText?.trim() || t('cancel'));

const rootClasses = computed(() => ({
  'ex-modal-root--modeless': !props.mask,
  'ex-modal-root--no-motion': !animation.value,
}));
const rootStyles = computed<CSSProperties>(() => {
  const fallback =
    Number.isFinite(baseZIndex.value) && baseZIndex.value >= 0
      ? Math.floor(baseZIndex.value)
      : DEFAULT_MODAL_Z_INDEX;
  const zIndex =
    typeof props.zIndex === 'number' && Number.isFinite(props.zIndex) && props.zIndex >= 0
      ? Math.floor(props.zIndex)
      : fallback;
  return { zIndex };
});
const wrapClasses = computed(() => [
  {
    'ex-modal-wrap--centered': props.centered,
  },
  props.wrapClassName,
]);
const modalClasses = computed(() => [
  'ex-modal',
  `ex-modal--${normalizedSize.value}`,
  `ex-modal--${normalizedType.value}`,
  { 'ex-modal--neon': neonEffect.value },
]);

/** 仅接受正的有限像素数值；字符串交由浏览器按 CSS 长度规则校验。 */
const normalizedWidth = computed<string | undefined>(() => {
  const width: unknown = props.width;
  if (typeof width === 'number') {
    return Number.isFinite(width) && width > 0 ? `${width}px` : undefined;
  }
  if (typeof width !== 'string') return undefined;
  const normalized = width.trim();
  return normalized || undefined;
});
const modalStyles = computed<CSSProperties>(() =>
  normalizedWidth.value ? { width: normalizedWidth.value } : {}
);

useOverlay({
  active: () => visible.value,
  container: modalRef,
  lockScroll: () => props.mask && props.lockScroll,
  closeOnEscape: () => props.keyboard,
  onEscape: async () => {
    await requestCloseIntent('cancel');
  },
  trapFocus: () => props.mask,
  autoFocus: () => props.mask,
  restoreFocus: true,
});

type CloseIntent = 'ok' | 'cancel' | 'api';
let pendingCloseIntent: Promise<boolean> | null = null;

/** 所有关闭入口共享同一任务，避免异步守卫期间重复发出业务事件。 */
const requestCloseIntent = (intent: CloseIntent): Promise<boolean> => {
  if (!props.modelValue) return Promise.resolve(false);
  if (pendingCloseIntent) return pendingCloseIntent;

  if (intent === 'ok') emit('ok');
  else if (intent === 'cancel') emit('cancel');

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

const handleMaskClick = (): void => {
  if (!props.mask || !props.maskClosable) return;
  void requestCloseIntent('cancel');
};
const handleOk = (): void => {
  void requestCloseIntent('ok');
};
const handleCancel = (): void => {
  void requestCloseIntent('cancel');
};
const handleAfterClose = (): void => emit('afterClose');

const open = (): void => {
  pendingCloseIntent = null;
  requestOpen();
};
const close = (): Promise<boolean> => requestCloseIntent('api');
const getElement = (): HTMLDivElement | null => modalRef.value ?? null;

defineExpose<ExModalExposed>({ open, close, getElement });
</script>

<style scoped lang="scss" src="./ExModal.scss"></style>
