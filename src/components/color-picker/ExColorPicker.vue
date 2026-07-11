<template>
  <div ref="rootRef" v-bind="$attrs" :class="rootClasses" :style="rootStyle">
    <!-- 触发器保持原生按钮语义所需的键盘与 ARIA 行为。 -->
    <button
      ref="triggerRef"
      type="button"
      class="ex-color-picker__trigger"
      :class="{ 'is-empty': !hasValue }"
      aria-haspopup="dialog"
      :aria-controls="panelId"
      :aria-label="t('trigger')"
      :aria-disabled="disabled"
      :aria-expanded="visible"
      :disabled="disabled"
      :tabindex="disabled ? -1 : 0"
      @click="handleTriggerClick"
      @keydown="handleTriggerKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <div class="ex-color-picker__swatch">
        <div class="ex-color-picker__swatch-inner" :style="previewStyle" />
      </div>
      <ExIcon
        class="ex-color-picker__arrow"
        icon="arrow-down-s-line"
        :size="14"
        aria-hidden="true"
      />
    </button>

    <Teleport to="body" :disabled="!teleported">
      <Transition name="ex-color-picker-dropdown">
        <div
          v-if="visible"
          :id="panelId"
          ref="panelRef"
          class="ex-color-picker__panel"
          :class="popperClass"
          :style="panelStyle"
          role="dialog"
          :aria-label="t('panel')"
          @keydown.esc.stop.prevent="handleEscape"
        >
          <!-- 二维色板通过方向键分别调整饱和度与明度。 -->
          <div
            ref="svRef"
            class="ex-color-picker__sv"
            :style="svStyle"
            role="application"
            tabindex="0"
            :aria-label="`${t('saturationValue')}: ${saturationValueText}`"
            @pointerdown="onSVDown"
            @keydown="handleSVKeydown"
          >
            <div class="ex-color-picker__sv-white" />
            <div class="ex-color-picker__sv-black" />
            <div class="ex-color-picker__sv-thumb" :style="svThumbStyle" />
          </div>

          <div class="ex-color-picker__sliders">
            <div class="ex-color-picker__slider-stack">
              <div
                ref="hueRef"
                class="ex-color-picker__hue"
                role="slider"
                tabindex="0"
                aria-orientation="horizontal"
                :aria-label="t('hue')"
                aria-valuemin="0"
                aria-valuemax="360"
                :aria-valuenow="Math.round(hsva.h)"
                @pointerdown="onHueDown"
                @keydown="handleHueKeydown"
              >
                <div class="ex-color-picker__slider-thumb" :style="hueThumbStyle" />
              </div>

              <div
                v-if="showAlpha"
                ref="alphaRef"
                class="ex-color-picker__alpha"
                role="slider"
                tabindex="0"
                aria-orientation="horizontal"
                :aria-label="t('alpha')"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-valuenow="Math.round(hsva.a * 100)"
                @pointerdown="onAlphaDown"
                @keydown="handleAlphaKeydown"
              >
                <div class="ex-color-picker__alpha-bar" :style="alphaBarStyle" />
                <div class="ex-color-picker__slider-thumb" :style="alphaThumbStyle" />
              </div>
            </div>

            <div class="ex-color-picker__current" aria-hidden="true">
              <div class="ex-color-picker__current-inner" :style="previewStyle" />
            </div>
          </div>

          <div class="ex-color-picker__controls">
            <label :for="inputId" class="ex-color-picker__label">{{ t('hex') }}</label>
            <input
              :id="inputId"
              v-model="hexInput"
              class="ex-color-picker__input"
              spellcheck="false"
              autocomplete="off"
              @keydown.enter.prevent="handleHexCommit"
              @blur="handleHexCommit"
            />
          </div>

          <div v-if="predefine?.length" class="ex-color-picker__predefine">
            <button
              v-for="(color, index) in predefine"
              :key="`${color}-${index}`"
              type="button"
              class="ex-color-picker__predefine-item"
              :title="color"
              :aria-label="`${t('selectColor')} ${color}`"
              @click="selectPredefine(color)"
            >
              <span class="ex-color-picker__predefine-inner" :style="{ backgroundColor: color }" />
            </button>
          </div>

          <div class="ex-color-picker__footer">
            <button
              v-if="clearable"
              type="button"
              class="ex-color-picker__btn ex-color-picker__btn--text"
              @click="handleClear"
            >
              {{ t('clear') }}
            </button>
            <button
              type="button"
              class="ex-color-picker__btn ex-color-picker__btn--primary"
              @click="handleConfirm"
            >
              {{ t('confirm') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, reactive, ref, useId, watch } from 'vue';
import type { ExColorPickerEmits, ExColorPickerExposed, ExColorPickerProps } from './types';
import { clamp, formatColor, hsvToRgb, opaqueRgb, parseColor, rgbToHsv } from './utils';
import type { RGBA } from './utils';
import { useLocale } from '../../locale';
import { useComponentSize } from '../config-provider/composables';
import { useFormItem } from '../form/use-form-item';
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';

defineOptions({
  name: 'ExColorPicker',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExColorPickerProps>(), {
  modelValue: '',
  disabled: false,
  size: undefined,
  showAlpha: false,
  format: 'hex',
  predefine: undefined,
  clearable: true,
  teleported: true,
});

const emit = defineEmits<ExColorPickerEmits>();
const { t } = useLocale('colorPicker');
const componentSize = useComponentSize(computed(() => props.size));
const formItem = useFormItem();
const instanceId = useId();
const panelId = `ex-color-picker-panel-${instanceId}`;
const inputId = `ex-color-picker-input-${instanceId}`;

const rootRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const panelRef = ref<HTMLElement>();
const svRef = ref<HTMLElement>();
const hueRef = ref<HTMLElement>();
const alphaRef = ref<HTMLElement>();

const visible = ref(false);
const panelStyle = ref<Record<string, string>>({});
const hasValue = ref(false);
const hexInput = ref('');
const hsva = reactive({ h: 0, s: 1, v: 1, a: 1 });

const rootClasses = computed(() => [
  'ex-color-picker',
  `ex-color-picker--${componentSize.value}`,
  { 'is-disabled': props.disabled, 'is-active': visible.value },
  ...normalizeCustomClass(props.class),
]);
const rootStyle = computed(() => props.style || undefined);

const currentRgba = computed<RGBA>(() => {
  const { r, g, b } = hsvToRgb(hsva.h, hsva.s, hsva.v);
  return { r, g, b, a: props.showAlpha ? hsva.a : 1 };
});
const currentColorString = computed(() =>
  formatColor(currentRgba.value, props.format, props.showAlpha)
);
const currentHex = computed(() => formatColor(currentRgba.value, 'hex', props.showAlpha));
const hueRgb = computed(() => {
  const { r, g, b } = hsvToRgb(hsva.h, 1, 1);
  return `rgb(${r}, ${g}, ${b})`;
});

const previewStyle = computed(() =>
  hasValue.value
    ? {
        backgroundColor: `rgba(${currentRgba.value.r}, ${currentRgba.value.g}, ${currentRgba.value.b}, ${currentRgba.value.a})`,
      }
    : {}
);
const svStyle = computed(() => ({ backgroundColor: hueRgb.value }));
const svThumbStyle = computed(() => ({
  left: `${hsva.s * 100}%`,
  top: `${(1 - hsva.v) * 100}%`,
}));
const hueThumbStyle = computed(() => ({ left: `${(hsva.h / 360) * 100}%` }));
const alphaBarStyle = computed(() => ({
  background: `linear-gradient(to right, rgba(${currentRgba.value.r}, ${currentRgba.value.g}, ${currentRgba.value.b}, 0), ${opaqueRgb(currentRgba.value)})`,
}));
const alphaThumbStyle = computed(() => ({ left: `${hsva.a * 100}%` }));
const saturationValueText = computed(
  () => `${Math.round(hsva.s * 100)}%, ${Math.round(hsva.v * 100)}%`
);

/** 将外部颜色同步到内部状态；透明度始终保留，避免运行时开启 Alpha 后丢失语义。 */
const syncFromValue = (value: string) => {
  const parsed = parseColor(value ?? '');
  if (!parsed) {
    hasValue.value = false;
    hexInput.value = '';
    return;
  }

  const { h, s, v } = rgbToHsv(parsed.r, parsed.g, parsed.b);
  hsva.h = h;
  hsva.s = s;
  hsva.v = v;
  hsva.a = parsed.a;
  hasValue.value = true;
  hexInput.value = currentHex.value;
};

watch(
  () => props.modelValue,
  value => syncFromValue(value),
  { immediate: true }
);

watch(
  () => props.showAlpha,
  () => {
    if (hasValue.value) hexInput.value = currentHex.value;
    if (visible.value) nextTick(updatePanelPosition);
  }
);

/** 实时更新绑定值；change 仅在一次交互正式结束时触发。 */
const applyLive = () => {
  hasValue.value = true;
  const value = currentColorString.value;
  hexInput.value = currentHex.value;
  emit('update:modelValue', value);
  emit('active-change', value);
};

const commit = () => {
  emit('change', currentColorString.value);
  formItem?.onFieldChange();
};

let removeDragListeners: (() => void) | null = null;

const stopDrag = () => {
  removeDragListeners?.();
  removeDragListeners = null;
};

/** 每次拖拽只维护一组全局监听，并区分正常释放与系统取消。 */
const startDrag = (computeValue: (event: PointerEvent) => boolean) => (event: PointerEvent) => {
  if (props.disabled) return;
  event.preventDefault();
  stopDrag();
  let hasChanged = computeValue(event);

  const move = (moveEvent: PointerEvent) => {
    if (props.disabled) {
      cleanup();
      return;
    }
    hasChanged = computeValue(moveEvent) || hasChanged;
  };
  const cleanup = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', finish);
    window.removeEventListener('pointercancel', cancel);
    window.removeEventListener('blur', cancel);
    if (removeDragListeners === cleanup) removeDragListeners = null;
  };
  const finish = () => {
    cleanup();
    if (!props.disabled && hasChanged) commit();
  };
  const cancel = () => cleanup();

  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', cancel);
  window.addEventListener('blur', cancel);
  removeDragListeners = cleanup;
};

const computeSV = (event: PointerEvent) => {
  if (!svRef.value) return false;
  const rect = svRef.value.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;
  hsva.s = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  hsva.v = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
  applyLive();
  return true;
};

const computeHue = (event: PointerEvent) => {
  if (!hueRef.value) return false;
  const rect = hueRef.value.getBoundingClientRect();
  if (rect.width <= 0) return false;
  hsva.h = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 360;
  applyLive();
  return true;
};

const computeAlpha = (event: PointerEvent) => {
  if (!alphaRef.value) return false;
  const rect = alphaRef.value.getBoundingClientRect();
  if (rect.width <= 0) return false;
  hsva.a = clamp((event.clientX - rect.left) / rect.width, 0, 1);
  applyLive();
  return true;
};

const onSVDown = startDrag(computeSV);
const onHueDown = startDrag(computeHue);
const onAlphaDown = startDrag(computeAlpha);

const finishKeyboardChange = () => {
  applyLive();
  commit();
};

const handleSVKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  const step = event.shiftKey ? 0.1 : 0.01;
  if (event.key === 'ArrowLeft') hsva.s = clamp(hsva.s - step, 0, 1);
  else if (event.key === 'ArrowRight') hsva.s = clamp(hsva.s + step, 0, 1);
  else if (event.key === 'ArrowDown') hsva.v = clamp(hsva.v - step, 0, 1);
  else if (event.key === 'ArrowUp') hsva.v = clamp(hsva.v + step, 0, 1);
  else return;
  event.preventDefault();
  finishKeyboardChange();
};

const handleHueKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  const step = event.shiftKey || event.key === 'PageUp' || event.key === 'PageDown' ? 10 : 1;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'PageDown') {
    hsva.h = clamp(hsva.h - step, 0, 360);
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'PageUp') {
    hsva.h = clamp(hsva.h + step, 0, 360);
  } else if (event.key === 'Home') hsva.h = 0;
  else if (event.key === 'End') hsva.h = 360;
  else return;
  event.preventDefault();
  finishKeyboardChange();
};

const handleAlphaKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  const step = event.shiftKey || event.key === 'PageUp' || event.key === 'PageDown' ? 0.1 : 0.01;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown' || event.key === 'PageDown') {
    hsva.a = clamp(hsva.a - step, 0, 1);
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'PageUp') {
    hsva.a = clamp(hsva.a + step, 0, 1);
  } else if (event.key === 'Home') hsva.a = 0;
  else if (event.key === 'End') hsva.a = 1;
  else return;
  event.preventDefault();
  finishKeyboardChange();
};

const handleHexCommit = () => {
  if (props.disabled) return;
  const parsed = parseColor(hexInput.value);
  if (!parsed) {
    hexInput.value = hasValue.value ? currentHex.value : '';
    return;
  }

  const { h, s, v } = rgbToHsv(parsed.r, parsed.g, parsed.b);
  hsva.h = h;
  hsva.s = s;
  hsva.v = v;
  hsva.a = parsed.a;
  applyLive();
  commit();
};

const selectPredefine = (color: string) => {
  if (props.disabled) return;
  const parsed = parseColor(color);
  if (!parsed) return;
  const { h, s, v } = rgbToHsv(parsed.r, parsed.g, parsed.b);
  hsva.h = h;
  hsva.s = s;
  hsva.v = v;
  hsva.a = parsed.a;
  applyLive();
  commit();
};

/** 面板定位同时约束在可视区域内，避免靠近窗口边缘时溢出。 */
const updatePanelPosition = () => {
  if (!panelRef.value) return;
  if (!props.teleported) {
    panelStyle.value = { position: 'absolute', top: 'calc(100% + 6px)', left: '0' };
    return;
  }
  if (!triggerRef.value) return;

  const triggerRect = triggerRef.value.getBoundingClientRect();
  const panelWidth = panelRef.value.offsetWidth;
  const panelHeight = panelRef.value.offsetHeight;
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
  const gap = 6;
  const edge = 8;
  const spaceBelow = viewportHeight - triggerRect.bottom;
  const preferredTop =
    spaceBelow < panelHeight + gap && triggerRect.top > panelHeight + gap
      ? triggerRect.top - panelHeight - gap
      : triggerRect.bottom + gap;
  const top = clamp(preferredTop, edge, Math.max(edge, viewportHeight - panelHeight - edge));
  const left = clamp(triggerRect.left, edge, Math.max(edge, viewportWidth - panelWidth - edge));

  panelStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
  };
};

const open = () => {
  if (props.disabled || visible.value) return;
  syncFromValue(props.modelValue);
  visible.value = true;
  emit('visible-change', true);
  nextTick(updatePanelPosition);
};

const close = () => {
  if (!visible.value) return;
  stopDrag();
  visible.value = false;
  emit('visible-change', false);
};

const handleTriggerClick = () => {
  if (props.disabled) return;
  if (visible.value) close();
  else open();
};

const handleConfirm = () => {
  if (props.disabled) return;
  if (!hasValue.value) applyLive();
  commit();
  close();
};

const handleClear = () => {
  if (props.disabled) return;
  hasValue.value = false;
  hexInput.value = '';
  emit('update:modelValue', '');
  emit('change', '');
  emit('clear');
  formItem?.onFieldChange();
  close();
};

const handleFocus = (event: FocusEvent) => emit('focus', event);
const handleBlur = (event: FocusEvent) => {
  emit('blur', event);
  formItem?.onFieldBlur();
};

const handleTriggerKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    open();
  } else if (event.key === 'Escape' && visible.value) {
    event.preventDefault();
    close();
  }
};

const handleEscape = () => {
  close();
  nextTick(() => triggerRef.value?.focus());
};

const handleClickOutside = (event: MouseEvent) => {
  if (!visible.value) return;
  const target = event.target as Node;
  if (
    rootRef.value &&
    !rootRef.value.contains(target) &&
    panelRef.value &&
    !panelRef.value.contains(target)
  ) {
    close();
  }
};

watch(visible, isVisible => {
  if (isVisible) {
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
  } else {
    document.removeEventListener('mousedown', handleClickOutside);
    window.removeEventListener('resize', updatePanelPosition);
    window.removeEventListener('scroll', updatePanelPosition, true);
  }
});

watch(
  () => props.disabled,
  isDisabled => {
    if (isDisabled) close();
  }
);

watch(
  () => props.teleported,
  () => {
    if (visible.value) nextTick(updatePanelPosition);
  }
);

onUnmounted(() => {
  stopDrag();
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('resize', updatePanelPosition);
  window.removeEventListener('scroll', updatePanelPosition, true);
});

const focus = () => triggerRef.value?.focus();
const blur = () => triggerRef.value?.blur();

defineExpose<ExColorPickerExposed>({ focus, blur });
</script>

<style scoped lang="scss" src="./ExColorPicker.scss"></style>
