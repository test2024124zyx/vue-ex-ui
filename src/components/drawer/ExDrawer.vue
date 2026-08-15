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
        class="ex-drawer-wrapper"
        :class="wrapperClasses"
        :data-theme="configTheme"
        :style="wrapperStyles"
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
            v-bind="panelAttrs"
            :class="drawerClasses"
            :style="drawerStyles"
            :role="dialogRole"
            :aria-modal="mask ? 'true' : undefined"
            :aria-label="accessibleLabel"
            :aria-labelledby="labelledBy"
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
              <div
                v-if="$slots.header"
                :id="titleId"
                class="ex-drawer__title"
              >
                <slot name="header"></slot>
              </div>
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
import { computed, ref, useAttrs, useId, useSlots, watch } from 'vue';
import type { CSSProperties } from 'vue';
import ExButton from '../button/ExButton.vue';
import ExIcon from '../icon/ExIcon.vue';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
} from '../config-provider/composables';
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
const attrs = useAttrs();
const { t } = useLocale('drawer');
const { t: tDialog } = useLocale('dialog');
const baseZIndex = useZIndexLayer('modal');
const configTheme = useConfigTheme();
const neonEffect = useNeonEffect();
const animation = useAnimation();
const panelRef = ref<HTMLDivElement>();
const titleId = `ex-drawer-title-${useId()}`;
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

const shouldRender = computed(() => visible.value || (hasOpened.value && !props.destroyOnClose));
const hasTitle = computed(() => Boolean(props.title || slots.title));
const accessibleLabel = computed(() => {
  const explicitLabel = props.ariaLabel?.trim() || nativeAriaLabel.value;
  if (explicitLabel) return explicitLabel;
  if (nativeLabelledBy.value || slots.header || hasTitle.value) return undefined;
  return tDialog('label');
});
const labelledBy = computed(() => {
  if (props.ariaLabel?.trim() || nativeAriaLabel.value) return undefined;
  return nativeLabelledBy.value ?? (slots.header || hasTitle.value ? titleId : undefined);
});
const showHeader = computed(() => Boolean(slots.header || hasTitle.value || props.closable));
const hasFooter = computed(() => Boolean(slots.footer || props.showFooter));

const wrapperClasses = computed(() => ({
  'ex-drawer-wrapper--modeless': !props.mask,
  'ex-no-neon': !neonEffect.value,
  'ex-no-animation': !animation.value,
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
    await requestCloseIntent('api');
  },
  trapFocus: () => props.mask,
  autoFocus: () => props.mask,
  restoreFocus: true,
});

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
  if (props.mask && props.maskClosable) void requestCloseIntent('api');
};
const handleClose = () => void requestCloseIntent('api');
const handleOk = () => emit('ok');
const handleCancel = () => {
  void requestCloseIntent('cancel');
};
const handleOpened = () => emit('opened');
const handleClosed = () => emit('closed');

const open = () => {
  pendingCloseIntent = null;
  requestOpen();
};
const close = () => requestCloseIntent('api');
const getElement = () => panelRef.value ?? null;

defineExpose<ExDrawerExposed>({ open, close, getElement });
</script>

<style scoped lang="scss" src="./ExDrawer.scss"></style>
