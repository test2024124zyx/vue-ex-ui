<template>
  <div ref="rootRef" :class="rootClasses" :style="rootStyle">
    <!-- 触发器 -->
    <div
      ref="triggerRef"
      class="ex-time-picker__trigger"
      role="combobox"
      aria-haspopup="dialog"
      :aria-expanded="visible"
      :aria-disabled="disabled"
      :tabindex="disabled ? undefined : 0"
      @click="handleTriggerClick"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <ExIcon icon="time-line" class="ex-time-picker__prefix" :size="16" aria-hidden="true" />
      <span v-if="modelValue" class="ex-time-picker__text">{{ modelValue }}</span>
      <span v-else class="ex-time-picker__placeholder">{{ placeholder || t('selectTime') }}</span>

      <span
        v-if="showClear"
        class="ex-time-picker__clear"
        :aria-label="t('clear')"
        @click.stop="handleClear"
      >
        <ExIcon icon="close-circle-line" :size="16" aria-hidden="true" />
      </span>
    </div>

    <!-- 下拉面板 -->
    <Teleport to="body" :disabled="!teleported">
      <Transition name="ex-time-picker-dropdown">
        <div
          v-if="visible"
          ref="panelRef"
          class="ex-time-picker__panel"
          :class="popperClass"
          :style="panelStyle"
        >
          <div class="ex-time-picker__columns">
            <div v-if="showHour" ref="hourColRef" class="ex-time-picker__column" role="listbox">
              <div
                v-for="h in hours"
                :key="`h-${h.value}`"
                class="ex-time-picker__cell"
                :class="{ 'is-selected': draft.h === h.value, 'is-disabled': h.disabled }"
                role="option"
                :aria-selected="draft.h === h.value"
                @click="selectUnit('h', h.value, h.disabled)"
              >
                {{ pad(h.value) }}
              </div>
            </div>

            <div v-if="showMinute" ref="minuteColRef" class="ex-time-picker__column" role="listbox">
              <div
                v-for="m in minutes"
                :key="`m-${m.value}`"
                class="ex-time-picker__cell"
                :class="{ 'is-selected': draft.m === m.value, 'is-disabled': m.disabled }"
                role="option"
                :aria-selected="draft.m === m.value"
                @click="selectUnit('m', m.value, m.disabled)"
              >
                {{ pad(m.value) }}
              </div>
            </div>

            <div v-if="showSecond" ref="secondColRef" class="ex-time-picker__column" role="listbox">
              <div
                v-for="s in seconds"
                :key="`s-${s.value}`"
                class="ex-time-picker__cell"
                :class="{ 'is-selected': draft.s === s.value, 'is-disabled': s.disabled }"
                role="option"
                :aria-selected="draft.s === s.value"
                @click="selectUnit('s', s.value, s.disabled)"
              >
                {{ pad(s.value) }}
              </div>
            </div>
          </div>

          <div class="ex-time-picker__footer">
            <button type="button" class="ex-time-picker__now" @click="selectNow">
              {{ t('now') }}
            </button>
            <button type="button" class="ex-time-picker__confirm" @click="handleConfirm">
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
import type { ExTimePickerProps, ExTimePickerEmits, ExTimePickerExposed } from './types';
import { useLocale } from '../../locale';
import { useComponentSize } from '../config-provider/composables';
import { useFormItem } from '../form/use-form-item';
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';

defineOptions({
  name: 'ExTimePicker',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExTimePickerProps>(), {
  modelValue: '',
  format: 'HH:mm:ss',
  placeholder: '',
  disabled: false,
  clearable: true,
  size: undefined,
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1,
  teleported: true,
});

const emit = defineEmits<ExTimePickerEmits>();

const { t } = useLocale('timePicker');
const componentSize = useComponentSize(computed(() => props.size));
const formItem = useFormItem();

const rootRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const panelRef = ref<HTMLElement>();
const hourColRef = ref<HTMLElement>();
const minuteColRef = ref<HTMLElement>();
const secondColRef = ref<HTMLElement>();

const visible = ref(false);
const panelStyle = ref<Record<string, string>>({});

// 当前编辑中的时分秒
const draft = reactive<{ h: number; m: number; s: number }>({ h: 0, m: 0, s: 0 });

const showHour = computed(() => props.format.includes('HH'));
const showMinute = computed(() => props.format.includes('mm'));
const showSecond = computed(() => props.format.includes('ss'));

const pad = (n: number): string => String(n).padStart(2, '0');

const rootClasses = computed(() => [
  'ex-time-picker',
  `ex-time-picker--${componentSize.value}`,
  { 'is-disabled': props.disabled, 'is-active': visible.value },
  ...normalizeCustomClass(props.class),
]);

const rootStyle = computed(() => {
  if (!props.style) return undefined;
  return props.style;
});

const showClear = computed(() => props.clearable && !props.disabled && !!props.modelValue);

// 解析 modelValue -> draft
const parseValue = (val: string) => {
  if (!val) return null;
  const parts = val.split(':').map(p => parseInt(p, 10));
  const units: Array<'h' | 'm' | 's'> = [];
  if (showHour.value) units.push('h');
  if (showMinute.value) units.push('m');
  if (showSecond.value) units.push('s');
  const result = { h: 0, m: 0, s: 0 };
  units.forEach((u, i) => {
    const n = parts[i];
    if (n !== undefined && !Number.isNaN(n)) result[u] = n;
  });
  return result;
};

const formatDraft = (): string => {
  const segments: string[] = [];
  if (showHour.value) segments.push(pad(draft.h));
  if (showMinute.value) segments.push(pad(draft.m));
  if (showSecond.value) segments.push(pad(draft.s));
  return segments.join(':');
};

const syncDraftFromValue = () => {
  const parsed = parseValue(props.modelValue);
  if (parsed) {
    draft.h = parsed.h;
    draft.m = parsed.m;
    draft.s = parsed.s;
  } else {
    draft.h = 0;
    draft.m = 0;
    draft.s = 0;
  }
};

// 生成各列选项（含禁用判断）
interface Cell {
  value: number;
  disabled: boolean;
}
const buildCells = (max: number, step: number, disabledList: number[]): Cell[] => {
  const cells: Cell[] = [];
  for (let i = 0; i <= max; i += step) {
    cells.push({ value: i, disabled: disabledList.includes(i) });
  }
  return cells;
};

const hours = computed<Cell[]>(() =>
  buildCells(23, Math.max(1, props.hourStep), props.disabledHours?.() ?? [])
);
const minutes = computed<Cell[]>(() =>
  buildCells(59, Math.max(1, props.minuteStep), props.disabledMinutes?.(draft.h) ?? [])
);
const seconds = computed<Cell[]>(() =>
  buildCells(59, Math.max(1, props.secondStep), props.disabledSeconds?.(draft.h, draft.m) ?? [])
);

// 面板定位（向下不够则向上）
const updatePanelPosition = () => {
  if (!props.teleported || !triggerRef.value || !panelRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const panelHeight = panelRef.value.offsetHeight;
  const spaceBelow = window.innerHeight - rect.bottom;

  const top =
    spaceBelow < panelHeight && rect.top > panelHeight
      ? rect.top - panelHeight - 4
      : rect.bottom + 4;

  panelStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${rect.left}px`,
    minWidth: `${rect.width}px`,
  };
};

const scrollSelectedIntoView = () => {
  const scroll = (col?: HTMLElement) => {
    if (!col) return;
    const selected = col.querySelector<HTMLElement>('.is-selected');
    if (selected) col.scrollTop = selected.offsetTop;
  };
  scroll(hourColRef.value);
  scroll(minuteColRef.value);
  scroll(secondColRef.value);
};

const open = () => {
  if (props.disabled) return;
  syncDraftFromValue();
  visible.value = true;
  emit('visible-change', true);
  nextTick(() => {
    updatePanelPosition();
    scrollSelectedIntoView();
  });
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

const emitValue = () => {
  const value = formatDraft();
  emit('update:modelValue', value);
  emit('change', value);
  formItem?.onFieldChange();
};

const selectUnit = (unit: 'h' | 'm' | 's', value: number, disabled: boolean) => {
  if (disabled) return;
  draft[unit] = value;
  emitValue();
  nextTick(scrollSelectedIntoView);
};

const selectNow = () => {
  const now = new Date();
  draft.h = now.getHours();
  draft.m = now.getMinutes();
  draft.s = now.getSeconds();
  emitValue();
  nextTick(scrollSelectedIntoView);
};

const handleConfirm = () => {
  emitValue();
  close();
};

const handleClear = () => {
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
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('resize', updatePanelPosition);
  window.removeEventListener('scroll', updatePanelPosition, true);
});

const focus = () => triggerRef.value?.focus();
const blur = () => triggerRef.value?.blur();

defineExpose<ExTimePickerExposed>({ focus, blur });
</script>

<style scoped lang="scss" src="./ExTimePicker.scss"></style>
