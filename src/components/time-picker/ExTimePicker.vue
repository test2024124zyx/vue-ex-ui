<template>
  <div
    ref="rootRef"
    v-bind="rootAttrs"
    :class="rootClasses"
    :style="rootStyle"
  >
    <!-- 触发器 -->
    <div
      :id="id"
      ref="triggerRef"
      class="ex-time-picker__trigger"
      role="combobox"
      aria-haspopup="dialog"
      :aria-expanded="visible"
      v-bind="fieldAriaAttrs"
      :aria-label="ariaLabel || t('selectTime')"
      :aria-controls="panelId"
      :tabindex="disabled ? undefined : 0"
      @click="handleTriggerClick"
      @keydown="handleKeydown"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <ExIcon
        icon="time-line"
        class="ex-time-picker__prefix"
        :size="16"
        aria-hidden="true"
      />
      <span
        v-if="displayValue"
        class="ex-time-picker__text"
      >
        {{ displayValue }}
      </span>
      <span
        v-else
        class="ex-time-picker__placeholder"
      >
        {{ placeholder || t('selectTime') }}
      </span>

      <button
        v-if="showClear"
        type="button"
        class="ex-time-picker__clear"
        :aria-label="t('clear')"
        @click.stop="handleClear"
      >
        <ExIcon
          icon="close-circle-line"
          :size="16"
          aria-hidden="true"
        />
      </button>
    </div>

    <!-- 下拉面板 -->
    <Teleport
      to="body"
      :disabled="!teleported"
    >
      <Transition name="ex-time-picker-dropdown">
        <div
          v-if="visible"
          :id="panelId"
          ref="panelRef"
          class="ex-time-picker__panel"
          role="dialog"
          :aria-label="ariaLabel || t('selectTime')"
          :data-theme="configTheme"
          :class="[popperClass, portalEffectClasses]"
          :style="panelStyle"
        >
          <div
            v-if="range"
            class="ex-time-picker__endpoints"
            role="tablist"
            :aria-label="t('selectRange')"
          >
            <button
              v-for="endpoint in endpoints"
              :id="`${panelId}-${endpoint}`"
              :key="endpoint"
              type="button"
              role="tab"
              :data-endpoint="endpoint"
              :aria-selected="activeEndpoint === endpoint"
              :aria-controls="`${panelId}-columns`"
              :tabindex="activeEndpoint === endpoint ? 0 : -1"
              @click="selectEndpoint(endpoint)"
              @keydown="handleEndpointKeydown($event, endpoint)"
            >
              <span>{{ t(endpoint === 'start' ? 'startTime' : 'endTime') }}</span>
              <span>
                {{ rangeTouched[endpoint] ? formatTime(rangeDrafts[endpoint]) : t('selectTime') }}
              </span>
            </button>
          </div>
          <div
            :id="`${panelId}-columns`"
            class="ex-time-picker__columns"
            :role="range ? 'tabpanel' : undefined"
            :aria-labelledby="range ? `${panelId}-${activeEndpoint}` : undefined"
          >
            <div
              v-if="showHour"
              ref="hourColRef"
              class="ex-time-picker__column"
              role="listbox"
              :aria-label="t('hour')"
            >
              <div
                v-for="h in hours"
                :key="`h-${h.value}`"
                class="ex-time-picker__cell"
                :class="{ 'is-selected': draft.h === h.value, 'is-disabled': h.disabled }"
                role="option"
                :aria-selected="draft.h === h.value"
                :aria-disabled="h.disabled"
                :tabindex="h.disabled ? -1 : draft.h === h.value ? 0 : -1"
                data-unit="h"
                :data-value="h.value"
                @click="selectUnit('h', h.value, h.disabled)"
                @keydown="handleCellKeydown('h', h.value, $event)"
              >
                {{ pad(h.value) }}
              </div>
            </div>

            <div
              v-if="showMinute"
              ref="minuteColRef"
              class="ex-time-picker__column"
              role="listbox"
              :aria-label="t('minute')"
            >
              <div
                v-for="m in minutes"
                :key="`m-${m.value}`"
                class="ex-time-picker__cell"
                :class="{ 'is-selected': draft.m === m.value, 'is-disabled': m.disabled }"
                role="option"
                :aria-selected="draft.m === m.value"
                :aria-disabled="m.disabled"
                :tabindex="m.disabled ? -1 : draft.m === m.value ? 0 : -1"
                data-unit="m"
                :data-value="m.value"
                @click="selectUnit('m', m.value, m.disabled)"
                @keydown="handleCellKeydown('m', m.value, $event)"
              >
                {{ pad(m.value) }}
              </div>
            </div>

            <div
              v-if="showSecond"
              ref="secondColRef"
              class="ex-time-picker__column"
              role="listbox"
              :aria-label="t('second')"
            >
              <div
                v-for="s in seconds"
                :key="`s-${s.value}`"
                class="ex-time-picker__cell"
                :class="{ 'is-selected': draft.s === s.value, 'is-disabled': s.disabled }"
                role="option"
                :aria-selected="draft.s === s.value"
                :aria-disabled="s.disabled"
                :tabindex="s.disabled ? -1 : draft.s === s.value ? 0 : -1"
                data-unit="s"
                :data-value="s.value"
                @click="selectUnit('s', s.value, s.disabled)"
                @keydown="handleCellKeydown('s', s.value, $event)"
              >
                {{ pad(s.value) }}
              </div>
            </div>
          </div>

          <p
            v-if="invalidRangeOrder"
            class="ex-time-picker__range-error"
            role="status"
          >
            {{ t('invalidRangeOrder') }}
          </p>

          <div class="ex-time-picker__footer">
            <button
              type="button"
              class="ex-time-picker__now"
              :disabled="!interactive || !hasSelectableTime"
              @click="selectNow"
            >
              {{ t('now') }}
            </button>
            <button
              type="button"
              class="ex-time-picker__confirm"
              :disabled="!interactive || !canConfirm"
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
import { computed, ref, reactive, watch, nextTick, onUnmounted, useAttrs } from 'vue';
import type {
  ExTimePickerProps,
  ExTimePickerEmits,
  ExTimePickerExposed,
  TimePickerEndpoint,
  TimePickerRange,
} from './types';
import { useLocale } from '../../locale';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
} from '../config-provider/composables';
import { useFormFieldState } from '../form/use-form-item';
import { usePopupOverlay } from '../../composables/usePopupOverlay';
import { useFloatingAutoUpdate } from '../../composables/useFloatingAutoUpdate';
import { normalizeCustomClass } from '../../composables/useCustomClass';
import ExIcon from '../icon/ExIcon.vue';
import { generateId } from '../../utils/id';
import { isComposingKeyboardEvent } from '../../utils/keyboard';
import { useControllableState } from '../../composables/useControllableState';
import {
  formatTimeValue,
  normalizeTimeFormat,
  parseTimeValue,
  type TimeValue,
  type TimeUnit,
} from './time-values';

defineOptions({
  name: 'ExTimePicker',
  inheritAttrs: false,
});

const props = withDefaults(defineProps<ExTimePickerProps>(), {
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
const valueState = useControllableState<string>({
  controlledValue: () => props.modelValue,
  defaultValue: '',
});
const rangeState = useControllableState<TimePickerRange | null>({
  controlledValue: () => props.rangeValue,
  defaultValue: null,
  clone: value => (Array.isArray(value) && value.length === 2 ? [...value] : null),
});

const { t } = useLocale('timePicker');
const {
  formItem,
  disabled,
  interactive,
  size: componentSize,
  ariaAttrs: fieldAriaAttrs,
} = useFormFieldState(props);
const attrs = useAttrs();

const rootRef = ref<HTMLElement>();
const triggerRef = ref<HTMLElement>();
const panelRef = ref<HTMLElement>();
const hourColRef = ref<HTMLElement>();
const minuteColRef = ref<HTMLElement>();
const secondColRef = ref<HTMLElement>();
const panelId = generateId('ex-time-picker-panel');
const PANEL_VIEWPORT_GAP = 4;
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const HOUR_MAX = HOURS_PER_DAY - 1;
const MINUTE_MAX = MINUTES_PER_HOUR - 1;
const SECOND_MAX = SECONDS_PER_MINUTE - 1;

const rootAttrs = computed(() =>
  Object.fromEntries(
    Object.entries(attrs).filter(
      ([key]) => !['aria-label', 'aria-describedby', 'id', 'class', 'style'].includes(key)
    )
  )
);

const visible = ref(false);
const panelPositionStyle = ref<Record<string, string>>({});
const configTheme = useConfigTheme();
const neonEffect = useNeonEffect();
const animation = useAnimation();
const dropdownZIndex = useZIndexLayer('dropdown');
const { styles: popupOverlayStyles, containsTarget } = usePopupOverlay({
  active: () => visible.value,
  container: panelRef,
  zIndex: () => dropdownZIndex.value,
  onEscape: () => {
    close();
    triggerRef.value?.focus();
  },
});
const portalEffectClasses = computed(() => ({
  'ex-no-neon': !neonEffect.value,
  'ex-no-animation': !animation.value,
}));
const panelStyle = computed<Record<string, string>>(() => ({
  ...panelPositionStyle.value,
  ...popupOverlayStyles.value,
}));

// 当前编辑中的时分秒
const draft = reactive<{ h: number; m: number; s: number }>({ h: 0, m: 0, s: 0 });
const endpoints: TimePickerEndpoint[] = ['start', 'end'];
const activeEndpoint = ref<TimePickerEndpoint>('start');
const rangeDrafts = reactive({ start: { h: 0, m: 0, s: 0 }, end: { h: 0, m: 0, s: 0 } });
const rangeTouched = reactive({ start: false, end: false });
const callbackEndpoint = computed(() => (props.range ? activeEndpoint.value : undefined));
const confirmedRange = computed(() => {
  const value = rangeState.value.value;
  return Array.isArray(value) &&
    value.length === 2 &&
    value.every(item => parseTimeValue(item, props.format))
    ? value
    : null;
});
const displayValue = computed(() =>
  props.range
    ? confirmedRange.value?.join(` ${t('rangeSeparator')} `) || ''
    : valueState.value.value
);

const effectiveFormat = computed(() => normalizeTimeFormat(props.format));
const showHour = computed(() => effectiveFormat.value.includes('HH'));
const showMinute = computed(() => effectiveFormat.value.includes('mm'));
const showSecond = computed(() => effectiveFormat.value.includes('ss'));

const pad = (n: number): string => String(n).padStart(2, '0');

const rootClasses = computed(() => [
  'ex-time-picker',
  `ex-time-picker--${componentSize.value}`,
  {
    'is-disabled': disabled.value,
    'is-active': visible.value,
    'ex-time-picker--range': props.range,
  },
  ...normalizeCustomClass(props.class),
]);

const rootStyle = computed(() => {
  if (!props.style) return undefined;
  return props.style;
});

const showClear = computed(() => props.clearable && interactive.value && !!displayValue.value);

// 解析 modelValue -> draft
const parseValue = (value: string) => parseTimeValue(value, effectiveFormat.value);
const formatTime = (value: TimeValue) => formatTimeValue(value, effectiveFormat.value);

const syncDraftFromValue = () => {
  if (props.range) {
    activeEndpoint.value = 'start';
    endpoints.forEach((endpoint, index) => {
      const value = confirmedRange.value?.[index];
      const parsed = value ? parseValue(value) : null;
      rangeDrafts[endpoint] = parsed ?? { h: 0, m: 0, s: 0 };
      rangeTouched[endpoint] = parsed !== null;
    });
    Object.assign(draft, rangeDrafts.start);
    return;
  }
  const parsed = parseValue(valueState.value.value);
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
  const normalizedStep = Number.isFinite(step) ? Math.floor(Math.max(1, step)) : 1;
  for (let i = 0; i <= max; i += normalizedStep) {
    cells.push({ value: i, disabled: disabledList.includes(i) });
  }
  return cells;
};

const hours = computed<Cell[]>(() =>
  buildCells(HOUR_MAX, props.hourStep, props.disabledHours?.(callbackEndpoint.value) ?? [])
);
const minutes = computed<Cell[]>(() =>
  buildCells(
    MINUTE_MAX,
    props.minuteStep,
    props.disabledMinutes?.(draft.h, callbackEndpoint.value) ?? []
  )
);
const seconds = computed<Cell[]>(() =>
  buildCells(
    SECOND_MAX,
    props.secondStep,
    props.disabledSeconds?.(draft.h, draft.m, callbackEndpoint.value) ?? []
  )
);

const getCells = (unit: TimeUnit): Cell[] => {
  if (unit === 'h') return hours.value;
  if (unit === 'm') return minutes.value;
  return seconds.value;
};

const findClosestEnabled = (cells: Cell[], target: number): Cell | undefined => {
  return cells
    .filter(cell => !cell.disabled)
    .sort((first, second) => {
      const distance = Math.abs(first.value - target) - Math.abs(second.value - target);
      return distance || first.value - second.value;
    })[0];
};

const normalizeDraftUnit = (unit: TimeUnit, target = draft[unit]): boolean => {
  const cell = findClosestEnabled(getCells(unit), target);
  if (!cell) return false;
  draft[unit] = cell.value;
  return true;
};

const normalizeDependentUnits = (unit: TimeUnit): boolean => {
  if (unit === 'h' && showMinute.value && !normalizeDraftUnit('m')) return false;
  if ((unit === 'h' || unit === 'm') && showSecond.value && !normalizeDraftUnit('s')) return false;
  return true;
};

const normalizeDraft = (): boolean => {
  if (showHour.value && !normalizeDraftUnit('h')) return false;
  if (showMinute.value && !normalizeDraftUnit('m')) return false;
  if (showSecond.value && !normalizeDraftUnit('s')) return false;
  return true;
};

const isDraftSelectable = computed(() => {
  const selected = (unit: TimeUnit) =>
    getCells(unit).some(cell => cell.value === draft[unit] && !cell.disabled);
  return (
    (!showHour.value || selected('h')) &&
    (!showMinute.value || selected('m')) &&
    (!showSecond.value || selected('s'))
  );
});

const toSeconds = ({ h, m, s }: TimeValue): number =>
  (h * MINUTES_PER_HOUR + m) * SECONDS_PER_MINUTE + s;

const isRangeEndpointSelectable = (endpoint: TimePickerEndpoint) => {
  const value = rangeDrafts[endpoint];
  const available = (
    maximum: number,
    step: number,
    excluded: number[] | undefined,
    selected: number
  ) =>
    buildCells(maximum, step, excluded ?? []).some(
      cell => cell.value === selected && !cell.disabled
    );
  return (
    rangeTouched[endpoint] &&
    (!showHour.value ||
      available(HOUR_MAX, props.hourStep, props.disabledHours?.(endpoint), value.h)) &&
    (!showMinute.value ||
      available(
        MINUTE_MAX,
        props.minuteStep,
        props.disabledMinutes?.(value.h, endpoint),
        value.m
      )) &&
    (!showSecond.value ||
      available(
        SECOND_MAX,
        props.secondStep,
        props.disabledSeconds?.(value.h, value.m, endpoint),
        value.s
      ))
  );
};
const invalidRangeOrder = computed(() =>
  Boolean(
    props.range &&
    rangeTouched.start &&
    rangeTouched.end &&
    toSeconds(rangeDrafts.start) > toSeconds(rangeDrafts.end)
  )
);
const canConfirm = computed(() =>
  props.range
    ? !invalidRangeOrder.value && endpoints.every(isRangeEndpointSelectable)
    : isDraftSelectable.value
);

// 穷举至多一天内的时分秒组合，确保依赖上级值的禁用回调也被完整校验。
const findClosestSelectableTime = (target: TimeValue): TimeValue | undefined => {
  const hourCells = showHour.value
    ? hours.value.filter(cell => !cell.disabled)
    : [{ value: target.h, disabled: false }];
  const targetSeconds = toSeconds(target);
  let closest: TimeValue | undefined;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const hourCell of hourCells) {
    const minuteCells = showMinute.value
      ? buildCells(
          MINUTE_MAX,
          props.minuteStep,
          props.disabledMinutes?.(hourCell.value, callbackEndpoint.value) ?? []
        ).filter(cell => !cell.disabled)
      : [{ value: target.m, disabled: false }];

    for (const minuteCell of minuteCells) {
      const secondCells = showSecond.value
        ? buildCells(
            SECOND_MAX,
            props.secondStep,
            props.disabledSeconds?.(hourCell.value, minuteCell.value, callbackEndpoint.value) ?? []
          ).filter(cell => !cell.disabled)
        : [{ value: target.s, disabled: false }];

      for (const secondCell of secondCells) {
        const candidate = {
          h: hourCell.value,
          m: minuteCell.value,
          s: secondCell.value,
        };
        const distance = Math.abs(toSeconds(candidate) - targetSeconds);
        if (distance < closestDistance) {
          closest = candidate;
          closestDistance = distance;
          if (distance === 0) return closest;
        }
      }
    }
  }

  return closest;
};

const hasSelectableTime = computed(() => Boolean(findClosestSelectableTime(draft)));

// 面板定位（向下不够则向上）
const updatePanelPosition = () => {
  if (!props.teleported) {
    panelPositionStyle.value = {};
    return;
  }
  if (!triggerRef.value || !panelRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  const panelHeight = panelRef.value.offsetHeight;
  const panelWidth = Math.max(panelRef.value.offsetWidth, rect.width);
  const spaceBelow = window.innerHeight - rect.bottom;

  const top =
    spaceBelow < panelHeight && rect.top > panelHeight
      ? Math.max(PANEL_VIEWPORT_GAP, rect.top - panelHeight - PANEL_VIEWPORT_GAP)
      : Math.min(
          Math.max(PANEL_VIEWPORT_GAP, window.innerHeight - panelHeight - PANEL_VIEWPORT_GAP),
          rect.bottom + PANEL_VIEWPORT_GAP
        );
  const maxLeft = Math.max(PANEL_VIEWPORT_GAP, window.innerWidth - panelWidth - PANEL_VIEWPORT_GAP);
  const left = Math.max(PANEL_VIEWPORT_GAP, Math.min(rect.left, maxLeft));

  panelPositionStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${rect.width}px`,
  };
};

const scrollSelectedIntoView = () => {
  const scroll = (col?: HTMLElement) => {
    if (!col) return;
    const selected = col.querySelector<HTMLElement>('.is-selected');
    // 端点标题位于时间列上方，滚动量必须使用列内偏移而非整个弹层偏移。
    if (selected) col.scrollTop = selected.offsetTop - col.offsetTop;
  };
  scroll(hourColRef.value);
  scroll(minuteColRef.value);
  scroll(secondColRef.value);
};

useFloatingAutoUpdate(
  visible,
  [triggerRef, panelRef],
  [() => props.range, () => props.format, () => props.teleported, componentSize],
  updatePanelPosition
);

const focusCell = (unit: TimeUnit, value: number) => {
  nextTick(() => {
    panelRef.value
      ?.querySelector<HTMLElement>(`[data-unit="${unit}"][data-value="${value}"]`)
      ?.focus();
  });
};

const focusInitialCell = () => {
  const units: TimeUnit[] = [];
  if (showHour.value) units.push('h');
  if (showMinute.value) units.push('m');
  if (showSecond.value) units.push('s');
  const unit = units.find(candidate => findClosestEnabled(getCells(candidate), draft[candidate]));
  if (!unit) return;
  const cell = findClosestEnabled(getCells(unit), draft[unit]);
  if (cell) focusCell(unit, cell.value);
};

const selectEndpoint = (endpoint: TimePickerEndpoint) => {
  if (!interactive.value) return;
  activeEndpoint.value = endpoint;
  Object.assign(draft, rangeDrafts[endpoint]);
  nextTick(scrollSelectedIntoView);
};
const handleEndpointKeydown = (event: KeyboardEvent, endpoint: TimePickerEndpoint) => {
  if (!interactive.value || isComposingKeyboardEvent(event)) return;
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    focusInitialCell();
    return;
  }
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next =
    event.key === 'Home'
      ? 'start'
      : event.key === 'End'
        ? 'end'
        : endpoint === 'start'
          ? 'end'
          : 'start';
  selectEndpoint(next);
  nextTick(() => panelRef.value?.querySelector<HTMLElement>(`[data-endpoint="${next}"]`)?.focus());
};

const open = (focusOptions = false) => {
  if (!interactive.value || visible.value) return;
  syncDraftFromValue();
  if (!props.range) normalizeDraft();
  visible.value = true;
  emit('visible-change', true);
  nextTick(() => {
    updatePanelPosition();
    scrollSelectedIntoView();
    if (focusOptions) focusInitialCell();
  });
};

const close = () => {
  if (!visible.value) return;
  visible.value = false;
  emit('visible-change', false);
};

const handleTriggerClick = () => {
  if (!interactive.value) return;
  if (visible.value) close();
  else open();
};

const emitValue = () => {
  if (!interactive.value || !isDraftSelectable.value) return;
  if (props.range) {
    rangeDrafts[activeEndpoint.value] = { ...draft };
    rangeTouched[activeEndpoint.value] = true;
    return;
  }
  const value = formatTime(draft);
  valueState.request(value);
  emit('update:modelValue', value);
  emit('change', value);
  formItem?.onFieldChange();
};

const selectUnit = (unit: 'h' | 'm' | 's', value: number, disabled: boolean) => {
  if (!interactive.value || disabled) return;
  draft[unit] = value;
  const selectable = normalizeDependentUnits(unit);
  if (props.range) {
    // 即使下级没有可选时间也保留真实草稿，让确认状态反映当前编辑而非旧快照。
    rangeDrafts[activeEndpoint.value] = { ...draft };
    rangeTouched[activeEndpoint.value] = true;
  }
  if (!selectable) return;
  emitValue();
  nextTick(scrollSelectedIntoView);
};

const selectNow = () => {
  if (!interactive.value) return;
  const now = new Date();
  const selection = findClosestSelectableTime({
    h: now.getHours(),
    m: now.getMinutes(),
    s: now.getSeconds(),
  });
  if (!selection) return;
  draft.h = selection.h;
  draft.m = selection.m;
  draft.s = selection.s;
  emitValue();
  nextTick(scrollSelectedIntoView);
};

const handleConfirm = () => {
  if (!interactive.value || !canConfirm.value) return;
  if (props.range) {
    const value: TimePickerRange = [formatTime(rangeDrafts.start), formatTime(rangeDrafts.end)];
    rangeState.request(value);
    emit('update:rangeValue', [...value]);
    emit('range-change', [...value]);
    formItem?.onFieldChange();
  } else emitValue();
  close();
};

const handleClear = () => {
  if (!interactive.value) return;
  if (props.range) {
    rangeState.request(null);
    emit('update:rangeValue', null);
    emit('range-change', null);
  } else {
    valueState.request('');
    emit('update:modelValue', '');
    emit('change', '');
  }
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
  if (e.target !== e.currentTarget || !interactive.value || isComposingKeyboardEvent(e)) return;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (!visible.value) open(true);
    else focusInitialCell();
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    if (!visible.value) open(true);
  } else if (e.key === 'Escape' && visible.value) {
    e.preventDefault();
    e.stopPropagation();
    close();
  }
};

const handleCellKeydown = (unit: TimeUnit, value: number, event: KeyboardEvent) => {
  if (!interactive.value || isComposingKeyboardEvent(event)) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopPropagation();
    close();
    triggerRef.value?.focus();
    return;
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    selectUnit(unit, value, false);
    return;
  }

  const units: TimeUnit[] = [];
  if (showHour.value) units.push('h');
  if (showMinute.value) units.push('m');
  if (showSecond.value) units.push('s');
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    const currentIndex = units.indexOf(unit);
    const offset = event.key === 'ArrowRight' ? 1 : -1;
    const targetUnit = units[currentIndex + offset];
    if (!targetUnit) return;
    event.preventDefault();
    const target = findClosestEnabled(getCells(targetUnit), draft[targetUnit]);
    if (target) focusCell(targetUnit, target.value);
    return;
  }

  const enabled = getCells(unit).filter(cell => !cell.disabled);
  if (enabled.length === 0) return;
  const currentIndex = enabled.findIndex(cell => cell.value === value);
  let target: Cell | undefined;
  if (event.key === 'ArrowDown') {
    target = enabled[(currentIndex + 1 + enabled.length) % enabled.length];
  } else if (event.key === 'ArrowUp') {
    target = enabled[(currentIndex - 1 + enabled.length) % enabled.length];
  } else if (event.key === 'Home') {
    target = enabled[0];
  } else if (event.key === 'End') {
    target = enabled[enabled.length - 1];
  } else {
    return;
  }

  event.preventDefault();
  if (target) {
    selectUnit(unit, target.value, false);
    focusCell(unit, target.value);
  }
};

// 点击外部关闭
const handleClickOutside = (event: MouseEvent) => {
  if (!visible.value) return;
  const target = event.target as Node;
  if (rootRef.value && !rootRef.value.contains(target) && !containsTarget(target)) {
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

watch(interactive, canInteract => {
  if (!canInteract) close();
});

watch(
  () => formItem?.resetRevision?.value,
  () => {
    // 重置必须同时清除范围两端的已编辑标记，避免继续确认旧草稿。
    close();
    syncDraftFromValue();
  },
  { flush: 'post' }
);

watch(
  [valueState.value, rangeState.value, () => props.format, () => props.range],
  () => {
    syncDraftFromValue();
    if (!visible.value) return;
    if (!props.range) normalizeDraft();
    nextTick(scrollSelectedIntoView);
  },
  { deep: true }
);

watch(
  () => props.teleported,
  () => {
    if (!visible.value) return;
    nextTick(updatePanelPosition);
  }
);

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
