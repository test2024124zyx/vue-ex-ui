<template>
  <div
    ref="heatmapRef"
    :class="heatmapClasses"
    :style="heatmapStyles"
    role="group"
    :aria-label="ariaLabel || t('ariaLabel')"
    :aria-describedby="hasCalendar ? legendId : undefined"
  >
    <template v-if="hasCalendar">
      <div class="ex-heatmap__viewport">
        <div class="ex-heatmap__calendar">
          <div
            v-if="showMonthLabels"
            class="ex-heatmap__months"
            aria-hidden="true"
          >
            <span
              v-if="showWeekLabels"
              class="ex-heatmap__month-spacer"
            ></span>
            <div class="ex-heatmap__month-grid">
              <span
                v-for="month in monthSlots"
                :key="month.key"
                class="ex-heatmap__month-slot"
              >
                {{ month.label }}
              </span>
            </div>
          </div>

          <div class="ex-heatmap__body">
            <div
              v-if="showWeekLabels"
              class="ex-heatmap__weeks"
              aria-hidden="true"
            >
              <span
                v-for="(label, index) in weekLabels"
                :key="index"
                class="ex-heatmap__week-label"
              >
                {{ label }}
              </span>
            </div>

            <div class="ex-heatmap__grid">
              <div
                v-for="(row, rowIndex) in calendarRows"
                :key="rowIndex"
                class="ex-heatmap__row"
              >
                <template
                  v-for="day in row"
                  :key="day.source.date"
                >
                  <button
                    v-if="day.source.inRange"
                    type="button"
                    :class="['ex-heatmap__cell', `ex-heatmap__cell--level-${day.level}`]"
                    :data-date="day.source.date"
                    :tabindex="activeDate === day.source.date ? 0 : -1"
                    :aria-label="day.accessibleLabel"
                    :aria-describedby="
                      activeTooltipCell?.source.date === day.source.date ? tooltipId : undefined
                    "
                    @click="handleCellClick(day, $event)"
                    @keydown="handleCellKeydown(day, $event)"
                    @mouseenter="handleCellEnter(day)"
                    @mouseleave="handleCellLeave(day)"
                    @focus="handleCellFocus(day)"
                    @blur="handleCellBlur(day)"
                  ></button>
                  <span
                    v-else
                    class="ex-heatmap__placeholder"
                    aria-hidden="true"
                  ></span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        :id="legendId"
        class="ex-heatmap__legend"
        role="img"
        :aria-label="t('legend')"
      >
        <span
          class="ex-heatmap__legend-label"
          aria-hidden="true"
        >
          {{ t('less') }}
        </span>
        <span
          v-for="level in [0, 1, 2, 3, 4]"
          :key="level"
          class="ex-heatmap__legend-item"
          :data-level="level"
          aria-hidden="true"
        ></span>
        <span
          class="ex-heatmap__legend-label"
          aria-hidden="true"
        >
          {{ t('more') }}
        </span>
      </div>
    </template>

    <div
      v-else-if="rangeError"
      class="ex-heatmap__empty ex-heatmap__empty--error"
      role="alert"
    >
      <ExIcon
        class="ex-heatmap__empty-icon"
        icon="calendar-line"
        :size="48"
        aria-hidden="true"
      />
      <p>{{ t('invalidRange') }}</p>
    </div>

    <div
      v-else
      class="ex-heatmap__empty"
    >
      <slot name="empty">
        <ExIcon
          class="ex-heatmap__empty-icon"
          icon="calendar-line"
          :size="48"
          aria-hidden="true"
        />
        <p>{{ emptyText ?? t('empty') }}</p>
      </slot>
    </div>

    <Teleport to="body">
      <div
        v-if="activeTooltipCell"
        :id="tooltipId"
        ref="tooltipRef"
        :class="tooltipClasses"
        :data-theme="configTheme"
        :data-placement="tooltipPlacement"
        :style="tooltipStyle"
        role="tooltip"
      >
        <div class="ex-heatmap__tooltip-date">
          {{ activeTooltipCell.displayDate }}
        </div>
        <div class="ex-heatmap__tooltip-value">
          {{ activeTooltipCell.source.value }}
        </div>
        <span
          class="ex-heatmap__tooltip-arrow"
          aria-hidden="true"
        ></span>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  type CSSProperties,
  type StyleValue,
} from 'vue';
import { normalizeCustomClass } from '../../composables/useCustomClass';
import { useLocale } from '../../locale';
import { computeFloatingPosition, type FloatingPlacement } from '../../utils/floating';
import { generateId } from '../../utils/id';
import {
  useAnimation,
  useConfigTheme,
  useNeonEffect,
  useZIndexLayer,
} from '../config-provider/composables';
import ExIcon from '../icon/ExIcon.vue';
import {
  createHeatmapCalendar,
  getHeatmapLevel,
  normalizeHeatmapData,
  normalizeHeatmapMetric,
  resolveHeatmapMaximum,
  resolveHeatmapRange,
  type HeatmapCalendarCell,
} from './heatmap-utils';
import type { ExHeatmapEmits, ExHeatmapExposed, ExHeatmapProps, HeatmapDataItem } from './types';

defineOptions({
  name: 'ExHeatmap',
});

interface HeatmapViewCell {
  source: HeatmapCalendarCell;
  level: 0 | 1 | 2 | 3 | 4;
  displayDate: string;
  accessibleLabel: string;
}

const CELL_SIZES = {
  small: 24,
  medium: 28,
  large: 32,
} as const;

const props = withDefaults(defineProps<ExHeatmapProps>(), {
  size: 'medium',
  theme: 'neon',
  showMonthLabels: true,
  showWeekLabels: true,
  showTooltip: true,
  gap: 4,
  radius: 2,
});

const emit = defineEmits<ExHeatmapEmits>();
const configTheme = useConfigTheme();
const animation = useAnimation();
const neonEffect = useNeonEffect();
const tooltipZIndex = useZIndexLayer('tooltip');
const { t, locale } = useLocale('heatmap');
const heatmapRef = ref<HTMLDivElement>();
const tooltipRef = ref<HTMLDivElement>();
const tooltipId = generateId('ex-heatmap-tooltip');
const legendId = generateId('ex-heatmap-legend');
const activeDate = ref<string | null>(null);
const hoveredDate = ref<string | null>(null);
const focusedDate = ref<string | null>(null);
const tooltipPlacement = ref<FloatingPlacement>('top');
const tooltipPositionStyle = ref<CSSProperties>({
  position: 'fixed',
  top: '0',
  left: '0',
  visibility: 'hidden',
});
let tooltipListenersAttached = false;

const heatmapClasses = computed(() => [
  'ex-heatmap',
  `ex-heatmap--${props.size}`,
  `ex-heatmap--${props.theme}`,
  ...normalizeCustomClass(props.class),
]);
const tooltipClasses = computed(() => [
  'ex-heatmap__tooltip',
  `ex-heatmap__tooltip--${props.theme}`,
  {
    'ex-no-animation': !animation.value,
    'ex-no-neon': !neonEffect.value,
  },
]);
const tooltipStyle = computed<CSSProperties>(() => ({
  ...tooltipPositionStyle.value,
  zIndex: tooltipZIndex.value,
}));

const cellSize = computed(() => CELL_SIZES[props.size]);
const normalizedGap = computed(() => normalizeHeatmapMetric(props.gap, 4, 64));
const normalizedRadius = computed(() =>
  normalizeHeatmapMetric(props.radius, 2, cellSize.value / 2)
);
const componentStyle = computed<CSSProperties>(
  () =>
    ({
      '--ex-heatmap-cell-size': `${cellSize.value}px`,
      '--ex-heatmap-gap': `${normalizedGap.value}px`,
      '--ex-heatmap-radius': `${normalizedRadius.value}px`,
    }) as CSSProperties
);
const heatmapStyles = computed<StyleValue>(() => [componentStyle.value, props.style]);

const rangeResult = computed(() => resolveHeatmapRange(props.startDate, props.endDate));
const rangeError = computed(() => !rangeResult.value.ok);
const normalizedData = computed(() => normalizeHeatmapData(props.data));
const hasCalendar = computed(() => rangeResult.value.ok && normalizedData.value.size > 0);

const calendarWeeks = computed<HeatmapCalendarCell[][]>(() => {
  const result = rangeResult.value;
  if (!result.ok || normalizedData.value.size === 0) return [];
  return createHeatmapCalendar(normalizedData.value, result.range);
});

const visibleMaximum = computed(() =>
  resolveHeatmapMaximum(
    calendarWeeks.value.flat().filter(cell => cell.inRange),
    props.maxValue
  )
);

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
);
const monthFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { month: 'short' }));
const weekdayFormatter = computed(
  () => new Intl.DateTimeFormat(locale.value, { weekday: 'short' })
);

const viewWeeks = computed<HeatmapViewCell[][]>(() =>
  calendarWeeks.value.map(week =>
    week.map(source => {
      const displayDate = dateFormatter.value.format(source.dateValue);
      return {
        source,
        level: getHeatmapLevel(source.value, visibleMaximum.value),
        displayDate,
        accessibleLabel: `${displayDate}: ${source.value}`,
      };
    })
  )
);

const calendarRows = computed(() =>
  Array.from(
    { length: 7 },
    (_, dayIndex) =>
      viewWeeks.value.map(week => week[dayIndex]).filter(Boolean) as HeatmapViewCell[]
  )
);

const interactiveCells = computed(() => viewWeeks.value.flat().filter(day => day.source.inRange));
const cellByDate = computed(
  () => new Map(interactiveCells.value.map(day => [day.source.date, day]))
);

const monthSlots = computed(() =>
  calendarWeeks.value.map((week, weekIndex) => {
    const firstOfMonth = week.find(cell => cell.inRange && cell.dateValue.getDate() === 1);
    const labelCell =
      firstOfMonth ?? (weekIndex === 0 ? week.find(cell => cell.inRange) : undefined);
    return {
      key: week[0]?.date ?? String(weekIndex),
      label: labelCell ? monthFormatter.value.format(labelCell.dateValue) : '',
    };
  })
);

const weekLabels = computed(() =>
  Array.from({ length: 7 }, (_, dayIndex) =>
    dayIndex % 2 === 1 ? weekdayFormatter.value.format(new Date(2024, 0, 7 + dayIndex)) : ''
  )
);

watch(
  interactiveCells,
  cells => {
    const availableDates = new Set(cells.map(day => day.source.date));
    if (!activeDate.value || !availableDates.has(activeDate.value)) {
      activeDate.value = cells[0]?.source.date ?? null;
    }
    if (hoveredDate.value && !availableDates.has(hoveredDate.value)) {
      hoveredDate.value = null;
    }
    if (focusedDate.value && !availableDates.has(focusedDate.value)) {
      focusedDate.value = null;
    }
  },
  { immediate: true }
);

const requestedTooltipDate = computed(() => focusedDate.value ?? hoveredDate.value);
const activeTooltipCell = computed(() => {
  if (!props.showTooltip || !requestedTooltipDate.value) return null;
  return cellByDate.value.get(requestedTooltipDate.value) ?? null;
});

const toEventData = (cell: HeatmapCalendarCell): HeatmapDataItem => {
  const { dateValue: _dateValue, inRange: _inRange, hasData: _hasData, ...data } = cell;
  return data;
};

const handleCellClick = (day: HeatmapViewCell, event: MouseEvent) => {
  emit('cell-click', toEventData(day.source), event);
};

const handleCellEnter = (day: HeatmapViewCell) => {
  hoveredDate.value = day.source.date;
  emit('cell-hover', toEventData(day.source));
};

const handleCellLeave = (day: HeatmapViewCell) => {
  if (hoveredDate.value === day.source.date) hoveredDate.value = null;
  emit('cell-hover', null);
};

const handleCellFocus = (day: HeatmapViewCell) => {
  activeDate.value = day.source.date;
  focusedDate.value = day.source.date;
};

const handleCellBlur = (day: HeatmapViewCell) => {
  if (focusedDate.value === day.source.date) focusedDate.value = null;
};

const focusCell = (index: number) => {
  const cells = interactiveCells.value;
  if (cells.length === 0) return;
  const targetIndex = Math.min(Math.max(index, 0), cells.length - 1);
  const target = cells[targetIndex];
  if (!target) return;

  activeDate.value = target.source.date;
  nextTick(() => {
    heatmapRef.value
      ?.querySelector<HTMLButtonElement>(`[data-date="${target.source.date}"]`)
      ?.focus();
  });
};

const handleCellKeydown = (day: HeatmapViewCell, event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    hoveredDate.value = null;
    focusedDate.value = null;
    return;
  }

  const currentIndex = interactiveCells.value.findIndex(
    cell => cell.source.date === day.source.date
  );
  if (currentIndex < 0) return;

  let targetIndex: number | null = null;
  if (event.key === 'ArrowUp') targetIndex = currentIndex - 1;
  if (event.key === 'ArrowDown') targetIndex = currentIndex + 1;
  if (event.key === 'ArrowLeft') targetIndex = currentIndex - 7;
  if (event.key === 'ArrowRight') targetIndex = currentIndex + 7;
  if (event.key === 'Home') {
    targetIndex = event.ctrlKey || event.metaKey ? 0 : currentIndex - day.source.dateValue.getDay();
  }
  if (event.key === 'End') {
    targetIndex =
      event.ctrlKey || event.metaKey
        ? interactiveCells.value.length - 1
        : currentIndex + (6 - day.source.dateValue.getDay());
  }
  if (targetIndex === null) return;

  event.preventDefault();
  focusCell(targetIndex);
};

const updateTooltipPosition = () => {
  const day = activeTooltipCell.value;
  const floating = tooltipRef.value;
  const root = heatmapRef.value;
  if (!day || !floating || !root || typeof window === 'undefined') return;

  const reference = root.querySelector<HTMLButtonElement>(`[data-date="${day.source.date}"]`);
  if (!reference) return;

  const referenceRect = reference.getBoundingClientRect();
  const floatingRect = floating.getBoundingClientRect();
  const position = computeFloatingPosition({
    reference: referenceRect,
    floating: { width: floatingRect.width, height: floatingRect.height },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    placement: 'top',
    offset: 8,
    padding: 8,
  });

  tooltipPlacement.value = position.placement;
  tooltipPositionStyle.value = {
    position: 'fixed',
    top: `${position.y}px`,
    left: `${position.x}px`,
    visibility: 'visible',
  };
};

const attachTooltipListeners = () => {
  if (tooltipListenersAttached || typeof window === 'undefined') return;
  window.addEventListener('resize', updateTooltipPosition);
  window.addEventListener('scroll', updateTooltipPosition, true);
  tooltipListenersAttached = true;
};

const detachTooltipListeners = () => {
  if (!tooltipListenersAttached || typeof window === 'undefined') return;
  window.removeEventListener('resize', updateTooltipPosition);
  window.removeEventListener('scroll', updateTooltipPosition, true);
  tooltipListenersAttached = false;
};

watch(
  activeTooltipCell,
  day => {
    if (!day) {
      detachTooltipListeners();
      return;
    }

    tooltipPositionStyle.value = {
      position: 'fixed',
      top: '0',
      left: '0',
      visibility: 'hidden',
    };
    attachTooltipListeners();
    nextTick(updateTooltipPosition);
  },
  { flush: 'post' }
);

onBeforeUnmount(detachTooltipListeners);

const getElement = () => heatmapRef.value ?? null;

defineExpose<ExHeatmapExposed>({
  getElement,
});
</script>

<style scoped lang="scss" src="./ExHeatmap.scss"></style>
