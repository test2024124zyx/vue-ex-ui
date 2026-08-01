<template>
  <Teleport to="body">
    <Transition
      name="ex-drawer-wrapper-fade"
      @after-enter="handleOpened"
      @after-leave="handleClosed"
    >
      <div
        v-if="shouldRender"
        v-show="visible"
        ref="wrapperRef"
        class="ex-drawer-wrapper"
        :class="wrapperClasses"
        :data-theme="configTheme"
        :style="wrapperStyles"
        v-bind="$attrs"
      >
        <Transition name="ex-drawer-mask-fade">
          <div
            v-if="mask && shouldRender"
            v-show="visible"
            class="ex-drawer-mask"
            @click="handleMaskClick"
          ></div>
        </Transition>

        <Transition :name="`ex-drawer-slide-${placement}`">
          <div
            v-if="shouldRender"
            v-show="visible"
            ref="panelRef"
            :class="drawerClasses"
            :style="drawerStyles"
            role="dialog"
            :aria-modal="mask ? 'true' : undefined"
            :aria-label="ariaLabel || undefined"
            :aria-labelledby="!ariaLabel && hasTitle && !$slots.header ? titleId : undefined"
            @click.stop
          >
            <div
              class="ex-drawer__border"
              aria-hidden="true"
            ></div>

            <div
              v-if="showHeader"
              class="ex-drawer__header"
            >
              <slot
                v-if="$slots.header"
                name="header"
              ></slot>
              <div
                v-else-if="hasTitle"
                :id="titleId"
                class="ex-drawer__title"
              >
                <slot name="title">
                  {{ title }}
                </slot>
              </div>

              <button
                v-if="closable"
                class="ex-drawer__close"
                type="button"
                :aria-label="t('close')"
                @click="handleClose"
              >
                <ExIcon
                  icon="close-line"
                  :size="20"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div class="ex-drawer__body">
              <slot></slot>
            </div>

            <div
              v-if="hasFooter"
              class="ex-drawer__footer"
            >
              <slot name="footer">
                <ExButton
                  :disabled="cancelDisabled"
                  @click="handleCancel"
                >
                  {{ cancelText || t('cancel') }}
                </ExButton>
                <ExButton
                  :type="okType"
                  :loading="okLoading"
                  :disabled="okDisabled"
                  @click="handleOk"
                >
                  {{ okText || t('ok') }}
                </ExButton>
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
import type { CSSProperties } from 'vue';
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import { useConfigTheme, useZIndex } from '../config-provider/composables';
import { useLocale } from '../../locale';
import { useGuardedVisibility } from '../../composables/useGuardedVisibility';
import { useOverlay } from '../../composables/useOverlay';
import type { ExDrawerEmits, ExDrawerExposed, ExDrawerProps } from './types';

defineOptions({
  name: 'ExDrawer',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExDrawerProps>(), {
  modelValue: false,
  placement: 'right',
  size: 'medium',
  closable: true,
  mask: true,
  maskClosable: true,
  closeOnPressEscape: true,
  destroyOnClose: false,
  showFooter: false,
  okType: 'primary',
  okLoading: false,
  okDisabled: false,
  cancelDisabled: false,
  zIndex: undefined,
  lockScroll: true,
});

const emit = defineEmits<ExDrawerEmits>();
const slots = useSlots();
const { t } = useLocale('drawer');
const baseZIndex = useZIndex(50);
const configTheme = useConfigTheme();
const wrapperRef = ref<HTMLDivElement>();
const panelRef = ref<HTMLDivElement>();
const titleId = `ex-drawer-title-${useId()}`;

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
const showHeader = computed(() => Boolean(slots.header || hasTitle.value || props.closable));
const hasFooter = computed(() => Boolean(slots.footer || props.showFooter));

const wrapperClasses = computed(() => ({
  'ex-drawer-wrapper--modeless': !props.mask,
}));
const wrapperStyles = computed<CSSProperties>(() => ({
  zIndex: props.zIndex ?? baseZIndex.value,
}));
const drawerClasses = computed(() => [
  'ex-drawer',
  `ex-drawer--${props.placement}`,
  props.customClass,
]);

const PRESET_SIZES = {
  small: '300px',
  medium: '500px',
  large: '800px',
  'extra-large': '1000px',
} as const;

/** 将预设与数值尺寸转换为有效 CSS 长度，非法数值稳定回退到中等尺寸。 */
const normalizedSize = computed(() => {
  if (typeof props.size === 'number') {
    return Number.isFinite(props.size) && props.size > 0 ? `${props.size}px` : PRESET_SIZES.medium;
  }
  return PRESET_SIZES[props.size as keyof typeof PRESET_SIZES] ?? props.size;
});

const sizeStyles = computed<CSSProperties>(() => {
  if (props.placement === 'left' || props.placement === 'right') {
    return { width: normalizedSize.value, maxWidth: '100vw' };
  }
  return { height: normalizedSize.value, maxHeight: '100vh' };
});
const drawerStyles = computed(() => [sizeStyles.value, props.customStyle]);

useOverlay({
  active: () => visible.value,
  container: panelRef,
  lockScroll: () => props.mask && props.lockScroll,
  closeOnEscape: () => props.closeOnPressEscape,
  onEscape: async () => {
    await requestClose();
  },
  trapFocus: () => props.mask,
  autoFocus: () => props.mask,
  restoreFocus: true,
});

const handleMaskClick = () => {
  if (props.mask && props.maskClosable) void requestClose();
};
const handleClose = () => void requestClose();
const handleOk = () => emit('ok');
const handleCancel = () => {
  emit('cancel');
  void requestClose();
};
const handleOpened = () => emit('opened');
const handleClosed = () => emit('closed');

const open = () => requestOpen();
const close = () => requestClose();
const getElement = () => panelRef.value ?? null;

defineExpose<ExDrawerExposed>({ open, close, getElement });
</script>

<style scoped lang="scss" src="./ExDrawer.scss"></style>
