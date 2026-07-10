<template>
  <div ref="rootRef" :class="rootClasses" :style="rootStyle">
    <!-- 触发器 -->
    <div
      ref="triggerRef"
      class="ex-color-picker__trigger"
      :class="{ 'is-empty': !hasValue }"
      role="button"
      :aria-disabled="disabled"
      :aria-expanded="visible"
      :tabindex="disabled ? undefined : 0"
      @click="handleTriggerClick"
      @keydown="handleKeydown"
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
    </div>

    <!-- 面板 -->
    <Teleport to="body" :disabled="!teleported">
      <Transition name="ex-color-picker-dropdown">
        <div
          v-if="visible"
          ref="panelRef"
          class="ex-color-picker__panel"
          :class="popperClass"
          :style="panelStyle"
        >
          <!-- 饱和度/明度面板 -->
          <div ref="svRef" class="ex-color-picker__sv" :style="svStyle" @pointerdown="onSVDown">
            <div class="ex-color-picker__sv-white" />
            <div class="ex-color-picker__sv-black" />
            <div class="ex-color-picker__sv-thumb" :style="svThumbStyle" />
          </div>

          <div class="ex-color-picker__sliders">
            <div class="ex-color-picker__slider-stack">
              <!-- 色相 -->
              <div ref="hueRef" class="ex-color-picker__hue" @pointerdown="onHueDown">
                <div class="ex-color-picker__slider-thumb" :style="hueThumbStyle" />
              </div>

              <!-- 透明度 -->
              <div
                v-if="showAlpha"
                ref="alphaRef"
                class="ex-color-picker__alpha"
                @pointerdown="onAlphaDown"
              >
                <div class="ex-color-picker__alpha-bar" :style="alphaBarStyle" />
                <div class="ex-color-picker__slider-thumb" :style="alphaThumbStyle" />
              </div>
            </div>

            <!-- 当前色预览 -->
            <div class="ex-color-picker__current">
              <div class="ex-color-picker__current-inner" :style="previewStyle" />
            </div>
          </div>

          <!-- HEX 输入 -->
          <div class="ex-color-picker__controls">
            <span class="ex-color-picker__label">{{ t('hex') }}</span>
            <input
              v-model="hexInput"
              class="ex-color-picker__input"
              spellcheck="false"
              @keydown.enter="handleHexCommit"
              @blur="handleHexCommit"
            />
          </div>

          <!-- 预定义颜色 -->
          <div v-if="predefine && predefine.length" class="ex-color-picker__predefine">
            <div
              v-for="(color, i) in predefine"
              :key="i"
              class="ex-color-picker__predefine-item"
              :title="color"
              @click="selectPredefine(color)"
            >
              <div class="ex-color-picker__predefine-inner" :style="{ backgroundColor: color }" />
            </div>
          </div>

          <!-- 底部 -->
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
import { computed, ref, reactive, watch, nextTick, onUnmounted } from 'vue';
import type { ExColorPickerProps, ExColorPickerEmits, ExColorPickerExposed } from './types';
import { hsvToRgb, rgbToHsv, parseColor, formatColor, opaqueRgb, clamp, type RGBA } from './utils';
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

const rootStyle = computed(() => (props.style ? props.style : undefined));

// 派生颜色
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
const svThumbStyle = computed(() => ({ left: `${hsva.s * 100}%`, top: `${(1 - hsva.v) * 100}%` }));
const hueThumbStyle = computed(() => ({ left: `${(hsva.h / 360) * 100}%` }));
const alphaBarStyle = computed(() => ({
  background: `linear-gradient(to right, rgba(${currentRgba.value.r}, ${currentRgba.value.g}, ${currentRgba.value.b}, 0), ${opaqueRgb(currentRgba.value)})`,
}));
const alphaThumbStyle = computed(() => ({ left: `${hsva.a * 100}%` }));

// 外部值 -> 内部 HSVA
const syncFromValue = (val: string) => {
  const parsed = parseColor(val ?? '');
  if (parsed) {
    const { h, s, v } = rgbToHsv(parsed.r, parsed.g, parsed.b);
    hsva.h = h;
    hsva.s = s;
    hsva.v = v;
    hsva.a = props.showAlpha ? parsed.a : 1;
    hasValue.value = true;
    hexInput.value = currentHex.value;
  } else {
    hasValue.value = false;
    hexInput.value = '';
  }
};

watch(
  () => props.modelValue,
  val => syncFromValue(val),
  { immediate: true }
);

// 实时应用（拖动过程中）
const applyLive = () => {
  hasValue.value = true;
  const str = currentColorString.value;
  hexInput.value = currentHex.value;
  emit('update:modelValue', str);
  emit('active-change', str);
};

const commit = () => {
  emit('change', currentColorString.value);
  formItem?.onFieldChange();
};

// 拖动逻辑
let removeDrag: (() => void) | null = null;
const stopDrag = () => {
  removeDrag?.();
  removeDrag = null;
};

const startDrag = (compute: (e: PointerEvent) => void) => (e: PointerEvent) => {
  if (props.disabled) return;
  e.preventDefault();
  compute(e);
  const move = (ev: PointerEvent) => compute(ev);
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    removeDrag = null;
    commit();
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  removeDrag = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
  };
};

const computeSV = (e: PointerEvent) => {
  if (!svRef.value) return;
  const rect = svRef.value.getBoundingClientRect();
  hsva.s = clamp((e.clientX - rect.left) / rect.width, 0, 1);
  hsva.v = clamp(1 - (e.clientY - rect.top) / rect.height, 0, 1);
  applyLive();
};
const computeHue = (e: PointerEvent) => {
  if (!hueRef.value) return;
  const rect = hueRef.value.getBoundingClientRect();
  hsva.h = clamp((e.clientX - rect.left) / rect.width, 0, 1) * 360;
  applyLive();
};
const computeAlpha = (e: PointerEvent) => {
  if (!alphaRef.value) return;
  const rect = alphaRef.value.getBoundingClientRect();
  hsva.a = clamp((e.clientX - rect.left) / rect.width, 0, 1);
  applyLive();
};

const onSVDown = startDrag(computeSV);
const onHueDown = startDrag(computeHue);
const onAlphaDown = startDrag(computeAlpha);

// HEX 输入提交
const handleHexCommit = () => {
  const parsed = parseColor(hexInput.value);
  if (parsed) {
    const { h, s, v } = rgbToHsv(parsed.r, parsed.g, parsed.b);
    hsva.h = h;
    hsva.s = s;
    hsva.v = v;
    hsva.a = props.showAlpha ? parsed.a : 1;
    applyLive();
    commit();
  } else {
    hexInput.value = hasValue.value ? currentHex.value : '';
  }
};

const selectPredefine = (color: string) => {
  const parsed = parseColor(color);
  if (!parsed) return;
  const { h, s, v } = rgbToHsv(parsed.r, parsed.g, parsed.b);
  hsva.h = h;
  hsva.s = s;
  hsva.v = v;
  hsva.a = props.showAlpha ? parsed.a : 1;
  applyLive();
  commit();
};

// 面板定位
const updatePanelPosition = () => {
  if (!props.teleported || !triggerRef.value || !panelRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const panelHeight = panelRef.value.offsetHeight;
  const spaceBelow = window.innerHeight - rect.bottom;
  const top =
    spaceBelow < panelHeight && rect.top > panelHeight
      ? rect.top - panelHeight - 6
      : rect.bottom + 6;
  panelStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${rect.left}px`,
  };
};

const open = () => {
  if (props.disabled) return;
  syncFromValue(props.modelValue);
  visible.value = true;
  emit('visible-change', true);
  nextTick(updatePanelPosition);
};
const close = () => {
  if (!visible.value) return;
  visible.value = false;
  emit('visible-change', false);
};

const handleTriggerClick = () => {
  if (props.disabled) return;
  if (visible.value) close();
  else open();
};

const handleConfirm = () => {
  applyLive();
  commit();
  close();
};

const handleClear = () => {
  hasValue.value = false;
  hexInput.value = '';
  emit('update:modelValue', '');
  emit('change', '');
  emit('clear');
  formItem?.onFieldChange();
  close();
};

const handleFocus = (e: FocusEvent) => emit('focus', e);
const handleBlur = (e: FocusEvent) => {
  emit('blur', e);
  formItem?.onFieldBlur();
};

const handleKeydown = (e: KeyboardEvent) => {
  if (props.disabled) return;
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (visible.value) close();
    else open();
  } else if (e.key === 'Escape' && visible.value) {
    e.preventDefault();
    close();
  }
};

// 点击外部关闭
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
