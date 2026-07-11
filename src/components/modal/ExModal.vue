<template>
  <Teleport
    to="body"
    :disabled="!appendToBody"
  >
    <Transition
      name="ex-modal-root-fade"
      @after-leave="handleAfterClose"
    >
      <div
        v-if="shouldRender"
        v-show="visible"
        class="ex-modal-root"
        :class="rootClasses"
        :style="rootStyles"
        v-bind="$attrs"
      >
        <Transition name="ex-modal-mask-fade">
          <div
            v-if="mask && shouldRender"
            v-show="visible"
            class="ex-modal-mask"
            @click="handleMaskClick"
          />
        </Transition>

        <div
          class="ex-modal-wrap"
          :class="wrapClasses"
          @click.self="handleMaskClick"
        >
          <Transition name="ex-modal-zoom">
            <div
              v-if="shouldRender"
              v-show="visible"
              ref="modalRef"
              :class="modalClasses"
              :style="modalStyles"
              role="dialog"
              :aria-modal="mask ? 'true' : undefined"
              :aria-label="ariaLabel || undefined"
              :aria-labelledby="!ariaLabel && hasTitle ? titleId : undefined"
            >
              <div class="ex-modal-content">
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
                  <h2
                    v-if="hasTitle"
                    :id="titleId"
                    class="ex-modal-title"
                  >
                    <slot name="title">
                      {{ title }}
                    </slot>
                  </h2>
                </div>

                <div
                  class="ex-modal-body"
                  :style="bodyStyle"
                >
                  <slot />
                </div>

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
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, useId, useSlots } from 'vue';
import type { CSSProperties } from 'vue';
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import { useZIndex } from '../config-provider/composables';
import { useGuardedVisibility } from '../../composables/useGuardedVisibility';
import { useOverlay } from '../../composables/useOverlay';
import { useLocale } from '../../locale';
import type { ExModalEmits, ExModalExposed, ExModalProps } from './types';

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
  zIndex: undefined,
  appendToBody: true,
  destroyOnClose: false,
  showFooter: true,
  lockScroll: true,
});

const emit = defineEmits<ExModalEmits>();
const slots = useSlots();
const { t } = useLocale('dialog');
const baseZIndex = useZIndex(50);
const modalRef = ref<HTMLDivElement>();
const titleId = `ex-modal-title-${useId()}`;

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
const hasHeader = computed(() => Boolean(hasTitle.value || slots.icon));
const hasFooter = computed(() => Boolean(slots.footer || props.showFooter));

const rootClasses = computed(() => ({
  'ex-modal-root--modeless': !props.mask,
}));
const rootStyles = computed<CSSProperties>(() => ({
  zIndex: props.zIndex ?? baseZIndex.value,
}));
const wrapClasses = computed(() => [
  {
    'ex-modal-wrap--centered': props.centered,
  },
  props.wrapClassName,
]);
const modalClasses = computed(() => [
  'ex-modal',
  `ex-modal--${props.size}`,
  `ex-modal--${props.type}`,
]);

/** 仅接受正的有限像素数值；字符串交由浏览器按 CSS 长度规则校验。 */
const normalizedWidth = computed(() => {
  if (typeof props.width === 'number') {
    return Number.isFinite(props.width) && props.width > 0 ? `${props.width}px` : undefined;
  }
  const width = props.width?.trim();
  return width || undefined;
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
    emit('cancel');
    await requestClose();
  },
  trapFocus: () => props.mask,
  autoFocus: () => props.mask,
  restoreFocus: true,
});

const handleMaskClick = () => {
  if (!props.mask || !props.maskClosable) return;
  emit('cancel');
  void requestClose();
};
const handleOk = () => {
  emit('ok');
  void requestClose();
};
const handleCancel = () => {
  emit('cancel');
  void requestClose();
};
const handleAfterClose = () => emit('afterClose');

const open = () => requestOpen();
const close = () => requestClose();
const getElement = () => modalRef.value ?? null;

defineExpose<ExModalExposed>({ open, close, getElement });
</script>

<style scoped lang="scss" src="./ExModal.scss"></style>
